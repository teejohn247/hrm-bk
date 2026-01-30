import mongoose from 'mongoose';

const JobPostSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now()
    },
    description: { type: String },
    companyId: { type: String, required: true },
    companyName: { type: String, required: true },
    departmentName: { type: String, required: true },
    departmentId: { type: String, required: true },
    openingDate: {type: Date, required: true },
    closingDate: {type: Date, required: true },
    jobType: {type: String, required: true },
    status: {type: String, default: "inactive"},
    hiringManager: {type: String, required: true },
    hiringManagerID: {type: String, required: true },
    form: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
    },
});

module.exports = mongoose.model("JobPost", JobPostSchema);