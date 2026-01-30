

import mongoose from 'mongoose';

const AuditTrailSchema = new mongoose.Schema({
    companyName: { type: String },
    companyId: { type: String },
    humanResources: [
        {
            email: { type: String },
            userName: { type: String },
            action: { type: String },
            dateTime: { type: String },
        }
    ],
    accounting: [
        {
            email: { type: String },
            userName: { type: String },
            action: { type: String },
            dateTime: { type: String },
        }
    ],
    projects: [
        {
            email: { type: String },
            userName: { type: String },
            action: { type: String },
            dateTime: { type: String },
        }
    ],
    crm: [
        {
            email: { type: String },
            userName: { type: String },
            action: { type: String },
            dateTime: { type: String },
        }
    ],
    supplyChain: [
        {
            email: { type: String },
            userName: { type: String },
            action: { type: String },
            dateTime: { type: String },
        }
    ],
}, { timestamps: true });


module.exports = mongoose.model("AuditTrail", AuditTrailSchema);