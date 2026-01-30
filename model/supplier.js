const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
    supplierName: { 
        type: String, 
        required: true 
    },
    contactPersonName: {type: String},
    email: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String 
    },

    address: {
        street: { 
            type: String 
        },
        city: { 
            type: String 
        },
        state: { 
            type: String 
        },
        zipCode: { 
            type: String 
        },
        country: { 
            type: String 
        }
    },
    imageUrl: {
        type: String 
    },

    status: { 
        type: String, 
        enum: ['active', 'inactive', 'suspended'], 
        default: 'active' 
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    user: { 
        type: String 
    },
    activeOrders: { 
        type: Number,
        default: 0
    },
    fulfilledOrders: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema);
