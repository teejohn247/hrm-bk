/**
 * Update HR module with full feature permissions via PATCH /api/v1/modules/hr
 *
 * Usage: TOKEN=your_jwt node scripts/updateHRModulePermissions.js
 */

import dotenv from 'dotenv';
import { hrModuleFeatures } from '../constants/hrModuleWithPermissions.js';

dotenv.config();

const PORT = process.env.PORT || 8800;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

async function main() {
  const token = process.env.TOKEN;
  if (!token) {
    console.error('\n❌ TOKEN required: TOKEN=your_jwt node scripts/updateHRModulePermissions.js\n');
    process.exit(1);
  }

  try {
    console.log('📤 Updating HR module with full feature permissions...');
    const res = await fetch(`${BASE_URL}/modules/hr`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ moduleFeatures: hrModuleFeatures }),
    });

    const data = await res.json();

    if (res.ok) {
      console.log('\n✅ HR module updated successfully with all feature permissions!');
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
