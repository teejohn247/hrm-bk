import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';

const sgMail = require('@sendgrid/mail')

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const createRole = async (req, res) => {
    try {
        const { roleName, permissions } = req.body;

        if (!Array.isArray(permissions)) {
            return res.status(400).json({
                status: 400,
                error: 'Permissions must be an array'
            });
        }

        let roleN = await Role.findOne({ companyId: req.payload.id, roleName });
        let company = await Company.findOne({ _id: req.payload.id });

        if (roleN) {
            return res.status(400).json({
                status: 400,
                error: 'This role Name already exists'
            });
        }

        let role = new Role({
            roleName,
            companyId: req.payload.id,
            companyName: company.companyName,
            permissions
        });

        const savedRole = await role.save();
        return res.status(201).json({
            status: 201,
            success: true,
            data: savedRole
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        });
    }
}
export default createRole;



