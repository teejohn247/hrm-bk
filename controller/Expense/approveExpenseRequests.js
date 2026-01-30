
import dotenv from 'dotenv';
import  LeaveRecords from '../../model/ExpenseRequests';
import  Employee from '../../model/Employees';

import Roles from '../../model/Roles';
import AuditTrail from '../../model/AuditTrail';
import Company from '../../model/Company';
import utils from '../../config/utils';
import { emailTemp } from '../../emailTemplate';
import moment from 'moment';
import { sendEmail } from '../../config/email';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const approveExpense = async (req, res) => {

    try {
   
      
const { status, comment, requestId, approved } = req.body;
console.log({requestId})


let company = await Company.findOne({ _id: req.payload.id });
const leaveType = await LeaveRecords.findOne({ _id: requestId});

console.log({leaveType})
const check = await Employee.findOne({ _id: leaveType.employeeId});
let employee = await Employee.findOne({ _id: leaveType.employeeId })

console.log({check})


if (!check) {
    res.status(400).json({
        status: 400,
        error: "Employee doesn't exist"
    });
    return;
}

if (!leaveType) {
    res.status(400).json({
        status: 400,
        error: "Expense Request doesn't exist"
    });
    return;
}
const approve = employee.approvals.filter(obj => obj.approvalType === "expense");

console.log(leaveType.employeeId)

await leaveType.updateOne({
    status: approved == true ? "Approved" : "Declined",
    dateOfApproval:  new Date().toISOString(),
    approved

}).then(async (app) => {
    
//     Employee.findOneAndUpdate({ _id: leaveType.userId }, { 
//         $set: { 
//             "leaveAssignment.$[i].leaveApproved": approved && approved,
//             "leaveAssignment.$[i].status": approved == true ? "Approved" :approved == false && "Declined",
//             "leaveAssignment.$[i].leaveStartDate": leaveType.leaveStartDate && leaveType.leaveStartDate,
//             "leaveAssignment.$[i].leaveEndDate": leaveType.leaveEndDate && leaveType.leaveEndDate,
//             "leaveAssignment.$[i].assignedNoOfDays": leaveType.assignedNoOfDays && leaveType.assignedNoOfDays,
//             "leaveAssignment.$[i].decisionMessage": decisionMessage && decisionMessage,

//         }
//    },
//    { 
//     arrayFilters: [
//         {
//             "i.leaveTypeId": leaveType.leaveTypeId
//         }
//     ]},
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

            // } else {


               LeaveRecords.findOneAndUpdate({ _id: requestId}, { 
                    $set: { 
                       comment: comment
    
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


                            if(leaveType.status == "Pending"){

                              console.log({leaveType}, leaveType.status)
                                   
                              Employee.findOneAndUpdate(
                                { _id: leaveType.employeeId},
                                {
                                  $set: {
                                    "expenseDetails.cardBalance":
                                      Number(employee.expenseDetails.cardBalance) - Number(leaveType.amount),
                                    "expenseDetails.cardLimit":
                                      Number(employee.expenseDetails.cardBalance) - Number(leaveType.amount),
                                    "expenseDetails.totalSpent":
                                      Number(employee.expenseDetails.totalSpent) + Number(leaveType.amount),
                                    "expenseDetails.currentSpent": Number(leaveType.amount),
                                    "expenseDetails.currentExpense":
                                      Number(employee.expenseDetails.currentExpense) + Number(leaveType.amount),
                                  },
                                },
                                async function (err, result) {
                                  if (err) {
                                    res.status(401).json({
                                      status: 401,
                                      success: false,
                                      error: err,
                                    });
                      
                                    return;
                                  } else {
                                    // const history = await Employee.findOneAndUpdate(
                                    //   { _id: req.payload.id },
                                    //   {
                                    //     $push: {
                                    //       "expenseDetails.expenseHistory": {
                      
                                    //           employeeId: req.payload.id,
                                    //           companyId: employee.companyId,
                                    //           companyName: employee.companyName,
                                    //           expenseTypeId,
                                    //           expenseTypeName: expense.expenseCardName,
                                    //           expenseDate,
                                    //           attachment: image,
                                    //           approver: approve[0].approval,
                                    //           approverId: approve[0].approvalId,
                                    //           amount,
                                    //           image,
                                    //           description,
                                    //       },
                                    //     },
                                    //   }
                                    // );
                      
                      
                      
                                    // console.log({ history });
                                    // if (history) {
                      
                                  
                                    // } else {
                                    //   res.status(400).json({
                                    //     status: 400,
                                    //     error: "error saving expense history",
                                    //   });
                                    //   return;
                                    // }
                                  }
                                }
                              );


                            let data = `<div>
                            <p style="padding: 32px 0; text-align: left !important; font-weight: 700; font-size: 20px;font-family: 'DM Sans';">
                            Hi ${check.firstName},
                            </p> 
                    
                            <p style="font-size: 16px; text-align: left !important; font-weight: 300;">
                            
                             Your expense request has been ${approved == true ? "Approved" : "Declined"}
                           
                            <br><br>
                            </p>
                            
                            <div>`
                    
                           let resp = emailTemp(data, 'Expense Request Application Notification')
                
                           const receivers = [
                            {
                              email: check.email
                            }
                          ]
                    
                            await sendEmail(req, res, check.email, receivers, 'Expense Request Application Notification', resp);
        
                            res.status(200).json({
                                status: 200,
                                success: true,
                                data: "Update Successful"
                            })
                           return
                            } else{
                                res.status(400).json({
                                    status: 400,
                                    success: true,
                                    data: "You have already approved or declined this request"
                                })
                            }

                        
                   
                              
    
                           
                        }
                    })
               
            // }
        // })
 

});


    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default approveExpense;








// expenseDetails: {
//     expenseTypeId: {
//       type: String,
//     },
//     cardNo: {
//       type: String,
//     },
//     cardHolder: {
//       type: String,
//     },
//     dateIssued: {
//       type: String,
//     },
//     expiryDate: {
//       type: String,
//       default: "",
//     },
//     cardLimit: {
//       type: Number,
//       default: 0,
//     },
//     cardBalance: {
//       type: Number,
//       default: 0,
//     },
//     totalSpent: {
//       type: Number,
//       default: 0,
//     },
//     currentSpent: {
//       type: Number,
//       default: 0,
//     },
//     currentExpense: {
//       type: Number,
//       default: 0,
//     },
 
//     expenseHistory: [
//       {
//         expenseTypeId: { type: String, required: true },
//         expenseTypeName: { type: String, required: true },
//         expenseDate: { type: String, required: true },
//         currency: { type: String },
//         amount: { type: String, required: true },
//         attachment: { type: String },
//         approver: { type: String },
//         approverId: { type: String },
//         dateRemitted: { type: String },
//         dateOfApproval: { type: String },
//         description: { type: String },
//         dateRequested: { type: Date, default: Date.now() },
//       },
//     ],
//   },


 
        




