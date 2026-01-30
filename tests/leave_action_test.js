/**
 * Test script for leave application and approval
 * 
 * This script tests that the leave application and approval system works correctly,
 * particularly that days are automatically deducted from the leave balance when a leave is approved.
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

// Test login credentials
const adminCredentials = {
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'password'
};

const employeeCredentials = {
  email: process.env.EMPLOYEE_EMAIL || 'employee@example.com',
  password: process.env.EMPLOYEE_PASSWORD || 'password'
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
 * Get employee details including leave information
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Employee details
 */
async function getEmployeeDetails(token) {
  try {
    const config = {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        'x-auth-token': token
      }
    };
    
    console.log('Fetching employee details...'.yellow);
    const response = await axios.get('/employers/fetchUserDetails', config);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching employee details:'.red, error.message);
    if (error.response) {
      console.error(error.response.data);
    }
    throw error;
  }
}

/**
 * Apply for leave
 * @param {string} token - Auth token
 * @param {Object} leaveData - Leave application data
 * @returns {Promise<Object>} Leave application response
 */
async function applyForLeave(token, leaveData) {
  try {
    const config = {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        'x-auth-token': token
      }
    };
    
    console.log('Applying for leave...'.yellow);
    const response = await axios.post('/employers/leaveApplication', leaveData, config);
    return response.data;
  } catch (error) {
    console.error('Error applying for leave:'.red, error.message);
    if (error.response) {
      console.error(error.response.data);
    }
    throw error;
  }
}

/**
 * Approve or reject leave
 * @param {string} token - Auth token
 * @param {Object} leaveActionData - Approval/rejection data
 * @returns {Promise<Object>} Leave action response
 */
async function approveOrRejectLeave(token, leaveActionData) {
  try {
    const config = {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        'x-auth-token': token
      }
    };
    
    console.log(`${leaveActionData.approved ? 'Approving' : 'Rejecting'} leave...`.yellow);
    const response = await axios.post('/employers/leaveAction', leaveActionData, config);
    return response.data;
  } catch (error) {
    console.error('Error with leave action:'.red, error.message);
    if (error.response) {
      console.error(error.response.data);
    }
    throw error;
  }
}

/**
 * Fetch pending leave requests
 * @param {string} token - Auth token
 * @returns {Promise<Array>} List of pending leave requests
 */
async function fetchPendingLeaves(token) {
  try {
    const config = {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        'x-auth-token': token
      }
    };
    
    console.log('Fetching pending leave requests...'.yellow);
    const response = await axios.get('/employers/fetchLeaveRecords', config);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching pending leaves:'.red, error.message);
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
    console.log('=== STARTING LEAVE APPLICATION AND APPROVAL TEST ==='.cyan.bold);
    
    // 1. Login as employee
    const employeeToken = await login(employeeCredentials);
    
    // 2. Get employee details to find available leave types
    const employeeDetails = await getEmployeeDetails(employeeToken);
    
    if (!employeeDetails.leaveAssignment || employeeDetails.leaveAssignment.length === 0) {
      console.error('Employee has no leave types assigned'.red.bold);
      return;
    }
    
    console.log('\n=== EMPLOYEE LEAVE ASSIGNMENT ==='.cyan);
    console.table(employeeDetails.leaveAssignment.map(leave => ({
      'Leave Type': leave.leaveName,
      'Total Days': leave.noOfLeaveDays,
      'Days Used': leave.daysUsed,
      'Days Left': leave.daysLeft,
      'Leave Type ID': leave.leaveTypeId
    })));
    
    // 3. Select the first leave type with available days
    const availableLeave = employeeDetails.leaveAssignment.find(leave => 
      leave.daysLeft > 0 || (leave.noOfLeaveDays - leave.daysUsed > 0)
    );
    
    if (!availableLeave) {
      console.error('No leave types with available days found'.red.bold);
      return;
    }
    
    console.log(`\nUsing leave type: ${availableLeave.leaveName}`.yellow);
    console.log(`Current balance: ${availableLeave.daysLeft} days left`.yellow);
    
    // 4. Apply for leave (requesting 1 day)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };
    
    const leaveApplication = {
      leaveTypeId: availableLeave.leaveTypeId,
      leaveStartDate: formatDate(tomorrow),
      leaveEndDate: formatDate(dayAfterTomorrow),
      requestMessage: 'Leave test from automated script',
      noOfLeaveDays: availableLeave.noOfLeaveDays
    };
    
    console.log('\n=== APPLYING FOR LEAVE ==='.cyan);
    console.log(`From: ${leaveApplication.leaveStartDate}`);
    console.log(`To: ${leaveApplication.leaveEndDate}`);
    
    const leaveResponse = await applyForLeave(employeeToken, leaveApplication);
    console.log('Leave application submitted'.green);
    console.log('Leave ID:', leaveResponse.data._id);
    
    // 5. Login as admin to approve the leave
    const adminToken = await login(adminCredentials);
    
    // 6. Fetch pending leave requests
    const pendingLeaves = await fetchPendingLeaves(adminToken);
    
    console.log(`\nFound ${pendingLeaves.length} pending leave requests`.yellow);
    
    // Find the leave request we just created
    const ourLeave = pendingLeaves.find(leave => 
      leave._id === leaveResponse.data._id
    );
    
    if (!ourLeave) {
      console.error('Could not find our leave request in pending leaves'.red.bold);
      return;
    }
    
    console.log('\n=== LEAVE DETAILS BEFORE APPROVAL ==='.cyan);
    console.log(`Employee: ${ourLeave.fullName}`);
    console.log(`Leave Type: ${ourLeave.leaveTypeName}`);
    console.log(`Days Requested: ${ourLeave.daysRequested || 'Not specified'}`);
    console.log(`Status: ${ourLeave.status}`);
    
    // 7. Approve the leave
    const leaveActionData = {
      leaveId: ourLeave._id,
      approved: true,
      decisionMessage: 'Approved by automated test'
    };
    
    await approveOrRejectLeave(adminToken, leaveActionData);
    console.log('Leave request approved'.green);
    
    // 8. Get employee details again to check if days were deducted
    const updatedEmployeeDetails = await getEmployeeDetails(employeeToken);
    const updatedLeave = updatedEmployeeDetails.leaveAssignment.find(
      leave => leave.leaveTypeId === availableLeave.leaveTypeId
    );
    
    console.log('\n=== EMPLOYEE LEAVE BALANCE AFTER APPROVAL ==='.cyan);
    console.log(`Before: ${availableLeave.daysLeft} days left`.yellow);
    console.log(`After: ${updatedLeave.daysLeft} days left`.green);
    
    // Verify days were deducted
    if (updatedLeave.daysLeft < availableLeave.daysLeft) {
      console.log('TEST PASSED: Days were successfully deducted from leave balance ✅'.green.bold);
    } else {
      console.log('TEST FAILED: Days were not deducted from leave balance ❌'.red.bold);
    }
    
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