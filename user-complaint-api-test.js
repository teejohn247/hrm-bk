const axios = require('axios');
const assert = require('assert');
const { describe, it, before } = require('mocha');

// Configuration
const config = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
  user: {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'password123'
  },
  timeout: 10000 // 10 seconds
};

// Global variables
let authToken;
let complaintId;
let screenshotUrl = 'https://example.com/test-screenshot.jpg';

// Setup axios instance
const api = axios.create({
  baseURL: config.baseUrl,
  timeout: config.timeout,
  validateStatus: status => status < 500 // Don't throw for HTTP 4xx responses
});

// Helper function to set auth token
const setAuthHeader = () => {
  if (authToken) {
    api.defaults.headers.common['Authorization'] = authToken;
  }
};

describe('User Complaint API Tests', function() {
  this.timeout(config.timeout);

  // Step 1: Authentication
  describe('Authentication', () => {
    it('should sign in and get an auth token', async () => {
      const response = await api.post('/signIn', {
        email: config.user.email,
        password: config.user.password
      });

      assert.equal(response.status, 200);
      assert.ok(response.data.success);
      assert.ok(response.data.token);
      
      authToken = response.data.token;
      setAuthHeader();
    });
  });

  // Step 2: User Complaint Endpoints
  describe('User Complaint Endpoints', () => {
    // 2.1 Upload screenshot
    it('should upload a screenshot', async () => {
      const response = await api.post('/api/complaints/upload-screenshot', {
        image: screenshotUrl
      });

      assert.equal(response.status, 200);
      assert.ok(response.data.success);
      assert.ok(response.data.data.screenshotUrl);
      
      // Store the screenshot URL for later use
      screenshotUrl = response.data.data.screenshotUrl;
    });

    // 2.2 Create a complaint
    it('should create a new complaint', async () => {
      const response = await api.post('/api/complaints', {
        description: 'Test complaint from automated tests',
        issueCategory: 'Technical Issue',
        screenshot: screenshotUrl
      });

      assert.equal(response.status, 201);
      assert.ok(response.data.success);
      assert.ok(response.data.message.includes('submitted successfully'));
      
      // If the response includes the ID, store it for later tests
      if (response.data.data && response.data.data.id) {
        complaintId = response.data.data.id;
      }
    });

    // 2.3 Get all complaints
    it('should retrieve all complaints with pagination', async () => {
      const response = await api.get('/api/complaints?page=1&limit=10');

      assert.equal(response.status, 200);
      assert.ok(response.data.success);
      assert.ok(Array.isArray(response.data.data));
      
      // If we didn't get an ID from create, use the first complaint
      if (!complaintId && response.data.data.length > 0) {
        complaintId = response.data.data[0].id;
      }
    });

    // 2.4 Get a specific complaint
    it('should retrieve a specific complaint by ID', async () => {
      // Skip this test if we don't have a complaint ID
      if (!complaintId) {
        this.skip();
        return;
      }

      const response = await api.get(`/api/complaints/${complaintId}`);

      assert.equal(response.status, 200);
      assert.ok(response.data.success);
      assert.equal(response.data.data.id, complaintId);
    });

    // 2.5 Update a complaint
    it('should update a complaint', async () => {
      // Skip this test if we don't have a complaint ID
      if (!complaintId) {
        this.skip();
        return;
      }

      const response = await api.put(`/api/complaints/${complaintId}`, {
        description: 'Updated description from automated tests',
        issueCategory: 'Performance Issue',
        status: 'in-progress',
        resolution: 'Working on a fix'
      });

      assert.equal(response.status, 200);
      assert.ok(response.data.success);
      assert.ok(response.data.message.includes('updated successfully'));
    });

    // 2.6 Verify the update
    it('should verify the complaint was updated', async () => {
      // Skip this test if we don't have a complaint ID
      if (!complaintId) {
        this.skip();
        return;
      }

      const response = await api.get(`/api/complaints/${complaintId}`);

      assert.equal(response.status, 200);
      assert.ok(response.data.success);
      assert.equal(response.data.data.description, 'Updated description from automated tests');
      assert.equal(response.data.data.issueCategory, 'Performance Issue');
    });

    // 2.7 Delete the complaint
    it('should delete (soft-delete) a complaint', async () => {
      // Skip this test if we don't have a complaint ID
      if (!complaintId) {
        this.skip();
        return;
      }

      const response = await api.delete(`/api/complaints/${complaintId}`);

      assert.equal(response.status, 200);
      assert.ok(response.data.success);
      assert.ok(response.data.message.includes('deleted successfully'));
    });

    // 2.8 Verify the deletion
    it('should verify the complaint was deleted', async () => {
      // Skip this test if we don't have a complaint ID
      if (!complaintId) {
        this.skip();
        return;
      }

      const response = await api.get(`/api/complaints/${complaintId}`);

      // Should return 404 as the complaint is soft-deleted
      assert.equal(response.status, 404);
      assert.ok(!response.data.success);
    });
  });

  // Step 3: Test error cases
  describe('Error Handling', () => {
    it('should handle invalid complaint ID', async () => {
      const response = await api.get('/api/complaints/invalidid123');
      
      assert.ok(response.status === 400 || response.status === 404);
      assert.ok(!response.data.success);
    });

    it('should handle missing required fields when creating', async () => {
      const response = await api.post('/api/complaints', {
        // Missing required fields
      });

      assert.equal(response.status, 400);
      assert.ok(!response.data.success);
    });
  });
});

// Run with: EXPORT API_BASE_URL=http://localhost:5000 TEST_USER_EMAIL=your@email.com TEST_USER_PASSWORD=yourpassword && npx mocha user-complaint-api-test.js 