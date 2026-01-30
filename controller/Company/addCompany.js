
import dotenv from 'dotenv';
import Company from '../../model/Company';
import bcrypt from 'bcrypt';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const addCompany = async (req, res) => {

    try {
       
        const {companyName, email, password} = req.body;
        let company = await Company.findOne({ email });


        if (!company.companyName) {

            res.status(400).json({
                status: 400,
                error: 'Company Name is required'
            })
            return;
        }


        if (company) {

            res.status(400).json({
                status: 400,
                error: 'This Company already exist'
            })
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        console.log(salt, hashed)

        company= new Company({
            companyName, 
            email,
            password: hashed,
        });

        await company.save();

        res.status(200).json({
            status: 200,
            data: company
        })

        // const token = utils.encodeToken(superAdmin.id, true, superAdmin.email);

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default addCompany;



