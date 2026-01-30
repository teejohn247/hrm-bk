import mongoose from 'mongoose';

const checkInFormSchema = new mongoose.Schema({
    companyName: { type: String },
    companyId: { type: String },
    formTitle: {
        type: String,
        required: true,
        default: 'Check-In Appraisal Form'
    },
    fields: [{
        id: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true,
            enum: ['text', 'textarea', 'select', 'file', 'number', 'date']
        },
        required: {
            type: Boolean,
            default: false
        },
        description: String,
        width: {
            type: String,
            enum: ['full', 'half', 'third'],
            default: 'full'
        },
        options: [{
            value: String,
            label: String
        }],
        rows: Number,
        placeholder: String,
        allowMultiple: Boolean,
        acceptedFileTypes: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("CheckInForm", checkInFormSchema);
