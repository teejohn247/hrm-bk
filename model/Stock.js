import { required } from 'joi';
import mongoose from 'mongoose';

const StockSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    stockId: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unitCostPrice: {
        type: Number,
        required: true
    },
    costPriceCurrency: {
        type: String,
        required: true
    },
    unitSellingPrice: {
        type: Number,
        required: true
    },
    sellingPriceCurrency: {
        type: String,
        required: true
    },
    priceMarkup: {
        type: Number,
        required:true
    },
    supplier: {
        type: String,
        ref: 'Supplier'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    }
}, 
{ timestamps: true });

module.exports = mongoose.model("Stock", StockSchema); 
