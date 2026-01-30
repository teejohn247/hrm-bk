
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



const setExpense = async (req, res) => {

    try {
   
        // const { firstName, lastName, dateOfBirth, departmentId , companyRole, designationId, phoneNumber, gender,
        // employmentType} = req.body;

       
        
        // const { firstName, lastName, personalEmail, personalPhone,maritalStatus, nextOfKinFullName, nextOfKinPhoneNumber, nextOfKinGender, nextOfKinRelationship, nextOfKinAddress,  nationality, country, city, gender, phoneNumber, address, dateOfBirth,
        //      paymentInformation} = req.body;


        //      console.log({paymentInformation})
        

        // const check = await Employee.findOne({ _id: req.payload.id });
        // console.log({check})

     
        // let company = await Company.find({ _id: check.companyId});
        // console.log({company})

        // console.log('img', req.body.image)

        // if (!check) {
        //     res.status(400).json({
        //         status: 400,
        //         error: "Employee doesn't exist"
        //     });
        //     return;
        // }
        Employee.updateMany(
            { 'approvals.approvalType': 'reimbursement' },
            { $set: { 'approvals.$.approvalType': 'expense' } },

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
                
                                    res.status(200).json({
                                        status: 200,
                                        success: true,
                                        data: "done"
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
export default setExpense;



