import mongoose from 'mongoose';
import moment from 'moment';

const DepartmentSchema = new mongoose.Schema({
    departmentName: { type: String, required: true},
    companyId: { type: String, required: true },
    companyName: { type: String, required: true },
    managerId:  { type: String},
    managerName: { type: String},
    assignedAppraisals:[
        {
            appraisalId: { type: String },
            appraisalName: { type: String },
            dateAssigned: {
                type: Date,
                default: new Date().toISOString() 
            }

        }
    ],
})
DepartmentSchema.index({ companyId: 1, departmentName: 1 });
module.exports = mongoose.model("Department", DepartmentSchema);