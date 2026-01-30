# Roles and Permissions API Documentation

## Overview

This document provides comprehensive documentation for the Roles and Permissions system in the ACEALL ERP application. The system supports two approaches:

1. **Legacy System** - Using nested permission objects
2. **Modular System** - Using module-based permissions with rolePermissions array

---

## Database Models

### 1. Role Model (`model/Role.js`)
```javascript
{
  roleName: String,
  companyId: String,
  companyName: String,
  permissions: {
    employeeManagement: {
      views: {
        view_employee: Boolean,
        view_employee_details: Boolean
      },
      actions: {
        add_employee: Boolean,
        edit_employee: Boolean,
        delete_employee: Boolean
      }
    },
    leaveManagement: { /* similar structure */ },
    designationManagement: { /* similar structure */ },
    departmentManagement: { /* similar structure */ },
    appraisalManagement: { /* similar structure */ },
    expenseManagement: { /* similar structure */ }
  }
}
```

### 2. Roles Model (`model/Roles.js`)
```javascript
{
  companyId: String,
  roleName: String,
  description: String,
  rolePermissions: [{
    moduleId: String,
    featureId: String,
    permissionType: String,
    permissionKey: String,
    permissionValue: Boolean
  }]
}
```

### 3. Modules Model (`model/Modules.js`)
```javascript
{
  modules: [{
    moduleId: Number,
    key: String,
    moduleName: String,
    value: String,
    moduleFeatures: [{
      featureId: Number,
      featureKey: String,
      featureName: String,
      featurePermissions: [{
        key: String,
        name: String,
        permissionType: String
      }]
    }]
  }]
}
```

### 4. Employee Model (roles field)
```javascript
{
  roles: [{
    roleName: String,
    companyId: String,
    companyName: String,
    description: String,
    rolePermissions: [{
      moduleId: String,
      featureId: String,
      permissionType: String,
      permissionKey: String,
      permissionValue: Boolean
    }]
  }]
}
```

---

## API Endpoints

### 1. Create Role (Legacy System)

**Endpoint:** `POST /createRole`

**Auth Required:** ✅ Yes (Bearer Token)

**Controller:** `controller/RolesandPermissions/createRole.js`

**Request Payload:**
```json
{
  "roleName": "Manager",
  "permissions": [
    {
      "employeeManagement": {
        "views": {
          "view_employee": true,
          "view_employee_details": true
        },
        "actions": {
          "add_employee": true,
          "edit_employee": false,
          "delete_employee": false
        }
      },
      "leaveManagement": {
        "views": {
          "view_leaves": true,
          "view_leave_details": true,
          "view_leave_applications": true
        },
        "actions": {
          "create_leaves": false,
          "edit_leave_applications": true,
          "delete_leave_applications": false
        }
      }
    }
  ]
}
```

**Success Response (201):**
```json
{
  "status": 201,
  "success": true,
  "data": {
    "_id": "64f9a1b2c3d4e5f6g7h8i9j0",
    "roleName": "Manager",
    "companyId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "companyName": "ABC Corp",
    "permissions": [
      {
        "employeeManagement": {
          "views": {
            "view_employee": true,
            "view_employee_details": true
          },
          "actions": {
            "add_employee": true,
            "edit_employee": false,
            "delete_employee": false
          }
        },
        "leaveManagement": {
          "views": {
            "view_leaves": true,
            "view_leave_details": true,
            "view_leave_applications": true
          },
          "actions": {
            "create_leaves": false,
            "edit_leave_applications": true,
            "delete_leave_applications": false
          }
        }
      }
    ],
    "createdAt": "2024-10-31T12:00:00.000Z",
    "updatedAt": "2024-10-31T12:00:00.000Z"
  }
}
```

**Error Responses:**

**400 - Role Already Exists:**
```json
{
  "status": 400,
  "error": "This role Name already exists"
}
```

**400 - Invalid Permissions Format:**
```json
{
  "status": 400,
  "error": "Permissions must be an array"
}
```

**500 - Server Error:**
```json
{
  "status": 500,
  "success": false,
  "error": "Error message"
}
```

---

### 2. Create Role (Modular System)

**Endpoint:** `POST /createRole`

**Auth Required:** ✅ Yes (Bearer Token)

**Controller:** `controller/AceERP/Auth/roles.js`

**Request Payload:**
```json
{
  "roleName": "Department Head",
  "description": "Head of department with specific module access",
  "modules": [
    "64f9a1b2c3d4e5f6g7h8i9j0",
    "64f9a1b2c3d4e5f6g7h8i9j1"
  ],
  "companyId": "64a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Success Response (200):**
```json
{
  "status": 200,
  "message": "Role created successfully for the specified company",
  "data": {
    "_id": "64f9a1b2c3d4e5f6g7h8i9j2",
    "roleName": "Department Head",
    "description": "Head of department with specific module access",
    "companyId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "rolePermissions": [
      {
        "moduleId": "64f9a1b2c3d4e5f6g7h8i9j0",
        "featureId": "64f9a1b2c3d4e5f6g7h8i9j3",
        "permissionKey": "view_employees",
        "permissionType": "view",
        "permissionValue": false
      },
      {
        "moduleId": "64f9a1b2c3d4e5f6g7h8i9j0",
        "featureId": "64f9a1b2c3d4e5f6g7h8i9j4",
        "permissionKey": "create_employee",
        "permissionType": "action",
        "permissionValue": false
      }
    ],
    "createdAt": "2024-10-31T12:00:00.000Z",
    "updatedAt": "2024-10-31T12:00:00.000Z"
  }
}
```

**Error Responses:**

**400 - Missing Required Fields:**
```json
{
  "status": 400,
  "error": "Please provide roleName, modules array, and companyId"
}
```

**400 - Role Already Exists:**
```json
{
  "status": 400,
  "error": "Role name already exists in the specified company"
}
```

**500 - Server Error:**
```json
{
  "status": 500,
  "error": "Error message"
}
```

---

### 3. Assign Role to Employee

**Endpoint:** `PATCH /assignRole`

**Auth Required:** ✅ Yes (Bearer Token)

**Controller:** `controller/RolesandPermissions/assignRole.js`

**Request Payload:**
```json
{
  "employeeId": "64f9a1b2c3d4e5f6g7h8i9j5",
  "roleId": "64f9a1b2c3d4e5f6g7h8i9j2"
}
```

**Success Response (200):**
```json
{
  "status": 200,
  "success": true,
  "message": "Role assigned successfully",
  "data": {
    "_id": "64f9a1b2c3d4e5f6g7h8i9j5",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "companyId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "role": "64f9a1b2c3d4e5f6g7h8i9j2",
    "roleName": "Department Head",
    "permissions": {
      "employeeManagement": {
        "views": {
          "view_employee": true
        },
        "actions": {
          "add_employee": true
        }
      }
    }
  }
}
```

**Error Responses:**

**400 - Missing Required Fields:**
```json
{
  "status": 400,
  "error": "Employee ID and Role ID are required"
}
```

**403 - Unauthorized:**
```json
{
  "status": 403,
  "error": "Unauthorized: Employee does not belong to your company"
}
```

**404 - Role Not Found:**
```json
{
  "status": 404,
  "error": "Role not found"
}
```

**404 - Employee Not Found:**
```json
{
  "status": 404,
  "error": "Employee not found"
}
```

**500 - Server Error:**
```json
{
  "status": 500,
  "success": false,
  "error": "Error message"
}
```

---

### 4. Update Role and Permissions

**Endpoint:** `PUT /updateRole`

**Auth Required:** ✅ Yes (Bearer Token)

**Controller:** `controller/RolesandPermissions/updateRoleandPermissions.js`

**Request Payload:**
```json
{
  "roleId": "64f9a1b2c3d4e5f6g7h8i9j2",
  "roleName": "Senior Manager",
  "permissions": [
    {
      "employeeManagement": {
        "views": {
          "view_employee": true,
          "view_employee_details": true
        },
        "actions": {
          "add_employee": true,
          "edit_employee": true,
          "delete_employee": true
        }
      },
      "leaveManagement": {
        "views": {
          "view_leaves": true,
          "view_leave_details": true
        },
        "actions": {
          "create_leaves": true,
          "edit_leave_applications": true
        }
      }
    }
  ]
}
```

**Success Response (200):**
```json
{
  "status": 200,
  "success": true,
  "message": "Role and permissions updated successfully",
  "data": {
    "updatedRole": {
      "_id": "64f9a1b2c3d4e5f6g7h8i9j2",
      "roleName": "Senior Manager",
      "companyId": "64a1b2c3d4e5f6g7h8i9j0k1",
      "permissions": [
        {
          "employeeManagement": {
            "views": {
              "view_employee": true,
              "view_employee_details": true
            },
            "actions": {
              "add_employee": true,
              "edit_employee": true,
              "delete_employee": true
            }
          },
          "leaveManagement": {
            "views": {
              "view_leaves": true,
              "view_leave_details": true
            },
            "actions": {
              "create_leaves": true,
              "edit_leave_applications": true
            }
          }
        }
      ]
    },
    "affectedEmployees": 5
  }
}
```

**Error Responses:**

**400 - Invalid Input:**
```json
{
  "status": 400,
  "error": "Role ID and permissions array are required"
}
```

**404 - Role Not Found:**
```json
{
  "status": 404,
  "error": "Role not found or unauthorized"
}
```

**500 - Server Error:**
```json
{
  "status": 500,
  "success": false,
  "error": "Error message"
}
```

**Note:** This endpoint also updates all employees with this role unless they have custom permissions.

---

### 5. Update Employee Permissions (Custom)

**Endpoint:** `PUT /update-permissions`

**Auth Required:** ✅ Yes (Bearer Token)

**Controller:** `controller/RolesandPermissions/updateEmployeePermission.js`

**Request Payload:**
```json
{
  "employeeId": "64f9a1b2c3d4e5f6g7h8i9j5",
  "permissions": [
    {
      "employeeManagement": {
        "views": {
          "view_employee": true,
          "view_employee_details": true
        },
        "actions": {
          "add_employee": false,
          "edit_employee": true,
          "delete_employee": false
        }
      },
      "leaveManagement": {
        "views": {
          "view_leaves": true
        },
        "actions": {
          "create_leaves": false
        }
      }
    }
  ]
}
```

**Success Response (200):**
```json
{
  "status": 200,
  "success": true,
  "message": "Employee permissions updated successfully",
  "data": {
    "_id": "64f9a1b2c3d4e5f6g7h8i9j5",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "roleName": "Department Head",
    "permissions": [
      {
        "employeeManagement": {
          "views": {
            "view_employee": true,
            "view_employee_details": true
          },
          "actions": {
            "add_employee": false,
            "edit_employee": true,
            "delete_employee": false
          }
        },
        "leaveManagement": {
          "views": {
            "view_leaves": true
          },
          "actions": {
            "create_leaves": false
          }
        }
      }
    ],
    "hasCustomPermissions": true
  }
}
```

**Error Responses:**

**400 - Invalid Input:**
```json
{
  "status": 400,
  "error": "Employee ID and permissions array are required"
}
```

**404 - Employee Not Found:**
```json
{
  "status": 404,
  "error": "Employee not found or unauthorized"
}
```

**500 - Server Error:**
```json
{
  "status": 500,
  "success": false,
  "error": "Error message"
}
```

**Note:** Setting `hasCustomPermissions: true` prevents automatic role permission updates from affecting this employee.

---

### 6. Fetch Roles (Legacy System)

**Endpoint:** `GET /fetchRoles?page=1&limit=10`

**Auth Required:** ✅ Yes (Bearer Token)

**Controller:** `controller/systemRoles.js/fetchRoles.js`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)

**Success Response (201):**
```json
{
  "status": 201,
  "success": true,
  "data": [
    {
      "_id": "64f9a1b2c3d4e5f6g7h8i9j2",
      "roleName": "Manager",
      "companyId": "64a1b2c3d4e5f6g7h8i9j0k1",
      "description": "Manager role with specific permissions",
      "rolePermissions": [
        {
          "moduleId": "64f9a1b2c3d4e5f6g7h8i9j0",
          "featureId": "64f9a1b2c3d4e5f6g7h8i9j3",
          "permissionKey": "view_employees",
          "permissionType": "view",
          "permissionValue": true
        },
        {
          "moduleId": "64f9a1b2c3d4e5f6g7h8i9j0",
          "featureId": "64f9a1b2c3d4e5f6g7h8i9j4",
          "permissionKey": "create_employee",
          "permissionType": "action",
          "permissionValue": true
        }
      ],
      "createdAt": "2024-10-31T12:00:00.000Z",
      "updatedAt": "2024-10-31T12:00:00.000Z"
    }
  ],
  "totalPages": 3,
  "currentPage": "1"
}
```

**Error Responses:**

**404 - No Roles Found:**
```json
{
  "status": 404,
  "success": false,
  "error": "No Role Found"
}
```

**500 - Server Error:**
```json
{
  "status": 500,
  "success": false,
  "error": "Error message"
}
```

---

### 7. Fetch Admin Roles (With Module Sync)

**Endpoint:** `GET /roles`

**Auth Required:** ✅ Yes (Bearer Token)

**Controller:** `controller/AceERP/Auth/fetchRoles.js`

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f9a1b2c3d4e5f6g7h8i9j2",
      "roleName": "Super Admin",
      "companyId": "64a1b2c3d4e5f6g7h8i9j0k1",
      "companyName": "ABC Corp",
      "description": "Full system access",
      "rolePermissions": [
        {
          "_id": "64f9a1b2c3d4e5f6g7h8i9j6",
          "moduleId": "64f9a1b2c3d4e5f6g7h8i9j0",
          "featureId": "64f9a1b2c3d4e5f6g7h8i9j3",
          "permissionKey": "view_employees",
          "permissionType": "view",
          "permissionValue": true
        },
        {
          "_id": "64f9a1b2c3d4e5f6g7h8i9j7",
          "moduleId": "64f9a1b2c3d4e5f6g7h8i9j0",
          "featureId": "64f9a1b2c3d4e5f6g7h8i9j4",
          "permissionKey": "create_employee",
          "permissionType": "action",
          "permissionValue": true
        }
      ],
      "createdAt": "2024-10-31T12:00:00.000Z",
      "updatedAt": "2024-10-31T12:00:00.000Z"
    }
  ]
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Failed to fetch roles",
  "error": "Error message"
}
```

**Note:** This endpoint automatically syncs roles with current module permissions, adding missing permissions and removing obsolete ones.

---

### 8. Delete Role

**Endpoint:** `DELETE /deleteRole/:id`

**Auth Required:** ✅ Yes (Bearer Token)

**Controller:** `controller/RolesandPermissions/deleteRole.js`

**URL Parameters:**
- `id` (required): Role ID to delete

**Success Response (200):**
```json
{
  "status": 200,
  "success": true,
  "data": "Role Deleted successfully!"
}
```

**Error Responses:**

**404 - Role Not Found:**
```json
{
  "status": 404,
  "success": false,
  "error": "No role Found"
}
```

**401 - Deletion Failed:**
```json
{
  "status": 401,
  "success": false,
  "error": "Error message"
}
```

**500 - Server Error:**
```json
{
  "status": 500,
  "success": false,
  "error": "Error message"
}
```

---

### 9. Create Permissions

**Endpoint:** `POST /createPermissions`

**Auth Required:** ✅ Yes (Bearer Token)

**Controller:** `controller/systemRoles.js/createPermissions.js`

**Request Payload:**
```json
{
  "permissions": {
    "employeeManagement": {
      "views": {
        "view_employee": true,
        "view_employee_details": false
      },
      "actions": {
        "add_employee": true,
        "edit_employee": false,
        "delete_employee": false
      }
    },
    "leaveManagement": {
      "views": {
        "view_leaves": true,
        "view_leave_details": true
      },
      "actions": {
        "create_leaves": false,
        "edit_leave_applications": true
      }
    }
  }
}
```

**Success Response (200):**
```json
{
  "status": 200,
  "success": true,
  "data": {
    "_id": "64f9a1b2c3d4e5f6g7h8i9j8",
    "permissions": {
      "employeeManagement": {
        "views": {
          "view_employee": true,
          "view_employee_details": false
        },
        "actions": {
          "add_employee": true,
          "edit_employee": false,
          "delete_employee": false
        }
      },
      "leaveManagement": {
        "views": {
          "view_leaves": true,
          "view_leave_details": true
        },
        "actions": {
          "create_leaves": false,
          "edit_leave_applications": true
        }
      }
    },
    "created_by": "64a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2024-10-31T12:00:00.000Z",
    "updatedAt": "2024-10-31T12:00:00.000Z"
  }
}
```

**Error Response (500):**
```json
{
  "status": 500,
  "success": false,
  "error": "Error message"
}
```

---

### 10. Fetch Permissions

**Endpoint:** `GET /fetchPermissions?page=1&limit=10`

**Auth Required:** ✅ Yes (Bearer Token)

**Controller:** `controller/systemRoles.js/fetchPermissions.js`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)

**Success Response (201):**
```json
{
  "status": 201,
  "success": true,
  "data": [
    {
      "_id": "64f9a1b2c3d4e5f6g7h8i9j8",
      "permissions": {
        "employeeManagement": {
          "views": {
            "view_employee": true,
            "view_employee_details": false
          },
          "actions": {
            "add_employee": true,
            "edit_employee": false,
            "delete_employee": false
          }
        },
        "leaveManagement": {
          "views": {
            "view_leaves": true,
            "view_leave_details": true,
            "view_leave_applications": true
          },
          "actions": {
            "create_leaves": false,
            "edit_leave_applications": true,
            "delete_leave_applications": false
          }
        }
      },
      "created_by": "64a1b2c3d4e5f6g7h8i9j0k1",
      "createdAt": "2024-10-31T12:00:00.000Z",
      "updatedAt": "2024-10-31T12:00:00.000Z"
    }
  ],
  "totalPages": 2,
  "currentPage": "1"
}
```

**Error Responses:**

**404 - No Permissions Found:**
```json
{
  "status": 404,
  "success": false,
  "error": "No Role Found"
}
```

**500 - Server Error:**
```json
{
  "status": 500,
  "success": false,
  "error": "Error message"
}
```

---

## Permission Categories

The system supports the following permission modules:

### 1. Employee Management

**Views:**
- `view_employee` - View employee list
- `view_employee_details` - View employee details

**Actions:**
- `add_employee` - Create new employees
- `edit_employee` - Update employee information
- `delete_employee` - Remove employees

---

### 2. Leave Management

**Views:**
- `view_leave_types` - View leave types
- `view_leaves_types_details` - View leave type details
- `view_leaves` - View leave records
- `view_leave_details` - View leave details
- `view_leave_applications` - View leave applications

**Actions:**
- `create_leave_types` - Create new leave types
- `create_leaves` - Create leave records
- `edit_leave_types` - Update leave types
- `edit_leave_applications` - Approve/reject leave applications
- `delete_leave_applications` - Delete leave applications

---

### 3. Designation Management

**Views:**
- `view_designations` - View designation list
- `view_designations_details` - View designation details

**Actions:**
- `create_designations` - Create new designations
- `assign_designations` - Assign designations to employees
- `edit_designations` - Update designations
- `delete_designations` - Remove designations

---

### 4. Department Management

**Views:**
- `view_departments` - View department list
- `view_department_details` - View department details

**Actions:**
- `create_departments` - Create new departments
- `assign_departments` - Assign employees to departments
- `edit_departments` - Update department information
- `delete_departments` - Remove departments

---

### 5. Appraisal Management

**Views:**
- `view_appraisal_groups` - View appraisal groups
- `view_KPIs` - View Key Performance Indicators
- `view_appraisal_period` - View appraisal periods
- `view_appraisal_ratings` - View appraisal ratings
- `view_appraisals` - View appraisals

**Actions:**
- `create_appraisal_groups` - Create appraisal groups
- `edit_appraisal_groups` - Update appraisal groups
- `delete_appraisal_groups` - Remove appraisal groups
- `create_appraisal_periods` - Create appraisal periods
- `edit_appraisal_periods` - Update appraisal periods
- `delete_appraisal_periods` - Remove appraisal periods
- `create_appraisal_ratings` - Create rating scales
- `edit_appraisal_ratings` - Update rating scales
- `delete_appraisal_ratings` - Remove rating scales
- `create_appraisals` - Create appraisals
- `edit_appraisals` - Update appraisals
- `delete_appraisals` - Remove appraisals
- `create_KPIs` - Create KPIs
- `edit_KPIs` - Update KPIs
- `delete_KPIs` - Remove KPIs

---

### 6. Expense Management

**Views:**
- `view_expense_types` - View expense types
- `view_expense_requests` - View expense requests
- `view_expense_details` - View expense details

**Actions:**
- `create_expense_types` - Create new expense types
- `create_expense_request` - Submit expense requests
- `edit_expense_types` - Update expense types
- `edit_expenses` - Update expense records
- `delete_expense_types` - Remove expense types

---

## Key Features

### 1. Role-Based Access Control (RBAC)
- Employees inherit permissions from their assigned roles
- Centralized permission management through roles

### 2. Custom Employee Permissions
- Individual employees can have custom permissions that override role defaults
- Marked with `hasCustomPermissions: true` flag
- Prevents automatic role permission updates from affecting custom permissions

### 3. Module-Based System
- Permissions organized by functional modules (Employee, Leave, Appraisal, etc.)
- Modular structure allows easy extension and management

### 4. Company-Specific Roles
- All roles are scoped to specific companies
- Role names must be unique within a company
- Multi-tenant support

### 5. Dynamic Permission Updates
- Updating a role automatically updates all employees with that role
- Employees with custom permissions are excluded from automatic updates
- Provides count of affected employees in update response

### 6. Default Roles Support
- System supports predefined default roles:
  - **Super Admin** - Full system access
  - **Manager** - Management-level access
  - **Staff** - Standard employee access
  - **External** - Limited external access

### 7. Permission Sync
- The `/roles` endpoint automatically syncs role permissions with current module definitions
- Adds missing permissions from new modules/features
- Removes obsolete permissions no longer defined in modules

---

## Authentication

All endpoints require authentication via Bearer Token in the Authorization header:

```
Authorization: Bearer <token>
```

The token should contain:
- `id` - Company ID
- `email` - User email
- Other user/company metadata

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "status": <HTTP_STATUS_CODE>,
  "success": false,
  "error": "Error message"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Best Practices

1. **Role Creation:**
   - Use descriptive role names
   - Start with minimal permissions and add as needed
   - Follow principle of least privilege

2. **Permission Updates:**
   - Test role permission changes in development first
   - Be aware that role updates affect all assigned employees (unless custom permissions)
   - Review affected employee count before confirming updates

3. **Custom Permissions:**
   - Use sparingly for specific exceptions
   - Document why custom permissions were needed
   - Consider creating a new role instead if multiple employees need similar custom permissions

4. **Security:**
   - Never expose role/permission endpoints without authentication
   - Validate company ownership before allowing role modifications
   - Audit role and permission changes regularly

---

## Changelog

### Version 1.0.0
- Initial documentation
- Legacy and Modular system endpoints documented
- Permission categories defined
- Error handling standardized

---

## Support

For issues or questions regarding the Roles and Permissions API, please contact the development team or refer to the main project documentation.


