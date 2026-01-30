import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Admin from '../../../model/AceErps';
import utils from '../../../config/utils';
import { selectFields } from 'express-validator/src/select-fields';

const sgMail = require('@sendgrid/mail')



sgMail.setApiKey(process.env.SENDGRID_KEY);


dotenv.config();

const signInAceERP = async (req, res) => {

    try {
        const { email, password } = req.body;

        if (!email) {
            res.status(400).json({
                status: 400,
                success: false,
                errorMessage: 'Please enter a valid email'
            })
            return;
        }

        if (!password) {
            res.status(400).json({
                status: 400,
                success: false,
                errorMessage: 'Please password field is required'
            })
            return;
        }

        let admin = await Admin.findOne({ email: email });



        if (admin){
            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'Invalid login credentials'
                })
                return;
            }

            let company = await Admin.findOne({ email: email });

            console.log({admin})

            const token = utils.encodeToken(admin._id, true, admin.email, "");


            res.status(200).json({
                status: 200,
                data: company,
                token: token,
            })

            return;
        } 
        
      else {

                res.status(400).json({
                    status: 400,
                    error: `User with email: ${email} does not exist`
                })
                return;
         }
      
        } catch (error) {
            console.error(error)
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}

export default signInAceERP;
