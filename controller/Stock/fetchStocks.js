import Stock from '../../model/Stock';

const fetchStocks = async (req, res) => {
    try {
        const { search, companyId, productId, page = 1, limit = 10 } = req.query;

        // Initialize query object
        let query = {};

        // Add search criteria
        if (search) {
            query.$or = [
                { supplier: { $regex: search, $options: 'i' } }
            ];
        }

        // Add companyId filter
        if (companyId) {
            query.companyId = companyId;
        }

        // Add productId filter
        if (productId) {
            query.productId = productId;
        }

        // Pagination setup
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);
        const skip = (pageNumber - 1) * pageSize;

        // Fetch paginated stocks
        const stocks = await Stock.find(query)
            .populate('supplier')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        // Count total documents for pagination metadata
        const total = await Stock.countDocuments(query);

        res.status(200).json({
            status: 200,
            success: true,
            data: stocks,
            currentPage: pageNumber,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        console.error(`Error fetching stocks: ${error.message}`);
        res.status(500).json({
            status: 500,
            error: error.message,
        });
    }
};

export default fetchStocks;
