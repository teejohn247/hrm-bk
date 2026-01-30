import dotenv from 'dotenv';
import UserComplaint from '../../model/UserComplaint';
import Employee from '../../model/Employees';
import Company from '../../model/Company';

dotenv.config();

/**
 * Controller for getting user complaints with pagination and filtering
 * @route GET /api/complaints
 */
const getComplaints = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, issueCategory, createdByRole } = req.query;
        const userId = req.payload.id;
        
        // Build query based on user role and filters
        let query = { isDeleted: false };
        let isAdmin = false;
        let isSuperAdmin = false;
        let companyId;
        
        // Check if current user is a company/super admin or an employee
        const company = await Company.findOne({ _id: userId });
        
        if (company) {
            // Company account
            isAdmin = true;
            isSuperAdmin = company.isSuperAdmin || false;
            companyId = company._id;
            
            // Company admin sees all complaints for their company
            query.companyId = companyId;
        } else {
            // Employee account
            const employee = await Employee.findOne({ _id: userId });
            
            if (!employee) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'User not found'
                });
            }
            
            companyId = employee.companyId;
            
            // Check if employee is a super admin
            if (employee.isSuperAdmin) {
                isSuperAdmin = true;
                isAdmin = true;
                // Super admin sees all complaints for their company
                query.companyId = companyId;
            }
            // Check if employee is an admin
            else if (employee.permissions?.appraisalManagement?.createKPIGroup || 
                employee.roleName === 'Admin' || 
                employee.role === 'Admin') {
                isAdmin = true;
                // Admin sees all complaints for their company
                query.companyId = companyId;
            } else {
                // Regular employee only sees their own complaints
                query.userId = userId;
            }
        }
        
        // Apply filters if provided
        if (status) {
            query.status = status;
        }
        
        if (issueCategory) {
            query.issueCategory = issueCategory;
        }
        
        // Allow filtering by who created the complaint
        if (createdByRole && ['employee', 'admin', 'superadmin'].includes(createdByRole)) {
            query.createdByRole = createdByRole;
        }
        
        // Execute query with pagination
        const complaints = await UserComplaint.find(query)
            .sort({ createdAt: -1 }) // Most recent first
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .exec();
            
        // Get total count for pagination
        const totalComplaints = await UserComplaint.countDocuments(query);
        
        // Format response data
        const formattedComplaints = complaints.map(complaint => ({
            id: complaint._id,
            userFullName: complaint.userFullName,
            userEmail: complaint.userEmail,
            companyName: complaint.companyName,
            description: complaint.description,
            issueCategory: complaint.issueCategory,
            screenshot: complaint.screenshot,
            status: complaint.status,
            createdAt: complaint.createdAt,
            updatedAt: complaint.updatedAt,
            assignedToName: complaint.assignedToName || null,
            resolution: complaint.resolution || null,
            resolutionDate: complaint.resolutionDate || null,
            createdByRole: complaint.createdByRole || 'employee' // Include who created the complaint
        }));
        
        return res.status(200).json({
            status: 200,
            success: true,
            data: formattedComplaints,
            pagination: {
                totalComplaints,
                totalPages: Math.ceil(totalComplaints / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            },
            userRole: isSuperAdmin ? 'superadmin' : (isAdmin ? 'admin' : 'employee')
        });
        
    } catch (error) {
        console.error('Error fetching complaints:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An error occurred while fetching complaints'
        });
    }
};

export default getComplaints; 