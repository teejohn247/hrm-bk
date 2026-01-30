import ProductCategory from '../../model/ProductCategory';

const getCategories = async (req, res) => {
    try {
        const { companyId } = req.payload;

        
        let query = { companyId };
        const { page = 1, limit = 10, search = '' } = req.query;

        if (search) {
            query = {
                ...query,
                $or: [
                    { name: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const categories = await ProductCategory.find(query)
                            .sort({ createdAt: -1 })
                            .limit(limit * 1)
                            .skip((page - 1) * limit)
                            .exec();

        const count = await ProductCategory.find(query).countDocuments()


        res.status(200).json({
            status: 200,
            success: true,
            data: categories,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
}

export default getCategories;