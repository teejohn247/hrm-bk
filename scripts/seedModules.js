/**
 * Seed modules: add Recruitment, LMS, and update Orders (OM) with features.
 * Run: node scripts/seedModules.js
 *
 * Requires: TOKEN=your_jwt (for API) or run with direct DB access (no auth)
 *
 * This script uses the API to create/update modules. Ensure server is running.
 */

import dotenv from 'dotenv';
import { recruitmentModuleFeatures } from '../constants/recruitmentModuleFeatures.js';
import { lmsModuleFeatures } from '../constants/lmsModuleFeatures.js';
import { ordersModuleFeatures } from '../constants/ordersModuleFeatures.js';

dotenv.config();

const PORT = process.env.PORT || 8800;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

const MODULES_TO_CREATE = [
  {
    key: 'om',
    moduleName: 'Order Management Module',
    value: 'OM Module',
    moduleFeatures: ordersModuleFeatures,
  },
  {
    key: 'recruitment',
    moduleName: 'Recruitment Module',
    value: 'Recruitment Module',
    moduleFeatures: recruitmentModuleFeatures,
  },
  {
    key: 'lms',
    moduleName: 'LMS Module',
    value: 'LMS Module',
    moduleFeatures: lmsModuleFeatures,
  },
];

async function createModule(token, payload) {
  const res = await fetch(`${BASE_URL}/modules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    body: JSON.stringify(payload),
  });
  return res;
}

async function main() {
  const token = process.env.TOKEN;
  if (!token) {
    console.error('\n❌ TOKEN required. Run with: TOKEN=your_jwt node scripts/seedModules.js\n');
    console.error('   Make sure the server is running (npm run dev)\n');
    process.exit(1);
  }

  try {
    console.log('🌱 Seeding modules...\n');

    for (const module of MODULES_TO_CREATE) {
      console.log(`📤 Creating ${module.moduleName}...`);
      const res = await createModule(token, module);
      const data = await res.json();

      if (res.ok) {
        console.log(`   ✅ ${module.moduleName} created (moduleId: ${data.data?.moduleId})`);
      } else if (data.error?.includes('already exists')) {
        console.log(`   ⏭️  ${module.moduleName} already exists, skipping`);
      } else {
        console.error(`   ❌ Failed:`, data.error || data);
      }
    }

    console.log('\n✅ Seed complete.\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.cause?.code === 'ECONNREFUSED') {
      console.error('\n   Make sure the server is running: npm run dev\n');
    }
    process.exit(1);
  }
}

main();
