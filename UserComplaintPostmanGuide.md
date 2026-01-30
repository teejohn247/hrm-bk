# User Complaint API Testing Guide

This guide explains how to test the User Complaint API endpoints using the provided Postman collection.

## Setup Instructions

### 1. Import the Collection

1. Open Postman
2. Click on "Import" button in the top left
3. Upload the `UserComplaintPostmanCollection.json` file
4. The collection will be imported into your workspace

### 2. Create Environment Variables

Create a new environment in Postman with the following variables:

| Variable      | Description                                  | Example Value                           |
|---------------|----------------------------------------------|----------------------------------------|
| baseUrl       | The base URL of your API                     | http://localhost:5000                   |
| userEmail     | Email for authentication                     | admin@example.com                       |
| userPassword  | Password for authentication                  | yourpassword                            |
| authToken     | Will be auto-populated after sign-in         | (leave empty, will be auto-filled)      |
| complaintId   | Will be auto-populated after creating        | (leave empty, will be auto-filled)      |
| screenshotUrl | Will be auto-populated after upload          | (leave empty, will be auto-filled)      |

### 3. Select the Environment

Make sure to select your newly created environment from the dropdown in the top right of Postman.

## Test Flow

Follow these steps to properly test the API endpoints:

1. **Authentication**:
   - Execute the "Sign In" request first to get an authentication token
   - The token will be automatically saved to your environment variables

2. **Upload Screenshot** (Optional):
   - Run this if you want to include a screenshot with your complaint
   - The screenshot URL will be saved and used in subsequent requests

3. **Create Complaint**:
   - Create a new complaint using the provided data
   - The complaint ID will be saved for later use

4. **Get All Complaints**:
   - Retrieve a paginated list of complaints
   - You can modify the query parameters for pagination and filtering

5. **Get Complaint by ID**:
   - Retrieve a specific complaint using the saved ID

6. **Update Complaint**:
   - Modify the complaint details
   - Only administrators can update certain fields

7. **Delete Complaint**:
   - Delete (soft-delete) the complaint

## Important Notes

- All requests except "Sign In" require authentication (the token will be added automatically)
- The collection uses Postman's scripting to automatically capture and store variables between requests
- Error responses are properly formatted with detailed messages
- The tests verify API responses and help debug issues

## API Endpoint Details

### Authentication

```
POST {{baseUrl}}/signIn
```

### User Complaint Endpoints

```
POST   {{baseUrl}}/api/complaints/upload-screenshot  - Upload a screenshot
POST   {{baseUrl}}/api/complaints                    - Create a new complaint
GET    {{baseUrl}}/api/complaints                    - Get all complaints (with pagination)
GET    {{baseUrl}}/api/complaints/:id                - Get a specific complaint
PUT    {{baseUrl}}/api/complaints/:id                - Update a complaint
DELETE {{baseUrl}}/api/complaints/:id                - Delete a complaint
```

## Troubleshooting

- If authentication fails, check your credentials in the environment variables
- If you receive 404 errors, verify that the API server is running
- For 403 (Forbidden) errors, you may not have permission to access certain complaints
- Check the Postman console for detailed request/response logs 