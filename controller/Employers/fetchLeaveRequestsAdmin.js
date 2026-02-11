// import dotenv from 'dotenv';
// import Role from '../../model/ExpenseRequests';
// import Employee from '../../model/Employees';
// import Company from '../../model/Company';



// import { emailTemp } from '../../emailTemplate';


// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);



// const fetchExpenseReqsAdmin = async (req, res) => {

//     try {

//         const { page, limit, status, startDate, endDate, expenseTypeId } = req.query;

//         const user =  await Employee.findOne({_id: req.payload.id, isManager: true})
//         const company=  await Company.findOne({_id: req.payload.id})


//         if(!user && !company){
//             res.status(400).json({
//                 status: 400,
//                 success: false,
//                 data: "This employee is not a manager",
//             })

//             return;
//         }

//         // Build filter object
//         const buildFilter = (baseFilter) => {
//             let filter = { ...baseFilter };
            
//             if (status) {
//                 filter.status = status;
//             }
//             if (startDate && endDate) {
//                 filter.dateRequested = {
//                     $gte: new Date(startDate),
//                     $lte: new Date(endDate)
//                 };
//             }
//             if (expenseTypeId) {
//                 filter.expenseTypeId = expenseTypeId;
//             }
//             return filter;
//         };

//         if(user){


//             const baseFilter = {
//                 approverId: req.payload.id,
//                 companyId: user.companyId ? user.companyId :company._id
//             };
//             const filter = buildFilter(baseFilter);

//             const role = await Role.find(filter)
//                 .sort({ "dateRequested": -1 })
//                 .limit(limit * 1)
//                 .skip((page - 1) * limit)
//                 .exec();
    
//             const count = await Role.find(filter).countDocuments()
    
//             console.log(role)
    
//             res.status(200).json({
//                 status: 200,
//                 success: true,
//                 data: role,
//                 totalPages: Math.ceil(count / limit),
//                 currentPage: page
//             })
    
//             return;
    
//         }

//         else if(company){


//             const baseFilter = {
//                 companyId: company._id
//             };
//             const filter = buildFilter(baseFilter);

//             const role = await Role.find(filter)
//                 .sort({ "dateRequested": -1 })
//                 .limit(limit * 1)
//                 .skip((page - 1) * limit)
//                 .exec();
    
//             const count = await Role.find(filter).countDocuments()
    
//             console.log(role)
    
//             res.status(200).json({
//                 status: 200,
//                 success: true,
//                 data: role,
//                 totalPages: Math.ceil(count / limit),
//                 currentPage: page
//             })
    
//             return;
    
//         }


     
//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error
//         })
//     }
// }
// export default fetchExpenseReqsAdmin;
import dotenv from 'dotenv';
import ExpenseRequests from '../../model/ExpenseRequests';
import Employee from '../../model/Employees';
import Company from '../../model/Company';

dotenv.config();

/**
 * Fetch expense requests for admin/manager with comprehensive filtering
 * Filter Options: Employee ID, Expense type ID, Approval status, Payment status,
 * Date range, Amount range, Department (name-based), Company
 */
const fetchExpenseReqsAdmin = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            // Employee filters - ID-based (RECOMMENDED)
            employeeId, // Employee reference
            // Employee filters - Name-based (Backward compatibility)
            employeeName, // Deprecated - use employeeId
            department, // Department name (no ID in ExpenseRequests schema)
            // Expense filters - ID-based (RECOMMENDED)
            expenseTypeId, // Expense type schema reference
            // Expense filters - Name-based (Backward compatibility)
            expenseCategory, // Deprecated - use expenseTypeId
            // Status filters
            status,
            paymentStatus,
            // Date filters
            startDate,
            endDate,
            // Amount filters
            minAmount,
            maxAmount,
            // Company filter
            companyId: queryCompanyId,
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

        // Determine user type - parallel queries
        const [employee, company] = await Promise.all([
            Employee.findById(userId).select('companyId isManager').lean(),
            Company.findById(userId).lean()
        ]);

        // Validate user is manager or company admin
        if (!company && (!employee || !employee.isManager)) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'Access denied. Only managers and admins can view all expense requests.'
            });
        }

        // Build filter query
        let filterQuery = {};

        // Set base filter based on user type
        if (company) {
            // Company admin sees all company expenses
            filterQuery.companyId = userId;
        } else if (employee && employee.isManager) {
            // Manager sees expenses they can approve
            filterQuery.companyId = employee.companyId;
            filterQuery.approverId = userId;
        }

        // Search across multiple fields
        if (search && search !== 'undefined' && search !== '') {
            filterQuery.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { fullName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { expenseTypeName: { $regex: search, $options: 'i' } },
                { reference: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } }
            ];
        }

        // Employee filters - PRIORITY: Use IDs if provided, fallback to names
        if (employeeId) {
            // ✅ RECOMMENDED: Filter by employee ID
            filterQuery.employeeId = employeeId;
        } else if (employeeName) {
            // ⚠️ FALLBACK: Filter by employee name (for backward compatibility)
            filterQuery.$or = [
                { firstName: { $regex: employeeName, $options: 'i' } },
                { lastName: { $regex: employeeName, $options: 'i' } },
                { fullName: { $regex: employeeName, $options: 'i' } }
            ];
        }

        // Department filter (name-based only - no departmentId in schema)
        if (department) {
            filterQuery.department = { $regex: department, $options: 'i' };
        }

        // Expense filters - PRIORITY: Use IDs if provided, fallback to names
        if (expenseTypeId) {
            // ✅ RECOMMENDED: Filter by expense type ID
            filterQuery.expenseTypeId = expenseTypeId;
        } else if (expenseCategory) {
            // ⚠️ FALLBACK: Filter by expense category name (for backward compatibility)
            filterQuery.expenseTypeName = { $regex: expenseCategory, $options: 'i' };
        }

        // Status filters
        if (status) {
            filterQuery.status = status;
        }
        if (paymentStatus) {
            filterQuery.paymentStatus = paymentStatus;
        }

        // Company filter (only for super admins)
        if (queryCompanyId && company) {
            filterQuery.companyId = queryCompanyId;
        }

        // Date range filter
        if (startDate || endDate) {
            filterQuery.dateRequested = {};
            if (startDate) {
                filterQuery.dateRequested.$gte = new Date(startDate);
            }
            if (endDate) {
                filterQuery.dateRequested.$lte = new Date(endDate);
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
        // NOTE: departmentId is NOT populated as it doesn't exist in ExpenseRequests schema
        const [expenses, totalCount] = await Promise.all([
            ExpenseRequests.find(filterQuery)
                .sort(sortOptions)
                .limit(limitNum)
                .skip(skip)
                .populate('expenseTypeId', 'name description')
                .populate('employeeId', 'firstName lastName email profilePic department')
                .populate('approverId', 'firstName lastName email')
                .lean()
                .exec(),
            ExpenseRequests.countDocuments(filterQuery)
        ]);

        const totalPages = Math.ceil(totalCount / limitNum);

        // Calculate comprehensive statistics
        const statistics = await calculateExpenseStatistics(filterQuery);

        return res.status(200).json({
            status: 200,
            success: true,
            data: expenses,
            statistics,
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
                expenseTypeId,
                expenseCategory,
                status,
                paymentStatus,
                startDate,
                endDate,
                minAmount,
                maxAmount,
                search
            },
            message: expenses.length === 0 ? 'No expense requests found matching the criteria' : undefined
        });

    } catch (error) {
        console.error('Error fetching expense requests (admin):', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Failed to fetch expense requests',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Helper function to calculate statistics
async function calculateExpenseStatistics(filterQuery) {
    const [
        pendingExpenses,
        approvedExpenses,
        declinedExpenses,
        paidExpenses,
        unpaidExpenses
    ] = await Promise.all([
        ExpenseRequests.find({ ...filterQuery, status: 'Pending' }).select('amount').lean(),
        ExpenseRequests.find({ ...filterQuery, status: 'Approved' }).select('amount').lean(),
        ExpenseRequests.find({ ...filterQuery, status: 'Declined' }).select('amount').lean(),
        ExpenseRequests.find({ ...filterQuery, paymentStatus: 'Paid' }).select('amount').lean(),
        ExpenseRequests.find({ ...filterQuery, paymentStatus: 'Unpaid' }).select('amount').lean()
    ]);

    return {
        total: await ExpenseRequests.countDocuments(filterQuery),
        pending: {
            count: pendingExpenses.length,
            amount: pendingExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0)
        },
        approved: {
            count: approvedExpenses.length,
            amount: approvedExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0)
        },
        declined: {
            count: declinedExpenses.length,
            amount: declinedExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0)
        },
        paid: {
            count: paidExpenses.length,
            amount: paidExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0)
        },
        unpaid: {
            count: unpaidExpenses.length,
            amount: unpaidExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0)
        }
    };
}

export default fetchExpenseReqsAdmin;