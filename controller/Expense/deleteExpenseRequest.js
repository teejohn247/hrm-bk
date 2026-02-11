
// import dotenv from 'dotenv';
// import Department from '../../model/ExpenseRequests';
// import Employee from '../../model/Employees';

// import utils from '../../config/utils';

// import { emailTemp } from '../../emailTemplate';


// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);



// const deleteExpenseRequest = async (req, res) => {

//     try {

//         const department = await Department.findOne({_id: req.params.id})
//         const employee = await Employee.findOne({_id: department.employeeId})


//         console.log(department)
//         if(department.length < 1){
//             res.status(404).json({
//                 status:404,
//                 success: false,
//                 error:'No Expense Request Found'
//             })
//             return
//         }else{
//             Department.remove({ _id: req.params.id, status: 'Pending'},
//                 function (
//                     err,
//                     result
//                 ) {
    
//                     console.log(result)
    
//                     if (err) {
//                         res.status(401).json({
//                             status: 401,
//                             success: false,
//                             error: err
//                         })
//                     }
//                     else {

//                         Employee.findOneAndUpdate(
//                             { _id: department.employeeId },
//                             {
//                               $set: {
//                                 "expenseDetails.cardBalance":
//                                   Number(employee.expenseDetails.cardBalance) + Number(department.amount),
//                                 "expenseDetails.totalSpent":
//                                   Number(employee.expenseDetails.totalSpent) - Number(department.amount),
//                                 "expenseDetails.currentSpent": Number(department.amount),
//                                 "expenseDetails.currentExpense":
//                                   Number(employee.expenseDetails.currentExpense) - Number(department.amount),
//                               },
//                             },
//                             async function (err, result) {
//                               if (err) {
//                                 res.status(401).json({
//                                   status: 401,
//                                   success: false,
//                                   error: err,
//                                 });
                  
//                                 return;
//                               } else {
//                                 // const history = await Employee.findOneAndUpdate(
//                                 //   { _id: req.payload.id },
//                                 //   {
//                                 //     $push: {
//                                 //       "expenseDetails.expenseHistory": {
                  
//                                 //           employeeId: req.payload.id,
//                                 //           companyId: employee.companyId,
//                                 //           companyName: employee.companyName,
//                                 //           expenseTypeId,
//                                 //           expenseTypeName: expense.expenseCardName,
//                                 //           expenseDate,
//                                 //           attachment: image,
//                                 //           approver: approve[0].approval,
//                                 //           approverId: approve[0].approvalId,
//                                 //           amount,
//                                 //           image,
//                                 //           description,
//                                 //       },
//                                 //     },
//                                 //   }
//                                 // );
                  
                                
                  
//                                 // console.log({ history });
//                                 // if (history) {
//                                 //   res.status(200).json({
//                                 //     status: 200,
//                                 //     success: true,
//                                 //     data: history
//                                 //   });
//                                 //   return;
//                                 // } else {
//                                 //   res.status(400).json({
//                                 //     status: 400,
//                                 //     error: "error saving expense history",
//                                 //   });
//                                 //   return;
//                                 // }
//                               }
//                             }
//                           );
//                         res.status(200).json({
//                             status: 200,
//                             success: true,
//                             data: "Expense Request Deleted successfully!"
//                         })
//                     }
    
//                 })
//         }

//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error
//         })
//     }
// }
// export default deleteExpenseRequest;


import dotenv from 'dotenv';
import ExpenseRequests from '../../model/ExpenseRequests';
import Employee from '../../model/Employees';
import Company from '../../model/Company';

dotenv.config();

/**
 * Delete an expense request (only if status is Pending)
 * Refunds the amount back to employee's card balance
 * @route DELETE /api/expense/request/:id
 */
const deleteExpenseRequest = async (req, res) => {
    try {
        const expenseId = req.params.id;
        const userId = req.payload.id;

        // Validate expense ID
        if (!expenseId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Expense request ID is required'
            });
        }

        // Check if user is company or authorized employee
        const [company, employee] = await Promise.all([
            Company.findById(userId).lean(),
            Employee.findById(userId).lean()
        ]);

        let userCompany;
        let isAuthorized = false;

        if (company) {
            userCompany = company;
            isAuthorized = true;
        } else if (employee) {
            userCompany = await Company.findById(employee.companyId).lean();
            
            if (!userCompany) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'Company not found'
                });
            }

            // Authorization check - can delete own requests or admin can delete any
            isAuthorized = 
                employee.isSuperAdmin === true ||
                employee.role === 'Admin' ||
                employee.roleName === 'Admin' ||
                employee.companyRole === 'Admin' ||
                employee.permissions?.expenseManagement?.delete_expense_request === true;
        } else {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'User not found'
            });
        }

        // Find the expense request
        const expenseRequest = await ExpenseRequests.findOne({
            _id: expenseId,
            companyId: userCompany._id.toString()
        });

        if (!expenseRequest) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Expense request not found or does not belong to your company'
            });
        }

        // Check if expense belongs to user (if not admin)
        if (!isAuthorized && expenseRequest.employeeId.toString() !== userId) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'You can only delete your own expense requests'
            });
        }

        // Can only delete pending requests
        if (expenseRequest.status !== 'Pending') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: `Cannot delete expense request with status: ${expenseRequest.status}. Only pending requests can be deleted.`
            });
        }

        // Get employee details for refund
        const expenseEmployee = await Employee.findById(expenseRequest.employeeId);

        if (!expenseEmployee) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Employee associated with this expense not found'
            });
        }

        const expenseAmount = Number(expenseRequest.amount) || 0;

        // Calculate updated balances
        const currentCardBalance = Number(expenseEmployee.expenseDetails?.cardBalance) || 0;
        const currentTotalSpent = Number(expenseEmployee.expenseDetails?.totalSpent) || 0;
        const currentExpense = Number(expenseEmployee.expenseDetails?.currentExpense) || 0;

        const updatedCardBalance = currentCardBalance + expenseAmount;
        const updatedTotalSpent = Math.max(0, currentTotalSpent - expenseAmount);
        const updatedCurrentExpense = Math.max(0, currentExpense - expenseAmount);

        // Delete expense request and update employee in parallel
        const [deletedExpense, updatedEmployee] = await Promise.all([
            ExpenseRequests.findByIdAndDelete(expenseId),
            Employee.findByIdAndUpdate(
                expenseRequest.employeeId,
                {
                    $set: {
                        'expenseDetails.cardBalance': updatedCardBalance,
                        'expenseDetails.totalSpent': updatedTotalSpent,
                        'expenseDetails.currentSpent': expenseAmount,
                        'expenseDetails.currentExpense': updatedCurrentExpense
                    }
                },
                { new: true }
            ).select('expenseDetails firstName lastName fullName')
        ]);

        if (!deletedExpense) {
            return res.status(500).json({
                status: 500,
                success: false,
                error: 'Failed to delete expense request'
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Expense request deleted successfully',
            data: {
                deletedExpense: {
                    id: deletedExpense._id,
                    amount: expenseAmount,
                    description: deletedExpense.description,
                    expenseDate: deletedExpense.expenseDate
                },
                refund: {
                    employeeName: updatedEmployee.fullName || `${updatedEmployee.firstName} ${updatedEmployee.lastName}`,
                    refundedAmount: expenseAmount,
                    previousBalance: currentCardBalance,
                    newBalance: updatedCardBalance,
                    previousTotalSpent: currentTotalSpent,
                    newTotalSpent: updatedTotalSpent
                }
            }
        });

    } catch (error) {
        console.error('[DeleteExpenseRequest] Error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid ID format'
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while deleting the expense request'
        });
    }
};

export default deleteExpenseRequest;
