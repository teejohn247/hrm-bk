/**
 * Add Recruitment Management to HR module via PATCH /api/v1/modules/:id
 *
 * Usage: TOKEN=your_jwt node scripts/addHRModuleFeature.js
 */

import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 8800;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

const HR_MODULE_FEATURES_WITH_RECRUITMENT = [
  { featureId: 1, featureKey: 'employeeManagement', featureName: 'Employee Management', featurePermissions: [] },
  { featureId: 2, featureKey: 'payrollManagement', featureName: 'Payroll Management', featurePermissions: [] },
  { featureId: 3, featureKey: 'leaveManagement', featureName: 'Leave Management', featurePermissions: [] },
  { featureId: 4, featureKey: 'appraisalManagement', featureName: 'Appraisal Management', featurePermissions: [] },
  { featureId: 5, featureKey: 'expenseManagement', featureName: 'Expense Management', featurePermissions: [] },
  { featureId: 6, featureKey: 'calendarManagement', featureName: 'Calendar Management', featurePermissions: [] },
  { featureId: 7, featureKey: 'settingsManagement', featureName: 'Settings Management', featurePermissions: [] },
  { featureId: 8, featureKey: 'recruitmentManagement', featureName: 'Recruitment Management', featurePermissions: [] },
];

async function main() {
  const token = process.env.TOKEN;
  if (!token) {
    console.error('\n❌ TOKEN required: TOKEN=your_jwt node scripts/addHRModuleFeature.js\n');
    process.exit(1);
  }

  try {
    console.log('📤 Updating HR module (adding Recruitment Management)...');
    const res = await fetch(`${BASE_URL}/modules/hr`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ moduleFeatures: HR_MODULE_FEATURES_WITH_RECRUITMENT }),
    });

    const data = await res.json();

    if (res.ok) {
      console.log('\n✅ HR module updated successfully!');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error('\n❌ Failed:', data.error || data);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.cause?.code === 'ECONNREFUSED') {
      console.error('\n   Make sure the server is running: npm run dev');
    }
    process.exit(1);
  }
}

main();
