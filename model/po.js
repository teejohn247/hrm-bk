import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    internalOrderRef: {
        type: String,
        required: true,
    },
    trackingId: {
        type: String,
        required: true,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    orderCreationDate: {
        type: Date,
        required: true
    },
    actualOrderDeliveryDate: {
        type: Date,
        required: true
    },
    proposedOrderDeliveryDate: {
        type: Date,
        required: true
    },
    items: [{
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Supplier',
            required: true
        },
        freightId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Freight',
            required: true
        },
        productName: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'shipped', 'cancelled'],
            default: 'pending'
        },
        supplierPurchaseOrderNumber: {
            type: String,
            required: true
        },
        actualOrderDeliveryAfterDueDate: {
            type: Date
        },
        proposedOrderDeliveryAfterDueDate: {
            type: Date
        },
        expectedArrivalTime: {
            type: Date
        },
        supplierProposedDeliveryDate: {
            type: Date
        },
        supplierActualDeliveryDate: {
            type: Date
        },
        supplierActualDeliveryAfterDueDate: {
            type: Date
        },
        supplierProposedDeliveryAfterDueDate: {
            type: Date
        },
        taxTotal: {
            type: Number,
            required: true
        },
        shippingCost: {
            type: Number,
            required: true
        },
        discountTotal: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        zipCode: { type: String, required: true }
    },
    paymentTerms: {
        type: String,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    taxTotal: {
        type: Number,
        required: true
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    discountTotal: {
        type: Number,
        default: 0
    },
    grandTotal: {
        type: Number,
        required: true
    },
    notes: {
        type: String
    },
    attachments: [{
        fileName: String,
        fileUrl: String
    }],
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Orders', OrderSchema);