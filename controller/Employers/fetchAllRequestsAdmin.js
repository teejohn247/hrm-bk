import dotenv from 'dotenv';
import Role from '../../model/ExpenseRequests';
import Leave from '../../model/LeaveRecords';

import { emailTemp } from '../../emailTemplate';

const sgMail = require('@sendgrid/mail')

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const fetchAllReqsAdmin = async (req, res) => {
    try {
        const { page, limit, status, startDate, endDate, expenseTypeId } = req.query;

        // Build filter object
        let filterQuery = { approverId: req.payload.id };
        
        if (status) filterQuery.status = { $regex: status, $options: 'i' };
        if (expenseTypeId) filterQuery.expenseTypeId = expenseTypeId;
        
        // Add date range filter if either startDate or endDate is provided
        if (startDate || endDate) {
            filterQuery.dateRequested = {};
            if (startDate) filterQuery.dateRequested.$gte = new Date(startDate);
            if (endDate) filterQuery.dateRequested.$lte = new Date(endDate);
        }

        const role = await Role.find(filterQuery)
            .sort({ "dateRequested": -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const leave = await Leave.find(filterQuery)
            .sort({ "dateRequested": -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Role.find(filterQuery).countDocuments();

        console.log(role)

        res.status(200).json({
            status: 200,
            success: true,
            leaveRequests: leave,
            expenseRequests: role,
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
export default fetchAllReqsAdmin;



