import dotenv from 'dotenv';
import Branch from '../../model/Branch';

dotenv.config();

const fetchBranchById = async (req, res) => {
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

        res.status(200).json({
            status: 200,
            success: true,
            data: branch
        });

    } catch (error) {
        console.error('Error fetching branch:', error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error
        });
    }
};

export default fetchBranchById;
