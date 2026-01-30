import Stock from '../../model/Stock';
import Product from '../../model/Products';

const createStock = async (req, res) => {
    try {
        const { productId, quantity, unitCostPrice, costPriceCurrency, unitSellingPrice, sellingPriceCurrency, priceMarkup, supplier, stockStatus } = req.body;
        const { companyId, id } = req.payload;

        const product = await Product.findOne({ _id: productId, companyId });

        //generate a unique stock id using yearmonth/sku format product
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const stockId = `${year}${month}/${product.sku}`;

        // Create a new stock entry
        const newStock = new Stock({
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
        
        await newStock.save();

        //update product price with the selling price
        product.price = unitSellingPrice;
        product.currency = sellingPriceCurrency;
        product.stock = quantity;
        product.supplier = supplier;

        await product.save();

        res.status(201).json({
            status: 201,
            success: true,
            message: 'Stock entry created successfully',
            data: newStock
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
}

export default createStock;