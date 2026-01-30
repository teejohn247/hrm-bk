import Employee from '../../model/Employees';

const updateEmployeePermission = async (req, res) => {
    try {
        const { employeeId, permissions } = req.body;

        // Input validation
        if (!employeeId || !Array.isArray(permissions)) {
            return res.status(400).json({
                status: 400,
                error: 'Employee ID and permissions array are required'
            });
        }

        // Find employee and verify they belong to the company
        const employee = await Employee.findOne({ 
            _id: employeeId,
            companyId: req.payload.id 
        });

        if (!employee) {
            return res.status(404).json({
                status: 404,
                error: 'Employee not found or unauthorized'
            });
        }

        // Update employee permissions
        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            {
                permissions,
                hasCustomPermissions: true // Flag to indicate custom permissions
            },
            { 
                new: true,
                select: 'firstName lastName email roleName permissions hasCustomPermissions' // Select specific fields to return
            }
        );

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Employee permissions updated successfully',
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

export default updateEmployeePermission; 