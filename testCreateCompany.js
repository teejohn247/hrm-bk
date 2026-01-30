// Simple test script for the createCompany endpoint

const fetch = require('node-fetch');

// Test data for company creation
const testData = {
  companyName: 'Test Company',
  companyAddress: '123 Test Street, Testville',
  generalSettings: {
    timezone: 'UTC',
    language: 'en'
  }
};

// Function to create a test token (normally you would get this by logging in)
// NOTE: This is a placeholder, you need to replace with a valid JWT token
const getTestToken = () => {
  // Replace with a valid JWT token from your application
  // You can get this by logging into your application and extracting the token
  return 'YOUR_VALID_JWT_TOKEN_HERE';
};

// Test the createCompany endpoint
async function testCreateCompany() {
  try {
    const token = getTestToken();
    console.log('Testing createCompany endpoint with optimized implementation...');

    // Make the API call
    const response = await fetch('http://localhost:8080/api/company/createCompany', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });

    // Get the response data
    const responseStatus = response.status;
    let responseData;
    
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = await response.text();
    }

    // Log results
    console.log(`Response Status: ${responseStatus}`);
    console.log('Response Data:', typeof responseData === 'string' ? responseData : JSON.stringify(responseData, null, 2));

    // Determine test result
    if (responseStatus === 200) {
      console.log('✅ Test PASSED: Company created successfully');
    } else {
      console.log('❌ Test FAILED: Company creation failed');
    }
  } catch (error) {
    console.error('Error testing createCompany endpoint:', error.message);
    console.log('❌ Test FAILED: Error occurred during test');
  }
}

// Run the test
testCreateCompany();

/*
INSTRUCTIONS:
1. Replace 'YOUR_VALID_JWT_TOKEN_HERE' with a valid JWT token from your application
2. Make sure your server is running on localhost:8080
3. Run this script with: node testCreateCompany.js
*/ 