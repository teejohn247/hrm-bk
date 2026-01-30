import Product from '../../model/Products';

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({
                status: 404,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Product deleted successfully',
            data: deletedProduct
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
}

export default deleteProduct;