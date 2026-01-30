import dotenv from 'dotenv';
import Payroll from '../../model/Payroll';
import PayrollPeriod from '../../model/PayrollPeriod';
import PeriodPayData from '../../model/PeriodPayData';
import Employee from '../../model/Employees';
import Company from '../../model/Company';
import mongoose from 'mongoose';

const sgMail = require('@sendgrid/mail')

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const fetchPayrollPrd = async (req, res) => {
    try {
        // Get query parameters
        const { 
            page, 
            limit, 
            search, 
            status, 
            startDate, 
            endDate,
            minNetEarnings,
            maxNetEarnings,
            sortBy = 'payrollPeriodName',
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

        // Set match query parameters based on user type
        const matchQuery = comp ? 
            { companyId: req.payload.id } : 
            { employeeId: req.payload.id };

        // Add status filter if provided
        if (status) {
            matchQuery['payrollPeriodData.status'] = status;
        }

        // Create aggregation pipeline
        const pipeline = [
            {
                $match: matchQuery
            },
            {
                $lookup: {
                    from: 'payrollperiods',
                    localField: 'payrollPeriodId',
                    foreignField: '_id',
                    as: 'payrollPeriodData',
                },
            },
            {
                $unwind: '$payrollPeriodData',
            }
        ];

        // Add date range filters if provided
        if (startDate || endDate) {
            const dateFilter = {};
            if (startDate) dateFilter['payrollPeriodData.startDate'] = { $gte: startDate };
            if (endDate) dateFilter['payrollPeriodData.endDate'] = { $lte: endDate };
            
            if (Object.keys(dateFilter).length > 0) {
                pipeline.push({ $match: dateFilter });
            }
        }

        // Add search functionality
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'payrollPeriodData.payrollPeriodName': { $regex: search, $options: 'i' } },
                        { 'payrollPeriodData.reference': { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }
        
        // Add earnings range filters if provided
        if (minNetEarnings || maxNetEarnings) {
            const netEarningsFilter = {};
            if (minNetEarnings) netEarningsFilter.$gte = parseFloat(minNetEarnings);
            if (maxNetEarnings) netEarningsFilter.$lte = parseFloat(maxNetEarnings);
            
            if (Object.keys(netEarningsFilter).length > 0) {
                pipeline.push({
                    $match: {
                        netEarnings: netEarningsFilter
                    }
                });
            }
        }

        // Add group by stage
        pipeline.push({
            $group: {
                _id: '$payrollPeriodId',
                payrollPeriodName: { $first: '$payrollPeriodData.payrollPeriodName' },
                startDate: { $first: '$payrollPeriodData.startDate' },
                endDate: { $first: '$payrollPeriodData.endDate' },
                reference: { $first: '$payrollPeriodData.reference' },
                status: { $first: '$payrollPeriodData.status' },
                totalEarnings: { $sum: { $add: ['$totalEarnings'] } },
                netEarnings: { $sum: '$netEarnings' },
                deductions: { $sum: { $add: ['$deductions'] } },
                totalEmployees: { $sum: 1 }
            },
        });

        // Add sort stage
        const sortDirection = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
        pipeline.push({
            $sort: { [sortBy]: sortDirection }
        });

        // Count total records
        const countPipeline = [...pipeline]; // Clone the pipeline
        const countResults = await PeriodPayData.aggregate(countPipeline);
        const totalRecords = countResults.length;

        // Add pagination if requested
        if (isPaginated) {
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            
            pipeline.push(
                { $skip: (pageNum - 1) * limitNum },
                { $limit: limitNum }
            );
        }

        // Execute the aggregation
        const totals = await PeriodPayData.aggregate(pipeline);

        // Prepare response
        const response = {
            status: 200,
            success: true,
            data: totals,
            totalRecords,
            filters: {
                search,
                status,
                startDate,
                endDate,
                minNetEarnings,
                maxNetEarnings
            }
        };

        // Add pagination details if paginated
        if (isPaginated) {
            response.totalPages = Math.ceil(totalRecords / parseInt(limit));
            response.currentPage = parseInt(page);
        }

        res.status(200).json(response);

    } catch (error) {
        console.error('Error in fetchPayrollPrd:', error);
        res.status(500).json({
            status: 500,
            success: false,
            message: 'An error occurred while fetching payroll period summaries',
            error: error.message
        });
    }
}

export default fetchPayrollPrd;



