
import mongoose from 'mongoose';
import moment from 'moment/moment';


const AppraisalGroupSchema = new mongoose.Schema({
    companyName: { type: String },
    companyId: { type: String },
    groupName: { type: String },
    description: { type: String },
    type: { type: String,
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
    accessLevel: { 
        type: String,
        enum: ['Admin', 'Manager', 'Employee'],
        default: 'Admin'
    },
    groupKpis: [
        {
            kpiId: { type: String },
            kpiName: { type: String },
            kpiDescription: { type: String },
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
            type: { type: String},
            employees: [{ type: String }],
            departments: [{ type: String }],
            employeeId: { type: String },
            employeeName: { type: String },
            // profilePics: { type: String },
            ratingId: { type: String },
            ratingName: { type: String },
            // fields: {
            //     type: Map,
            //     of: mongoose.Schema.Types.Mixed,
            // },
            ratingDescription: { type: String },
            remarks: { 
                employeeRating: { type: String },
                managerRating: { type: String },
                employeeComment: { type: String },
                managerComment: { type: String },
             
             },
        }
    ],
    // potentialRating: { type: String },
    // overallPerformanceRating: { type: String },
    // generalRemarks: { type: String },
    assignedDesignations:  [{
        designation_id: {
            type: String,
        },
        designation_name: {
            type: String
        },
        date_assigned: {
            type: Date,
            // default: new Date().toISOString() 
        }
    }],
    assignedDepartments:  [{
        department_id: {
            type: String,
        },
        department_name: {
            type: String
        },
        date_assigned: {
            type: Date,
            default: new Date().toISOString() 
        }
    }],
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
    // Track who created this KPI group
    createdBy: { 
        type: String 
    },
    createdByRole: { 
        type: String,
        enum: ['employee', 'manager', 'admin', 'superadmin'],
        default: 'admin'
    }
}, { timestamps: true });


module.exports = mongoose.model("AppraisalGroup", AppraisalGroupSchema);