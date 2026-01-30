import Product from '../../model/Products';

const getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', categoryId } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { productName: { $regex: search, $options: 'i' } },
                { partNumber: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } }
            ];
        }

        if (categoryId) {
            query.categoryId = categoryId;
        }

        const products = await Product.find(query).populate('productCategory').populate('supplier')
                        .sort({ createdAt: -1 })
                        .limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();


        const count = await Product.find(query).countDocuments()

        res.status(200).json({
            status: 200,
            success: true,
            data: products,
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

export default getProducts;