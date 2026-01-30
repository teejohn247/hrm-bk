
import dotenv from 'dotenv';
import Department from '../../model/Department';
import Company from '../../model/Company';
import Employee from '../../model/Employees';
import AppraisalGroup from '../../model/AppraisalGroup';



const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const addDepartment = async (req, res) => {

    try {

        const {departmentName, managerId} = req.body;
        let departmentN = await Department.findOne({ companyId: req.payload.id, departmentName: departmentName });
        let companyName = await Company.findOne({ _id: req.payload.id });

        if(managerId){
            var employee = await Employee.findOne({_id: managerId})

            if (!employee) {

                res.status(400).json({
                    status: 400,
                    error: 'This employee does not exist'
                })
                return;
            }
        }

        if (departmentN) {

            res.status(400).json({
                status: 400,
                error: 'This department Name already exist'
            })
            return;
        }

       let department = new Department({
            departmentName,
            companyId: req.payload.id,
            companyName: companyName.companyName,
            managerName: employee ? `${employee.firstName} ${employee.lastName}` : '',
            managerId: managerId ? managerId : ''
        })


        await department.save().then(async (adm) => {

                //        Employee.updateMany({department: department.departmentName}, { 
                //         $set: { 
                //             managerName: employee && `${employee.firstName} ${employee.lastName}`,
                //             managerId: managerId && managerId
                //         }
                //    },
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
            
                //             } 
                //         })
    
                        if(employee){
    
                       Employee.updateOne({_id: managerId}, { 
                        $set: { 
                            isManager: true
                        }
                   },
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
            
                            } 
                        })
    
                    }
                        // res.status(200).json({
                        //     status: 200,
                        //     success: true,
                        //     data: adm
                        // })

                        const appraisal = await AppraisalGroup.findOne({companyId: req.payload.id, groupName: "General"})
    
                    
                        console.log({appraisal})
                        AppraisalGroup.findOneAndUpdate({companyId: req.payload.id,
                            groupName : "General" }, { 
                            $push: { assignedDepartments: {department_id: adm._id,
                                department_name: adm.departmentName}
                            },
                       },{ upsert: true },

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

                                    Department.findOneAndUpdate({ _id: adm._id}, { 
                                        $push: { departments: {
                                            appraisalId: appraisal._id,
                                            appraisalName: appraisal.groupName,
                                        }},
                                   },{ upsert: true },
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
                            
                                                const manager = await Department.findOne({_id: adm._id});
                            
                                                res.status(200).json({
                                                    status: 200,
                                                    success: true,
                                                    data: manager
                                                })

                                                
                            
                                            }
                                        })
                
                                //     addDepartment.findOneAndUpdate({ _id:  adm._id}, { 
                                //         $push: { departments: {
                                //             appraisalId: adm._id,
                                //             appraisalName: adm.groupName,
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
                            
                                //                 const manager = await AppraisalGroup.findOne({_id: adm._id});
                            
                                //                 res.status(200).json({
                                //                     status: 200,
                                //                     success: true,
                                //                     data: manager
                                //                 })
                            
                                //             }
                                //         })
                
                
                                }
                            })
        }).catch((err) => {
                console.error(err)
                res.status(400).json({
                    status: 400,
                    success: false,
                    error: err
                })
            })
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default addDepartment;



