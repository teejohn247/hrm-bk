# User Complaint API Testing

This repository contains testing tools and scripts for the User Complaint API.

## Overview

The User Complaint API provides the following functionality:
- Create new complaints with screenshots
- View and search complaints
- Update complaint details and status
- Delete complaints

## Testing Tools Included

1. **Postman Collection**: For manual API testing
2. **Automated Test Scripts**: For running automated tests with Mocha and Axios

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd user-complaint-api-tests

# Install dependencies
npm install
```

## Running Tests

### Using Postman

1. Import the `UserComplaintPostmanCollection.json` file into Postman
2. Set up environment variables as described in `UserComplaintPostmanGuide.md`
3. Run the collection or individual requests

### Using Automated Scripts

```bash
# Run the tests with default settings
npm test

# Run tests with custom settings
API_BASE_URL=http://your-api-url TEST_USER_EMAIL=your@email.com TEST_USER_PASSWORD=yourpassword npm test

# Run tests in watch mode (rerun when files change)
npm run test:watch
```

## Environment Variables

You can configure the test scripts using the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| API_BASE_URL | Base URL of your API | http://localhost:5000 |
| TEST_USER_EMAIL | Email for authentication | test@example.com |
| TEST_USER_PASSWORD | Password for authentication | password123 |

## File Structure

- `UserComplaintPostmanCollection.json` - Postman collection for API testing
- `UserComplaintPostmanGuide.md` - Guide for using the Postman collection
- `user-complaint-api-test.js` - Automated test script using Mocha and Axios
- `package.json` - Project configuration and dependencies
- `README.md` - This file

## Test Coverage

The tests cover:

1. **Authentication**: Verifying login and token generation
2. **Screenshot Upload**: Testing the screenshot upload functionality
3. **CRUD Operations**:
   - Creating new complaints
   - Reading complaints (both all and individual)
   - Updating complaint details
   - Deleting complaints
4. **Error Handling**:
   - Invalid inputs
   - Missing required fields
   - Invalid IDs

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /signIn | Authentication |
| POST | /api/complaints/upload-screenshot | Upload a screenshot |
| POST | /api/complaints | Create a new complaint |
| GET | /api/complaints | Get all complaints (with pagination) |
| GET | /api/complaints/:id | Get a specific complaint |
| PUT | /api/complaints/:id | Update a complaint |
| DELETE | /api/complaints/:id | Delete a complaint |

## Troubleshooting

- If authentication fails, verify your credentials
- If tests fail with connection errors, check that the API server is running
- For 403 (Forbidden) errors, ensure you're using a user with appropriate permissions

## Contributing

To contribute to this testing project:
1. Fork the repository
2. Create a feature branch
3. Add or update tests
4. Submit a pull request 