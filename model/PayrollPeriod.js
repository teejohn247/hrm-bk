import mongoose from 'mongoose';

const PayrollPeriodSchema = new mongoose.Schema({
    companyName: { type: String },
    companyId: { type: String },
    payrollPeriodName: { type: String },
    description: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    reference: { type: String },
    totalEarnings: { type: Number, default: 0 },
    netEarnings: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    status: {type: String, default: 'Pending'},
    date: { type: Date, default: Date.now()},
    approvers: [
    {
        approverId: {
        type: String,
        },
        approvalFullName: {
        type: String,
        },
        approvalProfilePic: {
        type: String,
        },
    },
    ],

}, { timestamps: true });


module.exports = mongoose.model("PayrollPeriod", PayrollPeriodSchema);