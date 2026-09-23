/**
 * LMS (Learning Management System) Module - feature permissions
 */

export const lmsModuleFeatures = [
  {
    featureId: 1,
    featureKey: 'coursesManagement',
    featureName: 'Courses Management',
    featurePermissions: [
      { key: 'canViewCourses', name: 'View Courses', permissionType: 'view' },
      { key: 'canCreateCourse', name: 'Create Course', permissionType: 'create' },
      { key: 'canUpdateCourse', name: 'Update Course', permissionType: 'update' },
      { key: 'canDeleteCourse', name: 'Delete Course', permissionType: 'delete' },
      { key: 'canPublishCourse', name: 'Publish Course', permissionType: 'update' },
    ],
  },
  {
    featureId: 2,
    featureKey: 'enrollmentsManagement',
    featureName: 'Enrollments Management',
    featurePermissions: [
      { key: 'canViewEnrollments', name: 'View Enrollments', permissionType: 'view' },
      { key: 'canEnrollUser', name: 'Enroll User', permissionType: 'create' },
      { key: 'canUpdateEnrollment', name: 'Update Enrollment', permissionType: 'update' },
      { key: 'canRemoveEnrollment', name: 'Remove Enrollment', permissionType: 'delete' },
    ],
  },
  {
    featureId: 3,
    featureKey: 'progressTracking',
    featureName: 'Progress Tracking',
    featurePermissions: [
      { key: 'canViewProgress', name: 'View Progress', permissionType: 'view' },
      { key: 'canUpdateProgress', name: 'Update Progress', permissionType: 'update' },
      { key: 'canViewProgressReports', name: 'View Progress Reports', permissionType: 'view' },
    ],
  },
  {
    featureId: 4,
    featureKey: 'certificatesManagement',
    featureName: 'Certificates Management',
    featurePermissions: [
      { key: 'canViewCertificates', name: 'View Certificates', permissionType: 'view' },
      { key: 'canCreateCertificate', name: 'Create Certificate', permissionType: 'create' },
      { key: 'canRevokeCertificate', name: 'Revoke Certificate', permissionType: 'delete' },
    ],
  },
  {
    featureId: 5,
    featureKey: 'assessmentsManagement',
    featureName: 'Assessments & Quizzes',
    featurePermissions: [
      { key: 'canViewAssessments', name: 'View Assessments', permissionType: 'view' },
      { key: 'canCreateAssessment', name: 'Create Assessment', permissionType: 'create' },
      { key: 'canUpdateAssessment', name: 'Update Assessment', permissionType: 'update' },
      { key: 'canDeleteAssessment', name: 'Delete Assessment', permissionType: 'delete' },
      { key: 'canViewAssessmentResults', name: 'View Assessment Results', permissionType: 'view' },
    ],
  },
];
