import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
    documentName: {
        type: String,
    },
    documentType: {
        type: String,
    },
    document: { type: String},
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    companyId: { type: String, required: true },
    companyName: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Document", DocumentSchema);