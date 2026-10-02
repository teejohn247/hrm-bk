import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    otp: {
        type: String,
        required: true,
    },
    companyName: {
        type: String,
        default: '',
        trim: true,
    },
    firstName: {
        type: String,
        default: '',
        trim: true,
    },
    lastName: {
        type: String,
        default: '',
        trim: true,
    },
    accountType: {
        type: String,
        default: 'Company',
    },
    purpose: {
        type: String,
        default: 'signup',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        default: '',
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600, // Document expires automatically 1 hour after creation
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Otp', OtpSchema);
