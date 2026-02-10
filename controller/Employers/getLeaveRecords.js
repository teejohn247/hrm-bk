// import dotenv from 'dotenv';
// import LeaveRecords from '../../model/LeaveRecords';

// dotenv.config();

// /**
//  * Get leave records for a specific user (with filters and pagination)
//  * Returns user's own leave records with various filter options
//  */
// const getLeaveRecords = async (req, res) => {
//     try {
//         const {
//             page = 1,
//             limit = 10,
//             status,
//             leaveType,
//             startDate,
//             endDate,
//             search
//         } = req.query;

//         const userId = req.payload.id;

//         // Parse and validate pagination
//         const pageNum = Math.max(1, parseInt(page));
//         const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
//         const skip = (pageNum - 1) * limitNum;

//         // Build filter query - start with user filter
//         const filterQuery = { userId };

//         // Add status filter
//         if (status) {
//             filterQuery.status = { $regex: status, $options: 'i' };
//         }

//         // Add leave type filter
//         if (leaveType) {
//             filterQuery.leaveType = { $regex: leaveType, $options: 'i' };
//         }

//         // Add date range filters
//         if (startDate || endDate) {
//             if (startDate && endDate) {
//                 // Both dates provided - records that overlap with this range
//                 filterQuery.$or = [
//                     {
//                         leaveStartDate: {
//                             $gte: new Date(startDate),
//                             $lte: new Date(endDate)
//                         }
//                     },
//                     {
//                         leaveEndDate: {
//                             $gte: new Date(startDate),
//                             $lte: new Date(endDate)
//                         }
//                     }
//                 ];
//             } else if (startDate) {
//                 // Only start date - records starting on or after this date
//                 filterQuery.leaveStartDate = { $gte: new Date(startDate) };
//             } else if (endDate) {
//                 // Only end date - records ending on or before this date
//                 filterQuery.leaveEndDate = { $lte: new Date(endDate) };
//             }
//         }

//         // Add general search filter
//         if (search) {
//             filterQuery.$or = [
//                 { reason: { $regex: search, $options: 'i' } },
//                 { comments: { $regex: search, $options: 'i' } },
//                 { leaveType: { $regex: search, $options: 'i' } },
//                 { status: { $regex: search, $options: 'i' } }
//             ];
//         }

//         // Execute query and count in parallel
//         const [leaveRecords, totalCount] = await Promise.all([
//             LeaveRecords.find(filterQuery)
//                 .sort({ _id: -1 })
//                 .limit(limitNum)
//                 .skip(skip)
//                 .lean()
//                 .exec(),
//             LeaveRecords.countDocuments(filterQuery)
//         ]);

//         const totalPages = Math.ceil(totalCount / limitNum);

//         return res.status(200).json({
//             status: 200,
//             success: true,
//             data: leaveRecords,
//             message: leaveRecords.length === 0 ? 'No leave records found matching the criteria' : undefined,
//             totalPages: totalPages,
//             currentPage: pageNum,
//             limit: limitNum,
           
//         });

//     } catch (error) {
//         console.error('Error fetching leave records:', error);
//         return res.status(500).json({
//             status: 500,
//             success: false,
//             error: 'Failed to fetch leave records',
//             message: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// export default getLeaveRecords;


import dotenv from 'dotenv';
import LeaveRecords from '../../model/LeaveRecords';
import Employee from '../../model/Employees';
import Company from '../../model/Company';

dotenv.config();

/**
 * Get leave records with comprehensive filtering
 * Filter Options: Employee, Leave type, Leave status, Date range, Department, Approver, Company
 */
const getLeaveRecords = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            // Leave filters
            status, // Pending, Approved, Declined, Cancelled
            leaveType,
            leaveTypeId,
            // Date filters
            startDate,
            endDate,
            // Employee filters
            employeeId,
            employeeName,
            department,
            // Approver filters
            approver,
            approverId,
            // Company filter
            companyId: queryCompanyId,
            // Search
            search,
            // Sorting
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const userId = req.payload.id;

        // Parse pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Determine user type
        const [employee, company] = await Promise.all([
            Employee.findById(userId).select('companyId isManager').lean(),
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
            // Company admin sees all company leaves
            filterQuery.companyId = userId;
        } else if (employee) {
            if (employee.isManager) {
                // Managers see their team's leaves
                filterQuery.companyId = employee.companyId;
            } else {
                // Regular employees see only their own leaves
                filterQuery.userId = userId;
                filterQuery.companyId = employee.companyId;
            }
        }

        // Search across multiple fields
        if (search && search !== 'undefined' && search !== '') {
            filterQuery.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { reason: { $regex: search, $options: 'i' } },
                { comments: { $regex: search, $options: 'i' } },
                { leaveTypeName: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } }
            ];
        }

        // Leave filters
        if (status) {
            filterQuery.status = status;
        }
        if (leaveType) {
            filterQuery.leaveTypeName = { $regex: leaveType, $options: 'i' };
        }
        if (leaveTypeId) {
            filterQuery.leaveTypeId = leaveTypeId;
        }

        // Employee filters
        if (employeeId) {
            filterQuery.userId = employeeId;
        }
        if (employeeName) {
            filterQuery.$or = [
                { firstName: { $regex: employeeName, $options: 'i' } },
                { lastName: { $regex: employeeName, $options: 'i' } },
                { fullName: { $regex: employeeName, $options: 'i' } }
            ];
        }
        if (department) {
            filterQuery.department = { $regex: department, $options: 'i' };
        }

        // Approver filters
        if (approver) {
            filterQuery.approver = { $regex: approver, $options: 'i' };
        }
        if (approverId) {
            filterQuery.leaveApprover = approverId;
        }

        // Company filter (only for super admins)
        if (queryCompanyId && company) {
            filterQuery.companyId = queryCompanyId;
        }

        // Date range filters - overlapping leaves
        if (startDate || endDate) {
            if (startDate && endDate) {
                // Find leaves that overlap with date range
                filterQuery.$or = [
                    {
                        leaveStartDate: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    },
                    {
                        leaveEndDate: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    },
                    {
                        $and: [
                            { leaveStartDate: { $lte: new Date(startDate) } },
                            { leaveEndDate: { $gte: new Date(endDate) } }
                        ]
                    }
                ];
            } else if (startDate) {
                filterQuery.leaveStartDate = { $gte: new Date(startDate) };
            } else if (endDate) {
                filterQuery.leaveEndDate = { $lte: new Date(endDate) };
            }
        }

        // Build sort options
        const sortDirection = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
        const sortOptions = { [sortBy]: sortDirection };

        // Execute query and count in parallel
        const [leaveRecords, totalCount] = await Promise.all([
            LeaveRecords.find(filterQuery)
                .sort(sortOptions)
                .limit(limitNum)
                .skip(skip)
                .populate('userId', 'firstName lastName email profilePic')
                .populate('leaveTypeId', 'leaveName')
                .lean()
                .exec(),
            LeaveRecords.countDocuments(filterQuery)
        ]);

        const totalPages = Math.ceil(totalCount / limitNum);

        // Calculate statistics
        const statistics = {
            total: totalCount,
            pending: await LeaveRecords.countDocuments({ ...filterQuery, status: 'Pending' }),
            approved: await LeaveRecords.countDocuments({ ...filterQuery, status: 'Approved' }),
            declined: await LeaveRecords.countDocuments({ ...filterQuery, status: 'Declined' }),
            cancelled: await LeaveRecords.countDocuments({ ...filterQuery, status: 'Cancelled' })
        };

        return res.status(200).json({
            status: 200,
            success: true,
            data: leaveRecords,
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
                status,
                leaveType,
                leaveTypeId,
                startDate,
                endDate,
                employeeId,
                employeeName,
                department,
                approver,
                approverId,
                search
            },
            message: leaveRecords.length === 0 ? 'No leave records found matching the criteria' : undefined
        });

    } catch (error) {
        console.error('Error fetching leave records:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Failed to fetch leave records',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default getLeaveRecords;