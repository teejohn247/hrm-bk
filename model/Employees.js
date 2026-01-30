import { string } from "joi";
import mongoose from "mongoose";
import moment from "moment";

const EmployeeSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyId: { 
    type: String, 
    required: true 
  },
  activeStatus: { type: Boolean, default: false },
  password: { type: String },
  salaryScale: { type: String },
  salaryLevel: { type: String },
  firstTimeLogin: { type: Boolean },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  fullName: { type: String, trim: true },
  dateOfBirth: { type: String, trim: true },
  personalEmail: { type: String },
  maritalStatus: { type: String },
  phoneNumber: { type: String, trim: true },
  profilePic: {
    type: String,
    default:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKoUT6kaiW2c9qcsxtXXDLJWsHwDvTNgaIkSzH7d0mNg&s",
  },
  address: { type: String, trim: true },
  gender: { type: String, trim: true },
  nextOfKinFullName: {
    type: String,
    trim: true,
  },
  nextOfKinAddress: {
    type: String,
    trim: true,
  },
  nextOfKinPhoneNumber: {
    type: String,
    trim: true,
  },
  nextOfKinGender: {
    type: String,
    trim: true,
  },
  roles:[
    {
        roleName: { type: String, required: true },
        companyId: { type: String},
        companyName: { type: String},
        description: {
          type: String,
          default: ''
      },
      rolePermissions: [{
        moduleId: {type: String},
        featureId: {type: String},
        permissionType: {type: String},
        permissionKey: {type: String},
        permissionValue: {type: Boolean}
        }]
      },
],
  nextOfKinRelationship: {
    type: String,
    trim: true,
  },
  email: { type: String, required: true, trim: true },

  nationality: { type: String, trim: true },
    country: { type: String,  trim: true },
    city: { type: String, trim: true },
  departmentId: { type: String,  trim: true },
  department: { type: String, required: true, trim: true },
  employmentType: { type: String, required: true, trim: true },
  employeeCode: { type: String, required: true, trim: true },
  companyAddress: { type: String, trim: true },
  companyBranch: { type: String, trim: true },
  position: { type: String, trim: true },
  role: { type: String, trim: true },
  salaryScaleId: {
    type: String,
  },
  salaryScale: { type: String, trim: true },
  designation: {
    type: String,
  },
  designationId: {
    type: String,
  },
  designationName: { type: String, trim: true },
  roleName: { type: String, trim: true },
  employmentStartDate: { type: String, trim: true },
  managerId: { type: String, trim: true },
  managerName: { type: String, trim: true },
  companyRole: { type: String, trim: true },
  appraisals: [{
    type: mongoose.Schema.Types.Mixed
  }],
  assignedAppraisals:[
    {
        appraisalId: { type: String, required: true },
        appraisalName: { type: String, required: true },
        dateAssigned: {
            type: Date,
            default: new Date().toISOString() 
        },
      

    }
],
  approvals: [
    {
      approvalType: {
        type: String,
      },
      approval: {
        type: String,
      },
      approvalId: {
        type: String,
      },
    },
  ],
  permissions: {
    employeeManagement: {
      addEmployee: { type: Boolean, default: false },
      bulkImportEmployees: { type: Boolean, default: false },
      bulkExportEmployees: { type: Boolean, default: false },
      uploadPhoto: { type: Boolean, default: false },
      editEmployee: { type: Boolean, default: false },
      deleteEmployee: { type: Boolean, default: false },
    },
    payrollManagement: {
      setPayrollPeriod: { type: Boolean, default: false },
      adjustPayrollDebits: { type: Boolean, default: false },
      adjustPayrollCredits: { type: Boolean, default: false },
      viewPayslip: { type: Boolean, default: false },
      downloadPayslip: { type: Boolean, default: false },
    },
    leaveManagement: {
      requestLeave: { type: Boolean, default: false },
      approveLeave: { type: Boolean, default: false },
      denyLeave: { type: Boolean, default: false },
      editLeaveRequest: { type: Boolean, default: false },
      deleteLeaveRequest: { type: Boolean, default: false },
    },
    expenseManagement: {
      requestExpense: { type: Boolean, default: false },
      approveExpense: { type: Boolean, default: false },
      denyExpense: { type: Boolean, default: false },
      editExpenseRequest: { type: Boolean, default: false },
      deleteExpenseRequest: { type: Boolean, default: false },
    },
    appraisalManagement: {
      createAppraisalPeriod: { type: Boolean, default: false },
      createKPIGroup: { type: Boolean, default: false },
      assignKPIToDepartment: { type: Boolean, default: false },
      createKPI: { type: Boolean, default: false },
      editKPI: { type: Boolean, default: false },
      deleteKPI: { type: Boolean, default: false },
      submitAppraisal: { type: Boolean, default: false },
    },
    calendar: {
      bookMeeting: { type: Boolean, default: false },
      addUpcomingEvent: { type: Boolean, default: false },
      filterEvents: { type: Boolean, default: false },
    },
    companySettings: {
      createDepartment: { type: Boolean, default: false },
      editDepartment: { type: Boolean, default: false },
      deleteDepartment: { type: Boolean, default: false },
      createDesignation: { type: Boolean, default: false },
      editDesignation: { type: Boolean, default: false },
      deleteDesignation: { type: Boolean, default: false },
      createPublicHoliday: { type: Boolean, default: false },
      editPublicHoliday: { type: Boolean, default: false },
      deletePublicHoliday: { type: Boolean, default: false },
      createLeaveType: { type: Boolean, default: false },
      editLeaveType: { type: Boolean, default: false },
      deleteLeaveType: { type: Boolean, default: false },
      createExpenseType: { type: Boolean, default: false },
      editExpenseType: { type: Boolean, default: false },
      deleteExpenseType: { type: Boolean, default: false },
      createPayrollCredit: { type: Boolean, default: false },
      editPayrollCredit: { type: Boolean, default: false },
      deletePayrollCredit: { type: Boolean, default: false },
      createPayrollDebit: { type: Boolean, default: false },
      editPayrollDebit: { type: Boolean, default: false },
      deletePayrollDebit: { type: Boolean, default: false },
    },
  },
  
hasCustomPermissions: {
  type: Boolean,
  default: false
},
  expenseDetails: {
    expenseTypeId: {
      type: String,
    },
    cardNo: {
      type: String,
    },
    cardHolder: {
      type: String,
    },
    dateIssued: {
      type: String,
    },
    expiryDate: {
      type: String,
      default: "",
    },
    cardLimit: {
      type: Number,
      default: 0,
    },
    cardBalance: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    currentSpent: {
      type: Number,
      default: 0,
    },
    currentExpense: {
      type: Number,
      default: 0,
    },

    // kpiAppraisals: [
    //   {
    //     expenseTypeId: { type: String, required: true },
    //     expenseTypeName: { type: String, required: true },
    //     expenseDate: { type: String, required: true },
    //     currency: { type: String },
    //     amount: { type: String, required: true },
    //     attachment: { type: String },
    //     approver: { type: String },
    //     approverId: { type: String },
    //     dateRemitted: { type: String },
    //     dateOfApproval: { type: String },
    //     description: { type: String },
    //     dateRequested: { type: Date, default: Date.now() },
    //   },
    // ],
 
    expenseHistory: [
      {
        expenseTypeId: { type: String},
        expenseTypeName: { type: String},
        expenseDate: { type: String},
        currency: { type: String },
        amount: { type: String},
        attachment: { type: String },
        approver: { type: String },
        approverId: { type: String },
        dateRemitted: { type: String },
        dateOfApproval: { type: String },
        description: { type: String },
        dateRequested: { type: Date, default: Date.now() },
      },
    ],
  },
  leaveAssignment: [
    {
      leaveTypeId: {
        type: String,
      },
      leaveName: {
        type: String,
      },
      noOfLeaveDays: {
        type: Number,
      },
      description: {
        type: String,
      },
      assignedNoOfDays: {
        type: Number,
      },
      daysUsed: {
        type: Number,
        default: 0,
      },
      daysLeft: {
        type: Number,
        default: 0,
      },
      leaveStartDate: {
        type: String,
      },
      leaveEndDate: {
        type: String,
      },
      requestMessage: {
        type: String,
      },
      decisionMessage: {
        type: String,
      },
      leaveApproved: {
        type: Boolean,
        default: false,
      },
    },
  ],
  officialInformation: [
    {
      // leave: [{
      //     leaveName: {
      //         type: String,
      //     },
      //     noOfDays: {
      //         type: String,
      //     },
      //     paid: {
      //         type:Boolean,
      //     },
      //     leaveType: {
      //         type: String,
      //     },
      //     leaveStart: {
      //         type: String,
      //     },
      //     leaveEndDate: {
      //         type: String,
      //     },
      //     daysUsed: {
      //         type: String,
      //     },
      //     leaveApproved: {
      //         type: Boolean,
      //     }
      // }],
      // leave:
      // [{
      //     leaveTypeId: {
      //         type: String,
      //     },
      // leaveType: {
      //     type: String,
      // },
      // leaveStart: {
      //     type: String,
      // },
      // leaveEndDate: {
      //     type: String,
      // },
      // daysUsed: {
      //     type: String,
      // },
      // leaveApproved: {
      //     type: Boolean,
      //     default: false
      // },
      // leaveAttendedTo: {
      //     type: Boolean,
      //     default: false
      // }
      // }],
      hmo: [
        {
          hmoName: {
            type: String,
          },
          features: {
            type: Array,
          },
          description: {
            type: String,
          },
        },
      ],
    },
  ],

  paymentInformation: {
    type: [
      {
        bankName: {
          type: String,
          default: ""
        },
        bankAddress: {
          type: String,
          default: ""
        },
        accountNumber: {
          type: Number,
          default: 0
        },
        accountName: {
          type: String,
          default: ""
        },
        sortCode: {
          type: String,
          default: ""
        },
        taxIdentificationNumber: {
          type: String,
          default: ""
        },
      },
    ],
    default: [{}] // Initialize with an empty object as default
  },

  permissions: {
    employeeManagement: 
    {
      views: {
        view_employee: {
          type: Boolean,
          default: false,
        },
        view_employee_details: {
          type: Boolean,
          default: false,
        },
      },

      actions: {
        add_employee: {
          type: Boolean,
          default: false,
        },
        edit_employee: {
          type: Boolean,
          default: false,
        },
        delete_employee: {
          type: Boolean,
          default: false,
        },
      },
    },
  leaveManagement: 
    {
      views: {
        view_leave_types: {
          type: Boolean,
          default: false,
        },
        view_leaves_types_details: {
          type: Boolean,
          default: false,
        },
        view_leaves: {
          type: Boolean,
          default: false,
        },
        view_leave_details: {
          type: Boolean,
          default: false,
        },
        view_leave_applications: {
          type: Boolean,
          default: false,
        },
      },

      actions: {
        create_leave_types: {
          type: Boolean,
          default: false,
        },
        create_leaves: {
          type: Boolean,
          default: false,
        },
        edit_leave_types: {
          type: Boolean,
          default: false,
        },
        edit_leave_applications: {
          type: Boolean,
          default: false,
        },
        delete_leave_applications: {
          type: Boolean,
          default: false,
        },
      },
    },
  designationManagement: 
    {
      views: {
        view_designations: {
          type: Boolean,
          default: false,
        },
        view_designations_details: {
          type: Boolean,
          default: false,
        },
      },

      actions: {
        create_designations: {
          type: Boolean,
          default: false,
        },
        assign_designations: {
          type: Boolean,
          default: false,
        },
        edit_designations: {
          type: Boolean,
          default: false,
        },
        delete_designations: {
          type: Boolean,
          default: false,
        },
      },
    },
  departmentManagement: 
    {
      views: {
        view_departments: {
          type: Boolean,
          default: false,
        },
        view_department_details: {
          type: Boolean,
          default: false,
        },
      },

      actions: {
        create_departments: {
          type: Boolean,
          default: false,
        },
        assign_departments: {
          type: Boolean,
          default: false,
        },
        edit_departments: {
          type: Boolean,
          default: false,
        },
        delete_departments: {
          type: Boolean,
          default: false,
        },
      },
    },
  appraisalManagement: 
    {
      views: {
        view_appraisal_groups: {
          type: Boolean,
          default: false,
        },
        view_KPIs: {
          type: Boolean,
          default: false,
        },
        view_appraisal_period: {
          type: Boolean,
          default: false,
        },
        view_appraisal_ratings: {
          type: Boolean,
          default: false,
        },
        view_appraisals: {
          type: Boolean,
          default: false,
        },
      },

      actions: {
        create_appraisal_groups: {
          type: Boolean,
          default: false,
        },
        edit_appraisal_groups: {
          type: Boolean,
          default: false,
        },
        delete_appraisal_groups: {
          type: Boolean,
          default: false,
        },
        create_appraisal_periods: {
          type: Boolean,
          default: false,
        },
        edit_appraisal_periods: {
          type: Boolean,
          default: false,
        },
        delete_appraisal_periods: {
          type: Boolean,
          default: false,
        },
        create_appraisal_ratings: {
            type: Boolean,
            default: false,
          },
          edit_appraisal_ratings: {
            type: Boolean,
            default: false,
          },
          delete_appraisal_ratings: {
            type: Boolean,
            default: false,
          },
          create_appraisals: {
            type: Boolean,
            default: false,
          },
          edit_appraisals: {
            type: Boolean,
            default: false,
          },
          delete_appraisals: {
            type: Boolean,
            default: false,
          },
        create_KPIs: {
          type: Boolean,
          default: false,
        },
        edit_KPIs: {
          type: Boolean,
          default: false,
        },
        delete_KPIs: {
          type: Boolean,
          default: false,
        },
      },
    },
  expenseManagement: 
    {
      views: {
        view_expense_types: {
          type: Boolean,
          default: false,
        },
        view_expense_requests: {
          type: Boolean,
          default: false,
        },
        view_expense_details: {
          type: Boolean,
          default: false,
        },
        view_expense_requests: {
          type: Boolean,
          default: false,
        },
        view_expense_types: {
          type: Boolean,
          default: false,
        },
      },

      actions: {
        create_expense_types: {
          type: Boolean,
          default: false,
        },
        create_expense_request: {
          type: Boolean,
          default: false,
        },
        edit_expense_types: {
          type: Boolean,
          default: false,
        },
        edit_expenses: {
          type: Boolean,
          default: false,
        },
        delete_expense_types: {
          type: Boolean,
          default: false,
        },
      },
    },
  },

  // attendance:
  //     [{
  //         attendanceDate: {
  //             type: Date,
  //         },
  //         attendanceClockIn: {
  //             type: String,
  //         },
  //         attendanceClockOut: {
  //             type: String,
  //         },
  //         workHours: {
  //             type: String,
  //         },
  //     }],
  // salaryHistory:
  //     [{
  //         salaryMonth: {
  //             type: String,
  //         },
  //         amount: {
  //             type: Number,
  //         },
  //         tax: {
  //             type: Number,
  //         },
  //         deductables: {
  //             type: Number,
  //         },
  //         totalTakeHome: {
  //             type: Number,
  //         },
  //         salaryDate: {
  //             type: Date
  //         },
  //         bankName: {
  //             type: String,
  //         },
  //         acctNumber: {
  //             type: String,
  //         },
  //         acctName: {
  //             type: String,
  //         },
  //         sortCode: {
  //             type: String,
  //         },
  //     }],
  isManager: {
    type: Boolean,
    default: false,
  },
  isSuperAdmin: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Employee", EmployeeSchema);
