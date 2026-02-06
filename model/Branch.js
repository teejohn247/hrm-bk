import mongoose from 'mongoose';

const BranchSchema = new mongoose.Schema({
    branchName: {
        type: String,
        required: true
    },
    branchCode: {
        type: String,
        unique: true,
        required: true
    },
    branchAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        postalCode: { type: String }
    },
    contactInfo: {
        phone: { type: String },
        email: { type: String },
        fax: { type: String }
    },
    companyId: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    branchManager: {
        managerId: { type: String },
        managerName: { type: String }
    },
    branchAdmin: {
        adminId: { type: String },
        adminName: { type: String }
    },
    employees: [{
        employeeId: { type: String },
        employeeName: { type: String }
    }],
    departments: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isHeadOffice: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: String,
        required: true
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model("Branch", BranchSchema);
