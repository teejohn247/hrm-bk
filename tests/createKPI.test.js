/**
 * Test script for KPI name uniqueness check in createKPI.js
 * 
 * This script tests that KPIs with the same name can be created in different contexts:
 * - Same name but different groups
 * - Same name, same group but different employees
 * - Same name, same group but different departments
 */

// Import required modules
const axios = require('axios');
const mongoose = require('mongoose');
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

// Test data
const testData = {
  // Company admin credentials - replace with valid credentials
  companyAdmin: {
    email: process.env.COMPANY_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.COMPANY_ADMIN_PASSWORD || 'password'
  },
  // Employee credentials - replace with valid credentials
  employee: {
    email: process.env.EMPLOYEE_EMAIL || 'employee@example.com',
    password: process.env.EMPLOYEE_PASSWORD || 'password'
  },
  // KPI data
  kpi: {
    name: 'Test KPI for Uniqueness Check',
    description: 'This is a test KPI to verify name uniqueness logic',
    weight: 10,
    threshold: 50,
    target: 75,
    max: 100,
    type: 'percentage',
    fields: {}
  }
};

// Test state to store IDs and tokens
const testState = {
  companyAdminToken: '',
  employeeToken: '',
  groupIds: [],
  employeeIds: [],
  departmentIds: [],
  createdKpiIds: []
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
 * Fetch available KPI groups
 * @param {string} token - Auth token
 * @returns {Promise<Array>} Array of group IDs
 */
async function fetchGroups(token) {
  try {
    console.log('Fetching KPI groups...'.yellow);
    const config = {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        'x-auth-token': token
      }
    };
    
    const response = await axios.get('/appraisal/fetchGroups', config);
    
    if (response.data && response.data.data) {
      const groups = response.data.data;
      console.log(`Found ${groups.length} KPI groups`.green);
      return groups.map(group => ({
        id: group._id,
        name: group.groupName,
        accessLevel: group.accessLevel
      }));
    } else {
      throw new Error('No groups found in response');
    }
  } catch (error) {
    console.error('Failed to fetch KPI groups:'.red, error.message);
    throw error;
  }
}

/**
 * Fetch employees
 * @param {string} token - Auth token
 * @returns {Promise<Array>} Array of employee IDs
 */
async function fetchEmployees(token) {
  try {
    console.log('Fetching employees...'.yellow);
    const config = {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        'x-auth-token': token
      }
    };
    
    const response = await axios.get('/employers/fetchEmployees', config);
    
    if (response.data && response.data.data) {
      const employees = response.data.data;
      console.log(`Found ${employees.length} employees`.green);
      return employees.map(emp => ({
        id: emp._id,
        name: emp.fullName,
        department: emp.departmentId
      }));
    } else {
      throw new Error('No employees found in response');
    }
  } catch (error) {
    console.error('Failed to fetch employees:'.red, error.message);
    throw error;
  }
}

/**
 * Fetch departments
 * @param {string} token - Auth token
 * @returns {Promise<Array>} Array of department IDs
 */
async function fetchDepartments(token) {
  try {
    console.log('Fetching departments...'.yellow);
    const config = {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        'x-auth-token': token
      }
    };
    
    const response = await axios.get('/department/fetchDepartments', config);
    
    if (response.data && response.data.data) {
      const departments = response.data.data;
      console.log(`Found ${departments.length} departments`.green);
      return departments.map(dept => ({
        id: dept._id,
        name: dept.departmentName
      }));
    } else {
      throw new Error('No departments found in response');
    }
  } catch (error) {
    console.error('Failed to fetch departments:'.red, error.message);
    throw error;
  }
}

/**
 * Create a KPI
 * @param {string} token - Auth token
 * @param {Object} kpiData - KPI data
 * @returns {Promise<Object>} Created KPI
 */
async function createKPI(token, kpiData) {
  try {
    console.log(`Creating KPI "${kpiData.name}" in group "${kpiData.group}"...`.yellow);
    console.log(`Employee IDs: ${kpiData.employeeIds?.length || 0}, Department IDs: ${kpiData.departmentIds?.length || 0}`.yellow);
    
    const config = {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        'x-auth-token': token
      }
    };
    
    const response = await axios.post('/appraisal/createKPI', kpiData, config);
    
    if (response.data && response.data.success) {
      console.log(`KPI "${kpiData.name}" created successfully`.green);
      return response.data.data;
    } else {
      throw new Error(response.data?.error || 'Failed to create KPI');
    }
  } catch (error) {
    if (error.response) {
      console.error(`Failed to create KPI "${kpiData.name}":`.red, error.response.data?.error || error.message);
      return { error: error.response.data?.error, status: error.response.status };
    } else {
      console.error(`Failed to create KPI "${kpiData.name}":`.red, error.message);
      throw error;
    }
  }
}

/**
 * Run test cases for KPI name uniqueness
 */
async function runTests() {
  try {
    console.log('=== STARTING KPI NAME UNIQUENESS TESTS ==='.cyan.bold);
    
    // 1. Login as company admin
    testState.companyAdminToken = await login(testData.companyAdmin);
    
    // 2. Fetch KPI groups
    const groups = await fetchGroups(testState.companyAdminToken);
    if (groups.length < 2) {
      console.error('Need at least 2 KPI groups for testing'.red);
      return;
    }
    testState.groupIds = groups.map(g => g.id);
    
    // 3. Fetch employees
    const employees = await fetchEmployees(testState.companyAdminToken);
    if (employees.length < 4) {
      console.error('Need at least 4 employees for testing'.red);
      return;
    }
    // Split employees into two groups for testing
    testState.employeeIds = [
      employees.slice(0, 2).map(e => e.id),  // First 2 employees
      employees.slice(2, 4).map(e => e.id)   // Next 2 employees
    ];
    
    // 4. Fetch departments
    const departments = await fetchDepartments(testState.companyAdminToken);
    if (departments.length < 2) {
      console.error('Need at least 2 departments for testing'.red);
      return;
    }
    testState.departmentIds = departments.map(d => d.id);
    
    // 5. Test Case 1: Create KPI with unique name (should succeed)
    console.log('\n=== TEST CASE 1: Create KPI with unique name ==='.cyan);
    const kpi1 = await createKPI(testState.companyAdminToken, {
      ...testData.kpi,
      name: `${testData.kpi.name} - Unique`,
      group: testState.groupIds[0],
      employeeIds: testState.employeeIds[0]
    });
    
    if (kpi1._id) {
      testState.createdKpiIds.push(kpi1._id);
      console.log('TEST CASE 1: PASSED ✅'.green.bold);
    } else {
      console.error('TEST CASE 1: FAILED ❌'.red.bold);
    }
    
    // 6. Test Case 2: Create KPI with same name in same group for same employees (should fail)
    console.log('\n=== TEST CASE 2: Create KPI with same name in same group for same employees ==='.cyan);
    const kpi2 = await createKPI(testState.companyAdminToken, {
      ...testData.kpi,
      name: `${testData.kpi.name} - Same Group Same Employees`,
      group: testState.groupIds[0],
      employeeIds: testState.employeeIds[0]
    });
    
    const kpi2Duplicate = await createKPI(testState.companyAdminToken, {
      ...testData.kpi,
      name: `${testData.kpi.name} - Same Group Same Employees`,
      group: testState.groupIds[0],
      employeeIds: testState.employeeIds[0]
    });
    
    if (kpi2._id && kpi2Duplicate.error && kpi2Duplicate.status === 400) {
      testState.createdKpiIds.push(kpi2._id);
      console.log('TEST CASE 2: PASSED ✅'.green.bold);
    } else {
      console.error('TEST CASE 2: FAILED ❌'.red.bold);
    }
    
    // 7. Test Case 3: Create KPI with same name in same group for different employees (should succeed)
    console.log('\n=== TEST CASE 3: Create KPI with same name in same group for different employees ==='.cyan);
    const kpi3 = await createKPI(testState.companyAdminToken, {
      ...testData.kpi,
      name: `${testData.kpi.name} - Same Group Different Employees`,
      group: testState.groupIds[0],
      employeeIds: testState.employeeIds[0]
    });
    
    const kpi3Different = await createKPI(testState.companyAdminToken, {
      ...testData.kpi,
      name: `${testData.kpi.name} - Same Group Different Employees`,
      group: testState.groupIds[0],
      employeeIds: testState.employeeIds[1]  // Different employees
    });
    
    if (kpi3._id && kpi3Different._id) {
      testState.createdKpiIds.push(kpi3._id, kpi3Different._id);
      console.log('TEST CASE 3: PASSED ✅'.green.bold);
    } else {
      console.error('TEST CASE 3: FAILED ❌'.red.bold);
    }
    
    // 8. Test Case 4: Create KPI with same name in different groups (should succeed)
    console.log('\n=== TEST CASE 4: Create KPI with same name in different groups ==='.cyan);
    const kpi4 = await createKPI(testState.companyAdminToken, {
      ...testData.kpi,
      name: `${testData.kpi.name} - Different Groups`,
      group: testState.groupIds[0],
      employeeIds: testState.employeeIds[0]
    });
    
    const kpi4DifferentGroup = await createKPI(testState.companyAdminToken, {
      ...testData.kpi,
      name: `${testData.kpi.name} - Different Groups`,
      group: testState.groupIds[1],  // Different group
      employeeIds: testState.employeeIds[0]  // Same employees
    });
    
    if (kpi4._id && kpi4DifferentGroup._id) {
      testState.createdKpiIds.push(kpi4._id, kpi4DifferentGroup._id);
      console.log('TEST CASE 4: PASSED ✅'.green.bold);
    } else {
      console.error('TEST CASE 4: FAILED ❌'.red.bold);
    }
    
    // 9. Test Case 5: Create KPI with same name for departments
    console.log('\n=== TEST CASE 5: Create KPI with same name for different departments ==='.cyan);
    const kpi5 = await createKPI(testState.companyAdminToken, {
      ...testData.kpi,
      name: `${testData.kpi.name} - Departments`,
      group: testState.groupIds[0],
      departmentIds: [testState.departmentIds[0]]
    });
    
    const kpi5DifferentDept = await createKPI(testState.companyAdminToken, {
      ...testData.kpi,
      name: `${testData.kpi.name} - Departments`,
      group: testState.groupIds[0],
      departmentIds: [testState.departmentIds[1]]  // Different department
    });
    
    if (kpi5._id && kpi5DifferentDept._id) {
      testState.createdKpiIds.push(kpi5._id, kpi5DifferentDept._id);
      console.log('TEST CASE 5: PASSED ✅'.green.bold);
    } else {
      console.error('TEST CASE 5: FAILED ❌'.red.bold);
    }
    
    // 10. Test Case 6: Create KPI with same name in same group for overlapping employees (should fail)
    console.log('\n=== TEST CASE 6: Create KPI with same name in same group for overlapping employees ==='.cyan);
    
    // Create a set of employees with one overlapping employee
    const overlappingEmployeeIds = [
      testState.employeeIds[0][0],  // First employee from first set
      ...testState.employeeIds[1]   // All employees from second set
    ];
    
    const kpi6 = await createKPI(testState.companyAdminToken, {
      ...testData.kpi,
      name: `${testData.kpi.name} - Overlapping`,
      group: testState.groupIds[0],
      employeeIds: testState.employeeIds[0]
    });
    
    const kpi6Overlapping = await createKPI(testState.companyAdminToken, {
      ...testData.kpi,
      name: `${testData.kpi.name} - Overlapping`,
      group: testState.groupIds[0],
      employeeIds: overlappingEmployeeIds
    });
    
    if (kpi6._id && kpi6Overlapping.error && kpi6Overlapping.status === 400) {
      testState.createdKpiIds.push(kpi6._id);
      console.log('TEST CASE 6: PASSED ✅'.green.bold);
    } else {
      console.error('TEST CASE 6: FAILED ❌'.red.bold);
    }
    
    console.log('\n=== ALL TESTS COMPLETED ==='.cyan.bold);
    const passedCount = testState.createdKpiIds.length;
    console.log(`Created ${passedCount} KPIs during testing`.yellow);
    
  } catch (error) {
    console.error('Test failed with error:'.red, error);
  }
}

// Run the tests
runTests()
  .then(() => {
    console.log('Tests finished'.green);
    process.exit(0);
  })
  .catch(err => {
    console.error('Tests failed'.red, err);
    process.exit(1);
  }); 