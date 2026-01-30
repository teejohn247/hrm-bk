import ProductCategory from '../../model/ProductCategory';

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCategory = await ProductCategory.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({
                status: 404,
                message: 'Product category not found'
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Product category deleted successfully',
            data: deletedCategory
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
}

export default deleteCategory;