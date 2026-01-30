import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import EmployeeTable from '../../model/EmployeeTable';

import Roles from '../../model/Roles';


import utils from '../../config/utils';

import { emailTemp } from '../../emailTemplate';
import LeaveRecords from '../../model/LeaveRecords';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const getLeaveRecords = async (req, res) => {

    try {

        const { page, limit, status, leaveType, startDate, endDate, search } = req.query;

        // Build filter object
        let filterQuery = { userId: req.payload.id };
        
        // Add status filter if provided
        if (status) filterQuery.status = { $regex: status, $options: 'i' };
        
        // Add leave type filter if provided
        if (leaveType) filterQuery.leaveType = { $regex: leaveType, $options: 'i' };
        
        // Add date range filters if provided
        if (startDate && endDate) {
            filterQuery.leaveStartDate = { $gte: new Date(startDate) };
            filterQuery.leaveEndDate = { $lte: new Date(endDate) };
        } else if (startDate) {
            filterQuery.leaveStartDate = { $gte: new Date(startDate) };
        } else if (endDate) {
            filterQuery.leaveEndDate = { $lte: new Date(endDate) };
        }
        
        // Add general search parameter if provided
        if (search) {
            // Assuming LeaveRecords model has fields like reason, comments, etc. that can be searched
            filterQuery.$or = [
                { reason: { $regex: search, $options: 'i' } },
                { comments: { $regex: search, $options: 'i' } },
                { leaveType: { $regex: search, $options: 'i' } },
                { status: { $regex: search, $options: 'i' } }
            ];
        }

        console.log("[getLeaveRecords] Filter query:", filterQuery);

        const leaveRecords = await LeaveRecords.find(filterQuery)
            .sort({_id: -1})
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await LeaveRecords.find(filterQuery).countDocuments();

        if(!leaveRecords || leaveRecords.length === 0){
            res.status(200).json({
                status: 200,
                success: true,
                data: [],
                message: 'No leave records found matching the criteria',
                totalPages: 0,
                currentPage: page || 1
            });
            return;
        } else {
            res.status(200).json({
                status: 200,
                success: true,
                data: leaveRecords,
                totalPages: Math.ceil(count / limit),
                currentPage: page || 1,
                totalRecords: count
            });
        }

    } catch (error) {
        console.error("[getLeaveRecords] Error:", error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An error occurred while fetching leave records'
        });
    }
}
export default getLeaveRecords;



