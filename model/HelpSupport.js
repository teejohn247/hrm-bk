import mongoose from 'mongoose';

const HelpSupportSchema = new mongoose.Schema({
    ticketNumber: {
        type: String,
        unique: true,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['technical', 'account', 'billing', 'general', 'feature_request', 'bug_report'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'pending', 'resolved', 'closed'],
        default: 'open'
    },
    submittedBy: {
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        userEmail: { type: String, required: true }
    },
    companyId: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    assignedTo: {
        supportAgentId: { type: String },
        supportAgentName: { type: String }
    },
    attachments: [{
        url: String,
        fileName: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    messages: [{
        senderId: { type: String, required: true },
        senderName: { type: String, required: true },
        senderType: { 
            type: String, 
            enum: ['user', 'support_agent', 'admin'],
            required: true
        },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        attachments: [{
            url: String,
            fileName: String
        }]
    }],
    resolution: {
        resolvedBy: { type: String },
        resolvedByName: { type: String },
        resolutionDate: { type: Date },
        resolutionNote: { type: String }
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true 
});

// Auto-generate ticket number before saving
HelpSupportSchema.pre('save', async function(next) {
    if (this.isNew) {
        const count = await mongoose.model('HelpSupport').countDocuments();
        this.ticketNumber = `TKT-${Date.now()}-${(count + 1).toString().padStart(5, '0')}`;
    }
    this.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model("HelpSupport", HelpSupportSchema);
