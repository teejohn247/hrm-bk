import Notification from '../../model/Notification';
import dotenv from 'dotenv';

dotenv.config();

const readNotification = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate notification ID
        if (!id) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: "Notification ID is required"
            });
        }

        // Find and update notification in one query using findByIdAndUpdate
        const notification = await Notification.findByIdAndUpdate(
            id,
            { read: true },
            { new: true } // Returns the updated document
        );

        // Check if notification exists
        if (!notification) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Notification not found'
            });
        }

        // Optional: Verify the notification belongs to the authenticated user
        // Uncomment if you have user authentication
        // if (notification.userId.toString() !== req.payload.id.toString()) {
        //     return res.status(403).json({
        //         status: 403,
        //         success: false,
        //         error: "You don't have permission to mark this notification as read"
        //     });
        // }

        return res.status(200).json({
            status: 200,
            success: true,
            data: notification,
            message: "Notification marked as read"
        });

    } catch (error) {
        console.error('Error marking notification as read:', {
            error: error.message,
            stack: error.stack,
            notificationId: req.params?.id
        });

        // Handle invalid MongoDB ObjectId format
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid notification ID format'
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while marking notification as read'
        });
    }
};

export default readNotification;