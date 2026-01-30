import dotenv from 'dotenv';
import Department from '../../model/Department';
import Employee from '../../model/Employees';
import Company from '../../model/Company';
import mongoose from 'mongoose';

dotenv.config();

const assignManager = async (req, res) => {
    try {
        const { managerId, departmentId } = req.body;
        
        // Input validation
        if (!managerId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'ManagerId is required'
            });
        }
        
        if (!departmentId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'DepartmentId is required'
            });
        }
        
        // Find the department
        const department = await Department.findOne({ _id: departmentId });
        if (!department) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'No department found'
            });
        }
        
        // Find the new manager
        const newManager = await Employee.findOne({ _id: managerId });
        if (!newManager) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Employee does not exist'
            });
        }
        
        // Find the company
        const company = await Company.findOne({ _id: req.payload.id });
        
        // Verify that the new manager belongs to the same company
        if (newManager.companyId !== company._id.toString()) {
            return res.status(400).json({
                status: 400,
                error: "Manager does not belong to this company"
            });
        }
        
        // Get the current manager ID from the department
        const currentManagerId = department.managerId;
        console.log(`Current department manager ID: ${currentManagerId}, New manager ID: ${managerId}`);
        
        // If there is a current department manager and it's different from the new manager,
        // we need to check if they're a departmental manager elsewhere before demoting
        if (currentManagerId && currentManagerId !== managerId) {
            console.log(`Checking if previous manager ${currentManagerId} is a department manager elsewhere...`);
            
            // Find if the current manager is assigned as a manager to any other departments
            const otherDepartments = await Department.find({
                _id: { $ne: departmentId },
                managerId: currentManagerId
            });
            
            // If the current manager isn't a department manager anywhere else,
            // we need to check if they should still have isManager flag
            if (otherDepartments.length === 0) {
                console.log(`Previous manager ${currentManagerId} isn't a department manager elsewhere`);
                
                // Check if this employee manages individual employees directly
                // This searches for employees with this person as their manager
                const managesEmployees = await Employee.findOne({
                    managerId: currentManagerId,
                    _id: { $ne: currentManagerId } // Exclude self-management
                });
                
                // Only set isManager to false if they don't manage any departments OR any individual employees
                if (!managesEmployees) {
                    console.log(`Previous manager ${currentManagerId} also doesn't manage any individual employees, setting isManager to false`);
                    try {
                        await Employee.updateOne(
                            { _id: currentManagerId }, 
                            { $set: { isManager: false } }
                        );
                        console.log(`Successfully set isManager to false for previous manager ${currentManagerId}`);
                    } catch (updateError) {
                        console.error(`Error updating previous manager: ${updateError}`);
                        // Continue with the process - don't fail the entire operation if this update fails
                    }
                } else {
                    console.log(`Previous manager ${currentManagerId} still manages individual employees, keeping isManager as true`);
                }
            } else {
                console.log(`Previous manager ${currentManagerId} manages ${otherDepartments.length} other departments, keeping isManager as true`);
            }
        }
        
        // Update the department with the new manager
        try {
            await Department.updateOne(
                { _id: departmentId }, 
                { 
                    $set: { 
                        managerName: `${newManager.firstName} ${newManager.lastName}`,
                        managerId: managerId
                    }
                }
            );
            console.log(`Department ${departmentId} updated with new manager ${managerId}`);
        } catch (deptUpdateError) {
            console.error(`Error updating department: ${deptUpdateError}`);
            return res.status(500).json({
                status: 500,
                success: false,
                error: deptUpdateError.message || 'Error updating department'
            });
        }
        
        // Prepare approvals array for employees in the department
        const approval = [
            {
                approvalType: 'leave',
                approval: `${newManager.firstName} ${newManager.lastName}`,
                approvalId: managerId
            },
            {
                approvalType: 'expense',
                approval: `${newManager.firstName} ${newManager.lastName}`,
                approvalId: managerId
            },
            {
                approvalType: 'appraisal',
                approval: `${newManager.firstName} ${newManager.lastName}`,
                approvalId: managerId
            }
        ];
        
        // Update all employees in the department
        try {
            await Employee.updateMany(
                { department: department.departmentName }, 
                { 
                    $set: { 
                        managerName: `${newManager.firstName} ${newManager.lastName}`,
                        managerId: managerId,
                        approvals: approval
                    }
                }
            );
            console.log(`Updated employees in department ${department.departmentName} to report to manager ${managerId}`);
        } catch (empUpdateError) {
            console.error(`Error updating employees: ${empUpdateError}`);
            // Continue with the process - updating the new manager is still important
        }
        
        // Set the new manager's isManager flag to true
        // This person is now a departmental manager, so they should have the flag
        try {
            await Employee.updateOne(
                { _id: managerId }, 
                { $set: { isManager: true } }
            );
            console.log(`Set isManager to true for new department manager ${managerId}`);
        } catch (managerUpdateError) {
            console.error(`Error updating new manager: ${managerUpdateError}`);
            // Continue - the department and employees are already updated
        }
        
        // Get the updated manager data to return
        const updatedManager = await Employee.findOne({ _id: managerId });
        
        return res.status(200).json({
            status: 200,
            success: true,
            data: updatedManager,
            message: `Manager successfully assigned to department ${department.departmentName}`
        });
    } catch (error) {
        console.error('Error in assignManager:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An unknown error occurred'
        });
    }
};

export default assignManager;



