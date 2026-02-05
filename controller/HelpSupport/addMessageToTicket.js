import dotenv from 'dotenv';
import HelpSupport from '../../model/HelpSupport';
import Employee from '../../model/Employees';
import Notification from '../../model/Notification';

dotenv.config();

const addMessageToTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { message, attachments } = req.body;

        if (!id) {
            return res.status(400).json({
                status: 400,
                error: "Ticket ID is required"
            });
        }

        if (!message || message === "") {
            return res.status(400).json({
                status: 400,
                error: "Message is required"
            });
        }

        const ticket = await HelpSupport.findOne({ _id: id });

        if (!ticket) {
            return res.status(404).json({
                status: 404,
                error: "Ticket not found"
            });
        }

        // Get sender details
        const user = await Employee.findOne({ _id: req.payload.id });
        const senderName = user ? (user.fullName || `${user.firstName} ${user.lastName}`) : "Admin";
        const senderType = user && user.isSuperAdmin ? 'admin' : (user ? 'user' : 'support_agent');

        // Add message to ticket
        ticket.messages.push({
            senderId: req.payload.id,
            senderName: senderName,
            senderType: senderType,
            message: message,
            timestamp: new Date(),
            attachments: attachments || []
        });

        ticket.lastUpdated = Date.now();

        // Update status to in_progress if it's open
        if (ticket.status === 'open') {
            ticket.status = 'in_progress';
        }

        await ticket.save();

        // Create notification for the other party
        let recipientId;
        if (req.payload.id === ticket.submittedBy.userId) {
            // If user sent the message, notify support (if assigned)
            if (ticket.assignedTo && ticket.assignedTo.supportAgentId) {
                recipientId = ticket.assignedTo.supportAgentId;
            }
        } else {
            // If support sent the message, notify user
            recipientId = ticket.submittedBy.userId;
        }

        if (recipientId) {
            const notification = new Notification({
                notificationType: 'Support Ticket Message',
                notificationContent: `New message on ticket #${ticket.ticketNumber}`,
                recipientId: recipientId,
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
            message: "Message added successfully"
        });

    } catch (error) {
        console.error('Error adding message to ticket:', error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error
        });
    }
};

export default addMessageToTicket;
