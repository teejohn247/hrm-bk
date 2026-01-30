/**
 * Test script for fetchEmployees.js
 * 
 * This script tests that fetchEmployees properly returns all employees
 * when page, limit, and search are undefined.
 */

// Import required modules
const axios = require('axios');
const dotenv = require('dotenv');
const colors = require('colors');

// Load environment variables
dotenv.config();

// Configure axios with base URL and auth token
const axiosConfig = {
  baseURL: process.env.API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    // You'll need to set the authorization token when running the tests
    'x-auth-token': process.env.AUTH_TOKEN || ''
  }
};

// Test login credentials
const credentials = {
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'password'
};

/**
 * Login function to get authentication token
 * @param {Object} credentials - Email and password
 * @returns {Promise<string>} Authentication token
 */
async function login(credentials) {
  try {
    console.log(`Logging in as ${credentials.email}...`.yellow);
    const response = await axios.post(
      '/auth/login',
      credentials,
      { baseURL: axiosConfig.baseURL }
    );
    
    if (response.data && response.data.token) {
      console.log(`Login successful for ${credentials.email}`.green);
      return response.data.token;
    } else {
      throw new Error('Token not found in response');
    }
  } catch (error) {
    console.error(`Login failed for ${credentials.email}:`.red, error.message);
    throw error;
  }
}

/**
 * Test function to call fetchEmployees with different parameter combinations
 * @param {string} token - Authentication token
 */
async function testFetchEmployees(token) {
  try {
    const config = {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        'x-auth-token': token
      }
    };

    // Test 1: Call with page, limit, and search all undefined (should return all employees)
    console.log('\n=== TEST 1: Call with no parameters ==='.cyan);
    const response1 = await axios.get('/employers/fetchEmployees', config);
    
    console.log(`Received ${response1.data.data.length} employees out of ${response1.data.totalRecords} total`.green);
    console.log(`No pagination info provided: ${!response1.data.totalPages && !response1.data.currentPage ? '✅' : '❌'}`.yellow);
    
    // Test 2: Call with pagination
    console.log('\n=== TEST 2: Call with pagination ==='.cyan);
    const response2 = await axios.get('/employers/fetchEmployees?page=1&limit=5', config);
    
    console.log(`Received ${response2.data.data.length} employees`.green);
    console.log(`Pagination info:`.yellow);
    console.log(`  Total Pages: ${response2.data.totalPages}`.yellow);
    console.log(`  Current Page: ${response2.data.currentPage}`.yellow);
    console.log(`  Total Records: ${response2.data.totalRecords}`.yellow);
    
    // Test 3: Call with search
    console.log('\n=== TEST 3: Call with search parameter ==='.cyan);
    // Using a search term that's likely to return some results
    const response3 = await axios.get('/employers/fetchEmployees?search=a', config);
    
    console.log(`Search for 'a' returned ${response3.data.data.length} employees`.green);
    
    // Test 4: Call with explicit "undefined" string parameters
    console.log('\n=== TEST 4: Call with explicit "undefined" string parameters ==='.cyan);
    const response4 = await axios.get('/employers/fetchEmployees?page=undefined&limit=undefined&search=undefined', config);
    
    console.log(`Received ${response4.data.data.length} employees out of ${response4.data.totalRecords} total`.green);
    console.log(`No pagination info provided: ${!response4.data.totalPages && !response4.data.currentPage ? '✅' : '❌'}`.yellow);
    
    // Test 5: Compare regular undefined vs explicit "undefined" string
    console.log('\n=== TEST 5: Compare no parameters vs explicit "undefined" parameters ==='.cyan);
    if (response1.data.totalRecords === response4.data.totalRecords && 
        response1.data.data.length === response4.data.data.length &&
        !response4.data.totalPages && !response4.data.currentPage) {
      console.log('Test PASSED: Results match between no parameters and explicit "undefined" parameters ✅'.green.bold);
    } else {
      console.log('Test FAILED: Results differ between no parameters and explicit "undefined" parameters ❌'.red.bold);
      console.log(`No parameters: ${response1.data.totalRecords}, Explicit "undefined": ${response4.data.totalRecords}`.red);
    }
    
    // Compare results
    console.log('\n=== FINAL COMPARISON ==='.cyan);
    if (response1.data.totalRecords >= response2.data.totalRecords && 
        response1.data.totalRecords >= response3.data.data.length) {
      console.log('Test PASSED: No parameters returned the most results ✅'.green.bold);
    } else {
      console.log('Test FAILED: No parameters did not return the most results ❌'.red.bold);
      console.log(`No parameters: ${response1.data.totalRecords}, Paginated: ${response2.data.totalRecords}, Search: ${response3.data.data.length}`.red);
    }
    
    return true;
  } catch (error) {
    console.error('Error testing fetchEmployees:'.red);
    if (error.response) {
      console.error(`Status: ${error.response.status}`.red);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
}

// Run tests
async function runTests() {
  try {
    console.log('=== STARTING FETCH EMPLOYEES TESTS ==='.cyan.bold);
    
    // Login to get token
    const token = await login(credentials);
    
    // Run tests
    const success = await testFetchEmployees(token);
    
    if (success) {
      console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY ==='.green.bold);
    } else {
      console.log('\n=== TESTS COMPLETED WITH ERRORS ==='.red.bold);
    }
  } catch (error) {
    console.error('Tests failed to run:'.red, error.message);
  }
}

// Run the tests
runTests()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('Tests failed:'.red, err);
    process.exit(1);
  }); 