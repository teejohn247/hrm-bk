
import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import Roles from '../../model/Roles';
import AuditTrail from '../../model/AuditTrail';
import Company from '../../model/Company';
import utils from '../../config/utils';
import { emailTemp } from '../../emailTemplate';
import AppraisalGroup from '../../model/AppraisalGroup';





const updateEmployee = async (req, res) => {

    try {
   
        const { password } = req.body;

        const check = await Employee.findOne({ _id: req.payload.id })
        // const appraisal = await AppraisalGroup.findOne({ _id: req.payload.id })



        if (!check) {
            res.status(400).json({
                status: 400,
                error: "Employee doesn't exist"
            })
            return;
        }
    

        Employee.findOneAndUpdate({ _id: req.payload.id}, { 
            $set: { 
                password,
                status: "Accepted"
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

                } else {

                    const appraisals = await AppraisalGroup.findOne({groupName : "General"}, {_id: 1, groupName:1, groupKpis: 1, description: 1})
                    AppraisalGroup.findOneAndUpdate({ groupName : "General"}, { 
                        $push: { assignedEmployees:
                            {employee_id: req.payload.id,
                            employee_name: check.fullName}
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
            
                                Employee.findOneAndUpdate({ _id: req.payload.id }, { 
                                    $push: {  appraisals },
    
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
    
    
    
                                    //         console.log(adm)
                                    //         console.log({departmentIds})
                                    //         AppraisalGroup.findOneAndUpdate({ groupName : "General" }, { 
                                    //             $push: { assignedDepartments: departments
                                    //             },
                                    //        },{ upsert: true },
                                    //             async function (
                                    //                 err,
                                    //                 result
                                    //             ) {
                                    //                 if (err) {
                                    //                     res.status(401).json({
                                    //                         status: 401,
                                    //                         success: false,
                                    //                         error: err
                                    //                     })
                                    
                                    //                 } else {
    
                                    //                     addDepartment.updateMany({ _id:  { $in: departmentIds }}, { 
                                    //                         $push: { departments: {
                                    //                             appraisalId: adm._id,
                                    //                             appraisalName: adm.groupName,
                                    //                         }},
                                    //                    },{ upsert: true },
                                    //                         async function (
                                    //                             err,
                                    //                             result
                                    //                         ) {
                                    //                             if (err) {
                                    //                                 res.status(401).json({
                                    //                                     status: 401,
                                    //                                     success: false,
                                    //                                     error: err
                                    //                                 })
                                                
                                    //                             } else {
                                                
                                    //                                 const manager = await AppraisalGroup.findOne({_id: adm._id});
                                                
                                    //                                 res.status(200).json({
                                    //                                     status: 200,
                                    //                                     success: true,
                                    //                                     data: manager
                                    //                                 })
                                                
                                    //                             }
                                    //                         })
                                    
                                    //                     addDepartment.updateMany({ _id:  { $in: departmentIds }}, { 
                                    //                         $push: { departments: {
                                    //                             appraisalId: adm._id,
                                    //                             appraisalName: adm.groupName,
                                    //                         }},
                                    //                    },{ upsert: true },
                                    //                         async function (
                                    //                             err,
                                    //                             result
                                    //                         ) {
                                    //                             if (err) {
                                    //                                 res.status(401).json({
                                    //                                     status: 401,
                                    //                                     success: false,
                                    //                                     error: err
                                    //                                 })
                                                
                                    //                             } else {
                                                
                                    //                                 const manager = await AppraisalGroup.findOne({_id: adm._id});
                                                
                                    //                                 res.status(200).json({
                                    //                                     status: 200,
                                    //                                     success: true,
                                    //                                     data: manager
                                    //                                 })
                                                
                                    //                             }
                                    //                         })
                                    
                                    
                                    //                 }
                                    //             })
                        
                                        }
                                    })
            
            
                            }
                        })
                  
                    res.status(200).json({
                        status: 200,
                        success: true,
                        data: "Update Successful"
                    })

                }
            })



    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default updateEmployee;



