import dotenv from 'dotenv';
import Company from '../../../model/AceErps';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {emailTemp }from '../../../emailTemplate';
import {sendEmail }from '../../../config/email';

const sgMail = require('@sendgrid/mail')

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);



const generatePasswordForAceERP = async (req, res) => {
    try {
        const email = 'aceerp@aceall.io';
        const randomBytes = crypto.randomBytes(12).toString('hex');
        const specialChars = '!@#$%^&*';
        const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        // Add 2 random special characters and 2 uppercase letters
        const generatedPassword = randomBytes +
            specialChars[Math.floor(Math.random() * specialChars.length)] +
            specialChars[Math.floor(Math.random() * specialChars.length)] +
            uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)] +
            uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)];

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(generatedPassword, salt);

        let company = await Company.findOne({ email });

        if (company) {
            // Update existing company's password
            await Company.findOneAndUpdate(
                { email },
                { $set: { password: hashedPassword } },
                { new: true }
            );
        } else {
            // Create new company if it doesn't exist
            company = new Company({
                companyName: 'AceERP',
                email,
                password: hashedPassword,
            });
            await company.save();
        }

        const receivers= [{
            email: email
        }]

        let data = `<div>
        <p style="padding: 32px 0; text-align:left !important; font-weight: 700; font-size: 20px;font-family: 'DM Sans';">
        Hi,
        </p> 
        

        <p style="font-size: 16px; text-align:left !important; font-weight: 300;">

        A password has been generated for your AceERP account.
        Below is your password: 
        <br>
        <br>

        ${generatedPassword}

        <br><br>
        </p>
        
        <div>`


        let resp = emailTemp(data, 'AceERP Password')
        console.log({resp})

        await sendEmail(req, res, email, receivers, 'AceERP Password', resp);

        res.status(200).json({
            status: 200,
            message: 'Password generated and saved successfully',
            generatedPassword // Note: Remove this in production
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message
        });
    }
}

export default generatePasswordForAceERP ;
