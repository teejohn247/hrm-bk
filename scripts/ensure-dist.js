const fs = require('fs');
const { execSync } = require('child_process');

const distApp = 'dist/app.js';

if (!fs.existsSync(distApp)) {
  console.log('[boot] dist/ not found — running yarn build (set Build Command to include yarn build to skip this at start)...');
  execSync('yarn build', { stdio: 'inherit' });
}
