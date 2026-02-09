import mongoose from 'mongoose';

const DocumentTypeSchema = new mongoose.Schema({
    documentType: {
        type: String,
    },
    description: { type: String},
    companyId: { type: String, required: true },
    companyName: { type: String, required: true },
    
})

module.exports = mongoose.model("DocumentType", DocumentTypeSchema);