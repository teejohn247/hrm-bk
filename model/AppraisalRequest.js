import mongoose from 'mongoose';
import moment from 'moment';

const AppraisalRequestsSchema = new mongoose.Schema({
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    kpiId: { type: String, required: true },
    kpiName: { type: String, required: true },
    dateRequested: { type: String, default: new Date().toISOString() },
    employeeSubmissionDate: { type: Date  },
    managerReviewDate: { type: String, required: true },
    employeeSignature: { type: Boolean },
    managerSignature: { type: Boolean },
    status: {type: String, default: "Pending"},
    approver: { type: String },
    approverId: { type: String },
    companyId: { type: String, required: true },
    companyName: { type: String, required: true },
    dateRequested: { type: String, default: new Date().toISOString() },
    comment: { type: String },
    dateOfApproval: { type: String },
        employeeDetails: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
    }
});

module.exports = mongoose.model("AppraisalRequests", AppraisalRequestsSchema);