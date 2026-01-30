
import dotenv from 'dotenv';
import Role from '../../model/Meetings';
import Employee from '../../model/Employees';



import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const fetchMeeting= async (req, res) => {

    try {

        const { page, limit } = req.query;

        const user = await Employee.findOne({_id: req.payload.id})

        console.log({user})

        if(user){
            

        const role = await Role.find({employeeId: req.payload.id})
        .sort({_id: -1})
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

        console.log(role.length)

        if(role.length < 0){

        const emp= await Employee.findOne({_id: req.payload.id})
        const empp = await Role.find({companyId: emp.companyId})
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

        const counts = await Role.find({employeeId: emp.companyId}).countDocuments()

        console.log(role)

        res.status(200).json({
            status: 200,
            success: true,
            data: empp,
            totalPages: Math.ceil(counts / limit),
            currentPage: page
        })

        return;

        }

        const count = await Role.find({companyId: req.payload.id}).countDocuments()

        console.log(role)

        res.status(200).json({
            status: 200,
            success: true,
            data: role,
        
        })

        return;
        }else{

            const role = await Role.find({companyId: String(req.payload.id)})
            .sort({_id: -1})
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
    
            console.log(role.length)
    
            if(role.length < 0){
    
            const emp= await Employee.findOne({_id: req.payload.id})
            const empp = await Role.find({companyId: String(role._id)})
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

            console.log({empp})

    
            const counts = await Role.find({companyId: role.companyId}).countDocuments()
    
            console.log(role)
    
            res.status(200).json({
                status: 200,
                success: true,
                data: empp,
                totalPages: Math.ceil(counts / limit),
                currentPage: page
            })
    
            return;
    
            }
    
            const count = await Role.find({companyId: req.payload.id}).countDocuments()
    
            console.log(role)
    
            res.status(200).json({
                status: 200,
                success: true,
                data: role,
            
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
export default fetchMeeting;



