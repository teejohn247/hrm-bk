import dotenv from 'dotenv';
import UserComplaint from '../../model/UserComplaint';
import Employee from '../../model/Employees';
import Company from '../../model/Company';

dotenv.config();

/**
 * Controller for updating a user complaint
 * @route PUT /api/complaints/:id
 */
const updateComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.payload.id;
        const { 
            description, 
            issueCategory, 
            screenshots,
            status, 
            assignedTo,
            resolution
        } = req.body;
        
        // Debug logging
        console.log('Update complaint request:', { 
            id, 
            userId, 
            body: req.body,
            status: status 
        });
        
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
        
        console.log('Current complaint status:', complaint.status);
        
        // Check permissions
        let hasAccess = false;
        let canChangeStatus = false;
        let canAssign = false;
        let isAdmin = false;
        let isSuperAdmin = false;
        
        // Check if user is a company account
        const company = await Company.findOne({ _id: userId });
        
        if (company) {
            // Company account
            isAdmin = true;
            isSuperAdmin = company.isSuperAdmin || false;
            // Company admin has full access if complaint belongs to their company
            if (company._id.toString() === complaint.companyId) {
                hasAccess = true;
                canChangeStatus = true;
                canAssign = true;
            }
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
                // Super admin has full access if complaint belongs to their company
                if (employee.companyId === complaint.companyId) {
                    hasAccess = true;
                    canChangeStatus = true;
                    canAssign = true;
                }
            }
            else if (employee.permissions?.appraisalManagement?.createKPIGroup || 
                employee.roleName === 'Admin' || 
                employee.role === 'Admin') {
                isAdmin = true;
                // Admin has full access if complaint belongs to their company
                if (employee.companyId === complaint.companyId) {
                    hasAccess = true;
                    canChangeStatus = true;
                    canAssign = true;
                }
            } else {
                // Regular employee can only update their own complaints and can't change status or assign
                if (employee._id.toString() === complaint.userId) {
                    hasAccess = true;
                    // Regular users cannot change status or assign complaints
                    canChangeStatus = false;
                    canAssign = false;
                }
                
                // If the employee is assigned to this complaint, they can update the status
                if (complaint.assignedTo === employee._id.toString()) {
                    canChangeStatus = true;
                }
            }
        }
        
        // Log permission results
        console.log('Permission check results:', { 
            hasAccess, 
            canChangeStatus, 
            isAdmin, 
            userId,
            complaintUserId: complaint.userId,
            complaintAssignedTo: complaint.assignedTo
        });
        
        if (!hasAccess) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'You do not have permission to update this complaint'
            });
        }
        
        // Build update object based on permissions
        const updateData = {};
        
        // Fields anyone with access can update
        if (description) updateData.description = description;
        if (issueCategory) updateData.issueCategory = issueCategory;
        
        // Handle screenshots (array) instead of screenshot (string)
        if (screenshots) {
            if (Array.isArray(screenshots)) {
                updateData.screenshots = screenshots;
            } else if (typeof screenshots === 'string') {
                // Convert single screenshot to array if string
                updateData.screenshots = [screenshots];
            }
        }
        
        // Fields only admins can update or assigned employees
        if (canChangeStatus && status) {
            console.log('Setting status to:', status);
            updateData.status = status;
            
            // If status is changed to 'resolved', set the resolution date
            if (status === 'resolved') {
                updateData.resolutionDate = new Date();
            }
        }
        
        if (canAssign && assignedTo) {
            updateData.assignedTo = assignedTo;
            
            // Get the assignee's name
            const assignee = await Employee.findOne({ _id: assignedTo });
            if (assignee) {
                updateData.assignedToName = assignee.fullName || `${assignee.firstName} ${assignee.lastName}`;
            }
        }
        
        // Resolution can be updated by admins or the assigned employee
        if (resolution && (canChangeStatus || (complaint.assignedTo === userId))) {
            updateData.resolution = resolution;
        }
        
        console.log('Update data:', updateData);
        
        // Only proceed with update if there's something to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'No valid fields to update'
            });
        }
        
        // Update the complaint
        const updatedComplaint = await UserComplaint.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );
        
        if (!updatedComplaint) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Failed to update complaint'
            });
        }
        
        console.log('Updated complaint status:', updatedComplaint.status);
        
        // Format response data
        const formattedComplaint = {
            id: updatedComplaint._id,
            userFullName: updatedComplaint.userFullName,
            userEmail: updatedComplaint.userEmail,
            companyName: updatedComplaint.companyName,
            description: updatedComplaint.description,
            issueCategory: updatedComplaint.issueCategory,
            screenshots: updatedComplaint.screenshots || [], // Return array of screenshots
            status: updatedComplaint.status,
            createdAt: updatedComplaint.createdAt,
            updatedAt: updatedComplaint.updatedAt,
            assignedToName: updatedComplaint.assignedToName || null,
            resolution: updatedComplaint.resolution || null,
            resolutionDate: updatedComplaint.resolutionDate || null
        };
        
        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Complaint updated successfully',
            data: formattedComplaint
        });
        
    } catch (error) {
        console.error('Error updating complaint:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An error occurred while updating the complaint'
        });
    }
};

export default updateComplaint; 