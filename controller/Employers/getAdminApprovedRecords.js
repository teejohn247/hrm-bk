import dotenv from 'dotenv';
import LeaveRecords from '../../model/LeaveRecords';

dotenv.config();

/**
 * Get approved leave records for a specific approver
 * Shows only approved records where user is the approver
 */
const getAdminApprovedRecords = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const approverId = req.params.id;

        // Validate approver ID
        if (!approverId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Approver ID is required'
            });
        }

        // Parse and validate pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Build filter query
        const filterQuery = {
            leaveApprover: approverId,
            status: 'Approved'
        };

        // Execute query and count in parallel
        const [approvedRecords, totalCount] = await Promise.all([
            LeaveRecords.find(filterQuery)
                .sort({ _id: -1 })
                .limit(limitNum)
                .skip(skip)
                .populate('userId', 'firstName lastName email')
                .lean()
                .exec(),
            LeaveRecords.countDocuments(filterQuery)
        ]);

        const totalPages = Math.ceil(totalCount / limitNum);

        return res.status(200).json({
            status: 200,
            success: true,
            data: approvedRecords,
            totalPages: totalPages,
            currentPage: pageNum,
            limit: limitNum,
           
        });

    } catch (error) {
        console.error('Error fetching approved records:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Failed to fetch approved records',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default getAdminApprovedRecords;