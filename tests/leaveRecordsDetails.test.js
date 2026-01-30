/**
 * Test script for leaveRecordsDetails API
 * 
 * This script tests that the leaveRecordsDetails API always returns
 * all day groups (0-7 days, 8-14 days, 15-21 days, 21+ days) even if
 * some groups don't have any employees.
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
    'x-auth-token': process.env.AUTH_TOKEN || ''
  }
};

// Test login credentials (admin/company account required for this test)
const adminCredentials = {
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
    if (error.response) {
      console.error(error.response.data);
    }
    throw error;
  }
}

/**
 * Fetch leave records details
 * @param {string} token - Auth token
 * @param {number} year - Optional year to filter
 * @returns {Promise<Object>} Leave records details
 */
async function fetchLeaveRecordsDetails(token, year = null) {
  try {
    const config = {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        'x-auth-token': token
      }
    };
    
    let url = '/leave/leaveRecordsDetails';
    if (year) {
      url += `?year=${year}`;
    }
    
    console.log(`Fetching leave records details${year ? ` for year ${year}` : ''}...`.yellow);
    const response = await axios.get(url, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching leave records details:'.red, error.message);
    if (error.response) {
      console.error(error.response.data);
    }
    throw error;
  }
}

/**
 * Main test function
 */
async function runTest() {
  try {
    console.log('=== STARTING LEAVE RECORDS DETAILS TEST ==='.cyan.bold);
    
    // 1. Login as admin
    const adminToken = await login(adminCredentials);
    
    // 2. Fetch leave records details
    const currentYear = new Date().getFullYear();
    const leaveRecordsDetails = await fetchLeaveRecordsDetails(adminToken, currentYear);
    
    console.log('\n=== LEAVE RECORDS DETAILS RESPONSE ==='.cyan);
    
    // 3. Verify all groups are present
    const expectedGroups = ["0-7 days", "8-14 days", "15-21 days", "21+ days"];
    const foundGroups = leaveRecordsDetails.data.map(group => group.group);
    
    console.log('Expected groups:'.yellow, expectedGroups);
    console.log('Found groups:'.yellow, foundGroups);
    
    // Check if all expected groups are present
    const allGroupsPresent = expectedGroups.every(group => foundGroups.includes(group));
    
    if (allGroupsPresent) {
      console.log('TEST PASSED: All day range groups are present in the response ✅'.green.bold);
    } else {
      console.log('TEST FAILED: Some day range groups are missing ❌'.red.bold);
      const missingGroups = expectedGroups.filter(group => !foundGroups.includes(group));
      console.log('Missing groups:'.red, missingGroups);
    }
    
    // 4. Verify each group has an employees array (even if empty)
    let allGroupsHaveEmployeesArray = true;
    const groupsWithoutEmployeesArray = [];
    
    leaveRecordsDetails.data.forEach(group => {
      if (!Array.isArray(group.employees)) {
        allGroupsHaveEmployeesArray = false;
        groupsWithoutEmployeesArray.push(group.group);
      }
    });
    
    if (allGroupsHaveEmployeesArray) {
      console.log('TEST PASSED: All groups have an employees array ✅'.green.bold);
    } else {
      console.log('TEST FAILED: Some groups do not have an employees array ❌'.red.bold);
      console.log('Groups without employees array:'.red, groupsWithoutEmployeesArray);
    }
    
    // 5. Additional info
    console.log('\n=== GROUP DETAILS ==='.cyan);
    leaveRecordsDetails.data.forEach(group => {
      console.log(`Group: ${group.group}`.yellow);
      console.log(`Employees count: ${group.employees.length}`);
      console.log('');
    });
    
    console.log('\n=== TEST COMPLETED ==='.cyan.bold);
    
  } catch (error) {
    console.error('Test failed:'.red.bold, error.message);
  }
}

// Run the test
runTest()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('Test execution error:'.red, err);
    process.exit(1);
  }); 