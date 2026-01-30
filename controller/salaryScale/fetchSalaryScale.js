
import dotenv from 'dotenv';
import Role from '../../model/SalaryScale';
import Employee from '../../model/Employees';
import Company from '../../model/Company';



import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const fetchSalaryScale = async (req, res) => {

    try {

        const { page, limit } = req.query;

        const company = await Company.findOne({_id: req.payload.id})
       
      

        if(company){
            const role = await Role.find({companyId: req.payload.id})
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            const count = await Role.find({companyId: req.payload.id}).countDocuments()

            console.log(role)
    
            res.status(200).json({
                status: 200,
                success: true,
                data: role,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            });

            return
    
        }else{
            const emp = await Employee.findOne({_id: req.payload.id})
            const designationUser = await Role.find({companyId: emp.companyId})
    
                res.status(200).json({
                    status: 200,
                    success: true,
                    data: designationUser,
                })
        
                return;
        }
          
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default fetchSalaryScale;



