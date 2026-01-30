
import dotenv from 'dotenv';
import Employee from '../../model/Leaves';
import Roles from '../../model/Roles';
import AuditTrail from '../../model/AuditTrail';
import Company from '../../model/Company';
import utils from '../../config/utils';
import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const updateLeave = async (req, res) => {

    try {
   
        const { leaveName, description  } = req.body;

        const check = await Employee.findOne({ _id: req.params.id })
        let company = await Company.find({ _id: req.payload.id });


        if (!check) {
            res.status(400).json({
                status: 400,
                error: "Employee doesn't exist"
            })
            return;
        }
    

        Employee.findOneAndUpdate({ _id: req.params.id}, { 
            $set: { 
                leaveName: leaveName && leaveName,
                description : description && description 
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

                } else {
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
export default updateLeave;



