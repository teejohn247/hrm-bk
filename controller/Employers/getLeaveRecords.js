import dotenv from 'dotenv';
import LeaveRecords from '../../model/LeaveRecords';

dotenv.config();

/**
 * Get leave records for a specific user (with filters and pagination)
 * Returns user's own leave records with various filter options
 */
const getLeaveRecords = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            leaveType,
            startDate,
            endDate,
            search
        } = req.query;

        const userId = req.payload.id;

        // Parse and validate pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Build filter query - start with user filter
        const filterQuery = { userId };

        // Add status filter
        if (status) {
            filterQuery.status = { $regex: status, $options: 'i' };
        }

        // Add leave type filter
        if (leaveType) {
            filterQuery.leaveType = { $regex: leaveType, $options: 'i' };
        }

        // Add date range filters
        if (startDate || endDate) {
            if (startDate && endDate) {
                // Both dates provided - records that overlap with this range
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
                    }
                ];
            } else if (startDate) {
                // Only start date - records starting on or after this date
                filterQuery.leaveStartDate = { $gte: new Date(startDate) };
            } else if (endDate) {
                // Only end date - records ending on or before this date
                filterQuery.leaveEndDate = { $lte: new Date(endDate) };
            }
        }

        // Add general search filter
        if (search) {
            filterQuery.$or = [
                { reason: { $regex: search, $options: 'i' } },
                { comments: { $regex: search, $options: 'i' } },
                { leaveType: { $regex: search, $options: 'i' } },
                { status: { $regex: search, $options: 'i' } }
            ];
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
            message: leaveRecords.length === 0 ? 'No leave records found matching the criteria' : undefined,
            totalPages: totalPages,
            currentPage: pageNum,
            limit: limitNum,
           
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