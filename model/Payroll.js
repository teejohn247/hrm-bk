import mongoose from 'mongoose';

const PayrollSchema = new mongoose.Schema({
    fields: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            required: true
    },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true })


module.exports = mongoose.model("Payroll", PayrollSchema);