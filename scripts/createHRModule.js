/**
 * Script to create the HR module via POST /api/v1/modules
 * 
 * Usage:
 *   node scripts/createHRModule.js
 *   
 * Requires: Server running, and either:
 *   - Pass token: TOKEN=your_jwt node scripts/createHRModule.js
 *   - Or pass credentials: EMAIL=aceerp@aceall.io PASSWORD=xxx node scripts/createHRModule.js
 */

import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 8800;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

const HR_MODULE_PAYLOAD = {
  key: 'hr',
  moduleName: 'Human Resources Management Module',
  value: 'HRM Module',
  moduleFeatures: [
    { featureId: 1, featureKey: 'employeeManagement', featureName: 'Employee Management', featurePermissions: [] },
    { featureId: 2, featureKey: 'payrollManagement', featureName: 'Payroll Management', featurePermissions: [] },
    { featureId: 3, featureKey: 'leaveManagement', featureName: 'Leave Management', featurePermissions: [] },
    { featureId: 4, featureKey: 'appraisalManagement', featureName: 'Appraisal Management', featurePermissions: [] },
    { featureId: 5, featureKey: 'expenseManagement', featureName: 'Expense Management', featurePermissions: [] },
    { featureId: 6, featureKey: 'calendarManagement', featureName: 'Calendar Management', featurePermissions: [] },
    { featureId: 7, featureKey: 'settingsManagement', featureName: 'Settings Management', featurePermissions: [] },
  ]
};

async function getToken() {
  const token = process.env.TOKEN;
  if (token) return token;

  const email = process.env.EMAIL || process.env.ADMIN_EMAIL;
  const password = process.env.PASSWORD || process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('\n❌ Auth required. Provide one of:\n');
    console.error('  TOKEN=your_jwt node scripts/createHRModule.js\n');
    console.error('  EMAIL=aceerp@aceall.io PASSWORD=yourpass node scripts/createHRModule.js\n');
    process.exit(1);
  }

  const res = await fetch(`${BASE_URL}/signInAceERP`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok || !data.token) {
    console.error('❌ Sign in failed:', data.error || data.errorMessage || data);
    process.exit(1);
  }
  return data.token;
}

async function createHRModule() {
  try {
    console.log('🔐 Authenticating...');
    const token = await getToken();

    console.log('📤 Creating HR module...');
    const res = await fetch(`${BASE_URL}/modules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(HR_MODULE_PAYLOAD),
    });

    const data = await res.json();

    if (res.ok) {
      console.log('\n✅ HR module created successfully!');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error('\n❌ Failed to create HR module:', data.error || data);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.cause?.code === 'ECONNREFUSED') {
      console.error('\n   Make sure the server is running: npm run dev (or npm start)');
    }
    process.exit(1);
  }
}

createHRModule();
