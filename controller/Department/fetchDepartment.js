
import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import Department from '../../model/Department';
import Company from '../../model/Company';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const fetchDepartment = async (req, res) => {

    try {

        const { page, limit } = req.query;

      

        const company = await Company.findOne({_id: req.payload.id})
       
      

        if(company){
            const department = await Department.find({companyId: req.payload.id})
            .sort({_id: -1})
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            const count = await Department.find({companyId: req.payload.id}).countDocuments()

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
        const departmentUser = await Department.find({companyId: emp.companyId})


            res.status(200).json({
                status: 200,
                success: true,
                data: departmentUser,
            })
    
            return;
    }
       

        // if(department.length < 1){
        //     res.status(404).json({
        //         status:404,
        //         success: false,
        //         error:'No department Found'
        //     })
        //     return
        // }else{
        //     res.status(200).json({
        //         status: 200,
        //         success: true,
        //         data: department,
        //         totalPages: Math.ceil(count / limit),
        //         currentPage: page
        //     })
        // }

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default fetchDepartment;



