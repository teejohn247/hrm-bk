/**
 * Test script for date utilities
 * Run with: node tests/test_date_utils.js
 */

const { parseDate, formatDateDDMMYYYY, formatDateISO } = require('../utils/dateUtils');

// Test cases for parsing different date formats
const testParseDate = () => {
  console.log('\n=== TESTING parseDate FUNCTION ===\n');
  
  const testCases = [
    { input: '25-05-2025', expected: 'DD-MM-YYYY format' },
    { input: '2025-05-25', expected: 'YYYY-MM-DD format' },
    { input: '2025-05-25T23:00:00.000Z', expected: 'ISO string' },
    { input: new Date(2025, 4, 25), expected: 'Date object' },
    { input: '25/05/2025', expected: 'fallback parsing' },
    { input: 'invalid-date', expected: 'null (invalid)' },
    { input: null, expected: 'null (invalid)' },
    { input: undefined, expected: 'null (invalid)' },
  ];
  
  testCases.forEach(test => {
    try {
      console.log(`\nTesting input: ${test.input} (expected: ${test.expected})`);
      const result = parseDate(test.input);
      console.log('Result:', result);
      if (result instanceof Date) {
        console.log('As ISO string:', result.toISOString());
        console.log('Valid date:', !isNaN(result.getTime()));
      } else {
        console.log('Not a valid Date object');
      }
    } catch (error) {
      console.error('Error in test:', error);
    }
    console.log('-----------------------------------');
  });
};

// Test cases for formatting dates to DD-MM-YYYY
const testFormatDateDDMMYYYY = () => {
  console.log('\n=== TESTING formatDateDDMMYYYY FUNCTION ===\n');
  
  const testCases = [
    { input: new Date(2025, 4, 25), expected: '25-05-2025' },
    { input: '25-05-2025', expected: '25-05-2025' },
    { input: '2025-05-25', expected: '25-05-2025' },
    { input: '2025-05-25T23:00:00.000Z', expected: '26-05-2025' }, // Note: timezone offset might affect this
    { input: 'invalid-date', expected: '' },
    { input: null, expected: '' },
  ];
  
  testCases.forEach(test => {
    try {
      console.log(`\nTesting input: ${test.input} (expected: ${test.expected})`);
      const result = formatDateDDMMYYYY(test.input);
      console.log('Result:', result);
      console.log('Matches expected:', result === test.expected);
    } catch (error) {
      console.error('Error in test:', error);
    }
    console.log('-----------------------------------');
  });
};

// Test cases for formatting dates to ISO strings
const testFormatDateISO = () => {
  console.log('\n=== TESTING formatDateISO FUNCTION ===\n');
  
  const testCases = [
    { input: new Date(2025, 4, 25), expected: new Date(2025, 4, 25).toISOString() },
    { input: '25-05-2025', expected: 'ISO string' },
    { input: '2025-05-25', expected: 'ISO string' },
    { input: '2025-05-25T23:00:00.000Z', expected: '2025-05-25T23:00:00.000Z' },
    { input: 'invalid-date', expected: '' },
    { input: null, expected: '' },
  ];
  
  testCases.forEach(test => {
    try {
      console.log(`\nTesting input: ${test.input}`);
      const result = formatDateISO(test.input);
      console.log('Result:', result);
      if (test.expected === 'ISO string') {
        console.log('Is valid ISO string:', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(result));
      } else {
        console.log('Matches expected:', result === test.expected);
      }
    } catch (error) {
      console.error('Error in test:', error);
    }
    console.log('-----------------------------------');
  });
};

// Test specific date issues from the production data
const testProductionDateIssues = () => {
  console.log('\n=== TESTING PRODUCTION DATE ISSUES ===\n');
  
  const testCases = [
    { 
      description: 'ISO string with timezone (2025-05-28T23:00:00.000Z)',
      input: '2025-05-28T23:00:00.000Z'
    },
    { 
      description: 'ISO string with timezone (2025-05-25T23:00:00.000Z)',
      input: '2025-05-25T23:00:00.000Z'
    },
    { 
      description: 'Sample from database record',
      leaveStartDate: '2025-05-25T23:00:00.000Z',
      leaveEndDate: '2025-05-28T23:00:00.000Z'
    }
  ];
  
  // Test the first two cases individually
  testCases.slice(0, 2).forEach(test => {
    try {
      console.log(`\nTesting: ${test.description}`);
      console.log('Input:', test.input);
      
      // Test parsing
      const parsed = parseDate(test.input);
      console.log('Parsed date:', parsed);
      console.log('Valid date:', parsed instanceof Date && !isNaN(parsed.getTime()));
      
      // Test formatting
      if (parsed) {
        const formatted = formatDateDDMMYYYY(parsed);
        console.log('Formatted (DD-MM-YYYY):', formatted);
      }
    } catch (error) {
      console.error('Error in test:', error);
    }
    console.log('-----------------------------------');
  });
  
  // Test the third case with both dates
  try {
    const test = testCases[2];
    console.log(`\nTesting: ${test.description}`);
    
    // Test start date
    console.log('Start date input:', test.leaveStartDate);
    const parsedStart = parseDate(test.leaveStartDate);
    console.log('Parsed start date:', parsedStart);
    console.log('Valid start date:', parsedStart instanceof Date && !isNaN(parsedStart.getTime()));
    
    // Test end date
    console.log('End date input:', test.leaveEndDate);
    const parsedEnd = parseDate(test.leaveEndDate);
    console.log('Parsed end date:', parsedEnd);
    console.log('Valid end date:', parsedEnd instanceof Date && !isNaN(parsedEnd.getTime()));
    
    // Test formatting
    if (parsedStart && parsedEnd) {
      console.log('Formatted start date (DD-MM-YYYY):', formatDateDDMMYYYY(parsedStart));
      console.log('Formatted end date (DD-MM-YYYY):', formatDateDDMMYYYY(parsedEnd));
      
      // Test date calculation
      const days = getDaysBetweenDates(parsedStart, parsedEnd);
      console.log('Days between dates:', days);
    }
  } catch (error) {
    console.error('Error in test:', error);
  }
  console.log('-----------------------------------');
};

// Utility function to calculate days between dates
function getDaysBetweenDates(startDate, endDate) {
  // Clone dates to avoid modifying the originals
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Reset time to midnight for comparison
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  // Calculate the difference in milliseconds
  const diffTime = Math.abs(end - start);
  
  // Convert to days
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  
  return diffDays;
}

// Run all tests
console.log('=== DATE UTILITIES TEST SUITE ===');
console.log('This test validates the date utility functions used in the application.\n');

testParseDate();
testFormatDateDDMMYYYY();
testFormatDateISO();
testProductionDateIssues();

console.log('\n=== ALL TESTS COMPLETED ==='); 