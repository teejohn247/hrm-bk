import dotenv from 'dotenv';
import Employee from '../../model/Holidays';

const sgMail = require('@sendgrid/mail');

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const updateHoliday = async (req, res) => {
    try {
        const { holidayName, description, date } = req.body;

        // Use lean() for read-only query
        const check = await Employee.findOne({ _id: req.params.id }).lean();

        if (!check) {
            return res.status(400).json({
                status: 400,
                error: "Holiday doesn't exist"
            });
        }

        // Build update object dynamically
        const updateFields = {};
        if (holidayName) updateFields.holidayName = holidayName;
        if (description) updateFields.description = description;
        if (date) updateFields.date = date;

        // Use async/await with lean()
        await Employee.findOneAndUpdate(
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
        console.error('Update holiday error:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message
        });
    }
};

export default updateHoliday;