
import dotenv from 'dotenv';
import Department from '../../model/ExpenseRequests';
import Company from '../../model/Company';


import Employee from '../../model/Employees';

import utils from '../../config/utils';

import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const updateExpenseRequest = async (req, res) => {

    try {
      const { expenseTypeId, expenseDate, amount, image, description } = req.body;

      console.log({ expenseTypeId, expenseDate, amount, image, description })

        const expense = await Department.findOne({_id: req.params.id})

        console.log({expense})
        const employee = await Employee.findOne({_id: expense.employeeId})
        let company = await Company.findOne({ _id: employee.companyId });
        console.log({company})
        console.log(req.payload)



        if(!expense){
            res.status(404).json({
                status:404,
                success: false,
                error:'No Expense Request Found'
            })
            return
        }else{

        console.log({
          employeeId: req.payload.id && req.payload.id,
              employeeName: employee.fullName ? employee.fullName : `${employee.firstName} ${employee.lastName}`,
              companyId: employee.companyId && employee.companyId,
              companyName: employee.companyName && employee.companyName,
              expenseTypeId: expenseTypeId && expenseTypeId,
              expenseTypeName: expense && expense.expenseTypeName,
              expenseDate: expenseDate && expenseDate,
              attachment: image && image,
              amount: amount && amount,
              image: image && image,
              description: description && description,
        })

        // Designation.findOneAndUpdate({ _id:  { $in: designations }}, { 
        //   $push: { assignedAppraisals: {
        //       appraisalId,
        //       appraisalName: appraisal.groupName,
        //   }},



    //     FinalRating.findOneAndUpdate({ _id: req.params.id}, { 
    //       $set: { 
    //           companyId: company._id ,
    //           companyName: company.companyName,
    //           appraisalPeriodId: appraisalPeriodId && appraisalPeriodId,
    //           appraisalPeriodName: appraisalPeriod.appraisalPeriodName && appraisalPeriod.appraisalPeriodName,
    //           appraisalPeriodStartDate: appraisalPeriod.StartDate && appraisalPeriod.StartDate,
    //           appraisalPeriodEndDate: appraisalPeriod.EndDate && appraisalPeriod.EndDate,
    //           appraisalPeriodActiveDate:  appraisalPeriod.activeDate && appraisalPeriod.activeDate,
    //           appraisalPeriodInactiveDate:  appraisalPeriod.inactiveDate && appraisalPeriod.inactiveDate,
    //           groupRating: groups && groups
    //       }
    //  },
           Department.findOneAndUpdate({ _id: req.params.id, status: 'Pending'},
            {
             $set: {
              employeeId: req.payload.id && req.payload.id,
              employeeName: employee.fullName ? employee.fullName : `${employee.firstName} ${employee.lastName}`,
              companyId: employee.companyId,
              companyName: employee.companyName,
              expenseTypeId: expenseTypeId && expenseTypeId,
              expenseTypeName: expense && expense.expenseTypeName,
              expenseDate: expenseDate && expenseDate,
              attachment: image && image,
              amount: amount && amount,
              image: image && image,
              description: description && description,
             }
            },
                async function (
                    err,
                    result
                ) {
    
                    console.log(result)
                    console.log(err)

    
                    if (err) {
                        res.status(401).json({
                            status: 401,
                            success: false,
                            error: err
                        })
                    }
                    else {

                     
                    }

               
    
                })


                Employee.findOneAndUpdate(
                  { _id: expense.employeeId },
                  {
                    $set: {
                      "expenseDetails.cardBalance":
                        Number(employee.expenseDetails.cardBalance) - Number(expense.amount) + Number(amount),
                      "expenseDetails.totalSpent":
                        Number(employee.expenseDetails.totalSpent) - Number(expense.amount) + Number(amount),
                      "expenseDetails.currentSpent": Number(amount),
                      "expenseDetails.currentExpense":
                        Number(employee.expenseDetails.currentExpense) - Number(expense.amount) + Number(amount),
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
                    }
                  }
                );
              res.status(200).json({
                  status: 200,
                  success: true,
                  data: "Expense Updated Successfully!"
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
export default updateExpenseRequest;



