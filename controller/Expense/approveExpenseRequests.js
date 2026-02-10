
// import dotenv from 'dotenv';
// import  LeaveRecords from '../../model/ExpenseRequests';
// import  Employee from '../../model/Employees';

// import Roles from '../../model/Roles';
// import AuditTrail from '../../model/AuditTrail';
// import Company from '../../model/Company';
// import utils from '../../config/utils';
// import { emailTemp } from '../../emailTemplate';
// import moment from 'moment';
// import { sendEmail } from '../../config/email';


// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);



// const approveExpense = async (req, res) => {

//     try {
   
      
// const { status, comment, requestId, approved } = req.body;
// console.log({requestId})


// let company = await Company.findOne({ _id: req.payload.id });
// const leaveType = await LeaveRecords.findOne({ _id: requestId});

// console.log({leaveType})
// const check = await Employee.findOne({ _id: leaveType.employeeId});
// let employee = await Employee.findOne({ _id: leaveType.employeeId })

// console.log({check})


// if (!check) {
//     res.status(400).json({
//         status: 400,
//         error: "Employee doesn't exist"
//     });
//     return;
// }

// if (!leaveType) {
//     res.status(400).json({
//         status: 400,
//         error: "Expense Request doesn't exist"
//     });
//     return;
// }
// const approve = employee.approvals.filter(obj => obj.approvalType === "expense");

// console.log(leaveType.employeeId)

// await leaveType.updateOne({
//     status: approved == true ? "Approved" : "Declined",
//     dateOfApproval:  new Date().toISOString(),
//     approved

// }).then(async (app) => {
    
// //     Employee.findOneAndUpdate({ _id: leaveType.userId }, { 
// //         $set: { 
// //             "leaveAssignment.$[i].leaveApproved": approved && approved,
// //             "leaveAssignment.$[i].status": approved == true ? "Approved" :approved == false && "Declined",
// //             "leaveAssignment.$[i].leaveStartDate": leaveType.leaveStartDate && leaveType.leaveStartDate,
// //             "leaveAssignment.$[i].leaveEndDate": leaveType.leaveEndDate && leaveType.leaveEndDate,
// //             "leaveAssignment.$[i].assignedNoOfDays": leaveType.assignedNoOfDays && leaveType.assignedNoOfDays,
// //             "leaveAssignment.$[i].decisionMessage": decisionMessage && decisionMessage,

// //         }
// //    },
// //    { 
// //     arrayFilters: [
// //         {
// //             "i.leaveTypeId": leaveType.leaveTypeId
// //         }
// //     ]},
// //         async function (
// //             err,
// //             result
// //         ) {
// //             if (err) {
// //                 res.status(401).json({
// //                     status: 401,
// //                     success: false,
// //                     error: err

// //                 })

//             // } else {


//                LeaveRecords.findOneAndUpdate({ _id: requestId}, { 
//                     $set: { 
//                        comment: comment
    
//                     }
//                },
//                     async function (
//                         err,
//                         result
//                     ) {
//                         if (err) {
//                             res.status(401).json({
//                                 status: 401,
//                                 success: false,
//                                 error: err
        
//                             })
        
//                         } else {


//                             if(leaveType.status == "Pending"){

//                               console.log({leaveType}, leaveType.status)
                                   
//                               Employee.findOneAndUpdate(
//                                 { _id: leaveType.employeeId},
//                                 {
//                                   $set: {
//                                     "expenseDetails.cardBalance":
//                                       Number(employee.expenseDetails.cardBalance) - Number(leaveType.amount),
//                                     "expenseDetails.cardLimit":
//                                       Number(employee.expenseDetails.cardBalance) - Number(leaveType.amount),
//                                     "expenseDetails.totalSpent":
//                                       Number(employee.expenseDetails.totalSpent) + Number(leaveType.amount),
//                                     "expenseDetails.currentSpent": Number(leaveType.amount),
//                                     "expenseDetails.currentExpense":
//                                       Number(employee.expenseDetails.currentExpense) + Number(leaveType.amount),
//                                   },
//                                 },
//                                 async function (err, result) {
//                                   if (err) {
//                                     res.status(401).json({
//                                       status: 401,
//                                       success: false,
//                                       error: err,
//                                     });
                      
//                                     return;
//                                   } else {
//                                     // const history = await Employee.findOneAndUpdate(
//                                     //   { _id: req.payload.id },
//                                     //   {
//                                     //     $push: {
//                                     //       "expenseDetails.expenseHistory": {
                      
//                                     //           employeeId: req.payload.id,
//                                     //           companyId: employee.companyId,
//                                     //           companyName: employee.companyName,
//                                     //           expenseTypeId,
//                                     //           expenseTypeName: expense.expenseCardName,
//                                     //           expenseDate,
//                                     //           attachment: image,
//                                     //           approver: approve[0].approval,
//                                     //           approverId: approve[0].approvalId,
//                                     //           amount,
//                                     //           image,
//                                     //           description,
//                                     //       },
//                                     //     },
//                                     //   }
//                                     // );
                      
                      
                      
//                                     // console.log({ history });
//                                     // if (history) {
                      
                                  
//                                     // } else {
//                                     //   res.status(400).json({
//                                     //     status: 400,
//                                     //     error: "error saving expense history",
//                                     //   });
//                                     //   return;
//                                     // }
//                                   }
//                                 }
//                               );


//                             let data = `<div>
//                             <p style="padding: 32px 0; text-align: left !important; font-weight: 700; font-size: 20px;font-family: 'DM Sans';">
//                             Hi ${check.firstName},
//                             </p> 
                    
//                             <p style="font-size: 16px; text-align: left !important; font-weight: 300;">
                            
//                              Your expense request has been ${approved == true ? "Approved" : "Declined"}
                           
//                             <br><br>
//                             </p>
                            
//                             <div>`
                    
//                            let resp = emailTemp(data, 'Expense Request Application Notification')
                
//                            const receivers = [
//                             {
//                               email: check.email
//                             }
//                           ]
                    
//                             await sendEmail(req, res, check.email, receivers, 'Expense Request Application Notification', resp);
        
//                             res.status(200).json({
//                                 status: 200,
//                                 success: true,
//                                 data: "Update Successful"
//                             })
//                            return
//                             } else{
//                                 res.status(400).json({
//                                     status: 400,
//                                     success: true,
//                                     data: "You have already approved or declined this request"
//                                 })
//                             }

                        
                   
                              
    
                           
//                         }
//                     })
               
//             // }
//         // })
 

// });


//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error
//         })
//     }
// }
// export default approveExpense;








// // expenseDetails: {
// //     expenseTypeId: {
// //       type: String,
// //     },
// //     cardNo: {
// //       type: String,
// //     },
// //     cardHolder: {
// //       type: String,
// //     },
// //     dateIssued: {
// //       type: String,
// //     },
// //     expiryDate: {
// //       type: String,
// //       default: "",
// //     },
// //     cardLimit: {
// //       type: Number,
// //       default: 0,
// //     },
// //     cardBalance: {
// //       type: Number,
// //       default: 0,
// //     },
// //     totalSpent: {
// //       type: Number,
// //       default: 0,
// //     },
// //     currentSpent: {
// //       type: Number,
// //       default: 0,
// //     },
// //     currentExpense: {
// //       type: Number,
// //       default: 0,
// //     },
 
// //     expenseHistory: [
// //       {
// //         expenseTypeId: { type: String, required: true },
// //         expenseTypeName: { type: String, required: true },
// //         expenseDate: { type: String, required: true },
// //         currency: { type: String },
// //         amount: { type: String, required: true },
// //         attachment: { type: String },
// //         approver: { type: String },
// //         approverId: { type: String },
// //         dateRemitted: { type: String },
// //         dateOfApproval: { type: String },
// //         description: { type: String },
// //         dateRequested: { type: Date, default: Date.now() },
// //       },
// //     ],
// //   },


import dotenv from 'dotenv';
import ExpenseRequests from '../../model/ExpenseRequests';
import Employee from '../../model/Employees';
import Company from '../../model/Company';
import Department from '../../model/Department';
import Notification from '../../model/Notification';
import { sendEmail } from '../../config/email';
import { emailTemp } from '../../emailTemplate';

dotenv.config();

/**
 * Approve or decline an expense request
 * Supports: Company accounts, Authorized employees, and Managers
 * @route PUT /api/expense/approve/:id
 */
const approveExpense = async (req, res) => {
    try {
        const { comment, approved, requestId } = req.body;
        // const requestId = req.params.id;
        const approverId = req.payload.id;

        // Validate input
        if (!requestId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Request ID is required'
            });
        }

        if (approved === undefined || typeof approved !== 'boolean') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Approval decision (true/false) is required'
            });
        }

        // Fetch expense request
        const expenseRequest = await ExpenseRequests.findById(requestId);

        if (!expenseRequest) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Expense request not found'
            });
        }

        // Check if already processed
        if (expenseRequest.status !== 'Pending') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: `This expense request has already been ${expenseRequest.status.toLowerCase()}`
            });
        }

        // Fetch employee who made the request
        const employee = await Employee.findById(expenseRequest.employeeId);

        if (!employee) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Employee not found'
            });
        }

        // Check authorization - Company OR Authorized Employee OR Manager
        const company = await Company.findOne({ _id: approverId });
        const isCompanyAccount = !!company;

        let isAuthorized = false;
        let approverName = '';
        let authorizationReason = '';

        if (isCompanyAccount) {
            // Company admin can approve if expense request belongs to their company
            isAuthorized = expenseRequest.companyId === company._id.toString();
            approverName = company.companyName;
            authorizationReason = 'Company Admin';
            console.log(`[ApproveExpense] Company admin: ${company.companyName}`);
        } else {
            // Employee trying to approve
            const approver = await Employee.findById(approverId);

            if (!approver) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'Approver not found'
                });
            }

            // Check if expense belongs to same company
            if (expenseRequest.companyId !== approver.companyId) {
                return res.status(403).json({
                    status: 403,
                    success: false,
                    error: 'Expense request does not belong to your company'
                });
            }

            approverName = approver.fullName || `${approver.firstName} ${approver.lastName}`;

            // Check 1: Super Admin or Admin role
            if (approver.isSuperAdmin === true || approver.role === 'Admin' || approver.roleName === 'Admin') {
                isAuthorized = true;
                authorizationReason = approver.isSuperAdmin ? 'Super Admin' : 'Admin';
            }

            // Check 2: Has explicit expense approval permission in employee's approvals
            if (!isAuthorized) {
                const hasApprovalPermission = employee.approvals?.some(
                    approval => approval.approvalType === 'expense' && 
                               approval.approvalId?.toString() === approverId.toString()
                );

                if (hasApprovalPermission) {
                    isAuthorized = true;
                    authorizationReason = 'Designated Approver';
                }
            }

            // Check 3: Is the employee's direct manager (via managerId)
            if (!isAuthorized && employee.managerId) {
                if (employee.managerId.toString() === approverId.toString()) {
                    isAuthorized = true;
                    authorizationReason = 'Direct Manager';
                    console.log(`[ApproveExpense] Direct manager approval by ${approverName}`);
                }
            }

            // Check 4: Is a department manager (manages department employee belongs to)
            if (!isAuthorized && approver.isManager === true && employee.departmentId) {
                const department = await Department.findOne({
                    _id: employee.departmentId,
                    managerId: approverId.toString()
                });

                if (department) {
                    isAuthorized = true;
                    authorizationReason = 'Department Manager';
                    console.log(`[ApproveExpense] Department manager approval by ${approverName} for department: ${department.departmentName}`);
                }
            }

            // Check 5: Has general expense approval permission in their own approvals array
            if (!isAuthorized) {
                const hasGeneralApprovalPermission = approver.approvals?.some(
                    approval => approval.approvalType === 'expense'
                );

                if (hasGeneralApprovalPermission && approver.isManager === true) {
                    isAuthorized = true;
                    authorizationReason = 'Manager with Expense Approval Rights';
                }
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'You are not authorized to approve this expense request'
            });
        }

        console.log(`[ApproveExpense] Authorization: ${authorizationReason} - ${approverName}`);

        // Determine new status
        const newStatus = approved ? 'Approved' : 'Declined';
        const amount = Number(expenseRequest.amount || 0);

        // If approving, validate sufficient balance
        if (approved && amount > 0) {
            const currentBalance = Number(employee.expenseDetails?.cardBalance || 0);

            if (currentBalance < amount) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: `Insufficient card balance. Available: ₦${currentBalance.toLocaleString()}, Required: ₦${amount.toLocaleString()}`
                });
            }
        }

        // Update expense request
        const updatedExpense = await ExpenseRequests.findByIdAndUpdate(
            requestId,
            {
                $set: {
                    status: newStatus,
                    approved: approved,
                    comment: comment || '',
                    dateOfApproval: new Date(),
                    approvedBy: approverId,
                    approverName: approverName,
                    authorizationReason: authorizationReason
                }
            },
            { new: true }
        );

        // If approved, update employee expense balance
        let newBalance = employee.expenseDetails?.cardBalance || 0;

        if (approved && amount > 0) {
            const currentBalance = Number(employee.expenseDetails?.cardBalance || 0);
            const currentLimit = Number(employee.expenseDetails?.cardLimit || 0);
            const totalSpent = Number(employee.expenseDetails?.totalSpent || 0);
            const currentExpense = Number(employee.expenseDetails?.currentExpense || 0);

            newBalance = currentBalance - amount;

            await Employee.findByIdAndUpdate(
                employee._id,
                {
                    $set: {
                        'expenseDetails.cardBalance': newBalance,
                        'expenseDetails.cardLimit': currentLimit - amount,
                        'expenseDetails.totalSpent': totalSpent + amount,
                        'expenseDetails.currentSpent': amount,
                        'expenseDetails.currentExpense': currentExpense + amount
                    },
                    $push: {
                        'expenseDetails.expenseHistory': {
                            expenseRequestId: requestId.toString(),
                            expenseTypeId: expenseRequest.expenseTypeId,
                            expenseTypeName: expenseRequest.expenseTypeName || 'Expense',
                            expenseDate: expenseRequest.expenseDate || new Date(),
                            amount: amount,
                            description: expenseRequest.description || '',
                            attachment: expenseRequest.attachment || '',
                            approver: approverName,
                            approverId: approverId.toString(),
                            dateOfApproval: new Date(),
                            status: 'Approved'
                        }
                    }
                }
            );

            console.log(`[ApproveExpense] Deducted ₦${amount.toLocaleString()} from employee balance. New balance: ₦${newBalance.toLocaleString()}`);
        }

        // Send in-app notification
        try {
            await Notification.create({
                notificationType: 'Expense Request',
                notificationContent: `Your expense request for ₦${amount.toLocaleString()} has been ${newStatus} by ${approverName} (${authorizationReason})${comment ? `. Comment: ${comment}` : ''}`,
                recipientId: employee._id.toString(),
                companyName: employee.companyName,
                companyId: employee.companyId,
                created_by: approverId.toString(),
                read: false,
                expenseRequestId: requestId.toString()
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        // Send email notification
        try {
            const emailContent = `
                <div>
                    <p style="padding: 32px 0; text-align: left !important; font-weight: 700; font-size: 20px; font-family: 'DM Sans';">
                        Hi ${employee.firstName},
                    </p> 
                    
                    <p style="font-size: 16px; text-align: left !important; font-weight: 300;">
                        Your expense request for <strong>₦${amount.toLocaleString()}</strong> has been <strong>${newStatus}</strong> by ${approverName} (${authorizationReason}).
                        <br><br>
                        ${comment ? `<strong>Comment:</strong> ${comment}<br><br>` : ''}
                        ${approved ? `The amount has been deducted from your expense card balance.<br>New Balance: <strong>₦${newBalance.toLocaleString()}</strong>` : 'No deduction was made from your account.'}
                    </p>
                </div>
            `;

            const htmlEmail = emailTemp(emailContent, 'Expense Request Notification');
            const receivers = [{ email: employee.email }];

            await sendEmail(
                req, 
                res, 
                employee.email, 
                receivers, 
                'Expense Request Notification', 
                htmlEmail
            );
        } catch (emailError) {
            console.error('Email notification failed:', emailError);
            // Don't fail the request if email fails
        }

        console.log(`[ApproveExpense] Expense request ${newStatus} by ${approverName} (${authorizationReason})`);

        return res.status(200).json({
            status: 200,
            success: true,
            message: `Expense request ${newStatus.toLowerCase()} successfully`,
            data: {
                expenseId: requestId,
                status: newStatus,
                amount: amount,
                approver: approverName,
                authorizationReason: authorizationReason,
                employee: {
                    id: employee._id,
                    name: `${employee.firstName} ${employee.lastName}`,
                    newBalance: newBalance
                }
            }
        });

    } catch (error) {
        console.error('[ApproveExpense] Error:', {
            error: error.message,
            stack: error.stack,
            requestId: req.params?.id,
            approverId: req.payload?.id
        });

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid request ID format',
                details: error.message
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to process expense approval'
        });
    }
};

export default approveExpense;