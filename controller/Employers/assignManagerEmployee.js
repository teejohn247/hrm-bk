import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import Roles from '../../model/Roles';
import AuditTrail from '../../model/AuditTrail';
import Company from '../../model/Company';
import utils from '../../config/utils';
import { emailTemp } from '../../emailTemplate';
import mongoose from 'mongoose';
import Department from "../../model/Department";
import Designation from "../../model/Designation";

const sgMail = require('@sendgrid/mail')

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

/**
 * Checks if an employee is a manager of any department or any employees
 * @param {string} employeeId - The employee ID to check
 * @returns {Promise<boolean>} - Whether the employee is a manager
 */
const isEmployeeAManager = async (employeeId) => {
    try {
        // Check if this employee is assigned as a manager to any department
        const managesDepartment = await Department.findOne({ managerId: employeeId });
        if (managesDepartment) {
            console.log(`Employee ${employeeId} is a manager of department: ${managesDepartment.departmentName}`);
            return true;
        }
        
        // Check if this employee is assigned as a manager to any other employees
        const managesEmployees = await Employee.findOne({
            managerId: employeeId,
            _id: { $ne: employeeId } // Exclude self-management
        });
        
        if (managesEmployees) {
            console.log(`Employee ${employeeId} is a manager of at least one employee`);
            return true;
        }
        
        console.log(`Employee ${employeeId} is not a manager of any department or employee`);
        return false;
    } catch (error) {
        console.error('Error checking if employee is a manager:', error);
        // Default to false on error
        return false;
    }
};

const assignManagerEmployee = async (req, res) => {
    try {
        const { employees, managerId } = req.body;
        
        // Input validation
        if (!managerId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Manager ID is required'
            });
        }
        
        if (!employees || !Array.isArray(employees) || employees.length === 0) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'At least one employee ID must be provided'
            });
        }
        
        // Find the manager and company
        const manager = await Employee.findOne({ _id: managerId });
        if (!manager) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Manager not found'
            });
        }
        
        const company = await Company.findOne({ _id: req.payload.id });
        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: "Company doesn't exist"
            });
        }

        // Verify that the manager belongs to the same company
        if (manager.companyId !== company._id.toString()) {
            return res.status(400).json({
                status: 400,
                error: "Manager does not belong to this company"
            });
        }
        
        console.log(`Assigning manager ${managerId} (${manager.firstName} ${manager.lastName}) to ${employees.length} employees`);
        
        // Check if any of the employees already have a different manager
        let previousManagers = [];
        for (const employeeId of employees) {
            const employee = await Employee.findOne({ _id: employeeId });
            if (employee && employee.managerId && employee.managerId !== managerId) {
                if (!previousManagers.includes(employee.managerId)) {
                    previousManagers.push(employee.managerId);
                }
            }
        }
        
        console.log(`Found ${previousManagers.length} previous managers`);
        
        // For each previous manager, check if they still manage any departments or employees
        for (const prevManagerId of previousManagers) {
            // Get all employees that will still have this manager after our update
            const stillManagedEmployees = await Employee.find({
                managerId: prevManagerId,
                _id: { $nin: employees } // Exclude employees we're updating
            });
            
            // Only check departments and update if this manager doesn't manage any other employees
            if (stillManagedEmployees.length === 0) {
                const stillAManager = await isEmployeeAManager(prevManagerId);
                
                if (!stillAManager) {
                    console.log(`Previous manager ${prevManagerId} no longer manages any employees or departments, setting isManager to false`);
                    try {
                        await Employee.updateOne(
                            { _id: prevManagerId },
                            { $set: { isManager: false } }
                        );
                    } catch (updateError) {
                        console.error(`Error updating previous manager ${prevManagerId}:`, updateError);
                        // Continue with the process
                    }
                }
            }
        }
        
        // Prepare approvals array
        const approval = [
            {
                approvalType: 'leave',
                approval: `${manager.firstName} ${manager.lastName}`,
                approvalId: managerId
            },
            {
                approvalType: 'expense',
                approval: `${manager.firstName} ${manager.lastName}`,
                approvalId: managerId
            },
            {
                approvalType: 'appraisal',
                approval: `${manager.firstName} ${manager.lastName}`,
                approvalId: managerId
            }
        ];
        
        // Update all the employees with the new manager
        try {
            await Employee.updateMany(
                { _id: { $in: employees } },
                {
                    $set: {
                        managerId: managerId,
                        managerName: `${manager.firstName} ${manager.lastName}`,
                        approvals: approval
                    }
                }
            );
            console.log(`Successfully updated ${employees.length} employees to be managed by ${managerId}`);
        } catch (updateError) {
            console.error('Error updating employees:', updateError);
            return res.status(500).json({
                status: 500,
                success: false,
                error: updateError.message || 'Error updating employees'
            });
        }
        
        // Set the isManager flag to true for the new manager
        try {
            await Employee.updateOne(
                { _id: managerId },
                { $set: { isManager: true } }
            );
            console.log(`Set isManager flag to true for ${managerId}`);
        } catch (managerUpdateError) {
            console.error('Error updating manager status:', managerUpdateError);
            // Continue since the employees have been updated successfully
        }
        
        // Create audit trail entry (commented out for now, as it was commented in the original)
        // Could be implemented if needed
        
        // Return success response
        return res.status(200).json({
            status: 200,
            success: true,
            data: {
                message: "Manager assigned successfully",
                affectedEmployees: employees.length,
                manager: {
                    id: managerId,
                    name: `${manager.firstName} ${manager.lastName}`
                }
            }
        });
    } catch (error) {
        console.error('Error in assignManagerEmployee:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An unknown error occurred'
        });
    }
};

export default assignManagerEmployee;



