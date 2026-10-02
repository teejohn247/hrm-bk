import dotenv from 'dotenv';
import Company from '../../model/Company';
import bcrypt from 'bcrypt';
import utils from '../../config/utils';
import { sendEmail } from '../../config/email';
import { emailTemp } from '../../emailTemplate';
import { signUpRegistrationUrl } from '../../config/frontendUrl';
import { signUp as otpSignUp } from '../Auth/otpController';

dotenv.config();

const signUp = async (req, res) => {
    // If request contains companyName or lacks password, use the modern OTP verification flow
    if (req.body.companyName || !req.body.password) {
        return otpSignUp(req, res);
    }

    try {
        const { email, password } = req.body;
        const normalizedEmail = (email || '').toLowerCase().trim();

        const company = await Company.findOne({ email: normalizedEmail });

        if (company) {
            return res.status(400).json({
                status: 400,
                error: `A user with email: ${normalizedEmail} already exists`,
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        console.log(salt, hashed);

        const token = utils.encodeSignUpToken(normalizedEmail, password);

        const receivers = [{
            email: normalizedEmail,
        }];

        const data = `<div>
        <p style="padding: 32px 0; text-align:left !important; font-weight: 700; font-size: 20px;font-family: 'DM Sans';">
        Hi,
        </p> 

        <p style="font-size: 16px; text-align:left !important; font-weight: 300;">
        Click on this link to complete your registration process <a href="${signUpRegistrationUrl(token)}">Makers ERP Platform</a> as an employee 
        <br><br>
        </p>
        <div>`;

        const resp = emailTemp(data, 'Complete Registration');
        console.log({ token });

        await sendEmail(req, res, normalizedEmail, receivers, 'Email Confirmation', resp);

        return res.status(200).json({
            status: 200,
            message: `A confirmation email has been sent to ${normalizedEmail}`,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error,
        });
    }
};

export default signUp;