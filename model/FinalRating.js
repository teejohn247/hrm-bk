

import mongoose from 'mongoose';

const FinalRatingSchema = new mongoose.Schema({
    employeeId: { type: String },
    employeeName: { type: String },
    managerId: { type: String },
    managerName: { type: String },
    companyName: { type: String },
    companyId: { type: String },
    appraisalPeriodId: { type: String },
    appraisalPeriodName: { type: String },
    appraisalPeriodStartDate: { type: String },
    appraisalPeriodEndDate: { type: String },
    appraisalPeriodActiveDate: { type: String },
    appraisalPeriodInactiveDate: { type: String },
    groupRating: [{ 
    groupId: { type: String },
    groupName: { type: String },
    groupDescription: { type: String },
    groupKpis:[
        {
            kpiId: { type: String },
            kpiName: { type: String },
            kpiDescription: { type: String },
            remarks: { 
                employeeRatingId: { type: String },
                managerRatingId: { type: String },
                employeeComment: { type: String },
                managerComment: { type: String }
             },
        }
    ],
}],
    potentialRating: { type: String },
    performanceRating: { type: String },
    generalRemarks: { type: String },
}, { timestamps: true });


module.exports = mongoose.model("FinalRating", FinalRatingSchema);