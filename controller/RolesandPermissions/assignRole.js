import Employee from '../../model/Employees';
import Role from '../../model/Role';

const assignRole = async (req, res) => {
    try {
        const { employeeId, roleId } = req.body;

        // Validate inputs
        if (!employeeId || !roleId) {
            return res.status(400).json({
                status: 400,
                error: 'Employee ID and Role ID are required'
            });
        }

        // Find the role
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({
                status: 404,
                error: 'Role not found'
            });
        }

        // Find and update the employee
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                status: 404,
                error: 'Employee not found'
            });
        }

        // Verify employee belongs to the same company
        if (employee.companyId.toString() !== req.payload.id) {
            return res.status(403).json({
                status: 403,
                error: 'Unauthorized: Employee does not belong to your company'
            });
        }

        // Update employee with role and permissions
        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            {
                role: roleId,
                roleName: role.roleName,
                permissions: role.permissions
            },
            { new: true }
        );

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Role assigned successfully',
            data: updatedEmployee
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message
        });
    }
};

export default assignRole;
