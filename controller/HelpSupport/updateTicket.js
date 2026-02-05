import dotenv from 'dotenv';
import HelpSupport from '../../model/HelpSupport';
import Notification from '../../model/Notification';

dotenv.config();

const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            status, 
            priority,
            assignedTo,
            resolution
        } = req.body;

        if (!id) {
            return res.status(400).json({
                status: 400,
                error: "Ticket ID is required"
            });
        }

        const ticket = await HelpSupport.findOne({ _id: id });

        if (!ticket) {
            return res.status(404).json({
                status: 404,
                error: "Ticket not found"
            });
        }

        const oldStatus = ticket.status;

        // Update fields if provided
        if (status) ticket.status = status;
        if (priority) ticket.priority = priority;
        if (assignedTo) ticket.assignedTo = assignedTo;
        
        // Handle resolution
        if (resolution) {
            ticket.resolution = {
                ...resolution,
                resolvedDate: new Date()
            };
            if (status !== 'resolved' && status !== 'closed') {
                ticket.status = 'resolved';
            }
        }

        ticket.lastUpdated = Date.now();

        await ticket.save();

        // Create notification for ticket submitter if status changed
        if (status && status !== oldStatus) {
            let notificationContent = `Your support ticket #${ticket.ticketNumber} status has been updated to ${status}`;
            
            if (resolution && resolution.resolutionNote) {
                notificationContent += `: ${resolution.resolutionNote}`;
            }

            const notification = new Notification({
                notificationType: 'Support Ticket Update',
                notificationContent: notificationContent,
                recipientId: ticket.submittedBy.userId,
                companyName: ticket.companyName,
                companyId: ticket.companyId,
                created_by: req.payload.id,
                read: false
            });

            await notification.save();
        }

        res.status(200).json({
            status: 200,
            success: true,
            data: ticket,
            message: "Ticket updated successfully"
        });

    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error
        });
    }
};

export default updateTicket;
