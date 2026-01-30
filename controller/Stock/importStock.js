import fs from 'fs';
import Stock from '../../model/Stock';
import Product from '../../model/Products';
import csv from 'csvtojson';

const importStock = async (req, res) => {
    try {
        const { companyId, id } = req.payload;
        const filePath = req.file.path;

        // Parse the CSV file and normalize headers
        const csvData = await csv({
            trim: true,
            ignoreEmpty: true,
            headers: [
                'productId',
                'quantity',
                'unitCostPrice',       // Maps to "unit cost price"
                'costPriceCurrency',   // Maps to "cost price currency"
                'unitSellingPrice',    // Maps to "unit selling price"
                'sellingPriceCurrency',// Maps to "selling price currency"
                'priceMarkup',         // Maps to "price markup"
                'supplier'
            ],
            renameHeaders: true 
        }).fromFile(filePath);

        const stocks = [];

        for (const row of csvData) {
            const {
                productId,
                quantity,
                unitCostPrice,
                costPriceCurrency,
                unitSellingPrice,
                sellingPriceCurrency,
                priceMarkup,
                supplier
            } = row;

            if (!productId || !quantity || !unitSellingPrice) {
                throw new Error('Missing required fields in CSV');
            }

            // Find the product and generate stockId
            const product = await Product.findOne({ _id: productId, companyId });
            if (!product) {
                throw new Error(`Product with ID ${productId} not found`);
            }

            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const stockId = `${year}${month}/${product.sku}`;

            // Prepare stock data
            stocks.push({
                productId,
                stockId,
                quantity,
                unitCostPrice,
                costPriceCurrency,
                unitSellingPrice,
                sellingPriceCurrency,
                priceMarkup,
                supplier,
                userId: id,
                companyId
            });
        }

        // Save all stock entries to the database
        await Stock.insertMany(stocks);

        // Update product prices
        for (const stock of stocks) {
            const product = await Product.findOne({ _id: stock.productId, companyId });
            if (product) {
                product.price = stock.unitSellingPrice;
                await product.save();
            }
        }

        // Remove the uploaded file
        fs.unlinkSync(filePath);

        res.status(201).json({
            status: 201,
            success: true,
            message: 'Stock entries imported successfully',
            data: stocks
        });
    } catch (error) {
        console.error(error);

        // Ensure file cleanup on error
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            status: 500,
            success: false,
            error: error.message
        });
    }
};

export default importStock;
