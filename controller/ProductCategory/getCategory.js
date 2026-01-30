import ProductCategory from '../../model/ProductCategory';

const getCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await ProductCategory.findById(id);

        if (!category) {
            return res.status(404).json({
                status: 404,
                message: 'Product category not found'
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            data: category
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
}

export default getCategory;