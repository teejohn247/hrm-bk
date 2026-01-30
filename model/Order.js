import mongoose from 'mongoose';
import { type } from 'os';
import supplier from './supplier';

const PurchaseOrderSchema = new mongoose.Schema({
    orderNo: {
        type: String,
        unique: true
    },
    internalOrderRefNo: {
        type: String,
    },
    referencePurchaseOrder: {
        type: [String],

    },
    trackingId: {
        type: String,
    },
    orderType: {
        type: String,
        enum: ['inward', 'outward']
    },
    dateRequested: {
        type: Date,

    },
    dueDate: {
        type: Date,

    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
    
        },
        quantity: {
            type: Number,
            min: 1
        },
        unitPrice: {
            type: Number,
    
        },
        stockId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Stock',
    
        },
        subtotal: {
            type: Number,
    
        },
        tax: {
            type: Number
    
        }
    }],
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',

    },
    customerShippingAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        zipCode: { type: String }
    },

    supplier: [{
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Supplier',
            default: null,
    
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
    
        },
        supplierOrderDate: {
            type: Date,
    
        },
        supplierDeliveryDate: {
            type: Date,
    
        }
    }],
    courier: [{
        courierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Courier',
    
        },
        packageWeight: {
            type: Number,
    
        },
        unitWeight: {
            type: String,
    
        },
        products: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
        
            },
        }],
        courierCost: {
            type: Number,
    
        },
        costCurrency: {
            type: String,
    
        },
        courierOrderDate: {
            type: Date,
    
        },
        courierDeliveryDate: {
            type: Date,
    
        }


    }],
    totalAmount: {
        type: Number,

    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    notes: {
        type: String
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',

    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',

    }
}, {
    timestamps: true
});

const PurchaseOrder = mongoose.model('PurchaseOrders', PurchaseOrderSchema);

export default PurchaseOrder;