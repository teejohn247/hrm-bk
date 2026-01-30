const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    productCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductCategory',
        default: null
      
    },
    productType: {
        type: String,
        enum: ['On-Request', 'Stocked'],
        required: true
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        default: null
    },
    sku: {
        type: String,
        required: true
    }, 
    productDescription: {
        type: String
    },
    price: {
        type: String,
        min: 0,
        default: 0
    },
    currency: {
        type: String,
        default: 'NGN'
    },
    partNumber: {
        type: String,
        required: true
    }, 
    productWeight: {
        type: Number,
        min: 0,
    },
    productWeightUnit: {
        type: String,
        enum: ['kg', 'g', 'lb', 'oz']
    },
    productLength: {
        type: Number,
        min: 0,
    },
    productLengthUnit: {
        type: String,
        enum: ['cm', 'm', 'in', 'ft']
    },
    productWidth: {
        type: Number,
        min: 0,
    },
    productWidthUnit: {
        type: String,
        enum: ['cm', 'm', 'in', 'ft']
    },
    productHeight: {
        type: Number,
        min: 0,
    },
    productHeightUnit: {
        type: String,
        enum: ['cm', 'm', 'in', 'ft']
    },
    stock: {
        type: Number,
        min: 0,
        default: 0
    },
    productImage: {
        type: String,
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});


module.exports = mongoose.model('Product', productSchema);
