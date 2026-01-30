

import mongoose from 'mongoose';

const AppraisalPeriodSchema = new mongoose.Schema({
    companyName: { type: String },
    companyId: { type: String },
    appraisalPeriodName: { type: String},
    description: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    activeDate: { type: String },
    inactiveDate: { type: String },
    progress: { type: Number,
        default: 0
    },
    status: { type: String,
        default: 'Set KPIs'
    },
    active: { type: Boolean,
    default: false },

    

}, { timestamps: true });


module.exports = mongoose.model("AppraisalPeriod", AppraisalPeriodSchema);