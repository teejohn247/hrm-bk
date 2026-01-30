
import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import LeaveRecords from '../../model/LeaveRecords';
import Leave from '../../model/Leaves';


import Roles from '../../model/Roles';
import AuditTrail from '../../model/AuditTrail';
import Company from '../../model/Company';
import utils from '../../config/utils';
import { emailTemp } from '../../emailTemplate';

import Designation from "../../model/Designation";
import Department from "../../model/Department";

const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const updateLeaveApplication = async (req, res) => {

    try {
   
    
        const { leaveTypeId, leaveStartDate, leaveEndDate, comments, noOfLeaveDays } = req.body;

        

        const check = await Employee.findOne({ _id: req.payload.id });
        // const checkManager = await Employee.findOne({ _id: check.managerId});

        console.log({check})


        if (!check) {
            res.status(400).json({
                status: 400,
                error: "Employee doesn't exist"
            });
            return;
        }
      
        const leaveType = await Leave.findOne({ _id: leaveTypeId });

     
        if (!leaveType) {
            res.status(400).json({
                status: 400,
                error: "leaveType doesn't exist"
            });
            return;
        }
        const approve = check.approvals.filter(obj => obj.approvalType === "leave");
        console.log({approve});

        const exists = check.leaveAssignment.some(obj => obj.leaveTypeId === leaveTypeId);

        if (!exists) {
        res.status(400).json({
            status: 400,
            error: "Leave doesn't exist under user profile"
        });
        return;
        }

        if (!approve && check.managerId) {
            res.status(400).json({
                status: 400,
                error: "You have not been assigned a manager yet"
            });
            return;
            }

        LeaveRecords.findOneAndUpdate({ _id: req.params.id}, { 
            $set: { 
                leaveTypeId: leaveTypeId && leaveTypeId,
                leaveTypeName: leaveType.leaveName && leaveType.leaveName,
                leaveStartDate: leaveStartDate && leaveStartDate,
                leaveEndDate: leaveEndDate && leaveEndDate,
                leaveApprover: approve && approve[0].approverId,
                approver: approve && approve[0].approver,
                comments: comments && comments, 
                noOfLeaveDays: noOfLeaveDays && noOfLeaveDays
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

                    return;

                } else {

                    // const checkUpdated = Employee.findOne({ _id: req.params.id })
                    // AuditTrail.findOneAndUpdate({ companyId: company[0]._id},
                    //     { $push: { humanResources: { 
        
                    //         userName: checkUpdated.firstName && checkUpdated.lastName,
                    //         email: checkUpdated.email && checkUpdated.email,
                    //         action: `Super admin updated ${checkUpdated.firstName} ${checkUpdated.lastName} records`,
                    //         dateTime: new Date()

                    //      }}
                    //    },
                    //         function (
                    //             err,
                    //             result
                    //         ) {
                    //             if (err) {
                    //                 res.status(401).json({
                    //                     status: 401,
                    //                     success: false,
                    //                     error: err
                
                    //                 })
                    //                 return;
                
                    //             } else {
                
                
                    //                 res.status(200).json({
                    //                     status: 200,
                    //                     success: true,
                    //                     data: "Update Successful"
                    //                 })
                    //                 return;
                
                    //             }
                    //         })


                            res.status(200).json({
                                status: 200,
                                success: true,
                                data: "Update Successful"
                            })
                            return;
                }
            })



    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })

        return;

    }
}
export default updateLeaveApplication;



