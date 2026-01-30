import dotenv from 'dotenv';
import PeriodPayData from '../../model/PeriodPayData';
import Employee from '../../model/Employees';
import Company from '../../model/Company';
import mongoose from 'mongoose';

const sgMail = require('@sendgrid/mail')

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const fetchPayrollData = async (req, res) => {
    try {
        // Get query parameters
        const { 
            page, 
            limit, 
            search, 
            firstName, 
            lastName, 
            fullName,
            department, 
            designation, 
            status,
            minNetEarnings,
            maxNetEarnings,
            payrollPeriodId,
            sortBy = 'fullName',
            sortOrder = 'asc'
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

        // Build filter query
        const filterQuery = comp ? { companyId: req.payload.id } : { employeeId: req.payload.id };
        
        // Add specific filters
        if (payrollPeriodId) {
            filterQuery.payrollPeriodId = payrollPeriodId;
        }

        if (status) filterQuery.status = status;
        if (department) filterQuery.department = { $regex: department, $options: 'i' };
        if (designation) filterQuery.designation = { $regex: designation, $options: 'i' };
        
        // Name filters
        if (firstName) filterQuery.firstName = { $regex: firstName, $options: 'i' };
        if (lastName) filterQuery.lastName = { $regex: lastName, $options: 'i' };
        if (fullName) filterQuery.fullName = { $regex: fullName, $options: 'i' };
        
        // Add search functionality
        if (search) {
            filterQuery.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { fullName: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Earnings range filters
        if (minNetEarnings || maxNetEarnings) {
            filterQuery.netEarnings = {};
            if (minNetEarnings) filterQuery.netEarnings.$gte = parseFloat(minNetEarnings);
            if (maxNetEarnings) filterQuery.netEarnings.$lte = parseFloat(maxNetEarnings);
        }

        // Count total records
        const count = await PeriodPayData.find(filterQuery).countDocuments();

        // Set sort order
        const sortDirection = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
        const sortOptions = { [sortBy]: sortDirection };

        // Query with or without pagination
        let payrollData;
        if (isPaginated) {
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            
            payrollData = await PeriodPayData.find(filterQuery)
                .sort(sortOptions)
                .limit(limitNum)
                .skip((pageNum - 1) * limitNum)
                .exec();
        } else {
            payrollData = await PeriodPayData.find(filterQuery)
                .sort(sortOptions)
                .exec();
        }

        // Prepare response
        const response = {
            status: 200,
            success: true,
            data: payrollData,
            totalRecords: count,
            filters: {
                search,
                firstName,
                lastName,
                fullName,
                department,
                designation,
                status,
                minNetEarnings,
                maxNetEarnings,
                payrollPeriodId
            }
        };

        // Add pagination details if paginated
        if (isPaginated) {
            response.totalPages = Math.ceil(count / parseInt(limit));
            response.currentPage = parseInt(page);
        }

        res.status(200).json(response);

    } catch (error) {
        console.error('Error in fetchPayrollData:', error);
        res.status(500).json({
            status: 500,
            success: false,
            message: 'An error occurred while fetching payroll data',
            error: error.message
        });
    }
}

export default fetchPayrollData;



