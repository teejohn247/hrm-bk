# Modules API - Sample Payloads

Documentation for the Create and Update module endpoints.

## Available Modules

| Module | Key | Description |
|--------|-----|-------------|
| HR | `hr` | Human Resources Management |
| Orders | `om` | Order Management (Customers, Purchase/Sales Orders, Inventory) |
| Recruitment | `recruitment` | Job Listings, Applications, Candidates, Offer Letters |
| LMS | `lms` | Learning Management (Courses, Enrollments, Certificates) |
| Settings | `settings` | General, HRM, OM Settings |

---

## Authentication

All endpoints require authentication. Pass the JWT token in the `Authorization` header (raw token, no `Bearer` prefix):

```
Authorization: <your_jwt_token>
```

---

## Create Module

**Endpoint:** `POST /api/v1/modules`  
**Auth:** Required

### Required Fields

| Field        | Type   | Description                    |
| ------------ | ------ | ------------------------------ |
| `key`        | string | Unique module identifier       |
| `moduleName` | string | Display name of the module     |
| `value`      | string | Short label/value for the module |

### Optional Fields

| Field           | Type  | Description                         |
| --------------- | ----- | ----------------------------------- |
| `moduleFeatures`| array | List of features within the module  |

### Sample Payload (Minimal)

```json
{
  "key": "inventory",
  "moduleName": "Inventory Management Module",
  "value": "IM Module"
}
```

### Sample Payload (Full - with Features)

See `constants/hrModuleWithPermissions.js` for the full HR module structure. Example:

```json
{
  "key": "hr",
  "moduleName": "Human Resources Management Module",
  "value": "HRM Module",
  "moduleFeatures": [
    {
      "featureId": 1,
      "featureKey": "employeeManagement",
      "featureName": "Employee Management",
      "featurePermissions": [
        { "key": "canViewEmployees", "name": "View Employees", "permissionType": "view" },
        { "key": "canCreateEmployee", "name": "Create Employee", "permissionType": "create" },
        { "key": "canUpdateEmployee", "name": "Update Employee", "permissionType": "update" },
        { "key": "canDeleteEmployee", "name": "Delete Employee", "permissionType": "delete" }
      ]
    },
    {
      "featureId": 2,
      "featureKey": "payrollManagement",
      "featureName": "Payroll Management",
      "featurePermissions": []
    },
    {
      "featureId": 3,
      "featureKey": "recruitmentManagement",
      "featureName": "Recruitment Management",
      "featurePermissions": [
        {
          "key": "view",
          "name": "View",
          "permissionType": "read"
        },
        {
          "key": "create",
          "name": "Create",
          "permissionType": "write"
        }
      ]
    }
  ]
}
```

### cURL Example

```bash
curl -X POST http://localhost:8800/api/v1/modules \
  -H "Content-Type: application/json" \
  -H "Authorization: YOUR_JWT_TOKEN" \
  -d '{
    "key": "hr",
    "moduleName": "Human Resources Management Module",
    "value": "HRM Module",
    "moduleFeatures": [
      {
        "featureId": 1,
        "featureKey": "employeeManagement",
        "featureName": "Employee Management",
        "featurePermissions": []
      }
    ]
  }'
```

---

## Update Module

**Endpoint:** `PATCH /api/v1/modules/:id`  
**Auth:** Required

**Path Parameter:** `id` — Module identifier (can be MongoDB `_id`, numeric `moduleId`, or module `key`)

### Updatable Fields (all optional)

| Field           | Type   | Description                              |
| --------------- | ------ | ---------------------------------------- |
| `key`           | string | Unique module identifier                 |
| `moduleName`    | string | Display name of the module               |
| `value`         | string | Short label/value for the module         |
| `moduleFeatures`| array  | Full list of features (replaces existing)|

### Sample Payload (Update Single Field)

```json
{
  "moduleName": "Human Resources & Recruitment Module"
}
```

### Sample Payload (Update Features - Add Recruitment Management)

```json
{
  "moduleFeatures": [
    {
      "featureId": 1,
      "featureKey": "employeeManagement",
      "featureName": "Employee Management",
      "featurePermissions": []
    },
    {
      "featureId": 2,
      "featureKey": "payrollManagement",
      "featureName": "Payroll Management",
      "featurePermissions": []
    },
    {
      "featureId": 3,
      "featureKey": "leaveManagement",
      "featureName": "Leave Management",
      "featurePermissions": []
    },
    {
      "featureId": 4,
      "featureKey": "appraisalManagement",
      "featureName": "Appraisal Management",
      "featurePermissions": []
    },
    {
      "featureId": 5,
      "featureKey": "expenseManagement",
      "featureName": "Expense Management",
      "featurePermissions": []
    },
    {
      "featureId": 6,
      "featureKey": "calendarManagement",
      "featureName": "Calendar Management",
      "featurePermissions": []
    },
    {
      "featureId": 7,
      "featureKey": "settingsManagement",
      "featureName": "Settings Management",
      "featurePermissions": []
    },
    {
      "featureId": 8,
      "featureKey": "recruitmentManagement",
      "featureName": "Recruitment Management",
      "featurePermissions": []
    }
  ]
}
```

### Sample Payload (Update Multiple Fields)

```json
{
  "key": "hrm",
  "moduleName": "Human Resources Management Module",
  "value": "HRM Module",
  "moduleFeatures": [
    {
      "featureId": 1,
      "featureKey": "employeeManagement",
      "featureName": "Employee Management",
      "featurePermissions": []
    }
  ]
}
```

### cURL Examples

**Update by module key:**
```bash
curl -X PATCH http://localhost:8800/api/v1/modules/hr \
  -H "Content-Type: application/json" \
  -H "Authorization: YOUR_JWT_TOKEN" \
  -d '{
    "moduleFeatures": [
      {
        "featureId": 1,
        "featureKey": "employeeManagement",
        "featureName": "Employee Management",
        "featurePermissions": []
      },
      {
        "featureId": 8,
        "featureKey": "recruitmentManagement",
        "featureName": "Recruitment Management",
        "featurePermissions": []
      }
    ]
  }'
```

**Update by moduleId:**
```bash
curl -X PATCH http://localhost:8800/api/v1/modules/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: YOUR_JWT_TOKEN" \
  -d '{"moduleName": "Updated Module Name"}'
```

**Update by MongoDB _id:**
```bash
curl -X PATCH http://localhost:8800/api/v1/modules/69919cc0a452a416cb982a23 \
  -H "Content-Type: application/json" \
  -H "Authorization: YOUR_JWT_TOKEN" \
  -d '{"value": "New Value"}'
```

---

## Feature Object Structure

| Field               | Type   | Required | Description                          |
| ------------------- | ------ | -------- | ------------------------------------ |
| `featureId`         | number | no*      | Unique ID (auto-assigned if omitted) |
| `featureKey`        | string | yes      | Unique feature identifier            |
| `featureName`       | string | yes      | Display name of the feature          |
| `featurePermissions`| array  | no       | List of permission objects           |

### Permission Object Structure

| Field           | Type   | Required | Description                |
| --------------- | ------ | -------- | -------------------------- |
| `key`           | string | yes      | Permission identifier      |
| `name`          | string | yes      | Display name               |
| `permissionType`| string | yes      | e.g. `"read"`, `"write"`   |

---

## Response Examples

### Create (201)

```json
{
  "status": 201,
  "message": "Module created successfully",
  "data": {
    "moduleId": 1,
    "key": "hr",
    "moduleName": "Human Resources Management Module",
    "value": "HRM Module",
    "moduleFeatures": [...]
  }
}
```

### Update (200)

```json
{
  "status": 200,
  "message": "Module updated successfully",
  "data": {
    "moduleId": 1,
    "key": "hr",
    "moduleName": "Human Resources Management Module",
    "value": "HRM Module",
    "moduleFeatures": [...]
  }
}
```

---

## Company Logo Upload

**Endpoint:** `PATCH /api/v1/company/:id/logo`  
**Auth:** Required  
**Content-Type:** `multipart/form-data`

Upload an image file to add/update the company logo. The image is uploaded to Cloudinary and the URL is saved to `companyLogo`.

| Field         | Type | Required | Description                |
| ------------- | ---- | -------- | -------------------------- |
| `companyLogo` | file | yes      | Image file (PNG, JPG, etc.)|

**cURL Example:**
```bash
curl -X PATCH http://localhost:8800/api/v1/company/COMPANY_ID/logo \
  -H "Authorization: YOUR_JWT_TOKEN" \
  -F "companyLogo=@/path/to/logo.png"
```

**Response (200):**
```json
{
  "status": 200,
  "success": true,
  "message": "Company logo updated successfully",
  "data": {
    "companyLogo": "https://res.cloudinary.com/.../image/upload/..."
  }
}
```
