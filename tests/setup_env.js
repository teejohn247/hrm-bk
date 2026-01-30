/**
 * Environment Setup Script for Tests
 * 
 * This script helps set up the .env file with user credentials
 * for testing fetchEmployees and other API endpoints.
 */

const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Default values
const defaults = {
  API_BASE_URL: 'http://localhost:5000/api',
  ADMIN_EMAIL: '',
  ADMIN_PASSWORD: ''
};

// Path to .env file
const envPath = path.resolve(process.cwd(), '.env');

// Check if .env already exists
const envExists = fs.existsSync(envPath);

console.log('\n=== Environment Setup for API Testing ===\n');

if (envExists) {
  console.log('An .env file already exists. Do you want to overwrite it? (y/n)');
  rl.question('> ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      askQuestions();
    } else {
      console.log('Setup canceled. Existing .env file was preserved.');
      rl.close();
    }
  });
} else {
  askQuestions();
}

function askQuestions() {
  console.log('\nPlease provide the following information:');
  
  rl.question(`API Base URL (default: ${defaults.API_BASE_URL}): `, (apiUrl) => {
    const API_BASE_URL = apiUrl || defaults.API_BASE_URL;
    
    rl.question('Admin Email: ', (adminEmail) => {
      if (!adminEmail) {
        console.log('Admin Email is required.');
        rl.close();
        return;
      }
      
      rl.question('Admin Password: ', (adminPassword) => {
        if (!adminPassword) {
          console.log('Admin Password is required.');
          rl.close();
          return;
        }
        
        rl.question('Auth Token (optional): ', (authToken) => {
          writeEnvFile(API_BASE_URL, adminEmail, adminPassword, authToken);
          rl.close();
        });
      });
    });
  });
}

function writeEnvFile(apiUrl, adminEmail, adminPassword, authToken) {
  const envContent = `# API configuration
API_BASE_URL=${apiUrl}

# Test credentials
ADMIN_EMAIL=${adminEmail}
ADMIN_PASSWORD=${adminPassword}

# Auth token (optional, will be obtained through login if not provided)
AUTH_TOKEN=${authToken || ''}
`;

  fs.writeFileSync(envPath, envContent);
  console.log('\n.env file created successfully!');
  console.log(`File saved at: ${envPath}`);
  console.log('\nYou can now run the tests with:');
  console.log('  node ./tests/fetchEmployees.test.js');
  console.log('  or');
  console.log('  ./tests/run_employee_test.sh');
}

rl.on('close', () => {
  console.log('\nSetup complete.');
  process.exit(0);
}); 