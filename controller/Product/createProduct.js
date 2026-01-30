import Product from '../../model/Products';

const createProduct = async (req, res) => {
    try {
        const { companyId, id } = req.payload;

        const { 
            productName, productCategory, productType, sku, productDescription,
            partNumber, productWeight, productWeightUnit, productLength,
            productLengthUnit, productWidth, productWidthUnit, productHeight,
            productHeightUnit, image
        } = req.body;
        // Check if the prdouct already exists
        const existingProduct = await Product.findOne({ productName, companyId });

        if (existingProduct) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'Product already exists'
            });
        }

        // Create a new product
        const newProduct = new Product({
            productName,
            productCategory,
            productType,
            sku, 
            productDescription,
            partNumber, 
            productWeight,
            productWeightUnit,
            productLength,
            productLengthUnit,
            productWidth,
            productWidthUnit,
            productHeight,
            productHeightUnit,
            productImage: image,
            userId: id,
            companyId

        });

        // Save the new product to the database
        await newProduct.save();

        res.status(201).json({
            status: 201,
            success: true,
            message: 'Product created successfully',
            data: newProduct
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
}

export default createProduct;