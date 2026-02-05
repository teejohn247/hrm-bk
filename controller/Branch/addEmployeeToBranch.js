import dotenv from 'dotenv';
import Branch from '../../model/Branch';
import Employee from '../../model/Employees';

dotenv.config();

const addEmployeeToBranch = async (req, res) => {
    try {
        const { branchId } = req.params;
        const { employeeId } = req.body;

        if (!branchId) {
            return res.status(400).json({
                status: 400,
                error: "Branch ID is required"
            });
        }

        if (!employeeId) {
            return res.status(400).json({
                status: 400,
                error: "Employee ID is required"
            });
        }

        const branch = await Branch.findOne({ _id: branchId });

        if (!branch) {
            return res.status(404).json({
                status: 404,
                error: "Branch not found"
            });
        }

        const employee = await Employee.findOne({ _id: employeeId });

        if (!employee) {
            return res.status(404).json({
                status: 404,
                error: "Employee not found"
            });
        }

        // Check if employee is already in the branch
        const existingEmployee = branch.employees.find(
            emp => emp.employeeId === employeeId
        );

        if (existingEmployee) {
            return res.status(400).json({
                status: 400,
                error: "Employee is already assigned to this branch"
            });
        }

        // Add employee to branch
        branch.employees.push({
            employeeId: employee._id.toString(),
            employeeName: employee.fullName || `${employee.firstName} ${employee.lastName}`
        });

        await branch.save();

        res.status(200).json({
            status: 200,
            success: true,
            data: branch,
            message: "Employee added to branch successfully"
        });

    } catch (error) {
        console.error('Error adding employee to branch:', error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error
        });
    }
};

export default addEmployeeToBranch;
