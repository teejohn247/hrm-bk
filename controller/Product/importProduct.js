import fs from 'fs';
import path from 'path';
import multer from 'multer';
import csv from 'csvtojson';
import Product from '../../model/Products';

const importProducts = async (req, res) => {
    try {
        const { companyId, id } = req.payload;

        // Validate file existence
        if (!req.file || !req.file.path) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'File upload is required',
            });
        }

        const filePath = req.file.path;
        const products = [];

        // Convert CSV to JSON
        const jsonArray = await csv().fromFile(filePath);

        for (const row of jsonArray) {
            const {
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
                image,
            } = row;

            products.push({
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
                userId: id,
                companyId,
            });
        }

        // Save products to database
        await Product.insertMany(products);

        // Remove uploaded file
        fs.unlinkSync(filePath);

        res.status(201).json({
            status: 201,
            success: true,
            message: 'Products imported successfully',
            data: products,
        });
    } catch (error) {
        console.error('Error importing products:', error);

        // Remove uploaded file in case of errors
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        res.status(500).json({
            status: 500,
            success: false,
            message: 'Failed to import products',
            error: error.message,
        });
    }
};

export default importProducts;
