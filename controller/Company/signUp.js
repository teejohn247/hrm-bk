
import dotenv from 'dotenv';
import Company from '../../model/Company';
import bcrypt from 'bcrypt';

import utils from '../../config/utils';
import { sendEmail } from '../../config/email';
import {emailTemp} from '../../emailTemplate';

const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const signUp = async (req, res) => {

    try {
       
        const {email, password} = req.body;
        let company = await Company.findOne({ email: email });


        if (company) {

            res.status(400).json({
                status: 400,
                error: `A user with email: ${email} already exist`
            })
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        console.log(salt, hashed)

        const token = utils.encodeSignUpToken(email, password);

        const receivers= [{
            email: email
        }]

        let data = `<div>
        <p style="padding: 32px 0; text-align:left !important; font-weight: 700; font-size: 20px;font-family: 'DM Sans';">
        Hi,
        </p> 
        

        <p style="font-size: 16px; text-align:left !important; font-weight: 300;">

        Click on this link to complete your registration process <a href="https://makers-hrm-1086159474664.europe-west1.run.app/app/${token}">Makers ERP Platform</a> as an employee 

        <br><br>
        </p>
        
        <div>`


        let resp = emailTemp(data, 'Complete Registration')
        console.log({token})

        await sendEmail(req, res, email, receivers, 'Email Confirmation', resp);

        res.status(200).json({
            status: 200,
            message: `A confirmation email has been sent to ${email}`
        })


    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default signUp;