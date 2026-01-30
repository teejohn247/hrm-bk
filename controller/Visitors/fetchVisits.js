
import dotenv from 'dotenv';
import Role from '../../model/Visitor';
import Company from '../../model/Company';
import Employee from '../../model/Employees';

import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const fetchVisits = async (req, res) => {

    try {

        const { page, limit } = req.query;

        const comp = await Company.findOne({_id: req.payload.id})

        if(comp){
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
                    error:'No booked visit'

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
        }else{
            const emp = await Employee.findOne({_id: req.payload.id})

            const role = await Role.find({companyId: emp.companyId})
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
    
            const count = await Role.find({companyId: emp.companyId}).countDocuments()
    
    
            if(!role){
                res.status(404).json({
                    status:404,
                    success: false,
                    error:'No booked visit'
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
        }

 
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default fetchVisits;



