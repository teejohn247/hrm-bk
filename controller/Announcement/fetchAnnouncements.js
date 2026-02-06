import dotenv from 'dotenv';
import Announcement from '../../model/Announcement';
import Employee from '../../model/Employees';

dotenv.config();

const fetchAnnouncements = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get user details to check if admin or employee
        const user = await Employee.findOne({ _id: req.payload.id });
        const companyId = req.payload.companyId || req.payload.id;

        if (!user) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'User not found'
            });
        }

        // Base query - company and active status
        let query = { 
            companyId: companyId.toString(),
            isActive: true
        };

        // Build $and array for combining multiple conditions
        const conditions = [];

        // 1. Filter by announcement type and target audience
        if (!user.isSuperAdmin) {
            // Regular employees only see announcements targeted to them
            conditions.push({
                $or: [
                    { announcementType: 'all' },
                    { 
                        announcementType: 'department', 
                        departments: user.department 
                    },
                    { 
                        announcementType: 'individual', 
                        targetEmployees: user._id.toString() 
                    }
                ]
            });
        }
        // If super admin, they see all announcements (no filter needed)

        // 2. Filter out expired announcements
        conditions.push({
            $or: [
                { expiryDate: { $exists: false } },
                { expiryDate: null },
                { expiryDate: { $gte: new Date() } }
            ]
        });

        // Combine all conditions with $and
        if (conditions.length > 0) {
            query.$and = conditions;
        }

        const announcements = await Announcement.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCount = await Announcement.countDocuments(query);

        console.log(`Fetched ${announcements.length} announcements for user ${user.fullName || user.email}`);

        return res.status(200).json({
            status: 200,
            success: true,
            data: announcements,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                itemsPerPage: limit
            }
        });

    } catch (error) {
        console.error('Error fetching announcements:', {
            error: error.message,
            stack: error.stack,
            userId: req.payload?.id
        });

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid ID format',
                details: error.message
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while fetching announcements'
        });
    }
};

export default fetchAnnouncements;