import mongoose from 'mongoose';

const KpiSchema = new mongoose.Schema({
    companyName: { type: String },
    companyId: { type: String },
    employeeId:{ type: String },
    kpiName: { type: String },
    kpiDescription: { type: String },
    type: { 
        type: String,
        default: 'percentage'
    },
    fields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
    },
    remarks: { 
        type:{
            type: String,
            default: 'percentage'
        },
    weight: { type: Number,
        default: 0
     },
    threshold: { type: Number,
        default: 0
     },
    target: { type: Number,
        default: 0
     },
    max: { type: Number,
        default: 0 },
    employeeRatingId: { type: String, default: "" },
    employeeName: { type: String, default: "" },
    managerRatingId: { type: String, default: "" },
    managerName: { type: String, default: "" },
    employeeComment: { type: String, default: "" },
    managerComment: { type: String, default: "" },
    managerOverallComment: { type: String, default: "" },
    employeeSubmissionDate: { type: String, default: "" },
    managerReviewDate:{ type: String, default: "" },
    managerSignature: {type: Boolean },
    employeeSignature: {type: Boolean},

    
    },
    assignedEmployees:  [{
        employee_id: {
            type: String,
        },
        employee_name: {
            type: String
        },
        date_assigned: {
            type: Date,
            default: new Date().toISOString() 
        }
    }],
    // Arrays to store employee IDs and department IDs
    employees: [{ type: String }],
    departments: [{ type: String }],
    // Track who created this KPI
    createdBy: { 
        type: String 
    },
    createdByRole: { 
        type: String,
        enum: ['employee', 'manager', 'admin', 'superadmin'],
        default: 'admin'
    }
}, { timestamps: true });


module.exports = mongoose.model("Kpi", KpiSchema);