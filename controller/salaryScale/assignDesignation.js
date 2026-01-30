
import dotenv from 'dotenv';
import Employee from '../../model/Employees';
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



const assignDesignation = async (req, res) => {

    try {
   
        // const { firstName, lastName, dateOfBirth, departmentId , companyRole, designationId, phoneNumber, gender,
        // employmentType} = req.body;

        const { employees, designationId } = req.body;
        

        const check = await Designation.findOne({ _id: designationId });
        let company = await Company.findOne({ _id: req.payload.id });
        let emp = await Employee.findOne({ _id: { $in : employees }});



        if (!company) {
            res.status(400).json({
                status: 400,
                error: "Company doesn't exist"
            });
            return;
        }

        console.log({employees});

        let ids = []
        let ids2 = []


        check.leaveTypes.map((chk) => {
            ids.push(chk.leaveTypeId)
        });

        check.leaveTypes.map((chk) => {
            ids2.push(chk.expenseTypeId)
        });

        let checks_notification = await Employee.find({ _id:  { $in: employees }},
            { leaveAssignment: { $elemMatch: { leaveTypeId:  { $in: ids } }}})

            console.log(checks_notification)

            const dd = []

            checks_notification.map((chk) => {
                if(chk.leaveAssignment.length > 0){
                    dd.push(chk.leaveAssignment)
                }
            })

        let checks_expense = await Employee.find({ _id:  { $in: employees }},
            { leaveAssignment: { $elemMatch: { expenseTypeId:  { $in: ids2 } }}})

            console.log(checks_expense)

            const dd2 = []

            checks_notification.map((chk) => {
                if(chk.leaveAssignment.length > 0){
                    dd.push(chk.leaveAssignment)
                }
            })

            if (dd2.length > 0) {
                res.status(400).json({
                    status: 400,
                    error: 'The expense type  has already been assigned to one of the employees'
                })
                return
            }
            
          Employee.updateMany({ _id: { $in : employees }}, { 
            $push: { 
                leaveAssignment: check.leaveTypes,
            }
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
                    return;

                } else {
                    Employee.updateMany({ _id: { $in : employees }},
                        { $set: {
                            designationId: designationId,
                            designationName: check.designationName,
                            "expenseDetails.expenseTypeId":check.expenseCard[0].expenseTypeId,
                            "expenseDetails.cardCurrency": check.expenseCard[0].cardCurrency,
                            "expenseDetails.cardLimit": check.expenseCard[0].cardLimit,
                            "expenseDetails.cardBalance": check.expenseCard[0].cardLimit,
                            "expenseDetails.cardExpiry": check.expenseCard[0].cardExpiry,
                         }
                       },
                            function (
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
                
                
                                    res.status(200).json({
                                        status: 200,
                                        success: true,
                                        data: "Update Successful"
                                    })
                                    return;
                
                                }
                            })

                    // res.status(200).json({
                    //     status: 200,
                    //     success: true,
                    //     data: "Update Successful"
                    // })
                    // return;
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
export default assignDesignation;



