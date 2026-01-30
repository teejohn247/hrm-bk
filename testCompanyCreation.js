// Test script for the optimized createCompany function
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Mock objects needed for testing
const mockReq = {
  body: {
    companyName: 'Test Company XYZ',
    companyAddress: '123 Test Street',
    generalSettings: {
      timezone: 'UTC',
      language: 'en'
    }
  },
  payload: {
    id: '60d21b4667d0d8992e610c85', // Example MongoDB ID
    email: 'test@example.com'
  }
};

const mockRes = {
  status: function(statusCode) {
    console.log(`Response Status: ${statusCode}`);
    this.statusCode = statusCode;
    return this;
  },
  json: function(data) {
    console.log('Response Data:', JSON.stringify(data, null, 2));
    this.body = data;
    return this;
  }
};

// Replace the real imports in the createCompany module with mocks
const originalRequire = require;
require = function(modulePath) {
  if (modulePath === '../../model/Company') {
    return {
      findOne: async () => ({
        email: 'test@example.com',
        // Not setting companyName to simulate a company account that doesn't have a name yet
      }),
      findOneAndUpdate: async () => ({
        _id: '60d21b4667d0d8992e610c85',
        companyName: 'Test Company XYZ',
        email: 'test@example.com',
        companyFeatures: {
          modules: []
        }
      })
    };
  } else if (modulePath === '../../config/sub-domain') {
    return async () => ({ prefix: 'test123' });
  } else if (modulePath === '../../model/Module') {
    return {
      find: async () => [{
        modules: {
          module1: { 
            permissions: { 
              view: true, 
              edit: true 
            } 
          }
        }
      }]
    };
  } else if (modulePath === '../../model/AppraisalGroup') {
    return {
      findOne: async () => null,
      find: async () => [{
        groupName: 'General',
        companyId: '60d21b4667d0d8992e610c85'
      }]
    };
  } else if (modulePath === '../../model/AuditTrail') {
    return function() {
      return {
        save: async () => ({})
      };
    };
  } else {
    return originalRequire(modulePath);
  }
};

// Import the createCompany function after mocking dependencies
import createCompany from './controller/Company/createCompany.js';

// Restore original require
require = originalRequire;

// Run the test
async function runTest() {
  try {
    console.log('Starting test of optimized createCompany function...');
    
    // Create a simpler test that directly calls the API endpoint
    const express = require('express');
    const app = express();
    const router = express.Router();
    
    app.use(express.json());
    
    // Register the route with our optimized createCompany function
    router.post('/test-create-company', (req, res) => {
      console.log('Received request with body:', req.body);
      // Add the payload to simulate authentication
      req.payload = {
        id: '60d21b4667d0d8992e610c85',
        email: 'test@example.com'
      };
      
      // Call our optimized function
      createCompany(req, res)
        .then(() => console.log('Company creation handled'))
        .catch(err => console.error('Error during company creation:', err));
    });
    
    app.use('/api', router);
    
    // Start a server
    const server = app.listen(3001, () => {
      console.log('Test server started on port 3001');
      
      // Make a request to our test endpoint
      const axios = require('axios');
      axios.post('http://localhost:3001/api/test-create-company', {
        companyName: 'Test Company XYZ',
        companyAddress: '123 Test Street',
        generalSettings: {
          timezone: 'UTC',
          language: 'en'
        }
      })
      .then(response => {
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        console.log('✅ Test PASSED: Company created successfully');
      })
      .catch(error => {
        console.error('Request error:', error.message);
        if (error.response) {
          console.error('Error status:', error.response.status);
          console.error('Error data:', error.response.data);
        }
        console.log('❌ Test FAILED: Company creation failed');
      })
      .finally(() => {
        // Close the server
        server.close(() => {
          console.log('Test server closed');
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error('Test setup error:', error);
    process.exit(1);
  }
}

runTest(); 