# Login Demo - Company and Employee Tokens

This document shows how to log in as a company and employee to retrieve authentication tokens.

## Prerequisites

1. Server is running on `http://localhost:8800`
2. You need to have test accounts created in the database

## Creating Test Accounts

Since the signup endpoint requires email verification, you'll need to create accounts directly in the database. Here's a simple MongoDB query to create test accounts:

### MongoDB Commands to Create Test Accounts

```javascript
// Connect to your MongoDB
use your_database_name

// 1. Create Test Company
db.companies.insertOne({
  companyName: "Test Company Inc",
  email: "testcompany@example.com",
  // Password: TestPass123! (bcrypt hashed)
  password: "$2b$10$rK6ZbCKvF.MvFZYqZ2Np8.HqK5JFj/WKF6YbGp8X5QxN2YqFH4wC2",
  companyAddress: "123 Test Street",
  activeStatus: true,
  status: true,
  isSuperAdmin: false,
  industry: "Technology",
  subDomain: "testcompany",
  firstTimeLogin: false,
  createdAt: new Date(),
  updatedAt: new Date()
})

// Get the company ID from the previous insert
var companyId = db.companies.findOne({email: "testcompany@example.com"})._id

// 2. Create Test Employee
db.employees.insertOne({
  firstName: "John",
  lastName: "Doe",
  fullName: "John Doe",
  email: "testemployee@example.com",
  // Password: EmpPass123! (bcrypt hashed)
  password: "$2b$10$rK6ZbCKvF.MvFZYqZ2Np8.HqK5JFj/WKF6YbGp8X5QxN2YqFH4wC2",
  companyId: companyId,
  companyName: "Test Company Inc",
  department: "Engineering",
  designationName: "Software Engineer",
  activeStatus: true,
  status: "Active",
  firstTimeLogin: false,
  leaveAssignment: [],
  approvals: [],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Note:** The hashed password above is for `TestPass123!`. You can generate a new hash using:
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('YourPassword', 10);
console.log(hash);
```

## API Endpoint

**Base URL:** `http://localhost:8800/api/v1`

**Login Endpoint:** `POST /signIn`

## 1. Company Login

### Request:
```bash
curl -X POST http://localhost:8800/api/v1/signIn \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testcompany@example.com",
    "password": "TestPass123!"
  }'
```

### Expected Response:
```json
{
  "status": 200,
  "data": {
    "_id": "companyId123...",
    "companyName": "Test Company Inc",
    "email": "testcompany@example.com",
    "companyAddress": "123 Test Street",
    "activeStatus": true,
    "status": true,
    "isSuperAdmin": false,
    "industry": "Technology",
    "subDomain": "testcompany",
    "firstTimeLogin": false,
    "modules": { ... },
    "systemRoles": [ ... ]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YTM5..."
}
```

### Company Token Example:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YTM5ZjBhZGIxOGEyMzQ1Njc4OWFiYyIsImlzU3VwZXJBZG1pbiI6ZmFsc2UsImVtYWlsIjoidGVzdGNvbXBhbnlAZXhhbXBsZS5jb20iLCJjb21wYW55SWQiOiI2N2EzOWYwYWRiMThhMjM0NTY3ODlhYmMiLCJpYXQiOjE3MzgwMDAwMDAsImV4cCI6MTc0MDU5MjAwMH0.xyz123abc...
```

**Token Decoded:**
```json
{
  "id": "67a39f0adb18a2345678abc",
  "isSuperAdmin": false,
  "email": "testcompany@example.com",
  "companyId": "67a39f0adb18a2345678abc",
  "iat": 1738000000,
  "exp": 1740592000
}
```

---

## 2. Employee Login

### Request:
```bash
curl -X POST http://localhost:8800/api/v1/signIn \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testemployee@example.com",
    "password": "EmpPass123!"
  }'
```

### Expected Response:
```json
{
  "status": 200,
  "data": {
    "_id": "employeeId456...",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "email": "testemployee@example.com",
    "companyId": "companyId123...",
    "companyName": "Test Company Inc",
    "department": "Engineering",
    "designationName": "Software Engineer",
    "activeStatus": true,
    "status": "Active",
    "firstTimeLogin": false,
    "modules": { ... },
    "systemRoles": [ ... ]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YTM5..."
}
```

### Employee Token Example:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YTM5ZjBhZGIxOGEyMzQ1Njc4OWRlZiIsImlzU3VwZXJBZG1pbiI6ZmFsc2UsImVtYWlsIjoidGVzdGVtcGxveWVlQGV4YW1wbGUuY29tIiwiY29tcGFueUlkIjoiNjdhMzlmMGFkYjE4YTIzNDU2Nzg5YWJjIiwiaWF0IjoxNzM4MDAwMDAwLCJleHAiOjE3NDA1OTIwMDB9.abc456xyz...
```

**Token Decoded:**
```json
{
  "id": "67a39f0adb18a2345678def",
  "isSuperAdmin": false,
  "email": "testemployee@example.com",
  "companyId": "67a39f0adb18a2345678abc",
  "iat": 1738000000,
  "exp": 1740592000
}
```

---

## Using the Tokens

Once you have the tokens, include them in the Authorization header for authenticated requests:

```bash
# Example: Get announcements as company
curl -X GET http://localhost:8800/api/v1/announcements \
  -H "Authorization: Bearer <COMPANY_TOKEN>" \
  -H "Content-Type: application/json"

# Example: Get support tickets as employee
curl -X GET http://localhost:8800/api/v1/support-tickets \
  -H "Authorization: Bearer <EMPLOYEE_TOKEN>" \
  -H "Content-Type: application/json"
```

---

## Token Differences

### Company Token Payload:
- `id`: Company's _id (same as companyId)
- `isSuperAdmin`: false (unless super admin)
- `email`: Company email
- `companyId`: Company's _id
- Has access to: All company data, create announcements, manage branches, view all support tickets

### Employee Token Payload:
- `id`: Employee's _id
- `isSuperAdmin`: false
- `email`: Employee email
- `companyId`: The company they belong to
- Has access to: Their own data, announcements targeted to them, their own support tickets

---

## Quick Test Script

Save this as `test-login.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:8800/api/v1"

echo "=== Testing Company Login ==="
COMPANY_RESPONSE=$(curl -s -X POST "$API_URL/signIn" \
  -H "Content-Type: application/json" \
  -d '{"email":"testcompany@example.com","password":"TestPass123!"}')

echo "$COMPANY_RESPONSE" | jq '.'
COMPANY_TOKEN=$(echo "$COMPANY_RESPONSE" | jq -r '.token')

echo ""
echo "Company Token:"
echo "$COMPANY_TOKEN"

echo ""
echo "=== Testing Employee Login ==="
EMPLOYEE_RESPONSE=$(curl -s -X POST "$API_URL/signIn" \
  -H "Content-Type: application/json" \
  -d '{"email":"testemployee@example.com","password":"EmpPass123!"}')

echo "$EMPLOYEE_RESPONSE" | jq '.'
EMPLOYEE_TOKEN=$(echo "$EMPLOYEE_RESPONSE" | jq -r '.token')

echo ""
echo "Employee Token:"
echo "$EMPLOYEE_TOKEN"

echo ""
echo "=== Testing with Company Token ==="
curl -s -X GET "$API_URL/announcements" \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "=== Testing with Employee Token ==="
curl -s -X GET "$API_URL/support-tickets" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

Run it:
```bash
chmod +x test-login.sh
./test-login.sh
```

---

## Troubleshooting

### Error: "User does not exist"
- Make sure you've created the test accounts in MongoDB
- Verify the email addresses match exactly

### Error: "Invalid login credentials"
- Check that the password is correct
- Verify the password hash in the database matches the bcrypt hash of your password

### Error: "Cannot POST /signIn"
- The API base path is `/api/v1`, not root
- Use: `http://localhost:8800/api/v1/signIn`

### Token Expires
- Tokens expire after 30 days (default)
- Just login again to get a new token

---

## Testing New Features with Tokens

### Test Announcements:
```bash
# Create announcement (requires company token)
curl -X POST http://localhost:8800/api/v1/announcements \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome Message",
    "content": "Welcome to our new ERP system!",
    "announcementType": "all",
    "priority": "high"
  }'
```

### Test Branches:
```bash
# Create branch (requires company token)
curl -X POST http://localhost:8800/api/v1/branches \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branchName": "New York Office",
    "branchCode": "NYC-001",
    "branchAddress": {
      "city": "New York",
      "state": "NY"
    }
  }'
```

### Test Support Tickets:
```bash
# Create support ticket (employee can use their token)
curl -X POST http://localhost:8800/api/v1/support-tickets \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Need help with payroll",
    "description": "I cannot access the payroll module",
    "category": "technical",
    "priority": "high"
  }'
```

---

## Summary

1. **Create accounts** in MongoDB (use the MongoDB commands above)
2. **Login as company**: Use `testcompany@example.com` / `TestPass123!`
3. **Login as employee**: Use `testemployee@example.com` / `EmpPass123!`
4. **Use tokens** in Authorization header for authenticated requests
5. **Test new features** (announcements, branches, support tickets)

The main difference between tokens:
- Company token: Full admin access to all company data
- Employee token: Limited access to only relevant employee data
