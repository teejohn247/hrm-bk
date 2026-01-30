import dotenv from "dotenv";
import Role from "../../model/Role";
import Company from "../../model/Company";
import Leave from "../../model/Expense";
import Employee from "../../model/Employees";
import Expense from "../../model/Expense";
import ExpenseRequest from "../../model/ExpenseRequests";
import { emailTemp } from '../../emailTemplate';
import { sendEmail } from '../../config/email';
import moment  from "moment";
const sgMail = require("@sendgrid/mail");

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const createExpenseRequest = async (req, res) => {

  try {
    const { expenseTypeId, expenseDate, amount, image, description } = req.body;


const [day, month, year] = expenseDate.split('-'); // Split the string into day, month, and year parts
const isoDate = new Date(`${year}-${month}-${day}`).toISOString();



    let expense = await Expense.findOne({ _id: expenseTypeId });
    let employee = await Employee.findOne({ _id: req.payload.id })


    let company = await Company.findOne({ _id: employee.companyId });
  

    const checkManager = await Employee.findOne({ _id: employee.managerId});

    console.log({expense})


    if (!company.companyName) {
      res.status(400).json({
        status: 400,
        error: "No company has been created for this account",
      });
      return;
    }
 

    if (
      Number(employee.expenseDetails.cardLimit) == 0 
    ) {
      res.status(400).json({
        status: 400,
        error: "Card limit has not been set",
      });
      return;
    }

    if (Number(amount) > Number(employee.expenseDetails.cardBalance)) {
      res.status(400).json({
        status: 400,
        error:
          "This amount is greater than your card balance. Make a request to increase your limit",
      });
      return;
    }

    let data = {}

    data.employeeName = employee.fullName
    data.profilePic = employee.profilePic
    data.department = employee.department
    data.designationName = employee.designationName
    data.managerName = employee.managerName


    console.log('here')
    const approve = employee.approvals.filter(obj => obj.approvalType === "expense");

    console.log({approve})

    let expenseRequest = new ExpenseRequest({
      employeeId: req.payload.id,
      employeeName: employee.fullName ? employee.fullName : `${employee.firstName} ${employee.lastName}`,
      companyId: employee.companyId,
      companyName: employee.companyName,
      expenseTypeId,
      expenseTypeName: expense.expenseType,
      expenseDate: isoDate,
      attachment: image,
      approver: approve[0].approval,
      approverId: approve[0].approvalId,
      amount,
      image,
      description,
      employeeDetails: data
    });


    await expenseRequest
      .save()
      .then(async (adm) => {
        console.log(adm);

        // Employee.findOneAndUpdate(
        //   { _id: req.payload.id },
        //   {
        //     $set: {
        //       "expenseDetails.cardBalance":
        //         Number(employee.expenseDetails.cardBalance) - Number(amount),
        //       "expenseDetails.totalSpent":
        //         Number(employee.expenseDetails.totalSpent) + Number(amount),
        //       "expenseDetails.currentSpent": Number(amount),
        //       "expenseDetails.currentExpense":
        //         Number(employee.expenseDetails.currentExpense) + Number(amount),
        //     },
        //   },
        //   async function (err, result) {
        //     if (err) {
        //       res.status(401).json({
        //         status: 401,
        //         success: false,
        //         error: err,
        //       });

        //       return;
            // } else {
              const history = await Employee.findOneAndUpdate(
                { _id: req.payload.id },
                {
                  $push: {
                    "expenseDetails.expenseHistory": {

                        employeeId: req.payload.id,
                        companyId: employee.companyId,
                        companyName: employee.companyName,
                        expenseTypeId,
                        expenseTypeName: expense.expenseCardName,
                        expenseDate:  isoDate,
                        attachment: image,
                        approver: approve[0].approval,
                        approverId: approve[0].approvalId,
                        amount,
                        image,
                        description,
                    },
                  },
                }
              );



              console.log({ history });
              if (history) {

                let data = `<div>
                <p style="padding: 32px 0; text-align: left !important; font-weight: 700; font-size: 20px;font-family: 'DM Sans';">
                Hi,
                </p> 
        
                <p style="font-size: 16px; text-align: left !important; font-weight: 300;">
    
                 ${employee.firstName ? employee.firstName : employee.fullName} has made an expense request. 
                 Log in to your account to accept or reject.
               
                <br><br>
                </p>
                
                <div>`
        
               let resp = emailTemp(data, 'Expense Application Notification')
               console.log('heeheh1')
    
    
               const receivers = [
                {
                  email: checkManager.email
                }
              ]
              console.log('heeheh')
        
                await sendEmail(req, res, checkManager.email, receivers, 'Expense Application Notification', resp);
    
                let employeeData = `<div>
                <p style="padding: 32px 0; text-align: left !important; font-weight: 700; font-size: 20px;font-family: 'DM Sans';">
                Hi,
                </p> 
        
                <p style="font-size: 16px; text-align: left !important; font-weight: 300;">
    
                 Your expense approver has received your expense request. 
                 A decision would be made soon.
               
                <br><br>
                </p>
                
                <div>`
        
               let respEmployee = emailTemp( employeeData, 'Expense Application Notification')
               console.log('heeheh2')
    
               const receiverEmployee = [
                {
                  email: employee.email
                }
              ]
              console.log('heeheh')
        
                await sendEmail(req, res, employee.email, receiverEmployee, 'Expense Application Notification', respEmployee);
                res.status(200).json({
                  status: 200,
                  success: true,
                  data: history
                });
                return;
              } else {
                res.status(400).json({
                  status: 400,
                  error: "error saving expense history",
                });
                return;
              }
            // }
        //   }
        // );
        
      })
      .catch((err) => {
        console.error(err);
        res.status(400).json({
          status: 400,
          success: false,
          error: err,
        });
      });
  } catch (error) {
    res.status(500).json({
      status: 500,
      success: false,
      error: error,
    });
  }
};
export default createExpenseRequest;
