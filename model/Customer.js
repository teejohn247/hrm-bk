import { ref, string } from "joi";
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    firstName: { 
        type: String,
     },
    lastName: { 
        type: String,
    },
    companyName: { type: String },
    customerType: {
        type: String,
        enum: ['Individual', 'Company']
    },
    industry: { 

        type: mongoose.Schema.Types.ObjectId,
        ref: 'Industry',
        default: null
    },

    email: { 
        type: String,
        required: true,
        unique: true 
    },
    phone: { type: String },
    shippingAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        zipCode: { type: String }
    },
    systemRoles:[
        {
            roleName: { type: String, required: true },
            companyId: { type: String},
            companyName: { type: String},
            description: {
              type: String,
              default: ''
          },
          rolePermissions: [{
            moduleId: {type: String},
            featureId: {type: String},
            permissionType: {type: String},
            permissionKey: {type: String},
            permissionValue: {type: Boolean}
            }]
          },
        
    ],
    password: { type: String },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    user: { type: String },
    status: { 
        type: String, 
        enum: ['Active', 'Inactive'],
        default: 'Active' 
    }


},
{
    timestamps: true
})

module.exports = mongoose.model('Customer', customerSchema);