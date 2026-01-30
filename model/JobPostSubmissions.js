import mongoose from 'mongoose';

const JobListingFormsSchema = new mongoose.Schema({
    formId: {type: String, required: true},
    formName: {type: String, required: true},
    formFields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: true
    },
    jobPostId:{type: String, required: true},
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true })


module.exports = mongoose.model("JobListingForms", JobListingFormsSchema);