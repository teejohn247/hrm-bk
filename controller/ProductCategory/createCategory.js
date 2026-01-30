import ProductCategory from '../../model/ProductCategory';

const createProductCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const companyId = req.payload.companyId;

        // Check if the category already exists
        const existingCategory = await ProductCategory.findOne({ name, companyId });
        if (existingCategory) {
            return res.status(400).json({
                status: 400,
                message: 'Product category already exists'
            });
        }

        // Create a new product category
        const newCategory = new ProductCategory({
            name,
            description,
            companyId
        });

        // Save the new category to the database
        await newCategory.save();

        res.status(201).json({
            status: 201,
            success: true,
            message: 'Product category created successfully',
            data: newCategory
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
}

export default createProductCategory;