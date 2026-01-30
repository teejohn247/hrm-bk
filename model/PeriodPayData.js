import mongoose from 'mongoose';

const periodPayDataSchema = new mongoose.Schema({
    companyName: { type: String },
    companyId: { type: String },
    employeeId:{ type: String },
    email:{ type: String },
    firstName: { type: String },
    lastName: { type: String },
    fullName: { type: String },
    profilePic: { type: String },
    payrollPeriodId: { type: mongoose.Schema.Types.ObjectId, ref: 'PayrollPeriod' },
    role: { type: String },
    department:{ type: String },
    designation:{ type: String },
    dynamicFields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
    deductions: { type: Number, default: 0 },
    netEarnings: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    status: {type: String, default: 'Pending'},
    approvers: [
      {
          approverId: {
          type: String,
          },
          approvalFullName: {
          type: String,
          },
          approvalProfilePic: {
          type: String,
          },
      },
      ],
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true })


module.exports = mongoose.model("periodPayData", periodPayDataSchema);