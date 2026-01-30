export const erpModules = [
    {
        moduleId: 1,
        key: 'hr',
        moduleName: 'Human Resources Management Module',
        value: 'HRM Module',
        moduleFeatures: [
          {
            featureId: 1,
            featureKey: 'employeeManagement',
            featureName: 'Employee Management',
            featurePermissions: []
          },
          {
              featureId: 2,
              featureKey: 'payrollManagement',
              featureName: 'Payroll Management',
              featurePermissions: []
          },
          {
              featureId: 3,
              featureKey: 'leaveManagement',
              featureName: 'Leave Management',
              featurePermissions: []
          },
          {
              featureId: 4,
              featureKey: 'appraisalManagement',
              featureName: 'Appraisal Management',
              featurePermissions: []
          },
          {
            featureId: 5,
            featureKey: 'expenseManagement',
            featureName: 'Expense Management',
            featurePermissions: []
          },
          {
            featureId: 6,
            featureKey: 'calendarManagement',
            featureName: 'Calendar Management',
            featurePermissions: []
          },
          {
            featureId: 7,
            featureKey: 'settingsManagement',
            featureName: 'Settings Management',
            featurePermissions: []
          },
        ]
      },
      {
        moduleId: 2,
        key: 'om',
        value: 'OM Module',
        moduleName: 'Order Management Module',
        moduleFeatures: [
          {
              featureId: 1,
              featureKey: 'customersManagement',
              featureName: 'Customers Management',
              featurePermissions: []
          },
          {
              featureId: 2,
              featureKey: 'purchaseOrderManagement',
              featureName: 'Purchase Order Management',
              featurePermissions: []
          },
          {
              featureId: 5,
              featureKey: 'salesOrderManagement',
              featureName: 'Sales Order Management',
              featurePermissions: []
          },
          {
              featureId: 7,
              featureKey: 'reports',
              featureName: 'Reports',
              featurePermissions: []
          }
        ]
      },
      {
          moduleId: 3,
          key: 'settings',
          value: 'Settings Module',
          moduleName: 'Settings Management Module',
          moduleFeatures: [
              {
                  featureId: 1,
                  featureKey: 'generalSettings',
                  featureName: 'General Settings',
                  featurePermissions: []
              },
              {
                  featureId: 2,
                  featureKey: 'hrmSettings',
                  featureName: 'HRM Settings',
                  featurePermissions: []
              },
              {
                  featureId: 3,
                  featureKey: 'omSettings',
                  featureName: 'OM Settings',
                  featurePermissions: []
              }
          ]
        }
  ];
