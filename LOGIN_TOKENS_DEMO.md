# Login Tokens Demo - Company & Employee

## 📝 Overview
This document provides test credentials and example JWT tokens for both Company (Admin) and Employee accounts.

---

## 🔐 Test Credentials

### Company/Admin Account
```
Email: testcompany@example.com
Password: TestPass123!
```

### Employee Account
```
Email: testemployee@example.com
Password: EmpPass123!
```

---

## 🚀 Quick Start - Create Test Accounts

If you need to create the test accounts in your MongoDB database, use these commands:

### MongoDB Shell Commands:

```javascript
// Switch to your database
use your_database_name

// 1. Create Test Company
db.companies.insertOne({
  companyName: "Test Company Inc",
  email: "testcompany@example.com",
  password: "$2b$10$KypECr4oml29zzhq4k0/wutrq0bN7b4qAalX3EEpp4Ms8tLTWaB4q",
  companyAddress: "123 Test Street, Test City",
  activeStatus: true,
  status: true,
  isSuperAdmin: false,
  industry: "Technology",
  subDomain: "testcompany",
  firstTimeLogin: false,
  dateCreated: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
})

// Get the company ID
var testCompanyId = db.companies.findOne({email: "testcompany@example.com"})._id

// 2. Create Test Employee
db.employees.insertOne({
  firstName: "John",
  lastName: "Doe",
  fullName: "John Doe",
  email: "testemployee@example.com",
  password: "$2b$10$2o8DjwMQ6BXEr7aNi5vQ6.nUOBI7CWU/NeZTKXCNfHwgQq8INPy/m",
  companyId: testCompanyId,
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

// Verify creation
db.companies.findOne({email: "testcompany@example.com"})
db.employees.findOne({email: "testemployee@example.com"})
```

---

## 🔑 Login API Endpoint

**Endpoint:** `POST /api/v1/signIn`  
**Base URL:** `http://localhost:8800`

---

## 1️⃣ Company Login Example

### cURL Request:
```bash
curl -X POST http://localhost:8800/api/v1/signIn \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testcompany@example.com",
    "password": "TestPass123!"
  }'
```

### Response:
```json
{
  "status": 200,
  "data": {
    "_id": "67a39f0adb18a23456789abc",
    "companyName": "Test Company Inc",
    "email": "testcompany@example.com",
    "companyAddress": "123 Test Street, Test City",
    "activeStatus": true,
    "status": true,
    "isSuperAdmin": false,
    "industry": "Technology",
    "subDomain": "testcompany",
    "firstTimeLogin": false,
    "dateCreated": "2026-02-05T09:00:00.000Z",
    "createdAt": "2026-02-05T09:00:00.000Z",
    "updatedAt": "2026-02-05T09:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YTM5ZjBhZGIxOGEyMzQ1Njc4OWFiYyIsImlzU3VwZXJBZG1pbiI6ZmFsc2UsImVtYWlsIjoidGVzdGNvbXBhbnlAZXhhbXBsZS5jb20iLCJjb21wYW55SWQiOiI2N2EzOWYwYWRiMThhMjM0NTY3ODlhYmMiLCJpYXQiOjE3MzgwMDAwMDAsImV4cCI6MTc0MDU5MjAwMH0.dGVzdF9zaWduYXR1cmVfZm9yX2NvbXBhbnk"
}
```

### 🎫 Company Token (JWT):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YTM5ZjBhZGIxOGEyMzQ1Njc4OWFiYyIsImlzU3VwZXJBZG1pbiI6ZmFsc2UsImVtYWlsIjoidGVzdGNvbXBhbnlAZXhhbXBsZS5jb20iLCJjb21wYW55SWQiOiI2N2EzOWYwYWRiMThhMjM0NTY3ODlhYmMiLCJpYXQiOjE3MzgwMDAwMDAsImV4cCI6MTc0MDU5MjAwMH0.dGVzdF9zaWduYXR1cmVfZm9yX2NvbXBhbnk
```

### 🔍 Token Decoded (Payload):
```json
{
  "id": "67a39f0adb18a23456789abc",
  "isSuperAdmin": false,
  "email": "testcompany@example.com",
  "companyId": "67a39f0adb18a23456789abc",
  "iat": 1738000000,
  "exp": 1740592000
}
```

**Token Details:**
- `id`: Company's MongoDB _id
- `isSuperAdmin`: false (regular company admin)
- `email`: Company email address
- `companyId`: Same as id (company's own ID)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (~30 days)

**Permissions:**
✅ Create/Edit/Delete Announcements  
✅ Create/Manage Branches  
✅ View All Support Tickets for company  
✅ Manage Employees  
✅ Access all company data  

---

## 2️⃣ Employee Login Example

### cURL Request:
```bash
curl -X POST http://localhost:8800/api/v1/signIn \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testemployee@example.com",
    "password": "EmpPass123!"
  }'
```

### Response:
```json
{
  "status": 200,
  "data": {
    "_id": "67a39f0adb18a23456789def",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "email": "testemployee@example.com",
    "companyId": {
      "_id": "67a39f0adb18a23456789abc",
      "subDomain": "testcompany",
      "companyFeatures": {},
      "systemRoles": []
    },
    "companyName": "Test Company Inc",
    "department": "Engineering",
    "designationName": "Software Engineer",
    "activeStatus": true,
    "status": "Active",
    "firstTimeLogin": false,
    "leaveAssignment": [],
    "approvals": []
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YTM5ZjBhZGIxOGEyMzQ1Njc4OWRlZiIsImlzU3VwZXJBZG1pbiI6ZmFsc2UsImVtYWlsIjoidGVzdGVtcGxveWVlQGV4YW1wbGUuY29tIiwiY29tcGFueUlkIjoiNjdhMzlmMGFkYjE4YTIzNDU2Nzg5YWJjIiwiaWF0IjoxNzM4MDAwMDAwLCJleHAiOjE3NDA1OTIwMDB9.dGVzdF9zaWduYXR1cmVfZm9yX2VtcGxveWVl"
}
```

### 🎫 Employee Token (JWT):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YTM5ZjBhZGIxOGEyMzQ1Njc4OWRlZiIsImlzU3VwZXJBZG1pbiI6ZmFsc2UsImVtYWlsIjoidGVzdGVtcGxveWVlQGV4YW1wbGUuY29tIiwiY29tcGFueUlkIjoiNjdhMzlmMGFkYjE4YTIzNDU2Nzg5YWJjIiwiaWF0IjoxNzM4MDAwMDAwLCJleHAiOjE3NDA1OTIwMDB9.dGVzdF9zaWduYXR1cmVfZm9yX2VtcGxveWVl
```

### 🔍 Token Decoded (Payload):
```json
{
  "id": "67a39f0adb18a23456789def",
  "isSuperAdmin": false,
  "email": "testemployee@example.com",
  "companyId": "67a39f0adb18a23456789abc",
  "iat": 1738000000,
  "exp": 1740592000
}
```

**Token Details:**
- `id`: Employee's MongoDB _id (different from company)
- `isSuperAdmin`: false
- `email`: Employee email address
- `companyId`: The company they belong to
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (~30 days)

**Permissions:**
✅ View announcements targeted to them  
✅ View branch information (read-only)  
✅ Create/View own support tickets  
✅ Request leaves  
✅ View own employee data  
❌ Cannot create announcements  
❌ Cannot manage branches  
❌ Cannot view other employees' tickets  

---

## 🔄 Key Differences Between Tokens

| Feature | Company Token | Employee Token |
|---------|--------------|----------------|
| **User ID** | Company's _id | Employee's _id |
| **Company ID** | Same as User ID | Different (parent company) |
| **isSuperAdmin** | false (can be true for super admins) | Always false |
| **Access Level** | Full admin access | Limited employee access |
| **Can Create Announcements** | ✅ Yes | ❌ No |
| **Can Manage Branches** | ✅ Yes | ❌ No (read-only) |
| **Support Tickets** | ✅ All company tickets | ✅ Own tickets only |
| **Employee Data** | ✅ All employees | ✅ Own data only |

---

## 🧪 Testing with Tokens

### Using Company Token:

```bash
# Save the token
COMPANY_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Create an announcement (Admin only)
curl -X POST http://localhost:8800/api/v1/announcements \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Company Update",
    "content": "We have implemented new features!",
    "announcementType": "all",
    "priority": "high"
  }'

# Create a branch (Admin only)
curl -X POST http://localhost:8800/api/v1/branches \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branchName": "New York Office",
    "branchCode": "NYC-001"
  }'

# View all support tickets
curl -X GET http://localhost:8800/api/v1/support-tickets \
  -H "Authorization: Bearer $COMPANY_TOKEN"
```

### Using Employee Token:

```bash
# Save the token
EMPLOYEE_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# View announcements (only those targeted to them)
curl -X GET http://localhost:8800/api/v1/announcements \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN"

# Create a support ticket
curl -X POST http://localhost:8800/api/v1/support-tickets \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Login Issue",
    "description": "Cannot access my account",
    "category": "technical",
    "priority": "high"
  }'

# View own support tickets
curl -X GET http://localhost:8800/api/v1/support-tickets \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN"

# View branches (read-only)
curl -X GET http://localhost:8800/api/v1/branches \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN"
```

---

## 🎯 Complete Test Script

Save as `test-login-tokens.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:8800/api/v1"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 COMPANY LOGIN TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

COMPANY_RESPONSE=$(curl -s -X POST "$API_URL/signIn" \
  -H "Content-Type: application/json" \
  -d '{"email":"testcompany@example.com","password":"TestPass123!"}')

echo "📧 Email: testcompany@example.com"
echo "🔑 Password: TestPass123!"
echo ""
echo "📦 Response:"
echo "$COMPANY_RESPONSE" | jq '.'

COMPANY_TOKEN=$(echo "$COMPANY_RESPONSE" | jq -r '.token')
echo ""
echo "🎫 COMPANY TOKEN:"
echo "$COMPANY_TOKEN"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👤 EMPLOYEE LOGIN TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

EMPLOYEE_RESPONSE=$(curl -s -X POST "$API_URL/signIn" \
  -H "Content-Type: application/json" \
  -d '{"email":"testemployee@example.com","password":"EmpPass123!"}')

echo "📧 Email: testemployee@example.com"
echo "🔑 Password: EmpPass123!"
echo ""
echo "📦 Response:"
echo "$EMPLOYEE_RESPONSE" | jq '.'

EMPLOYEE_TOKEN=$(echo "$EMPLOYEE_RESPONSE" | jq -r '.token')
echo ""
echo "🎫 EMPLOYEE TOKEN:"
echo "$EMPLOYEE_TOKEN"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ TESTING API WITH COMPANY TOKEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "📢 Fetching announcements as company..."
curl -s -X GET "$API_URL/announcements" \
  -H "Authorization: Bearer $COMPANY_TOKEN" | jq '.'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ TESTING API WITH EMPLOYEE TOKEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "🎫 Fetching support tickets as employee..."
curl -s -X GET "$API_URL/support-tickets" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN" | jq '.'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ TEST COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

Run it:
```bash
chmod +x test-login-tokens.sh
./test-login-tokens.sh
```

---

## 📚 Summary

### Company Login
- **Email:** `testcompany@example.com`
- **Password:** `TestPass123!`
- **Access:** Full admin access to all features
- **Token Contains:** Company ID (id === companyId)

### Employee Login
- **Email:** `testemployee@example.com`
- **Password:** `EmpPass123!`
- **Access:** Limited to employee-specific features
- **Token Contains:** Employee ID (id ≠ companyId)

### Using Tokens
Include in the `Authorization` header:
```
Authorization: Bearer <TOKEN_HERE>
```

### Token Expiration
Tokens expire after ~30 days. Simply login again to get a new token.

---

## 🆘 Need Help?

If you encounter issues:

1. **Account doesn't exist:** Run the MongoDB commands above to create test accounts
2. **Invalid credentials:** Verify password hashes match (use `scripts/generatePasswordHash.js`)
3. **Token invalid:** Token may have expired, login again
4. **Can't access endpoint:** Ensure you're using the correct token for the action (admin vs employee)

---

For more details on API endpoints, see:
- `/docs/NewFeaturesAPI.md` - Complete API documentation
- `/IMPLEMENTATION_SUMMARY.md` - Implementation overview
