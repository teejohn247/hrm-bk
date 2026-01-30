import Role from '../../model/Role';
import Employee from '../../model/Employees';

const updateRoleAndPermissions = async (req, res) => {
    try {
        const { roleId, roleName, permissions } = req.body;

        // Input validation
        if (!roleId || !Array.isArray(permissions)) {
            return res.status(400).json({
                status: 400,
                error: 'Role ID and permissions array are required'
            });
        }

        // Find and verify role belongs to company
        const role = await Role.findOne({ 
            _id: roleId,
            companyId: req.payload.id 
        });

        if (!role) {
            return res.status(404).json({
                status: 404,
                error: 'Role not found or unauthorized'
            });
        }

        // Update role
        const updateData = {
            permissions,
            ...(roleName && { roleName })
        };

        const updatedRole = await Role.findByIdAndUpdate(
            roleId,
            updateData,
            { new: true }
        );

        // Find all employees with this role and update their permissions
        const employees = await Employee.find({ 
            role: roleId,
            companyId: req.payload.id 
        });

        // Update employees with new permissions
        const updatePromises = employees.map(async (employee) => {
            // Only update if permissions match the old role permissions
            if (JSON.stringify(employee.permissions.sort()) === JSON.stringify(role.permissions.sort())) {
                return Employee.findByIdAndUpdate(
                    employee._id,
                    {
                        permissions: permissions,
                        ...(roleName && { roleName })
                    },
                    { new: true }
                );
            }
            return employee; // Return unchanged if permissions were customized
        });

        const updatedEmployees = await Promise.all(updatePromises);

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Role and permissions updated successfully',
            data: {
                updatedRole,
                affectedEmployees: updatedEmployees.filter(emp => 
                    JSON.stringify(emp.permissions.sort()) === JSON.stringify(permissions.sort())
                ).length
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message
        });
    }
};

export default updateRoleAndPermissions;
