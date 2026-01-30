import mongoose from 'mongoose';

const DebitSchema = new mongoose.Schema({
    companyId: { type: String, required: true },
    companyName: { type: String, required: true },
    name: { type: String },
    description: { type: String },
    value: { type: Number},
    type: { type: String},
    refId: { type: String}
}, { timestamps: true });


module.exports = mongoose.model("Debit", DebitSchema);