import dotenv from 'dotenv';
import Company from '../../../model/Company';
import AceErp from '../../../model/AceErps';
// import Company from '../../model/Company';


import bcrypt from 'bcrypt';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const fetchAllCompanies = async (req, res) => {
    try {
        // Check if request is from AceERP admin
        const requestingUser = await AceErp.findOne({ _id: req.payload.id });
        if (requestingUser.email !== 'aceerp@aceall.io') {
            return res.status(403).json({
                status: 403,
                error: 'Unauthorized access. Only AceERP admin can fetch all companies.'
            });
        }

        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Get total count of companies
        const total = await Company.countDocuments({});

        // Fetch companies with pagination
        const companies = await Company.find({})
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        
        res.status(200).json({
            status: 200,
            data: companies,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message
        });
    }
}
export default  fetchAllCompanies;



