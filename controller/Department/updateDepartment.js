import dotenv from 'dotenv';
import Department from '../../model/Department';
import Employee from '../../model/Employees';
import Company from '../../model/Company';

dotenv.config();

/**
 * Update department details including manager assignment
 * @route PUT /api/department/update/:id
 */
const updateDepartment = async (req, res) => {
    try {
        const { departmentName, managerId } = req.body;
        const departmentId = req.params.id;
        const userId = req.payload.id;

        // Validate department ID
        if (!departmentId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Department ID is required'
            });
        }

        // Get existing department
        const department = await Department.findOne({ _id: departmentId });

        if (!department) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Department not found'
            });
        }

        // Verify user has permission (company or admin employee)
        const company = await Company.findOne({ _id: userId });
        const isCompanyAdmin = !!company;

        if (!isCompanyAdmin) {
            const employee = await Employee.findOne({ _id: userId });

            if (!employee) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'User not found'
                });
            }

            const isAuthorized = 
                employee.isSuperAdmin === true || 
                employee.role === 'Admin' || 
                employee.roleName === 'Admin' ||
                employee.permissions?.departmentManagement?.edit_departments === true;

            if (!isAuthorized) {
                return res.status(403).json({
                    status: 403,
                    success: false,
                    error: 'You do not have permission to update departments'
                });
            }

            // Verify department belongs to employee's company
            if (department.companyId !== employee.companyId) {
                return res.status(403).json({
                    status: 403,
                    success: false,
                    error: 'Department does not belong to your company'
                });
            }
        }

        // Check for duplicate department name (if changing name)
        if (departmentName && departmentName !== department.departmentName) {
            const duplicateDept = await Department.findOne({
                companyId: department.companyId,
                departmentName: departmentName.trim(),
                _id: { $ne: departmentId }
            });

            if (duplicateDept) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: 'A department with this name already exists'
                });
            }
        }

        // Prepare update fields
        const updateFields = {};
        
        if (departmentName && departmentName.trim() !== '') {
            updateFields.departmentName = departmentName.trim();
        }

        // Handle manager assignment
        let manager = null;
        if (managerId && managerId.trim() !== '') {
            manager = await Employee.findOne({ _id: managerId });

            if (!manager) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: 'Manager employee not found'
                });
            }

            // Verify manager belongs to the same company
            if (manager.companyId !== department.companyId) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: 'Manager does not belong to this company'
                });
            }

            updateFields.managerName = manager.fullName || `${manager.firstName} ${manager.lastName}`;
            updateFields.managerId = managerId;
        }

        // Update department
        const updatedDepartment = await Department.findByIdAndUpdate(
            departmentId,
            { $set: updateFields },
            { new: true }
        );

        // If manager was assigned, update employees and manager
        if (manager) {
            const managerFullName = manager.fullName || `${manager.firstName} ${manager.lastName}`;

            // Create approval array
            const approvals = [
                {
                    approvalType: 'leave',
                    approval: managerFullName,
                    approvalId: managerId
                },
                {
                    approvalType: 'expense',
                    approval: managerFullName,
                    approvalId: managerId
                },
                {
                    approvalType: 'appraisal',
                    approval: managerFullName,
                    approvalId: managerId
                }
            ];

            // Update all employees in this department
            const employeeUpdateResult = await Employee.updateMany(
                { 
                    companyId: department.companyId,
                    department: department.departmentName 
                },
                {
                    $set: {
                        managerName: managerFullName,
                        managerId: managerId,
                        approvals: approvals
                    }
                }
            );

            // Set manager flag on the manager employee
            await Employee.findByIdAndUpdate(
                managerId,
                { $set: { isManager: true } }
            );

            console.log(`Updated ${employeeUpdateResult.modifiedCount} employees with new manager: ${managerFullName}`);
        }

        // If department name was changed, update all employees' department field
        if (departmentName && departmentName !== department.departmentName) {
            await Employee.updateMany(
                { 
                    companyId: department.companyId,
                    department: department.departmentName 
                },
                {
                    $set: { department: departmentName.trim() }
                }
            );

            console.log(`Updated employee department names from "${department.departmentName}" to "${departmentName}"`);
        }

        console.log(`Department "${updatedDepartment.departmentName}" updated successfully`);

        return res.status(200).json({
            status: 200,
            success: true,
            data: updatedDepartment,
            message: 'Department updated successfully'
        });

    } catch (error) {
        console.error('Error updating department:', {
            error: error.message,
            stack: error.stack,
            departmentId: req.params?.id,
            userId: req.payload?.id
        });

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Validation error',
                details: error.message
            });
        }

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
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while updating the department'
        });
    }
};

export default updateDepartment;