import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import LeaveRecords from '../../model/LeaveRecords';
import Company from '../../model/Company';

dotenv.config();

/**
 * Get leave records for admin (with filters and pagination)
 * Shows records the admin can approve OR all company records if super admin
 */
const getAdminRecords = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            firstName,
            lastName,
            leaveTypeName,
            status,
            department,
            startDate,
            endDate,
            approved
        } = req.query;

        const userId = req.payload.id;

        // Parse and validate pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Check if user is employee or company (parallel queries)
        const [employee, company] = await Promise.all([
            Employee.findById(userId).select('companyId').lean(),
            Company.findById(userId).select('_id').lean()
        ]);

        // Build filter query
        const filterQuery = {};

        // Determine company filter based on user type
        if (employee) {
            // Regular employee - only see records they can approve
            filterQuery.companyId = employee.companyId;
            filterQuery.leaveApprover = userId;
        } else if (company) {
            // Super admin - see all company records
            filterQuery.companyId = userId;
        } else {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'User not found'
            });
        }

        // Add search filters
        if (firstName) {
            filterQuery.firstName = { $regex: firstName, $options: 'i' };
        }
        if (lastName) {
            filterQuery.lastName = { $regex: lastName, $options: 'i' };
        }
        if (leaveTypeName) {
            filterQuery.leaveTypeName = leaveTypeName;
        }
        if (status) {
            filterQuery.status = status;
        }
        if (department) {
            filterQuery.department = department;
        }
        if (approved !== undefined) {
            filterQuery.approved = approved === 'true';
        }

        // Date range filter
        if (startDate || endDate) {
            filterQuery.leaveStartDate = {};
            if (startDate) {
                filterQuery.leaveStartDate.$gte = new Date(startDate);
            }
            if (endDate) {
                filterQuery.leaveStartDate.$lte = new Date(endDate);
            }
        }

        // Execute query and count in parallel
        const [leaveRecords, totalCount] = await Promise.all([
            LeaveRecords.find(filterQuery)
                .sort({ _id: -1 })
                .limit(limitNum)
                .skip(skip)
                .lean()
                .exec(),
            LeaveRecords.countDocuments(filterQuery)
        ]);

        const totalPages = Math.ceil(totalCount / limitNum);

        return res.status(200).json({
            status: 200,
            success: true,
            data: leaveRecords,
            totalPages: totalPages,
            currentPage: pageNum,
            limit: limitNum,
           
        });

    } catch (error) {
        console.error('Error fetching admin records:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Failed to fetch leave records',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default getAdminRecords;