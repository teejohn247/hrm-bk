import dotenv from 'dotenv';
import Payroll from '../../model/Payroll';
import Employee from '../../model/Employees';
import Company from '../../model/Company';
import mongoose from 'mongoose';

const sgMail = require('@sendgrid/mail')

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const fetchPayroll = async (req, res) => {
    try {
        const { 
            page, 
            limit, 
            employeeName, 
            employeeId, 
            department, 
            startDate, 
            endDate, 
            paymentStatus, 
            payrollMonth, 
            payrollYear,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Check if pagination is requested
        const isPaginated = page !== undefined && limit !== undefined;

        // Find company or employee
        const comp = await Company.findOne({_id: req.payload.id});
        const employee = await Employee.findOne({_id: req.payload.id});

        if (!comp && !employee) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "User not found"
            });
        }

        // Build filter object
        let filterQuery = { companyId: req.payload.id };
        
        // Add employee filters if provided
        if (employeeName) filterQuery.employeeName = { $regex: employeeName, $options: 'i' };
        if (employeeId) filterQuery.employeeId = employeeId;
        if (department) filterQuery.department = { $regex: department, $options: 'i' };
        
        // Add date range filters if provided
        if (startDate && endDate) {
            filterQuery.paymentDate = { 
                $gte: new Date(startDate), 
                $lte: new Date(endDate) 
            };
        } else if (startDate) {
            filterQuery.paymentDate = { $gte: new Date(startDate) };
        } else if (endDate) {
            filterQuery.paymentDate = { $lte: new Date(endDate) };
        }
        
        // Add payment status filter if provided
        if (paymentStatus) filterQuery.paymentStatus = { $regex: paymentStatus, $options: 'i' };
        
        // Add payroll period filters
        if (payrollMonth) filterQuery.payrollMonth = parseInt(payrollMonth) || payrollMonth;
        if (payrollYear) filterQuery.payrollYear = parseInt(payrollYear);
        
        // Add general search parameter if provided
        if (search) {
            filterQuery.$or = [
                { employeeName: { $regex: search, $options: 'i' } },
                { employeeCode: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } },
                { paymentStatus: { $regex: search, $options: 'i' } },
                { paymentMethod: { $regex: search, $options: 'i' } },
                { bankName: { $regex: search, $options: 'i' } }
            ];
        }
        
        console.log("[fetchPayroll] Filter query:", filterQuery);

        // Count total records
        const count = await Payroll.find(filterQuery).countDocuments();

        // Set sort order
        const sortDirection = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
        const sortOptions = { [sortBy]: sortDirection };

        // Query with or without pagination
        let payrolls;
        if (isPaginated) {
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            
            payrolls = await Payroll.find(filterQuery)
                .sort(sortOptions)
                .limit(limitNum)
                .skip((pageNum - 1) * limitNum)
                .exec();
        } else {
            payrolls = await Payroll.find(filterQuery)
                .sort(sortOptions)
                .exec();
        }

        if (!payrolls || payrolls.length === 0) {
            return res.status(200).json({
                status: 200,
                success: true,
                data: [],
                message: 'No payroll records found matching the criteria',
                totalRecords: 0,
                filters: {
                    employeeName,
                    employeeId,
                    department,
                    startDate,
                    endDate,
                    paymentStatus,
                    payrollMonth,
                    payrollYear,
                    search
                }
            });
        }

        // Prepare response
        const response = {
            status: 200,
            success: true,
            data: payrolls,
            totalRecords: count,
            filters: {
                employeeName,
                employeeId,
                department,
                startDate,
                endDate,
                paymentStatus,
                payrollMonth,
                payrollYear,
                search
            }
        };

        // Add pagination details if paginated
        if (isPaginated) {
            response.totalPages = Math.ceil(count / parseInt(limit));
            response.currentPage = parseInt(page);
        }

        res.status(200).json(response);

    } catch (error) {
        console.error("[fetchPayroll] Error:", error);
        res.status(500).json({
            status: 500,
            success: false,
            message: 'An error occurred while fetching payroll records',
            error: error.message || 'Unknown error'
        });
    }
}

export default fetchPayroll;



