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
            attachments,
            isActive 
        } = req.body;

        if (!id) {
            return res.status(400).json({
                status: 400,
                error: "Announcement ID is required"
            });
        }

        const announcement = await Announcement.findOne({ _id: id });

        if (!announcement) {
            return res.status(404).json({
                status: 404,
                error: "Announcement not found"
            });
        }

        // Update fields if provided
        if (title) announcement.title = title;
        if (content) announcement.content = content;
        if (announcementType) announcement.announcementType = announcementType;
        if (departments) announcement.departments = departments;
        if (targetEmployees) announcement.targetEmployees = targetEmployees;
        if (priority) announcement.priority = priority;
        if (expiryDate !== undefined) announcement.expiryDate = expiryDate;
        if (attachments) announcement.attachments = attachments;
        if (isActive !== undefined) announcement.isActive = isActive;

        await announcement.save();

        // If announcement type or recipients changed, send new notifications
        if (announcementType || departments || targetEmployees) {
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
                recipients = announcement.targetEmployees.map(id => ({ _id: id }));
            }

            const notifications = recipients.map(recipient => ({
                notificationType: 'Announcement Updated',
                notificationContent: `Updated announcement: ${announcement.title}`,
                recipientId: recipient._id.toString(),
                companyName: announcement.companyName,
                companyId: announcement.companyId,
                created_by: req.payload.id,
                read: false
            }));

            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        }

        res.status(200).json({
            status: 200,
            success: true,
            data: announcement,
            message: "Announcement updated successfully"
        });

    } catch (error) {
        console.error('Error updating announcement:', error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error
        });
    }
};

export default updateAnnouncement;
