// import dotenv from 'dotenv';
// import Role from '../../model/Debit';
// import PayrollPeriod from '../../model/PayrollPeriod';
// import PeriodPayData from '../../model/PeriodPayData';
// import Employee from '../../model/Employees';
// import Company from '../../model/Company';
// import mongoose from 'mongoose';

// const sgMail = require('@sendgrid/mail')

// dotenv.config();

// sgMail.setApiKey(process.env.SENDGRID_KEY);

// const fetchPayrollPeriod = async (req, res) => {
//     try {
//         // Get query parameters
//         const { 
//             page, 
//             limit, 
//             search, 
//             status, 
//             startDate, 
//             endDate, 
//             payrollPeriodName,
//             reference,
//             sortBy = 'endDate',
//             sortOrder = 'asc'
//         } = req.query;

//         // Check if pagination is requested
//         const isPaginated = page !== undefined && limit !== undefined;

//         // Find company or employee
//         const comp = await Company.findOne({_id: req.payload.id});
//         const employee = await Employee.findOne({_id: req.payload.id});

//         if (!comp && !employee) {
//             return res.status(404).json({
//                 status: 404,
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         // Set companyId based on user type
//         const companyId = comp ? req.payload.id : employee.companyId;

//         // Build filter query
//         const filterQuery = { companyId };
        
//         // Add search functionality
//         if (search) {
//             filterQuery.$or = [
//                 { payrollPeriodName: { $regex: search, $options: 'i' } },
//                 { reference: { $regex: search, $options: 'i' } },
//                 { description: { $regex: search, $options: 'i' } }
//             ];
//         }

//         // Add specific filters
//         if (status) filterQuery.status = status;
//         if (payrollPeriodName) filterQuery.payrollPeriodName = { $regex: payrollPeriodName, $options: 'i' };
//         if (reference) filterQuery.reference = { $regex: reference, $options: 'i' };
        
//         // Date range filters
//         if (startDate && endDate) {
//             filterQuery.$and = [
//                 { startDate: { $gte: startDate } },
//                 { endDate: { $lte: endDate } }
//             ];
//         } else if (startDate) {
//             filterQuery.startDate = { $gte: startDate };
//         } else if (endDate) {
//             filterQuery.endDate = { $lte: endDate };
//         }

//         // Count total records
//         const count = await PayrollPeriod.find(filterQuery).countDocuments();

//         // Set sort order
//         const sortDirection = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
//         const sortOptions = { [sortBy]: sortDirection };

//         // Query with or without pagination
//         let payrollPeriods;
//         if (isPaginated) {
//             const pageNum = parseInt(page);
//             const limitNum = parseInt(limit);
            
//             payrollPeriods = await PayrollPeriod.find(filterQuery)
//                 .sort(sortOptions)
//                 .limit(limitNum)
//                 .skip((pageNum - 1) * limitNum)
//                 .exec();
//         } else {
//             payrollPeriods = await PayrollPeriod.find(filterQuery)
//                 .sort(sortOptions)
//                 .exec();
//         }

//         const all = [];
        
//         // Process each payroll period
//         const promises = payrollPeriods.map(async (payrollPeriod) => {
//             const periodPayData = await PeriodPayData.find({ payrollPeriodId: payrollPeriod._id });
            
//             all.push({
//                 ...payrollPeriod.toObject(),
//                 payrollPeriodData: periodPayData.map(payData => ({
//                     _id: payData._id,
//                     companyId: payData.companyId,
//                     companyName: payData.companyName,
//                     payrollPeriodId: payrollPeriod._id,
//                     firstName: payData.firstName,
//                     lastName: payData.lastName,
//                     fullName: payData.fullName,
//                     profilePic: payData.profilePic,
//                     department: payData.department,
//                     designation: payData.designation,
//                     employeeId: payData.employeeId,
//                     deductions: payData.deductions,
//                     netEarnings: payData.netEarnings,
//                     role: payData.role,
//                     bonus: payData.bonus,
//                     dynamicFields: payData.dynamicFields,
//                     totalEarnings: payData.totalEarnings,
//                     payeTax: payData.payeTax,
//                     status: payData.status,
//                 })),
//             });
//         });
        
//         await Promise.all(promises);

//         // Prepare response
//         const response = {
//             status: 200,
//             success: true,
//             data: all,
//             totalRecords: count,
//             filters: {
//                 search,
//                 status,
//                 startDate,
//                 endDate,
//                 payrollPeriodName,
//                 reference
//             }
//         };

//         // Add pagination details if paginated
//         if (isPaginated) {
//             response.totalPages = Math.ceil(count / parseInt(limit));
//             response.currentPage = parseInt(page);
//         }

//         res.status(200).json(response);

//     } catch (error) {
//         console.error('Error in fetchPayrollPeriod:', error);
//         res.status(500).json({
//             status: 500,
//             success: false,
//             message: 'An error occurred while fetching payroll periods',
//             error: error.message
//         });
//     }
// }

// export default fetchPayrollPeriod;


import dotenv from 'dotenv';
import PayrollPeriod from '../../model/PayrollPeriod';
import PeriodPayData from '../../model/PeriodPayData';
import Employee from '../../model/Employees';
import Company from '../../model/Company';

dotenv.config();

/**
 * Fetch payroll periods with comprehensive filtering
 * Filter Options: Employee, Pay period, Payroll status, Department, Company,
 * Salary range, Payment date range
 */
const fetchPayrollPeriod = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            // Employee filters
            employeeId,
            employeeName,
            department,
            // Payroll filters
            payPeriod, // payrollPeriodName
            payrollStatus, // Pending, Processing, Completed, Paid
            reference,
            // Date filters
            startDate,
            endDate,
            paymentStartDate, // Payment date range
            paymentEndDate,
            // Salary filters
            minSalary,
            maxSalary,
            // Company filter
            companyId: queryCompanyId,
            // Search
            search,
            // Sorting
            sortBy = 'endDate',
            sortOrder = 'desc'
        } = req.query;

        const userId = req.payload.id;

        // Parse pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Determine user type - parallel queries
        const [employee, company] = await Promise.all([
            Employee.findById(userId).select('companyId department').lean(),
            Company.findById(userId).lean()
        ]);

        if (!employee && !company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'User not found'
            });
        }

        // Build filter query for payroll periods
        let filterQuery = {
            companyId: company ? userId : employee.companyId
        };

        // Search across multiple fields
        if (search && search !== 'undefined' && search !== '') {
            filterQuery.$or = [
                { payrollPeriodName: { $regex: search, $options: 'i' } },
                { reference: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Payroll filters
        if (payPeriod) {
            filterQuery.payrollPeriodName = { $regex: payPeriod, $options: 'i' };
        }
        if (payrollStatus) {
            filterQuery.status = payrollStatus;
        }
        if (reference) {
            filterQuery.reference = { $regex: reference, $options: 'i' };
        }

        // Company filter (only for super admins)
        if (queryCompanyId && company) {
            filterQuery.companyId = queryCompanyId;
        }

        // Date range filters - Period dates
        if (startDate || endDate) {
            if (startDate && endDate) {
                filterQuery.$and = [
                    { startDate: { $gte: new Date(startDate) } },
                    { endDate: { $lte: new Date(endDate) } }
                ];
            } else if (startDate) {
                filterQuery.startDate = { $gte: new Date(startDate) };
            } else if (endDate) {
                filterQuery.endDate = { $lte: new Date(endDate) };
            }
        }

        // Date range filters - Payment dates
        if (paymentStartDate || paymentEndDate) {
            filterQuery.paymentDate = {};
            if (paymentStartDate) {
                filterQuery.paymentDate.$gte = new Date(paymentStartDate);
            }
            if (paymentEndDate) {
                filterQuery.paymentDate.$lte = new Date(paymentEndDate);
            }
        }

        // Build sort options
        const sortDirection = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
        const sortOptions = { [sortBy]: sortDirection };

        // Execute query and count in parallel
        const [payrollPeriods, totalCount] = await Promise.all([
            PayrollPeriod.find(filterQuery)
                .sort(sortOptions)
                .limit(limitNum)
                .skip(skip)
                .lean()
                .exec(),
            PayrollPeriod.countDocuments(filterQuery)
        ]);

        // Build employee filter for pay data
        let employeeFilter = {};
        if (employeeId) {
            employeeFilter.employeeId = employeeId;
        }
        if (employeeName) {
            employeeFilter.$or = [
                { firstName: { $regex: employeeName, $options: 'i' } },
                { lastName: { $regex: employeeName, $options: 'i' } },
                { fullName: { $regex: employeeName, $options: 'i' } }
            ];
        }
        if (department) {
            employeeFilter.department = { $regex: department, $options: 'i' };
        }

        // Build salary range filter
        if (minSalary || maxSalary) {
            employeeFilter.netEarnings = {};
            if (minSalary) {
                employeeFilter.netEarnings.$gte = parseFloat(minSalary);
            }
            if (maxSalary) {
                employeeFilter.netEarnings.$lte = parseFloat(maxSalary);
            }
        }

        // Fetch period pay data for each payroll period
        const enrichedPayrolls = await Promise.all(
            payrollPeriods.map(async (payrollPeriod) => {
                const payDataFilter = {
                    payrollPeriodId: payrollPeriod._id,
                    ...employeeFilter
                };

                const periodPayData = await PeriodPayData.find(payDataFilter)
                    .select('firstName lastName fullName profilePic department designation employeeId deductions netEarnings totalEarnings payeTax status bonus dynamicFields')
                    .lean();

                // Calculate totals for this period
                const periodTotals = {
                    employeeCount: periodPayData.length,
                    totalEarnings: periodPayData.reduce((sum, pd) => sum + (parseFloat(pd.totalEarnings) || 0), 0),
                    totalDeductions: periodPayData.reduce((sum, pd) => sum + (parseFloat(pd.deductions) || 0), 0),
                    totalNetPay: periodPayData.reduce((sum, pd) => sum + (parseFloat(pd.netEarnings) || 0), 0),
                    totalTax: periodPayData.reduce((sum, pd) => sum + (parseFloat(pd.payeTax) || 0), 0)
                };

                return {
                    ...payrollPeriod,
                    payrollPeriodData: periodPayData,
                    periodTotals
                };
            })
        );

        const totalPages = Math.ceil(totalCount / limitNum);

        // Calculate overall statistics
        const overallStats = enrichedPayrolls.reduce((stats, period) => ({
            totalEmployees: stats.totalEmployees + (period.periodTotals?.employeeCount || 0),
            totalEarnings: stats.totalEarnings + (period.periodTotals?.totalEarnings || 0),
            totalDeductions: stats.totalDeductions + (period.periodTotals?.totalDeductions || 0),
            totalNetPay: stats.totalNetPay + (period.periodTotals?.totalNetPay || 0),
            totalTax: stats.totalTax + (period.periodTotals?.totalTax || 0)
        }), {
            totalEmployees: 0,
            totalEarnings: 0,
            totalDeductions: 0,
            totalNetPay: 0,
            totalTax: 0
        });

        return res.status(200).json({
            status: 200,
            success: true,
            data: enrichedPayrolls,
            statistics: overallStats,
            pagination: {
                total: totalCount,
                totalPages,
                currentPage: pageNum,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            },
            filters: {
                employeeId,
                employeeName,
                department,
                payPeriod,
                payrollStatus,
                reference,
                startDate,
                endDate,
                paymentStartDate,
                paymentEndDate,
                minSalary,
                maxSalary,
                search
            },
            message: enrichedPayrolls.length === 0 ? 'No payroll periods found matching the criteria' : undefined
        });

    } catch (error) {
        console.error('Error fetching payroll periods:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Failed to fetch payroll periods',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default fetchPayrollPeriod;