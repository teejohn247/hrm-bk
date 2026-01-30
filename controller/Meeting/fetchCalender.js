
import dotenv from 'dotenv';
import Role from '../../model/Holidays';
import Employee from '../../model/Employees';
import Meeting from '../../model/Meetings';



import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const fetchHoliday= async (req, res) => {

    try {

        const { page, limit } = req.query;




        const role = await Role.find({companyId: req.payload.id})
        

        console.log(role.length)

        if(role.length < 0){

        const emp= await Employee.findOne({_id: req.payload.id})
        const empp = await Role.find({companyId: emp.companyId})
        const meeting = await Meeting.find({companyId: emp.companyId})
       
        console.log(role)

        res.status(200).json({
            status: 200,
            success: true,
            data: empp,
           
        })

        return;

        }

        res.status(200).json({
            status: 200,
            success: true,
            data: role,
        
        })

        return;
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default fetchHoliday;



