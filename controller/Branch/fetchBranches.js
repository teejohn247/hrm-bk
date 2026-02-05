import dotenv from 'dotenv';
import Branch from '../../model/Branch';

dotenv.config();

const fetchBranches = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

        // Get company ID from payload
        const companyId = req.payload.companyId || req.payload.id;

        let query = { companyId: companyId };

        // Filter by active status if provided
        if (isActive !== undefined) {
            query.isActive = isActive;
        }

        const branches = await Branch.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCount = await Branch.countDocuments(query);

        res.status(200).json({
            status: 200,
            success: true,
            data: branches,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                itemsPerPage: limit
            }
        });

    } catch (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error
        });
    }
};

export default fetchBranches;
