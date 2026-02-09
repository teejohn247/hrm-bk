import dotenv from 'dotenv';
import Branch from '../../model/Branch';

dotenv.config();

const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: 400,
                error: "Branch ID is required"
            });
        }

        const branch = await Branch.findOne({ _id: id });

        if (!branch) {
            return res.status(404).json({
                status: 404,
                error: "Branch not found"
            });
        }

        // Soft delete by setting isActive to false
        // branch.isActive = false;
        // await branch.save();

        // Or hard delete if preferred
        await Branch.deleteOne({ _id: id });

        res.status(200).json({
            status: 200,
            success: true,
            message: "Branch deleted successfully"
        });

    } catch (error) {
        console.error('Error deleting branch:', error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error
        });
    }
};

export default deleteBranch;
