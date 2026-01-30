import mongoose from 'mongoose';

const appraisalDataSchema = new mongoose.Schema({
    // companyName: { type: String },
    // companyId: { type: String },
    // employeeId:{ type: String },
    email:{ type: String },
    firstName: { type: String },
    lastName: { type: String },
    fullName: { type: String },
    profilePic: { type: String },
    appraisalPeriodName: { type: String },
    appraisalPeriodProgress: { type: Number,
        default: 0
    },
    appraisalPeriodStatus: { type: String,
        default: 'Set KPIs'
    },
 
    

    // role: { type: String },
    department:{ type: String },
    designation:{ type: String },
    companyName: { type: String },
    companyId: { type: String },
    companyRole: { type: String },
    employeeId:{ type: String },
    employeeName: { type: String },
    profilePics: { type: String },
    appraisalGroup:{ type: String },
    appraisalPeriodId:{ type: String, required: true },
    matrixScore: { type: Array },
    ratingId: { type: String },
    managerName: { type: String },
    managerId: { type: String },
    email: { type: String },
    employeeKpiId: { type: String },
    managerSubmissionDate: { type:Date },
    startDate: { type: String },
    endDate: { type: String },
    activeDate: { type: String },
    inactiveDate: { type: String },
    managerOverallComment: { type: String },
    employeeSubmissionDate: { type: String, default: new Date().toISOString() },
    managerReviewDate:{ type: String },
    managerSignature: {type: Boolean},
    employeeSignature: {type: Boolean},
    status: {type: String, default: "Pending"},
    kpiDescription: { type: String },
    kpiGroups: [{
      groupId: { type: String },
      groupName: { type: String},
      description: { type: String },
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

      accessLevel: { type: String,
        default: 'Admin'
      },
      groupKpis: [{
      kpiId: { type: String },
      kpiName: { type: String },
      kpiDescription: { type: String },
      employeeId: { type: String },
      employeeName: { type: String },
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
      remarks: { 
          employeeRating: { type: String },
          managerRating: { type: String },
          employeeComment: { type: String },
          managerComment: { type: String },
       },
      }]
    }],
 
}, { timestamps: true })


module.exports = mongoose.model("appraisalData", appraisalDataSchema);  