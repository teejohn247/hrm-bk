
import dotenv from 'dotenv';
import Role from '../../model/ExpenseRequests';
import Leave from '../../model/LeaveRecords'


import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const  approvedRequests = async (req, res) => {

    try {

        


        const expense = await Role.find({approverId: req.payload.id, status: "Approved" });
        const leave = await Role.find({leaveApprover: req.payload.id, status: "Approved"});


        const results = [expense, leave]

        res.status(200).json({
            status: 200,
            success: true,
            data: results,
         
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
export default approvedRequests;



