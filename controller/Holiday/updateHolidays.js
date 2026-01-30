
import dotenv from 'dotenv';
import Employee from '../../model/Holidays';
import Roles from '../../model/Roles';
import AuditTrail from '../../model/AuditTrail';
import Company from '../../model/Company';
import utils from '../../config/utils';
import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const updateHoliday = async (req, res) => {

    try {
   
        const { holidayName, description, date  } = req.body;

        const check = await Employee.findOne({ _id: req.params.id });

        console.log(req.body)


        if (!check) {
            res.status(400).json({
                status: 400,
                error: "Holiday doesn't exist"
            })
            return;
        }
    

        Employee.findOneAndUpdate({ _id: req.params.id}, { 
            $set: { 
                holidayName: holidayName && holidayName,
                description : description && description,
                date : date,
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
                    console.log({result})
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
export default updateHoliday;



