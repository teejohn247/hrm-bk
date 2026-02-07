import dotenv from 'dotenv';
import Announcement from '../../model/Announcement';
import Employee from '../../model/Employees';
import Company from '../../model/Company';

dotenv.config();

const fetchAnnouncements = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const userId = req.payload.id;
        const companyId = req.payload.companyId || req.payload.id;

        // Check if user is a company account (not an employee)
        const company = await Company.findOne({ _id: userId });
        const isCompanyAccount = !!company;

        // If not a company account, check if they're an employee
        let user = null;
        let isSuperAdmin = false;

        if (!isCompanyAccount) {
            user = await Employee.findOne({ _id: userId });
            
            if (!user) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'User not found'
                });
            }

            isSuperAdmin = user.isSuperAdmin;
        }

        // Base query - company only
        let query = { 
            companyId: companyId.toString()
        };

        // If user is company account OR super admin, they see ALL announcements
        if (isCompanyAccount || isSuperAdmin) {
            console.log(`Admin access (Company: ${isCompanyAccount}, SuperAdmin: ${isSuperAdmin}): fetching all announcements`);
            // No additional filters - they see everything
        } else {
            // Regular employees see only active, non-expired announcements targeted to them
            const conditions = [];

            // 1. Only active announcements
            query.isActive = true;

            // 2. Filter by announcement type and target audience
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

            // 3. Filter out expired announcements
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
        }

        const announcements = await Announcement.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCount = await Announcement.countDocuments(query);

        const userName = isCompanyAccount 
            ? company.companyName 
            : (user.fullName || user.email);

        console.log(`Fetched ${announcements.length} announcements for ${userName}`);

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