import dotenv from 'dotenv';
import Announcement from '../../model/Announcement';
import Employee from '../../model/Employees';
import Notification from '../../model/Notification';
import Company from '../../model/Company';

dotenv.config();

const createAnnouncement = async (req, res) => {
    try {
        const { 
            title, 
            content, 
            announcementType, 
            departments, 
            targetEmployees, 
            priority,
            expiryDate,
            attachments 
        } = req.body;

        // Validate required fields
        if (!title || title === "") {
            return res.status(400).json({
                status: 400,
                error: "Title is required"
            });
        }

        if (!content || content === "") {
            return res.status(400).json({
                status: 400,
                error: "Content is required"
            });
        }

        if (!announcementType || !['all', 'department', 'individual'].includes(announcementType)) {
            return res.status(400).json({
                status: 400,
                error: "Valid announcement type is required (all, department, or individual)"
            });
        }

        // Get company details
        const company = await Company.findOne({ _id: req.payload.id });
        
        if (!company) {
            return res.status(400).json({
                status: 400,
                error: "Company not found"
            });
        }

        // Get creator details
        const creator = await Employee.findOne({ _id: req.payload.id });
        const creatorName = creator ? creator.fullName || `${creator.firstName} ${creator.lastName}` : "Admin";

        // Create announcement
        const announcement = new Announcement({
            title,
            content,
            announcementType,
            departments: announcementType === 'department' ? departments : [],
            targetEmployees: announcementType === 'individual' ? targetEmployees : [],
            companyId: company._id,
            companyName: company.companyName,
            createdBy: req.payload.id,
            createdByName: creatorName,
            priority: priority || 'medium',
            expiryDate: expiryDate || null,
            attachments: attachments || [],
            isActive: true
        });

        await announcement.save();

        // Create notifications for recipients
        let recipients = [];

        if (announcementType === 'all') {
            // Get all employees in the company
            recipients = await Employee.find({ 
                companyId: company._id,
                activeStatus: true 
            }).select('_id');
        } else if (announcementType === 'department') {
            // Get employees in specified departments
            recipients = await Employee.find({ 
                companyId: company._id,
                department: { $in: departments },
                activeStatus: true 
            }).select('_id');
        } else if (announcementType === 'individual') {
            // Use specified employee IDs
            recipients = targetEmployees.map(id => ({ _id: id }));
        }

        // Create notifications for all recipients
        const notifications = recipients.map(recipient => ({
            notificationType: 'Announcement',
            notificationContent: `New announcement: ${title}`,
            recipientId: recipient._id.toString(),
            companyName: company.companyName,
            companyId: company._id,
            created_by: req.payload.id,
            read: false
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(200).json({
            status: 200,
            success: true,
            data: announcement,
            message: `Announcement created and sent to ${recipients.length} recipient(s)`
        });

    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error
        });
    }
};

export default createAnnouncement;
