import { hrModuleFeatures } from './hrModuleWithPermissions';
import { recruitmentModuleFeatures } from './recruitmentModuleFeatures';
import { lmsModuleFeatures } from './lmsModuleFeatures';
import { ordersModuleFeatures } from './ordersModuleFeatures';

export const erpModules = [
    {
        moduleId: 1,
        key: 'hr',
        moduleName: 'Human Resources Management Module',
        value: 'HRM Module',
        moduleFeatures: hrModuleFeatures,
      },
      {
        moduleId: 2,
        key: 'om',
        value: 'OM Module',
        moduleName: 'Order Management Module',
        moduleFeatures: ordersModuleFeatures,
      },
      {
        moduleId: 3,
        key: 'recruitment',
        moduleName: 'Recruitment Module',
        value: 'Recruitment Module',
        moduleFeatures: recruitmentModuleFeatures,
      },
      {
        moduleId: 4,
        key: 'lms',
        moduleName: 'LMS Module',
        value: 'LMS Module',
        moduleFeatures: lmsModuleFeatures,
      },
      {
          moduleId: 5,
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
