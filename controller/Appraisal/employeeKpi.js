
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Leave from '../../model/Expense';
import AppraisalGroup from '../../model/Kpi';
import AppraisalData from '../../model/AppraisalData';
import Group from '../../model/AppraisalGroup';
import AppraisalPeriod from '../../model/AppraisalPeriod';

import Kpi from '../../model/Kpi';
import EmployeeKpi from '../../model/EmployeeKpis';
import Employee from '../../model/Employees';








const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const employeeKPI = async (req, res) => {

    try {
       
        const { name, fields, employeeId, kpiGroups,  appraisalGroup, employeeSignStatus, appraisalPeriodId, employeeComment, signature, employeeRatingId} = req.body;


        // let company = await Company.findOne({ _id: req.payload.id });
       

        let employee = await Employee.findOne({ _id: req.payload.id});

        let pperiod = await AppraisalPeriod.findOne({ _id: appraisalPeriodId});
        // let group = await AppraisalGroup.findOne({ _id: appraisalPeriodId});





        console.log({pperiod})

        // let appraisal = await AppraisalGroup.findOne({ companyId:company._id,  kpiName: name });

        // console.log({appraisal})

        // if (!company.companyName) {
        //     res.status(400).json({
        //         status: 400,
        //         error: 'No company has been created for this account'
        //     })
        //     return;
        // }

        console.log({employee})

        if (!employee) {
            res.status(400).json({
                status: 400,
                error: 'Employee does not exist'
            })
            return;
        }

console.log({       
    employeeId: req.payload.id,
    employeeName: employee.fullName,
    profilePics: employee.profilePics,
    managerName: employee.managerName,
    managerId: employee.managerId,
    matrixScore: [],
    employeeSignedDate: new Date().toISOString(),
    employeeSignStatus: employeeSignStatus,
    managerSignStatus: false,
    managerSignedDate: "",
    companyId: req.payload.id,
    companyName: employee.companyName,
    status: "Awaiting Manager Approval",
    appraisalPeriodId,
    startDate: pperiod.startDate, 
    endDate: pperiod.endDate,
    activeDate: pperiod.activeDate, 
    appraisalName: pperiod.appraisalPeriodName,
    companyRole: employee.role,

    inactiveDate: pperiod.inactiveDate,
    kpiGroups,
})
     
       await new EmployeeKpi({
            employeeId: req.payload.id,
            employeeName: employee.fullName,
            profilePics: employee.profilePics,
            managerName: employee.managerName,
            managerId: employee.managerId,
            matrixScore: [],
            employeeSignedDate: new Date().toISOString(),
            employeeSignStatus: employeeSignStatus,
            managerSignStatus: false,
            managerSignedDate: "",
            companyId: req.payload.id,
            companyName: employee.companyName,
            companyRole: employee.role,
            appraisalName: pperiod && pperiod.appraisalPeriodName,
            status: "Awaiting Manager Review",
            // kpiDescription: kpi.kpiDescription,
            // appraisalGroup,
            appraisalPeriodId,
            startDate: pperiod && pperiod.startDate, 
            endDate: pperiod && pperiod.endDate,
            activeDate: pperiod && pperiod.activeDate, 
            inactiveDate:pperiod && pperiod.inactiveDate,
            kpiGroups,
            // "remarks.employeeComment": employeeComment,
            // "remarks.managerName": employee ? employee.managerName : "",
            // "remarks.employeeName": employee ? employee.fullName : "",
            // "remarks.managerComment": "",
            // "remarks.managerRatingId": "",
            // "remarks.managerOverallComment": "",
            // "remarks.employeeSubmissionDate":  new Date().toISOString(),
            // "remarks.employeeSignature": signature,
            // "remarks.managerSignature": false,
            // "remarks.employeeRatingId": employeeRatingId,
        }).save(async (err, updatedDoc) =>{
            console.log({err})
            if(err){
                res.status(400).json({
                    status: 400,
                    success: false,
                    data: err
                })
            }else{

                console.log(req.payload.id)

              const data =await AppraisalData.findOne({employeeId: req.payload.id})

              console.log({data})

            AppraisalData.findOneAndUpdate({employeeId: req.payload.id, appraisalPeriodId:appraisalPeriodId}, {
                    $set: {
                        employeeId: req.payload.id,
                        employeeName: employee.fullName,
                        profilePics: employee.profilePics,
                        managerName: employee.managerName,
                        managerId: employee.managerId,
                        email: employee.email,
                        employeeKpiId: updatedDoc._id,
                        kpiGroups,
                        status: "Awaiting Manager Review"
                    },
                },
                { new: true }, // To return the modified document
                    async function (
                        err,
                        result
                    ) {
                        if (err) {
                            res.status(401).json({
                                status: 401,
                                success: false,
                                error: err
                            })
                        } else {

              const updatedData =await AppraisalData.findOne({_id: updatedDoc._id})

                            res.status(200).json({
                                status: 200,
                                success: true,
                                data: result
                            })
                        }
                    })
                // res.status(200).json({
                //     status: 200,
                //     success: true,
                //     data: updatedDoc
                // })
            }
          
        })



    
        // const dd = []
        // await groups.save().then(async (adm) => {
        //     console.log(adm)

        //     let checks_group = await AppraisalGroup.find({ _id:  group},
        //         {groupKpis: { $elemMatch: { kpiId: adm._id } } })
    
        //                 checks_group.map((chk) => {
        //                     if(chk.groupKpis.length > 0){
        //                         dd.push(chk.groupKpis)
        //                     }
        //                 })
    
    
        //         if(dd.length > 0){
        //             res.status(404).json({
        //                 status:404,
        //                 success: false,
        //                 error:'kpi has already been assigned to group'
        //             })
        //             return
        //         }
    
        //     Group.findOneAndUpdate({ _id: group }, { 
        //         $push: { groupKpis: {
        //             kpiId: adm._id,
        //             kpiName: name,
        //             kpiDescription: description,
        //             fields,
        //             "remarks.employeeComment": "",
        //             "remarks.managerName": "",
        //             "remarks.employeeName": "",
        //             "remarks.managerComment": "",
        //             "remarks.managerOverallComment": "",
        //             "remarks.managerRatingId": "",
        //             "remarks.employeeRatingId": "",
    
    
        //         }},
        //    },{ upsert: true },
        //         async function (
        //             err,
        //             result
        //         ) {
        //             if (err) {
        //                 res.status(401).json({
        //                     status: 401,
        //                     success: false,
        //                     error: err
        //                 })
    
        //             } else {

        //                 console.log({result})
    
    
        //             }
        //         })
        //     res.status(200).json({
        //         status: 200,
        //         success: true,
        //         data: adm
        //     })
        // }).catch((err) => {
        //         console.error(err)
        //         res.status(400).json({
        //             status: 400,
        //             success: false,
        //             error: err
        //         })
        //     })
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default employeeKPI;



