import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    announcementType: {
        type: String,
        enum: ['all', 'department', 'individual'],
        required: true
    },
    // For department-specific announcements
    departments: [{
        type: String
    }],
    // For individual-specific announcements
    targetEmployees: [{
        type: String  // Employee IDs
    }],
    companyId: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
    createdByName: {
        type: String
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiryDate: {
        type: Date
    },
    attachments: [{
        url: String,
        fileName: String
    }]
}, { 
    timestamps: true 
});

module.exports = mongoose.model("Announcement", AnnouncementSchema);
