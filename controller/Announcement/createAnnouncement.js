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
            expiryDate
        } = req.body;

        // Validate required fields
        if (!title || title.trim() === "") {
            return res.status(400).json({
                status: 400,
                success: false,
                error: "Title is required"
            });
        }

        if (!content || content.trim() === "") {
            return res.status(400).json({
                status: 400,
                success: false,
                error: "Content is required"
            });
        }

        if (!announcementType || !['all', 'department', 'individual'].includes(announcementType)) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: "Valid announcement type is required (all, department, or individual)"
            });
        }

        // Validate type-specific requirements
        if (announcementType === 'department' && (!departments || departments.length === 0)) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: "Departments are required for department-specific announcements"
            });
        }

        if (announcementType === 'individual' && (!targetEmployees || targetEmployees.length === 0)) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: "Target employees are required for individual announcements"
            });
        }

        // Get company details
        const company = await Company.findOne({ _id: req.payload.id });
        
        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: "Company not found"
            });
        }

        // Get creator details
        const creator = await Employee.findOne({ _id: req.payload.id });
        const creatorName = creator 
            ? (creator.fullName || `${creator.firstName} ${creator.lastName}`)
            : "Admin";

        // Handle attachments from Cloudinary upload
        const attachments = [];
        
        // If image was uploaded via middleware, it will be in req.body.image
        if (req.body.image) {
            // Extract filename from the original file if available
            const fileName = req.file 
                ? req.file.originalname 
                : `attachment_${Date.now()}`;

            attachments.push({
                url: req.body.image,
                fileName: fileName
            });
        }

        // Also handle any additional attachments passed in the body (array of URLs)
        if (req.body.attachments && Array.isArray(req.body.attachments)) {
            const additionalAttachments = req.body.attachments.map((att, index) => {
                if (typeof att === 'string') {
                    // If it's just a URL string
                    return {
                        url: att,
                        fileName: `attachment_${index + 1}`
                    };
                } else if (att.url) {
                    // If it's already an object with url
                    return {
                        url: att.url,
                        fileName: att.fileName || `attachment_${index + 1}`
                    };
                }
                return null;
            }).filter(Boolean);

            attachments.push(...additionalAttachments);
        }

        // Create announcement
        const announcement = new Announcement({
            title: title.trim(),
            content: content.trim(),
            announcementType,
            departments: announcementType === 'department' ? departments : [],
            targetEmployees: announcementType === 'individual' ? targetEmployees : [],
            companyId: company._id.toString(),
            companyName: company.companyName,
            createdBy: req.payload.id.toString(),
            createdByName: creatorName,
            priority: priority || 'medium',
            expiryDate: expiryDate || null,
            attachments: attachments,
            isActive: true
        });

        const savedAnnouncement = await announcement.save();

        // Create notifications for recipients
        let recipients = [];

        if (announcementType === 'all') {
            // Get all active employees in the company
            recipients = await Employee.find({ 
                companyId: company._id.toString(),
                activeStatus: true 
            }).select('_id');
        } else if (announcementType === 'department') {
            // Get employees in specified departments
            recipients = await Employee.find({ 
                companyId: company._id.toString(),
                department: { $in: departments },
                activeStatus: true 
            }).select('_id');
        } else if (announcementType === 'individual') {
            // Validate target employees exist
            recipients = await Employee.find({
                _id: { $in: targetEmployees },
                companyId: company._id.toString()
            }).select('_id');

            // Check if all target employees were found
            if (recipients.length !== targetEmployees.length) {
                console.warn(`Some target employees not found. Expected: ${targetEmployees.length}, Found: ${recipients.length}`);
            }
        }

        // Create notifications for all recipients
        if (recipients.length > 0) {
            const notifications = recipients.map(recipient => ({
                notificationType: 'Announcement',
                notificationContent: `New announcement: ${title}`,
                recipientId: recipient._id.toString(),
                companyName: company.companyName,
                companyId: company._id.toString(),
                created_by: req.payload.id.toString(),
                read: false
            }));

            await Notification.insertMany(notifications);
        }

        console.log(`Announcement "${title}" created and sent to ${recipients.length} recipient(s)`);

        return res.status(200).json({
            status: 200,
            success: true,
            data: savedAnnouncement,
            message: `Announcement created and sent to ${recipients.length} recipient(s)`,
            recipientCount: recipients.length
        });

    } catch (error) {
        console.error('Error creating announcement:', {
            error: error.message,
            stack: error.stack,
            companyId: req.payload?.id,
            title: req.body?.title
        });

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Validation error',
                details: error.message
            });
        }

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
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while creating the announcement'
        });
    }
};

export default createAnnouncement;