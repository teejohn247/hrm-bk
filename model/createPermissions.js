import mongoose from 'mongoose';


const PermissionsSchema = new mongoose.Schema({
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
    created_by: {type: String, required: true},
}, { timestamps: true })


module.exports = mongoose.model("Permissions", PermissionsSchema);