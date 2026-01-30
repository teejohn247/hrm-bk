
import dotenv from 'dotenv';
import Role from '../../model/ExpenseRequests';


import { emailTemp } from '../../emailTemplate';
import fetchLeavesDetails from '../../model/LeaveRecords';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const fetchExpenseReqDetails = async (req, res) => {

    try {


        const role = await Role.find({_id: req.params.id })


        console.log(role)

        if (!check) {
            res.status(400).json({
                status: 400,
                error: "No record"
            })
            return;
        }

        res.status(200).json({
            status: 200,
            success: true,
            data: role,
            totalPages: Math.ceil(count / limit),
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
export default fetchExpenseReqDetails;



