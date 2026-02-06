import dotenv from 'dotenv';
import Announcement from '../../model/Announcement';
import Employee from '../../model/Employees';
import Notification from '../../model/Notification';

dotenv.config();

const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, 
            content, 
            announcementType, 
            departments, 
            targetEmployees, 
            priority,
            expiryDate,
            isActive,
            removeAttachment // Array of attachment URLs to remove
        } = req.body;

        // Validate announcement ID
        if (!id) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: "Announcement ID is required"
            });
        }

        // Find existing announcement
        const announcement = await Announcement.findOne({ _id: id });

        if (!announcement) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: "Announcement not found"
            });
        }

        // Check authorization (optional - uncomment if needed)
        // if (announcement.createdBy !== req.payload.id.toString()) {
        //     return res.status(403).json({
        //         status: 403,
        //         success: false,
        //         error: "You don't have permission to update this announcement"
        //     });
        // }

        // Track if recipients changed (to send notifications)
        const recipientsChanged = announcementType || departments || targetEmployees;

        // Update basic fields if provided
        if (title && title.trim() !== "") {
            announcement.title = title.trim();
        }
        
        if (content && content.trim() !== "") {
            announcement.content = content.trim();
        }
        
        if (announcementType && ['all', 'department', 'individual'].includes(announcementType)) {
            announcement.announcementType = announcementType;
        }
        
        if (priority && ['low', 'medium', 'high'].includes(priority)) {
            announcement.priority = priority;
        }
        
        if (expiryDate !== undefined) {
            announcement.expiryDate = expiryDate || null;
        }
        
        if (isActive !== undefined) {
            announcement.isActive = isActive;
        }

        // Update type-specific fields
        if (announcement.announcementType === 'department') {
            if (departments && Array.isArray(departments)) {
                announcement.departments = departments;
            }
            announcement.targetEmployees = []; // Clear individual targets
        } else if (announcement.announcementType === 'individual') {
            if (targetEmployees && Array.isArray(targetEmployees)) {
                announcement.targetEmployees = targetEmployees;
            }
            announcement.departments = []; // Clear departments
        } else if (announcement.announcementType === 'all') {
            announcement.departments = [];
            announcement.targetEmployees = [];
        }

        // Handle attachments
        let currentAttachments = announcement.attachments || [];

        // Remove specific attachments if requested
        if (removeAttachment && Array.isArray(removeAttachment)) {
            currentAttachments = currentAttachments.filter(
                att => !removeAttachment.includes(att.url)
            );
        }

        // Add new attachment from Cloudinary upload
        if (req.body.image) {
            const fileName = req.file 
                ? req.file.originalname 
                : `attachment_${Date.now()}`;

            currentAttachments.push({
                url: req.body.image,
                fileName: fileName
            });
        }

        // Handle additional attachments from body (if any)
        if (req.body.newAttachments && Array.isArray(req.body.newAttachments)) {
            const additionalAttachments = req.body.newAttachments.map((att, index) => {
                if (typeof att === 'string') {
                    return {
                        url: att,
                        fileName: `attachment_${index + 1}`
                    };
                } else if (att.url) {
                    return {
                        url: att.url,
                        fileName: att.fileName || `attachment_${index + 1}`
                    };
                }
                return null;
            }).filter(Boolean);

            currentAttachments.push(...additionalAttachments);
        }

        announcement.attachments = currentAttachments;

        // Save updated announcement
        const updatedAnnouncement = await announcement.save();

        // Send notifications if recipients changed
        if (recipientsChanged) {
            let recipients = [];

            if (announcement.announcementType === 'all') {
                recipients = await Employee.find({ 
                    companyId: announcement.companyId,
                    activeStatus: true 
                }).select('_id');
            } else if (announcement.announcementType === 'department') {
                recipients = await Employee.find({ 
                    companyId: announcement.companyId,
                    department: { $in: announcement.departments },
                    activeStatus: true 
                }).select('_id');
            } else if (announcement.announcementType === 'individual') {
                recipients = await Employee.find({
                    _id: { $in: announcement.targetEmployees },
                    companyId: announcement.companyId
                }).select('_id');
            }

            if (recipients.length > 0) {
                const notifications = recipients.map(recipient => ({
                    notificationType: 'Announcement Updated',
                    notificationContent: `Updated announcement: ${announcement.title}`,
                    recipientId: recipient._id.toString(),
                    companyName: announcement.companyName,
                    companyId: announcement.companyId,
                    created_by: req.payload.id.toString(),
                    read: false
                }));

                await Notification.insertMany(notifications);
                
                console.log(`Update notifications sent to ${recipients.length} recipient(s)`);
            }
        }

        console.log(`Announcement "${announcement.title}" updated successfully`);

        return res.status(200).json({
            status: 200,
            success: true,
            data: updatedAnnouncement,
            message: "Announcement updated successfully"
        });

    } catch (error) {
        console.error('Error updating announcement:', {
            error: error.message,
            stack: error.stack,
            announcementId: req.params?.id
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
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while updating the announcement'
        });
    }
};

export default updateAnnouncement;