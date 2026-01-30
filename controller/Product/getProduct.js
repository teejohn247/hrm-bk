import Product from '../../model/Products';
import Stock from '../../model/Stock';

const getProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the product by ID and populate related fields
        const product = await Product.findById(id)
            .populate('productCategory')
            .populate('supplier');

        if (!product) {
            return res.status(404).json({
                status: 404,
                message: 'Product not found',
            });
        }

        // Fetch the latest stock for the product
        const latestStock = await Stock.findOne({ productId: id })
            .sort({ createdAt: -1 });

            
        const productWithStock = {
            ...product.toObject(),
            latestStock,
        };

        res.status(200).json({
            status: 200,
            success: true,
            data: productWithStock,
        });
    } catch (error) {
        console.error(`Error fetching product: ${error.message}`);
        res.status(500).json({
            status: 500,
            error: error.message,
        });
    }
};

export default getProduct;
