import dotenv from 'dotenv';
import Role from '../../model/Debit';
import PayrollPeriod from '../../model/PayrollPeriod';
import PeriodPayData from '../../model/PeriodPayData';
import Employee from '../../model/Employees';
import Company from '../../model/Company';
import mongoose from 'mongoose';

const sgMail = require('@sendgrid/mail')

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const fetchPayrollPeriod = async (req, res) => {
    try {
        // Get query parameters
        const { 
            page, 
            limit, 
            search, 
            status, 
            startDate, 
            endDate, 
            payrollPeriodName,
            reference,
            sortBy = 'endDate',
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

        // Set companyId based on user type
        const companyId = comp ? req.payload.id : employee.companyId;

        // Build filter query
        const filterQuery = { companyId };
        
        // Add search functionality
        if (search) {
            filterQuery.$or = [
                { payrollPeriodName: { $regex: search, $options: 'i' } },
                { reference: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Add specific filters
        if (status) filterQuery.status = status;
        if (payrollPeriodName) filterQuery.payrollPeriodName = { $regex: payrollPeriodName, $options: 'i' };
        if (reference) filterQuery.reference = { $regex: reference, $options: 'i' };
        
        // Date range filters
        if (startDate && endDate) {
            filterQuery.$and = [
                { startDate: { $gte: startDate } },
                { endDate: { $lte: endDate } }
            ];
        } else if (startDate) {
            filterQuery.startDate = { $gte: startDate };
        } else if (endDate) {
            filterQuery.endDate = { $lte: endDate };
        }

        // Count total records
        const count = await PayrollPeriod.find(filterQuery).countDocuments();

        // Set sort order
        const sortDirection = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
        const sortOptions = { [sortBy]: sortDirection };

        // Query with or without pagination
        let payrollPeriods;
        if (isPaginated) {
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            
            payrollPeriods = await PayrollPeriod.find(filterQuery)
                .sort(sortOptions)
                .limit(limitNum)
                .skip((pageNum - 1) * limitNum)
                .exec();
        } else {
            payrollPeriods = await PayrollPeriod.find(filterQuery)
                .sort(sortOptions)
                .exec();
        }

        const all = [];
        
        // Process each payroll period
        const promises = payrollPeriods.map(async (payrollPeriod) => {
            const periodPayData = await PeriodPayData.find({ payrollPeriodId: payrollPeriod._id });
            
            all.push({
                ...payrollPeriod.toObject(),
                payrollPeriodData: periodPayData.map(payData => ({
                    _id: payData._id,
                    companyId: payData.companyId,
                    companyName: payData.companyName,
                    payrollPeriodId: payrollPeriod._id,
                    firstName: payData.firstName,
                    lastName: payData.lastName,
                    fullName: payData.fullName,
                    profilePic: payData.profilePic,
                    department: payData.department,
                    designation: payData.designation,
                    employeeId: payData.employeeId,
                    deductions: payData.deductions,
                    netEarnings: payData.netEarnings,
                    role: payData.role,
                    bonus: payData.bonus,
                    dynamicFields: payData.dynamicFields,
                    totalEarnings: payData.totalEarnings,
                    payeTax: payData.payeTax,
                    status: payData.status,
                })),
            });
        });
        
        await Promise.all(promises);

        // Prepare response
        const response = {
            status: 200,
            success: true,
            data: all,
            totalRecords: count,
            filters: {
                search,
                status,
                startDate,
                endDate,
                payrollPeriodName,
                reference
            }
        };

        // Add pagination details if paginated
        if (isPaginated) {
            response.totalPages = Math.ceil(count / parseInt(limit));
            response.currentPage = parseInt(page);
        }

        res.status(200).json(response);

    } catch (error) {
        console.error('Error in fetchPayrollPeriod:', error);
        res.status(500).json({
            status: 500,
            success: false,
            message: 'An error occurred while fetching payroll periods',
            error: error.message
        });
    }
}

export default fetchPayrollPeriod;