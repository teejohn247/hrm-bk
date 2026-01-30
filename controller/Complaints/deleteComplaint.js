import dotenv from 'dotenv';
import UserComplaint from '../../model/UserComplaint';
import Employee from '../../model/Employees';
import Company from '../../model/Company';

dotenv.config();

/**
 * Controller for soft-deleting a user complaint
 * @route DELETE /api/complaints/:id
 */
const deleteComplaint = async (req, res) => {
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
        
        // Check permissions
        let hasDeleteAccess = false;
        
        // Check if user is a company account
        const company = await Company.findOne({ _id: userId });
        
        if (company) {
            // Company account can delete if complaint belongs to their company
            hasDeleteAccess = company._id.toString() === complaint.companyId;
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
            if (employee.isSuperAdmin && employee.companyId === complaint.companyId) {
                // Super admin can delete if complaint belongs to their company
                hasDeleteAccess = true;
            }
            else if ((employee.permissions?.appraisalManagement?.createKPIGroup || 
                employee.roleName === 'Admin' || 
                employee.role === 'Admin') && 
                employee.companyId === complaint.companyId) {
                // Admin can delete if complaint belongs to their company
                hasDeleteAccess = true;
            } else {
                // Regular employee can only delete their own complaints
                hasDeleteAccess = employee._id.toString() === complaint.userId;
            }
        }
        
        if (!hasDeleteAccess) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'You do not have permission to delete this complaint'
            });
        }
        
        // Soft-delete the complaint (set isDeleted flag to true)
        const deletedComplaint = await UserComplaint.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        
        if (!deletedComplaint) {
            return res.status(500).json({
                status: 500,
                success: false,
                error: 'Failed to delete complaint'
            });
        }
        
        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Complaint deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting complaint:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An error occurred while deleting the complaint'
        });
    }
};

export default deleteComplaint; 