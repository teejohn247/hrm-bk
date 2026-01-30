
import dotenv from 'dotenv';
import Company from '../../model/Company';
import bcrypt from 'bcrypt';
import HTTP_STATUS from 'http-status-codes';
import jwt_decode from 'jwt-decode';

import utils from '../../config/utils';

const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const verifyNewUser = async (req, res) => {

    try {
       
        const {token} = req.body;
        if(!token){
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: HTTP_STATUS.BAD_REQUEST,
                error: 'token is required'
            });
    
            return;
         }


    
         const payload = jwt_decode(token);

         console.log({payload})
         if (!payload) {
          return res.status(500).json({
                status: 500,
                success: false,
                error: "Token can not be decoded"
            })
         } else {

            console.log(payload.email)

            let admin = await Company.findOne({ email: payload.email });

            console.log({admin})

            if (admin) {
    
                res.status(400).json({
                    status: 400,
                    error: `User with email: ${payload.email} has already been verified. Use the login route`
                })
                return;
            }
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(payload.password, salt);
    
            console.log(salt, hashed)
            let company = new Company({
                email: payload.email,
                password: hashed,
                firstTimeLogin: true, 
                isSuperAdmin: true
            });
    
            await company.save();

            let registered = await Company.findOne({ email: payload.email });

    
                const token = utils.encodeToken(company._id, company.isSuperAdmin, company.email);
    
                res.status(200).json({
                    status: 200,
                    data: registered,
                    token: token,
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
export default verifyNewUser;