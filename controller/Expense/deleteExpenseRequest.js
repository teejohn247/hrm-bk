
import dotenv from 'dotenv';
import Department from '../../model/ExpenseRequests';
import Employee from '../../model/Employees';

import utils from '../../config/utils';

import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const deleteExpenseRequest = async (req, res) => {

    try {

        const department = await Department.findOne({_id: req.params.id})
        const employee = await Employee.findOne({_id: department.employeeId})


        console.log(department)
        if(department.length < 1){
            res.status(404).json({
                status:404,
                success: false,
                error:'No Expense Request Found'
            })
            return
        }else{
            Department.remove({ _id: req.params.id, status: 'Pending'},
                function (
                    err,
                    result
                ) {
    
                    console.log(result)
    
                    if (err) {
                        res.status(401).json({
                            status: 401,
                            success: false,
                            error: err
                        })
                    }
                    else {

                        Employee.findOneAndUpdate(
                            { _id: department.employeeId },
                            {
                              $set: {
                                "expenseDetails.cardBalance":
                                  Number(employee.expenseDetails.cardBalance) + Number(department.amount),
                                "expenseDetails.totalSpent":
                                  Number(employee.expenseDetails.totalSpent) - Number(department.amount),
                                "expenseDetails.currentSpent": Number(department.amount),
                                "expenseDetails.currentExpense":
                                  Number(employee.expenseDetails.currentExpense) - Number(department.amount),
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
                                //   res.status(200).json({
                                //     status: 200,
                                //     success: true,
                                //     data: history
                                //   });
                                //   return;
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
                        res.status(200).json({
                            status: 200,
                            success: true,
                            data: "Expense Request Deleted successfully!"
                        })
                    }
    
                })
        }

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default deleteExpenseRequest;



