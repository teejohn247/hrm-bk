import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employees',
        required: true
    },
    from: {
        type: String,
        // required: true
    },
    subject: {
        type: String,
        // required: true
    },
    body: {
        type: String,
        required: true
    },
    receivedDate: {
        type: Date,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    attachments: [{
        filename: String,
        contentType: String,
        size: Number,
        url: String
    }]
}, { timestamps: true });

const Email = mongoose.model('Email', emailSchema);

export default Email;
