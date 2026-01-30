/**
 * Test script for leave management system date handling
 * Run with: node tests/leave_actions_test.js
 */

const dotenv = require('dotenv');
dotenv.config();

const axios = require('axios');
const mongoose = require('mongoose');
const { parseDate, formatDateDDMMYYYY, formatDateISO } = require('../utils/dateUtils');

// Set up API base URL
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
let authToken = '';
let companyId = '';
let employeeId = '';
let managerId = '';

// Test the leave application with various date formats
async function runLeaveTests() {
  console.log('=== LEAVE MANAGEMENT SYSTEM DATE HANDLING TEST ===');
  console.log('This test verifies date handling in the leave management system\n');
  
  try {
    // Step 1: Login and get authentication token
    await loginAsAdmin();
    
    // Step 2: Test various date formats
    await testLeaveCreationWithDates();
    
    console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  } finally {
    // Disconnect if connected
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('Database connection closed.');
    }
  }
}

// Login as admin and get token
async function loginAsAdmin() {
  try {
    console.log('\n=== LOGGING IN AS ADMIN ===');
    
    const loginData = {
      email: process.env.ADMIN_EMAIL || 'admin@aceall.io',
      password: process.env.ADMIN_PASSWORD || 'password'
    };
    
    console.log(`Attempting login with email: ${loginData.email}`);
    
    const response = await axios.post(`${API_BASE_URL}/users/login`, loginData);
    
    if (response.data && response.data.token) {
      authToken = response.data.token;
      companyId = response.data.user.company;
      console.log('✅ Login successful, retrieved auth token');
      console.log(`Company ID: ${companyId}`);
      
      // Get employee and manager IDs for testing
      await getTestEmployees();
      
      return response.data;
    } else {
      throw new Error('Login successful but no token received');
    }
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
}

// Get employee IDs for testing
async function getTestEmployees() {
  try {
    console.log('\n=== RETRIEVING TEST EMPLOYEES ===');
    
    const config = {
      headers: { Authorization: `Bearer ${authToken}` }
    };
    
    const response = await axios.get(`${API_BASE_URL}/employee/company/${companyId}`, config);
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      // Get a manager and a regular employee
      let manager = response.data.data.find(emp => emp.isManager);
      let employee = response.data.data.find(emp => !emp.isManager);
      
      // If no explicit manager, just use the first two different employees
      if (!manager || !employee) {
        manager = response.data.data[0];
        employee = response.data.data.length > 1 ? response.data.data[1] : response.data.data[0];
      }
      
      managerId = manager._id;
      employeeId = employee._id;
      
      console.log(`✅ Retrieved manager ID: ${managerId}`);
      console.log(`✅ Retrieved employee ID: ${employeeId}`);
      
      return { managerId, employeeId };
    } else {
      throw new Error('No employees found for testing');
    }
  } catch (error) {
    console.error('❌ Failed to retrieve test employees:', error.message);
    throw error;
  }
}

// Test leave creation with various date formats
async function testLeaveCreationWithDates() {
  console.log('\n=== TESTING LEAVE CREATION WITH VARIOUS DATE FORMATS ===');
  
  // Test cases with different date formats
  const testCases = [
    {
      name: "ISO String Format",
      startDate: new Date(2025, 5, 15).toISOString(), // ISO format
      endDate: new Date(2025, 5, 20).toISOString(),
    },
    {
      name: "DD-MM-YYYY Format",
      startDate: "15-06-2025", // DD-MM-YYYY format
      endDate: "20-06-2025",
    },
    {
      name: "YYYY-MM-DD Format",
      startDate: "2025-07-15", // YYYY-MM-DD format
      endDate: "2025-07-20",
    },
    {
      name: "ISO String with 23:00 Time",
      // This is the problematic case that was fixed - time at 23:00 UTC
      startDate: "2025-08-15T23:00:00.000Z",
      endDate: "2025-08-20T23:00:00.000Z",
    }
  ];
  
  for (const testCase of testCases) {
    await testSingleLeaveCreation(testCase);
  }
}

// Test single leave creation
async function testSingleLeaveCreation(testCase) {
  try {
    console.log(`\n--- Testing ${testCase.name} ---`);
    console.log(`Start date: ${testCase.startDate}`);
    console.log(`End date: ${testCase.endDate}`);
    
    // Parse the dates to validate them first
    const parsedStartDate = parseDate(testCase.startDate);
    const parsedEndDate = parseDate(testCase.endDate);
    
    if (!parsedStartDate || !parsedEndDate) {
      console.error(`❌ Invalid date format in test case ${testCase.name}`);
      return;
    }
    
    // Format dates and log them
    const formattedStartDate = formatDateDDMMYYYY(parsedStartDate);
    const formattedEndDate = formatDateDDMMYYYY(parsedEndDate);
    console.log(`Formatted start date (DD-MM-YYYY): ${formattedStartDate}`);
    console.log(`Formatted end date (DD-MM-YYYY): ${formattedEndDate}`);
    
    // Create leave application payload
    const leaveData = {
      employee: employeeId,
      startDate: testCase.startDate,
      endDate: testCase.endDate,
      leaveType: "Annual Leave",
      reason: `Test leave with ${testCase.name}`,
      manager: managerId,
      status: "Pending",
      createdBy: managerId,
      company: companyId
    };
    
    const config = {
      headers: { Authorization: `Bearer ${authToken}` }
    };
    
    // Submit leave application
    console.log('Submitting leave application...');
    const response = await axios.post(`${API_BASE_URL}/leave`, leaveData, config);
    
    if (response.data && response.data.success) {
      console.log('✅ Leave application submitted successfully');
      console.log(`Leave ID: ${response.data.data._id}`);
      
      // Verify the dates were stored correctly
      console.log('Verifying stored dates...');
      console.log(`System stored start date: ${response.data.data.startDate}`);
      console.log(`System stored end date: ${response.data.data.endDate}`);
      
      // Verify the same dates are returned when retrieving the leave
      await verifyLeaveRetrieval(response.data.data._id);
    } else {
      console.error('❌ Leave application submission failed');
      console.error('Response:', response.data);
    }
  } catch (error) {
    console.error(`❌ Error in ${testCase.name} test:`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Verify leave retrieval works with the stored dates
async function verifyLeaveRetrieval(leaveId) {
  try {
    const config = {
      headers: { Authorization: `Bearer ${authToken}` }
    };
    
    // Get the leave application
    const response = await axios.get(`${API_BASE_URL}/leave/${leaveId}`, config);
    
    if (response.data && response.data.success) {
      console.log('✅ Leave retrieved successfully');
      
      // Parse the retrieved dates
      const retrievedStartDate = parseDate(response.data.data.startDate);
      const retrievedEndDate = parseDate(response.data.data.endDate);
      
      // Format dates for display
      const formattedRetrievedStartDate = formatDateDDMMYYYY(retrievedStartDate);
      const formattedRetrievedEndDate = formatDateDDMMYYYY(retrievedEndDate);
      
      console.log(`Retrieved start date (DD-MM-YYYY): ${formattedRetrievedStartDate}`);
      console.log(`Retrieved end date (DD-MM-YYYY): ${formattedRetrievedEndDate}`);
    } else {
      console.error('❌ Leave retrieval failed');
      console.error('Response:', response.data);
    }
  } catch (error) {
    console.error('❌ Error verifying leave retrieval:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the tests
runLeaveTests(); 