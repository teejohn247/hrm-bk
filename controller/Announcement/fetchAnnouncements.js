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

        let query = { 
            companyId: companyId,
            isActive: true
        };

        // If user is an employee (not admin), filter announcements relevant to them
        if (user && !user.isSuperAdmin) {
            query.$or = [
                { announcementType: 'all' },
                { 
                    announcementType: 'department', 
                    departments: user.department 
                },
                { 
                    announcementType: 'individual', 
                    targetEmployees: user._id.toString() 
                }
            ];
        }

        // Filter out expired announcements
        query.$or = [
            { expiryDate: { $exists: false } },
            { expiryDate: null },
            { expiryDate: { $gte: new Date() } }
        ];

        const announcements = await Announcement.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCount = await Announcement.countDocuments(query);

        res.status(200).json({
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
        console.error('Error fetching announcements:', error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error
        });
    }
};

export default fetchAnnouncements;
