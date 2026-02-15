/**
 * Recruitment Module - feature permissions
 */

export const recruitmentModuleFeatures = [
  {
    featureId: 1,
    featureKey: 'jobListingsManagement',
    featureName: 'Job Listings Management',
    featurePermissions: [
      { key: 'canViewJobListings', name: 'View Job Listings', permissionType: 'view' },
      { key: 'canCreateJobListing', name: 'Create Job Listing', permissionType: 'create' },
      { key: 'canUpdateJobListing', name: 'Update Job Listing', permissionType: 'update' },
      { key: 'canDeleteJobListing', name: 'Delete Job Listing', permissionType: 'delete' },
      { key: 'canPublishJobListing', name: 'Publish Job Listing', permissionType: 'update' },
    ],
  },
  {
    featureId: 2,
    featureKey: 'applicationsManagement',
    featureName: 'Applications Management',
    featurePermissions: [
      { key: 'canViewApplications', name: 'View Applications', permissionType: 'view' },
      { key: 'canActionApplication', name: 'Action Application', permissionType: 'update' },
      { key: 'canDeleteApplication', name: 'Delete Application', permissionType: 'delete' },
      { key: 'canChangeApplicationStage', name: 'Change Application Stage', permissionType: 'update' },
    ],
  },
  {
    featureId: 3,
    featureKey: 'candidatesManagement',
    featureName: 'Candidates Management',
    featurePermissions: [
      { key: 'canViewCandidates', name: 'View Candidates', permissionType: 'view' },
      { key: 'canAddCandidate', name: 'Add Candidate', permissionType: 'create' },
      { key: 'canUpdateCandidate', name: 'Update Candidate', permissionType: 'update' },
      { key: 'canDeleteCandidate', name: 'Delete Candidate', permissionType: 'delete' },
    ],
  },
  {
    featureId: 4,
    featureKey: 'offerLettersManagement',
    featureName: 'Offer Letters Management',
    featurePermissions: [
      { key: 'canViewOfferLetters', name: 'View Offer Letters', permissionType: 'view' },
      { key: 'canCreateOfferLetter', name: 'Create Offer Letter', permissionType: 'create' },
      { key: 'canUpdateOfferLetter', name: 'Update Offer Letter', permissionType: 'update' },
      { key: 'canDeleteOfferLetter', name: 'Delete Offer Letter', permissionType: 'delete' },
    ],
  },
  {
    featureId: 5,
    featureKey: 'interviewManagement',
    featureName: 'Interview Management',
    featurePermissions: [
      { key: 'canViewInterviews', name: 'View Interviews', permissionType: 'view' },
      { key: 'canScheduleInterview', name: 'Schedule Interview', permissionType: 'create' },
      { key: 'canUpdateInterview', name: 'Update Interview', permissionType: 'update' },
      { key: 'canDeleteInterview', name: 'Delete Interview', permissionType: 'delete' },
    ],
  },
];
