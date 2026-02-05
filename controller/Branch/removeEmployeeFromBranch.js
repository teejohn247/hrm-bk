import dotenv from 'dotenv';
import Branch from '../../model/Branch';

dotenv.config();

const removeEmployeeFromBranch = async (req, res) => {
    try {
        const { branchId, employeeId } = req.params;

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

        // Remove employee from branch
        branch.employees = branch.employees.filter(
            emp => emp.employeeId !== employeeId
        );

        await branch.save();

        res.status(200).json({
            status: 200,
            success: true,
            data: branch,
            message: "Employee removed from branch successfully"
        });

    } catch (error) {
        console.error('Error removing employee from branch:', error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error
        });
    }
};

export default removeEmployeeFromBranch;
