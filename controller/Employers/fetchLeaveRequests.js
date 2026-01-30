import dotenv from 'dotenv';
import Role from '../../model/ExpenseRequests';


import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);




const fetchExpenseReqs= async (req, res) => {

    try {

        const { page, limit, status, startDate, endDate, expenseTypeId } = req.query;

        // Build filter object
        let filterQuery = { employeeId: req.payload.id };
        
        if (status) {
            filterQuery.status = status;
        }
        
        if (startDate && endDate) {
            filterQuery.expenseDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        if (expenseTypeId) {
            filterQuery.expenseTypeId = expenseTypeId;
        }

        const role = await Role.find(filterQuery)
            .sort({ "dateRequested": -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Role.find(filterQuery).countDocuments();

        console.log(role)

        res.status(200).json({
            status: 200,
            success: true,
            data: role,
            totalPages: Math.ceil(count / limit),
            currentPage: page
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
export default fetchExpenseReqs;



