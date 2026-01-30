import mongoose from 'mongoose';
import moment from 'moment'


const SalaryScaleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String},
    companyId: { type: String, required: true },
    companyName: { type: String, required: true },
    minAmount: { type: Number},
    maxAmount: { type: Number},
    salaryScaleLevels: [{
            levelName:  { type: String},
            payrollCredits:[{
                name: { type: String},
                creditId:{ type: String},
                type: { type: String},
                value: { type: Number},
                refName: { type: String},
                ref: { type: String},
            }],
            payrollDebits:[{
                name: { type: String},
                debitId: { type: String},
                type: { type: String},
                value: { type: Number},
                refName: { type: String},
                ref: { type: String},
            }]
    }]
});
module.exports = mongoose.model("SalaryScaleSchema", SalaryScaleSchema);