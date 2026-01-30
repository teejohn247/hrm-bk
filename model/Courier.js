import mongoose from "mongoose";

const courierSchema = new mongoose.Schema({
    courierName: {
        type: String,
        required: true
    },
    courierType: {
        type: [String],
        enum: ['Air', 'Sea', 'Land']
    },
    email: {type: String},
    phoneNumber: {type: String},
    imageUrl: {type: String},
    address: {
        street: {type: String},
        city: {type: String},
        state: {type: String},
        zipCode: {type: String},
        country: {type: String}
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
    user: { type: String },
    activeOrders: { 
        type: Number,
        default: 0
    },
    fulfilledOrders: {
        type: Number,
        default: 0
    }
   
},{
    timestamps: true
});


module.exports = mongoose.model('Courier', courierSchema);