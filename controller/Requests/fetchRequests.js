import dotenv from 'dotenv';
import ExpenseRequests from '../../model/ExpenseRequests';
import Leave from '../../model/LeaveRecords';


import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const fetchRequests = async (req, res) => {

    try {
        const { page = 1, limit = 10, status, startDate, endDate, requestType, search } = req.query;
        
        // Build filter object for expenses
        let expenseQuery = { employeeId: req.params.id };
        
        // Build filter object for leave
        let leaveQuery = { userId: req.params.id };
        
        // Add status filter if provided
        if (status) {
            expenseQuery.status = { $regex: status, $options: 'i' };
            leaveQuery.status = { $regex: status, $options: 'i' };
        }
        
        // Add date range filters if provided
        if (startDate && endDate) {
            // For expenses (assuming they have a date field)
            expenseQuery.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
            
            // For leave requests
            leaveQuery.$and = [
                { leaveStartDate: { $gte: new Date(startDate) } },
                { leaveEndDate: { $lte: new Date(endDate) } }
            ];
        } else if (startDate) {
            expenseQuery.date = { $gte: new Date(startDate) };
            leaveQuery.leaveStartDate = { $gte: new Date(startDate) };
        } else if (endDate) {
            expenseQuery.date = { $lte: new Date(endDate) };
            leaveQuery.leaveEndDate = { $lte: new Date(endDate) };
        }
        
        // Add search parameter for both collections
        if (search) {
            // For expenses - assuming these fields exist
            expenseQuery.$or = [
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { status: { $regex: search, $options: 'i' } },
                { comments: { $regex: search, $options: 'i' } }
            ];
            
            // For leave requests
            leaveQuery.$or = [
                { reason: { $regex: search, $options: 'i' } },
                { comments: { $regex: search, $options: 'i' } },
                { leaveType: { $regex: search, $options: 'i' } },
                { status: { $regex: search, $options: 'i' } }
            ];
        }
        
        console.log("[fetchRequests] Filters:", { expenseQuery, leaveQuery, requestType });
        
        // Retrieve data based on query parameters
        let expense = [];
        let leave = [];
        
        // If requestType is specified, only fetch that type
        if (requestType === 'expense') {
            expense = await ExpenseRequests.find(expenseQuery)
                .sort({ _id: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();
        } else if (requestType === 'leave') {
            leave = await Leave.find(leaveQuery)
                .sort({ _id: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();
        } else {
            // Fetch both types if no specific type is requested
            expense = await ExpenseRequests.find(expenseQuery).sort({ _id: -1 });
            leave = await Leave.find(leaveQuery).sort({ _id: -1 });
        }
        
        // Combine and sort results
        let results = [...expense, ...leave];
        
        // Sort combined results by createdAt date, newest first
        results.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.date || a.leaveStartDate);
            const dateB = new Date(b.createdAt || b.date || b.leaveStartDate);
            return dateB - dateA;
        });
        
        // Apply pagination to combined results if both types were fetched
        if (requestType !== 'expense' && requestType !== 'leave') {
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            results = results.slice(startIndex, endIndex);
        }
        
        // Count total records for pagination
        let totalExpense = 0;
        let totalLeave = 0;
        
        if (requestType === 'expense' || !requestType) {
            totalExpense = await ExpenseRequests.find(expenseQuery).countDocuments();
        }
        
        if (requestType === 'leave' || !requestType) {
            totalLeave = await Leave.find(leaveQuery).countDocuments();
        }
        
        const totalRecords = totalExpense + totalLeave;
        
        // Add request type flag to each item for frontend differentiation
        results = results.map(item => {
            // Clone the item to avoid modifying the mongoose document
            const processedItem = item.toObject ? item.toObject() : { ...item };
            
            // Add a flag to identify the type of request
            processedItem.requestType = item.leaveType ? 'leave' : 'expense';
            
            return processedItem;
        });
        
        res.status(200).json({
            status: 200,
            success: true,
            data: results,
            pagination: {
                totalRecords,
                totalPages: Math.ceil(totalRecords / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            },
            filters: {
                applied: !!(status || startDate || endDate || search || requestType),
                requestType: requestType || 'all'
            }
        });
    } catch (error) {
        console.error("[fetchRequests] Error:", error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An error occurred while fetching requests'
        });
    }
}
export default fetchRequests;



