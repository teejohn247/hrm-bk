
import dotenv from 'dotenv';
import Company from '../../model/Company';
import bcrypt from 'bcrypt';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const fetchCompany = async (req, res) => {

    try {
       
        let company = await Company.findOne({ _id: req.payload.id }, {_id: 1, companyName:1, companyAddress: 1, generalSettings: 1, status: 1, activeStatus:1})
        console.log({company})
        if (!company.companyName) {

            res.status(400).json({
                status: 400,
                error: 'This account has not registered a company'
            })
            return;
        }
        
        res.status(200).json({
            status: 200,
            data: company
        })


    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default fetchCompany;



