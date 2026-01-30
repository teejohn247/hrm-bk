import mongoose from 'mongoose';

const UserComplaintSchema = new mongoose.Schema({
    // User information
    userId: { type: String, required: true },
    userFullName: { type: String, required: true },
    userEmail: { type: String, required: true },
    companyId: { type: String, required: true },
    companyName: { type: String, required: true },
    createdByRole: { 
        type: String, 
        enum: ['employee', 'admin', 'superadmin'],
        default: 'employee'
    },
    
    // Complaint details
    description: { type: String, required: true },
    screenshots: [{ type: String }], // Array of URLs to screenshot images
    issueCategory: { type: String, required: true },
    
    // Additional useful fields
    status: { 
        type: String, 
        required: true,
        enum: ['pending', 'in-progress', 'resolved', 'closed'],
        default: 'pending' 
    },
    assignedTo: { type: String }, // ID of employee assigned to handle this complaint
    assignedToName: { type: String }, // Name of employee assigned to handle this complaint
    resolution: { type: String }, // Resolution details
    resolutionDate: { type: Date }, // When the complaint was resolved
    
    // System fields
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

export default mongoose.model('UserComplaint', UserComplaintSchema); 