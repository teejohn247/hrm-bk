
import dotenv from 'dotenv';
import Role from '../../model/Expense';
import Employee from '../../model/Employees';
import Company from '../../model/Company';



import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const fetchExpense= async (req, res) => {

    try {

        const { page, limit } = req.query;


        const company = await Company.findOne({_id: req.payload.id})
       
      

        if(company){
            const department = await Role.find({companyId: req.payload.id})
            .sort({_id: -1})
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            const count = await Role.find({companyId: req.payload.id}).countDocuments()

            res.status(200).json({
                status: 200,
                success: true,
                data: department,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            })
    
            return;
        }else{
        const emp = await Employee.findOne({_id: req.payload.id})
        const departmentUser = await Role.find({companyId: emp.companyId})

            res.status(200).json({
                status: 200,
                success: true,
                data: departmentUser,
            })
    
            return;
    }
       



        // const role = await Role.find({companyId: req.payload.id})
        // .limit(limit * 1)
        // .skip((page - 1) * limit)
        // .exec();

        // const count = await Role.find({companyId: req.payload.id}).countDocuments()

        // console.log(role)

        // res.status(200).json({
        //     status: 200,
        //     success: true,
        //     data: role,
        //     totalPages: Math.ceil(count / limit),
        //     currentPage: page
        // })

        // return;

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default fetchExpense;



