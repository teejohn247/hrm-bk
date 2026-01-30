
import dotenv from 'dotenv';
import Role from '../../model/Role';


import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const fetchRole = async (req, res) => {

    try {

        const { page, limit } = req.query;


        const role = await Role.find({companyId: req.payload.id})
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

        const count = await Role.find({companyId: req.payload.id}).countDocuments()

        console.log(role)

        if(!role){
            res.status(404).json({
                status:404,
                success: false,
                error:'No role Found'
            })
            return
        
        }else{
            res.status(200).json({
                status: 200,
                success: true,
                data: role,
                totalPages: Math.ceil(count / limit),
                currentPage: page
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
export default fetchRole;



