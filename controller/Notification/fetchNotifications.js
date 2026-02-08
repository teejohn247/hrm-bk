import Notifications from '../../model/Notification';
import Employee from '../../model/Employees';
import Company from '../../model/Company';
import dotenv from 'dotenv';

dotenv.config();

const fetchNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const userId = req.payload.id;

        // Check if user is a company account
        const company = await Company.findOne({ _id: userId });
        const isCompanyAccount = !!company;

        let query = {};
        let companyId;

        if (isCompanyAccount) {
            // Company account sees ALL notifications for their company
            companyId = company._id.toString();
            query = {
                companyId: companyId
            };
            console.log(`Company account: fetching all notifications for ${company.companyName}`);
        } else {
            // Employee account - check if employee exists
            const employee = await Employee.findOne({ _id: userId });

            if (!employee) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'User not found'
                });
            }

            companyId = employee.companyId;

            // Check if employee is super admin
            if (employee.isSuperAdmin) {
                // Super admin sees all notifications for the company
                query = {
                    companyId: companyId
                };
                console.log(`Super admin: fetching all notifications`);
            } else {
                // Regular employee sees only their unread notifications
                query = {
                    companyId: companyId,
                    recipientId: userId.toString(),
                    read: false
                };
            }
        }

        // Fetch notifications with pagination
        const notifications = await Notifications.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .exec();

        const totalCount = await Notifications.countDocuments(query);

        // Return appropriate response even if no notifications found
        return res.status(200).json({
            status: 200,
            success: true,
            data: notifications,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                itemsPerPage: limit,
                hasMore: page < Math.ceil(totalCount / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching notifications:', {
            error: error.message,
            stack: error.stack,
            userId: req.payload?.id
        });

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
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while fetching notifications'
        });
    }
};

export default fetchNotifications;