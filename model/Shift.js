

import mongoose from 'mongoose';

const ShiftSchema = new mongoose.Schema({
    companyName: { type: String },
    companyId: { type: String },
    name: { type: String},
    startTime: { type: Date },
    endTime: { type: Date },
    assignedEmployees: [{
        employeeId: {type: String},
        fullName: {type: String},
        profileImage: {type: String},
        checkInTime:{ type: Date },
        checkOutTime: { type: Date },
        status: {type: String}
    }]
}, { timestamps: true });


module.exports = mongoose.model("Shift", ShiftSchema);