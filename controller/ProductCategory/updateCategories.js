import ProductCategory from '../../model/ProductCategory';

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const updatedCategory = await ProductCategory.findByIdAndUpdate(
            id,
            { name, description },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                status: 404,
                message: 'Product category not found'
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Product category updated successfully',
            data: updatedCategory
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
}

export default updateCategory;