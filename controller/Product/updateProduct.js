import Product from '../../model/Products';

const updateProduct = async (req, res) => {
    try {
        const { companyId, id } = req.params;

        // Extract fields from the request body
        const { 
            productName, productCategory, productType, supplierId, sku, productDescription,
            price, partNumber, productWeight, productWeightUnit, productLength,
            productLengthUnit, productWidth, productWidthUnit, productHeight,
            productHeightUnit, image 
        } = req.body;

        console.log(req.body);
        // Update the product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                productName,
                productCategory,
                productType,
                supplierId,
                sku,
                productDescription,
                price,
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
                companyId,
            },
            { new: true, runValidators: true } // Return the updated document and run validations
        )
        .populate('productCategory')
        .populate('supplierId');

        if (!updatedProduct) {
            return res.status(404).json({
                status: 404,
                message: 'Product not found',
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct,
        });
    } catch (error) {
        console.error(`Error updating product: ${error.message}`);
        res.status(500).json({
            status: 500,
            error: error.message,
        });
    }
};

export default updateProduct;
