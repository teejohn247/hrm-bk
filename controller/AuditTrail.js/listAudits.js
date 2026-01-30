
import dotenv from 'dotenv';
import AuditTrail from '../../model/AuditTrail';
import Company from '../../model/Company';

const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const listAudits = async (req, res) => {

    try {

        const { page, limit } = req.query;
        const company = await Company.findOne({_id: req.payload.id})
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

        
        const audits = await AuditTrail.find({companyId: company._id})


        const count = await AuditTrail.find().countDocuments()

console.log(audits)
        if(!audits){
            res.status(404).json({
                status:404,
                success: false,
                error:'No Records'
            })
            return
        }else{
            res.status(200).json({
                status: 200,
                success: true,
                data: audits,
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
export default listAudits;



