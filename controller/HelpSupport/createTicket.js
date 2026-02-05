import dotenv from 'dotenv';
import HelpSupport from '../../model/HelpSupport';
import Employee from '../../model/Employees';
import Company from '../../model/Company';
import Notification from '../../model/Notification';

dotenv.config();

const createTicket = async (req, res) => {
    try {
        const { 
            subject, 
            description, 
            category, 
            priority,
            attachments 
        } = req.body;

        // Validate required fields
        if (!subject || subject === "") {
            return res.status(400).json({
                status: 400,
                error: "Subject is required"
            });
        }

        if (!description || description === "") {
            return res.status(400).json({
                status: 400,
                error: "Description is required"
            });
        }

        if (!category || !['technical', 'account', 'billing', 'general', 'feature_request', 'bug_report'].includes(category)) {
            return res.status(400).json({
                status: 400,
                error: "Valid category is required"
            });
        }

        // Get user details
        const user = await Employee.findOne({ _id: req.payload.id });
        const company = await Company.findOne({ _id: req.payload.companyId || req.payload.id });

        if (!user && !company) {
            return res.status(400).json({
                status: 400,
                error: "User not found"
            });
        }

        const userName = user ? (user.fullName || `${user.firstName} ${user.lastName}`) : company.companyName;
        const userEmail = user ? user.email : company.email;
        const companyId = user ? user.companyId : company._id;
        const companyName = user ? user.companyName : company.companyName;

        // Create ticket
        const ticket = new HelpSupport({
            subject,
            description,
            category,
            priority: priority || 'medium',
            status: 'open',
            submittedBy: {
                userId: req.payload.id,
                userName: userName,
                userEmail: userEmail
            },
            companyId: companyId,
            companyName: companyName,
            attachments: attachments || [],
            messages: []
        });

        await ticket.save();

        // Create notification for admins (you may want to customize this)
        // For now, we'll just return success

        res.status(200).json({
            status: 200,
            success: true,
            data: ticket,
            message: "Support ticket created successfully"
        });

    } catch (error) {
        console.error('Error creating support ticket:', error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error
        });
    }
};

export default createTicket;
