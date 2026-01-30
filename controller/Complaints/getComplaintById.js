import dotenv from 'dotenv';
import UserComplaint from '../../model/UserComplaint';
import Employee from '../../model/Employees';
import Company from '../../model/Company';

dotenv.config();

/**
 * Controller for getting a single user complaint by ID
 * @route GET /api/complaints/:id
 */
const getComplaintById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.payload.id;
        
        if (!id) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Complaint ID is required'
            });
        }
        
        // Find the complaint
        const complaint = await UserComplaint.findOne({ 
            _id: id,
            isDeleted: false
        });
        
        if (!complaint) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Complaint not found'
            });
        }
        
        // Check permissions: Only allow access if user is:
        // 1. The creator of the complaint
        // 2. An admin/superadmin from the same company
        let hasAccess = false;
        let isAdmin = false;
        let isSuperAdmin = false;
        
        // Check if user is a company account
        const company = await Company.findOne({ _id: userId });
        
        if (company) {
            // Company account
            isAdmin = true;
            isSuperAdmin = company.isSuperAdmin || false;
            // Company admin can access if complaint belongs to their company
            hasAccess = company._id.toString() === complaint.companyId;
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
            
            // Check if employee is a super admin or admin
            if (employee.isSuperAdmin) {
                isSuperAdmin = true;
                isAdmin = true;
                // Super admin can access if complaint belongs to their company
                hasAccess = employee.companyId === complaint.companyId;
            }
            else if (employee.permissions?.appraisalManagement?.createKPIGroup || 
                employee.roleName === 'Admin' || 
                employee.role === 'Admin') {
                isAdmin = true;
                // Admin can access if complaint belongs to their company
                hasAccess = employee.companyId === complaint.companyId;
            } else {
                // Regular employee can only access their own complaints
                hasAccess = employee._id.toString() === complaint.userId;
            }
        }
        
        if (!hasAccess) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'You do not have permission to access this complaint'
            });
        }
        
        // Format response data
        const formattedComplaint = {
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
            createdByRole: complaint.createdByRole || 'employee'
        };
        
        return res.status(200).json({
            status: 200,
            success: true,
            data: formattedComplaint,
            userRole: isSuperAdmin ? 'superadmin' : (isAdmin ? 'admin' : 'employee')
        });
        
    } catch (error) {
        console.error('Error fetching complaint:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An error occurred while fetching the complaint'
        });
    }
};

export default getComplaintById; 