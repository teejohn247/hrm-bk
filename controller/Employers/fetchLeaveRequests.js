// import dotenv from 'dotenv';
// import ExpenseRequests from '../../model/ExpenseRequests';

// dotenv.config();

// /**
//  * Fetch expense requests for a specific employee (with filters and pagination)
//  * Returns employee's own expense requests with various filter options
//  */
// const fetchExpenseReqs = async (req, res) => {
//     try {
//         const {
//             page = 1,
//             limit = 10,
//             status,
//             startDate,
//             endDate,
//             expenseTypeId,
//             minAmount,
//             maxAmount
//         } = req.query;

//         const employeeId = req.payload.id;

//         // Parse and validate pagination
//         const pageNum = Math.max(1, parseInt(page));
//         const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
//         const skip = (pageNum - 1) * limitNum;

//         // Build filter query - start with employee filter
//         const filterQuery = { employeeId };

//         // Add status filter
//         if (status) {
//             filterQuery.status = status;
//         }

//         // Add expense type filter
//         if (expenseTypeId) {
//             filterQuery.expenseTypeId = expenseTypeId;
//         }

//         // Add date range filter
//         if (startDate || endDate) {
//             filterQuery.expenseDate = {};
//             if (startDate) {
//                 filterQuery.expenseDate.$gte = new Date(startDate);
//             }
//             if (endDate) {
//                 filterQuery.expenseDate.$lte = new Date(endDate);
//             }
//         }

//         // Add amount range filter
//         if (minAmount || maxAmount) {
//             filterQuery.amount = {};
//             if (minAmount) {
//                 filterQuery.amount.$gte = parseFloat(minAmount);
//             }
//             if (maxAmount) {
//                 filterQuery.amount.$lte = parseFloat(maxAmount);
//             }
//         }

//         // Execute query and count in parallel
//         const [expenseRequests, totalCount] = await Promise.all([
//             ExpenseRequests.find(filterQuery)
//                 .sort({ dateRequested: -1 })
//                 .limit(limitNum)
//                 .skip(skip)
//                 .populate('expenseTypeId', 'name description')
//                 .populate('approver', 'firstName lastName email')
//                 .lean()
//                 .exec(),
//             ExpenseRequests.countDocuments(filterQuery)
//         ]);

//         const totalPages = Math.ceil(totalCount / limitNum);

//         // Calculate summary statistics
//         const summary = {
//             totalAmount: expenseRequests.reduce((sum, req) => sum + (req.amount || 0), 0),
//             approvedAmount: expenseRequests
//                 .filter(req => req.status === 'Approved')
//                 .reduce((sum, req) => sum + (req.amount || 0), 0),
//             pendingAmount: expenseRequests
//                 .filter(req => req.status === 'Pending')
//                 .reduce((sum, req) => sum + (req.amount || 0), 0)
//         };

//         return res.status(200).json({
//             status: 200,
//             success: true,
//             data: expenseRequests,
//             summary,
//             totalPages: totalPages,
//             currentPage: pageNum,
//             limit: limitNum,
//         });

//     } catch (error) {
//         console.error('Error fetching expense requests:', error);
//         return res.status(500).json({
//             status: 500,
//             success: false,
//             error: 'Failed to fetch expense requests',
//             message: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// export default fetchExpenseReqs;

// import dotenv from 'dotenv';
// import ExpenseRequests from '../../model/ExpenseRequests';
// import Employee from '../../model/Employees';
// import Company from '../../model/Company';

// dotenv.config();

/**
 * Fetch expense requests with comprehensive filtering
 * Filter Options: Employee ID, Expense type ID, Approval status, Payment status,
 * Date range, Amount range, Department (name-based), Company
 */
// const fetchExpenseReqs = async (req, res) => {
//     try {
//         const {
//             page = 1,
//             limit = 10,
//             // Employee filters - ID-based (RECOMMENDED)
//             employeeId, // Employee reference
//             // Employee filters - Name-based (Backward compatibility)
//             employeeName, // Deprecated - use employeeId
//             department, // Department name (no ID in ExpenseRequests schema)
//             // Expense filters - ID-based (RECOMMENDED)
//             expenseTypeId, // Expense type schema reference
//             // Expense filters - Name-based (Backward compatibility)
//             expenseCategory, // Deprecated - use expenseTypeId
//             // Status filters
//             approvalStatus, // Pending, Approved, Declined
//             paymentStatus, // Paid, Unpaid, Processing
//             // Date filters
//             startDate,
//             endDate,
//             // Amount filters
//             minAmount,
//             maxAmount,
//             // Company filter
//             companyId: queryCompanyId,
//             // Search
//             search,
//             // Sorting
//             sortBy = 'dateRequested',
//             sortOrder = 'desc'
//         } = req.query;

//         const userId = req.payload.id;

//         // Parse pagination
//         const pageNum = Math.max(1, parseInt(page));
//         const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
//         const skip = (pageNum - 1) * limitNum;

//         // Determine user type
//         const [employee, company] = await Promise.all([
//             Employee.findById(userId).select('companyId isManager').lean(),
//             Company.findById(userId).lean()
//         ]);

//         if (!employee && !company) {
//             return res.status(404).json({
//                 status: 404,
//                 success: false,
//                 error: 'User not found'
//             });
//         }

//         // Build filter query
//         let filterQuery = {};

//         // Set base filter based on user type
//         if (company) {
//             // Company admin sees all expenses
//             filterQuery.companyId = userId;
//         } else if (employee) {
//             if (employee.isManager) {
//                 // Managers see their team's expenses
//                 filterQuery.companyId = employee.companyId;
//             } else {
//                 // Regular employees see only their own expenses
//                 filterQuery.employeeId = userId;
//                 filterQuery.companyId = employee.companyId;
//             }
//         }

//         // Search across multiple fields
//         if (search && search !== 'undefined' && search !== '') {
//             filterQuery.$or = [
//                 { firstName: { $regex: search, $options: 'i' } },
//                 { lastName: { $regex: search, $options: 'i' } },
//                 { description: { $regex: search, $options: 'i' } },
//                 { expenseTypeName: { $regex: search, $options: 'i' } },
//                 { reference: { $regex: search, $options: 'i' } }
//             ];
//         }

//         // Employee filters - PRIORITY: Use IDs if provided, fallback to names
//         if (employeeId) {
//             // ✅ RECOMMENDED: Filter by employee ID
//             filterQuery.employeeId = employeeId;
//         } else if (employeeName) {
//             // ⚠️ FALLBACK: Filter by employee name (for backward compatibility)
//             filterQuery.$or = [
//                 { firstName: { $regex: employeeName, $options: 'i' } },
//                 { lastName: { $regex: employeeName, $options: 'i' } },
//                 { fullName: { $regex: employeeName, $options: 'i' } }
//             ];
//         }

//         // Department filter (name-based only - no departmentId in schema)
//         if (department) {
//             filterQuery.department = { $regex: department, $options: 'i' };
//         }

//         // Expense filters - PRIORITY: Use IDs if provided, fallback to names
//         if (expenseTypeId) {
//             // ✅ RECOMMENDED: Filter by expense type ID
//             filterQuery.expenseTypeId = expenseTypeId;
//         } else if (expenseCategory) {
//             // ⚠️ FALLBACK: Filter by expense category name (for backward compatibility)
//             filterQuery.expenseTypeName = { $regex: expenseCategory, $options: 'i' };
//         }

//         // Status filters
//         if (approvalStatus) {
//             filterQuery.status = approvalStatus;
//         }
//         if (paymentStatus) {
//             filterQuery.paymentStatus = paymentStatus;
//         }

//         // Company filter (only for super admins)
//         if (queryCompanyId && company) {
//             filterQuery.companyId = queryCompanyId;
//         }

//         // Date range filter
//         if (startDate || endDate) {
//             filterQuery.expenseDate = {};
//             if (startDate) {
//                 filterQuery.expenseDate.$gte = new Date(startDate);
//             }
//             if (endDate) {
//                 filterQuery.expenseDate.$lte = new Date(endDate);
//             }
//         }

//         // Amount range filter
//         if (minAmount || maxAmount) {
//             filterQuery.amount = {};
//             if (minAmount) {
//                 filterQuery.amount.$gte = parseFloat(minAmount);
//             }
//             if (maxAmount) {
//                 filterQuery.amount.$lte = parseFloat(maxAmount);
//             }
//         }

//         // Build sort options
//         const sortDirection = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
//         const sortOptions = { [sortBy]: sortDirection };

//         // Execute query and count in parallel
//         // NOTE: departmentId is NOT populated as it doesn't exist in ExpenseRequests schema
//         const [expenseRequests, totalCount] = await Promise.all([
//             ExpenseRequests.find(filterQuery)
//                 .sort(sortOptions)
//                 .limit(limitNum)
//                 .skip(skip)
//                 .populate('expenseTypeId', 'name description')
//                 .populate('employeeId', 'firstName lastName email profilePic')
//                 .populate('approver', 'firstName lastName email')
//                 .lean()
//                 .exec(),
//             ExpenseRequests.countDocuments(filterQuery)
//         ]);

//         const totalPages = Math.ceil(totalCount / limitNum);

//         // Calculate summary statistics
//         const summary = {
//             total: totalCount,
//             totalAmount: expenseRequests.reduce((sum, req) => sum + (parseFloat(req.amount) || 0), 0),
//             approvedCount: await ExpenseRequests.countDocuments({ ...filterQuery, status: 'Approved' }),
//             approvedAmount: (await ExpenseRequests.find({ ...filterQuery, status: 'Approved' }).select('amount').lean())
//                 .reduce((sum, req) => sum + (parseFloat(req.amount) || 0), 0),
//             pendingCount: await ExpenseRequests.countDocuments({ ...filterQuery, status: 'Pending' }),
//             pendingAmount: (await ExpenseRequests.find({ ...filterQuery, status: 'Pending' }).select('amount').lean())
//                 .reduce((sum, req) => sum + (parseFloat(req.amount) || 0), 0),
//             declinedCount: await ExpenseRequests.countDocuments({ ...filterQuery, status: 'Declined' }),
//             paidCount: await ExpenseRequests.countDocuments({ ...filterQuery, paymentStatus: 'Paid' }),
//             unpaidCount: await ExpenseRequests.countDocuments({ ...filterQuery, paymentStatus: 'Unpaid' })
//         };

//         return res.status(200).json({
//             status: 200,
//             success: true,
//             data: expenseRequests,
//             summary,
//             pagination: {
//                 total: totalCount,
//                 totalPages,
//                 currentPage: pageNum,
//                 limit: limitNum,
//                 hasNextPage: pageNum < totalPages,
//                 hasPrevPage: pageNum > 1
//             },
//             filters: {
//                 employeeId,
//                 employeeName,
//                 department,
//                 expenseTypeId,
//                 expenseCategory,
//                 approvalStatus,
//                 paymentStatus,
//                 startDate,
//                 endDate,
//                 minAmount,
//                 maxAmount,
//                 search
//             },
//             message: expenseRequests.length === 0 ? 'No expense requests found matching the criteria' : undefined
//         });

//     } catch (error) {
//         console.error('Error fetching expense requests:', error);
//         return res.status(500).json({
//             status: 500,
//             success: false,
//             error: 'Failed to fetch expense requests',
//             message: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// export default fetchExpenseReqs;


import dotenv from 'dotenv';
import ExpenseRequests from '../../model/ExpenseRequests';
import Employee from '../../model/Employees';
import Company from '../../model/Company';

dotenv.config();

/**
 * Fetch expense requests - Returns user's own expense requests
 * Managers see only their own requests (not their team's)
 * Filter Options: Expense type ID, Approval status, Payment status,
 * Date range, Amount range, Search
 */
const fetchExpenseReqs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            // Expense filters
            expenseTypeId,
            expenseCategory,
            // Status filters
            approvalStatus,
            paymentStatus,
            // Date filters
            startDate,
            endDate,
            // Amount filters
            minAmount,
            maxAmount,
            // Search
            search,
            // Sorting
            sortBy = 'dateRequested',
            sortOrder = 'desc'
        } = req.query;

        const userId = req.payload.id;

        // Parse pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Determine user type
        const [employee, company] = await Promise.all([
            Employee.findById(userId).select('companyId isManager department').lean(),
            Company.findById(userId).lean()
        ]);

        if (!employee && !company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'User not found'
            });
        }

        // Build filter query
        let filterQuery = {};

        // Set base filter based on user type
        if (company) {
            // Company admin sees all expenses
            filterQuery.companyId = userId;
        } else if (employee) {
            // ALL employees (including managers) see only their OWN expense requests
            filterQuery.employeeId = userId;
            filterQuery.companyId = employee.companyId;
        }

        // Search across multiple fields
        if (search && search !== 'undefined' && search !== '') {
            filterQuery.$or = [
                { description: { $regex: search, $options: 'i' } },
                { expenseTypeName: { $regex: search, $options: 'i' } },
                { reference: { $regex: search, $options: 'i' } }
            ];
        }

        // Expense filters - PRIORITY: Use IDs if provided, fallback to names
        if (expenseTypeId) {
            filterQuery.expenseTypeId = expenseTypeId;
        } else if (expenseCategory) {
            filterQuery.expenseTypeName = { $regex: expenseCategory, $options: 'i' };
        }

        // Status filters
        if (approvalStatus) {
            filterQuery.status = approvalStatus;
        }
        if (paymentStatus) {
            filterQuery.paymentStatus = paymentStatus;
        }

        // Date range filter
        if (startDate || endDate) {
            filterQuery.expenseDate = {};
            if (startDate) {
                filterQuery.expenseDate.$gte = new Date(startDate);
            }
            if (endDate) {
                filterQuery.expenseDate.$lte = new Date(endDate);
            }
        }

        // Amount range filter
        if (minAmount || maxAmount) {
            filterQuery.amount = {};
            if (minAmount) {
                filterQuery.amount.$gte = parseFloat(minAmount);
            }
            if (maxAmount) {
                filterQuery.amount.$lte = parseFloat(maxAmount);
            }
        }

        // Build sort options
        const sortDirection = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
        const sortOptions = { [sortBy]: sortDirection };

        // Execute query and count in parallel
        const [expenseRequests, totalCount] = await Promise.all([
            ExpenseRequests.find(filterQuery)
                .sort(sortOptions)
                .limit(limitNum)
                .skip(skip)
                .populate('expenseTypeId', 'name description')
                .populate('approver', 'firstName lastName email')
                .lean()
                .exec(),
            ExpenseRequests.countDocuments(filterQuery)
        ]);

        const totalPages = Math.ceil(totalCount / limitNum);

        // Calculate summary statistics
        const summary = {
            total: totalCount,
            totalAmount: expenseRequests.reduce((sum, req) => sum + (parseFloat(req.amount) || 0), 0),
            approvedCount: await ExpenseRequests.countDocuments({ ...filterQuery, status: 'Approved' }),
            approvedAmount: (await ExpenseRequests.find({ ...filterQuery, status: 'Approved' }).select('amount').lean())
                .reduce((sum, req) => sum + (parseFloat(req.amount) || 0), 0),
            pendingCount: await ExpenseRequests.countDocuments({ ...filterQuery, status: 'Pending' }),
            pendingAmount: (await ExpenseRequests.find({ ...filterQuery, status: 'Pending' }).select('amount').lean())
                .reduce((sum, req) => sum + (parseFloat(req.amount) || 0), 0),
            declinedCount: await ExpenseRequests.countDocuments({ ...filterQuery, status: 'Declined' }),
            paidCount: await ExpenseRequests.countDocuments({ ...filterQuery, paymentStatus: 'Paid' }),
            unpaidCount: await ExpenseRequests.countDocuments({ ...filterQuery, paymentStatus: 'Unpaid' })
        };

        return res.status(200).json({
            status: 200,
            success: true,
            data: expenseRequests,
            summary,
            pagination: {
                total: totalCount,
                totalPages,
                currentPage: pageNum,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            },
            filters: {
                expenseTypeId,
                expenseCategory,
                approvalStatus,
                paymentStatus,
                startDate,
                endDate,
                minAmount,
                maxAmount,
                search
            },
            userType: company ? 'company' : (employee?.isManager ? 'manager' : 'employee'),
            message: expenseRequests.length === 0 ? 'No expense requests found matching the criteria' : undefined
        });

    } catch (error) {
        console.error('Error fetching expense requests:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Failed to fetch expense requests',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default fetchExpenseReqs;