import dotenv from 'dotenv';
import Employee from '../../model/Leaves';
import Roles from '../../model/Roles';
import AuditTrail from '../../model/AuditTrail';
import Company from '../../model/Company';
import utils from '../../config/utils';
import { emailTemp } from '../../emailTemplate';

const sgMail = require('@sendgrid/mail');

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const updateLeave = async (req, res) => {
    try {
        const { leaveName, description } = req.body;

        // Use lean() to get plain JavaScript objects instead of Mongoose documents
        const check = await Employee.findOne({ _id: req.params.id }).lean();

        if (!check) {
            return res.status(400).json({
                status: 400,
                error: "Employee doesn't exist"
            });
        }

        // Build update object only with provided fields
        const updateFields = {};
        if (leaveName) updateFields.leaveName = leaveName;
        if (description) updateFields.description = description;

        // Use async/await instead of callback, and use lean()
        const result = await Employee.findOneAndUpdate(
            { _id: req.params.id },
            { $set: updateFields },
            { new: true, lean: true }
        );

        return res.status(200).json({
            status: 200,
            success: true,
            data: "Update Successful"
        });

    } catch (error) {
        console.error('Update leave error:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message
        });
    }
};

export default updateLeave;