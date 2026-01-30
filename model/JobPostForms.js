import mongoose from 'mongoose';

const JobListingFormsSchema = new mongoose.Schema({
    formName: {type: String, required: true},
    formFields: 
        [{
            fieldTitle: {
                type: String,
            },
            inputType: {
                type: String
            }
        }],
    jobPostId:{type: String, required: true},
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true })


module.exports = mongoose.model("JobListingForms", JobListingFormsSchema);