import mongoose from 'mongoose';

const LeaveSchema = new mongoose.Schema({
    leaveName: {
        type: String,
    },
    description: { type: String},
    companyId: { type: String, required: true },
    companyName: { type: String, required: true },
    
})

module.exports = mongoose.model("Leave", LeaveSchema);