# New Features API Documentation

This document describes the newly implemented features: Notifications for Leave Flow, Announcements, Branches, and Help Support.

## Table of Contents
1. [Leave Notifications](#leave-notifications)
2. [Announcements API](#announcements-api)
3. [Branches API](#branches-api)
4. [Help Support API](#help-support-api)

---

## Leave Notifications

### Overview
Notifications are now automatically created and stored in the database whenever leave-related actions occur. This allows users to see notifications on their dashboard.

### Notification Events
1. **Leave Request Submitted**: 
   - Manager receives notification when employee submits leave request
   - Employee receives confirmation notification

2. **Leave Approved/Declined**:
   - Employee receives notification with approval/rejection status and decision message

### Database Model
Notifications are stored in the `Notification` model with the following fields:
- `notificationType`: Type of notification (e.g., "Leave Request", "Leave Approved")
- `notificationContent`: Detailed message content
- `recipientId`: User who should receive the notification
- `companyId` & `companyName`: Company context
- `created_by`: User who triggered the notification
- `read`: Boolean flag for read status

---

## Announcements API

### Overview
Administrators can create announcements that can be targeted to:
- All employees in the company
- Specific departments
- Individual employees

### Endpoints

#### 1. Create Announcement
**POST** `/announcements`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Company Meeting",
  "content": "All hands meeting on Friday at 3 PM",
  "announcementType": "all", // Options: "all", "department", "individual"
  "departments": ["Engineering", "Marketing"], // Required if announcementType is "department"
  "targetEmployees": ["employeeId1", "employeeId2"], // Required if announcementType is "individual"
  "priority": "high", // Options: "low", "medium", "high"
  "expiryDate": "2026-12-31T23:59:59Z", // Optional
  "attachments": [ // Optional
    {
      "url": "https://example.com/file.pdf",
      "fileName": "meeting-agenda.pdf"
    }
  ]
}
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "data": {
    "_id": "announcementId",
    "title": "Company Meeting",
    "content": "All hands meeting on Friday at 3 PM",
    "announcementType": "all",
    "companyId": "companyId",
    "companyName": "Company Name",
    "createdBy": "userId",
    "createdByName": "John Doe",
    "priority": "high",
    "isActive": true,
    "createdAt": "2026-02-05T12:00:00Z",
    "updatedAt": "2026-02-05T12:00:00Z"
  },
  "message": "Announcement created and sent to 50 recipient(s)"
}
```

#### 2. Get All Announcements
**GET** `/announcements?page=1&limit=10`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "data": [
    {
      "_id": "announcementId",
      "title": "Company Meeting",
      "content": "All hands meeting on Friday at 3 PM",
      "announcementType": "all",
      "priority": "high",
      "createdAt": "2026-02-05T12:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 48,
    "itemsPerPage": 10
  }
}
```

#### 3. Get Announcement by ID
**GET** `/announcements/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "data": {
    "_id": "announcementId",
    "title": "Company Meeting",
    "content": "All hands meeting on Friday at 3 PM",
    "announcementType": "all",
    "departments": [],
    "targetEmployees": [],
    "companyId": "companyId",
    "companyName": "Company Name",
    "createdBy": "userId",
    "createdByName": "John Doe",
    "priority": "high",
    "isActive": true,
    "expiryDate": null,
    "attachments": [],
    "createdAt": "2026-02-05T12:00:00Z",
    "updatedAt": "2026-02-05T12:00:00Z"
  }
}
```

#### 4. Update Announcement
**PATCH** `/announcements/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "priority": "medium",
  "isActive": true
}
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "data": { /* updated announcement */ },
  "message": "Announcement updated successfully"
}
```

#### 5. Delete Announcement
**DELETE** `/announcements/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "message": "Announcement deleted successfully"
}
```

---

## Branches API

### Overview
Companies can create and manage multiple branches. Each branch can have:
- Branch details (name, code, address, contact info)
- Branch manager
- Assigned employees
- Departments

### Endpoints

#### 1. Create Branch
**POST** `/branches`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "branchName": "New York Office",
  "branchCode": "NYC-001",
  "branchAddress": {
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001"
  },
  "contactInfo": {
    "phone": "+1-234-567-8900",
    "email": "nyc@company.com",
    "fax": "+1-234-567-8901"
  },
  "branchManager": {
    "managerId": "managerId123",
    "managerName": "Jane Smith"
  },
  "departments": ["Sales", "Marketing"],
  "isHeadOffice": false
}
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "data": {
    "_id": "branchId",
    "branchName": "New York Office",
    "branchCode": "NYC-001",
    "branchAddress": { /* address object */ },
    "contactInfo": { /* contact object */ },
    "companyId": "companyId",
    "companyName": "Company Name",
    "branchManager": { /* manager object */ },
    "employees": [],
    "departments": ["Sales", "Marketing"],
    "isActive": true,
    "isHeadOffice": false,
    "createdBy": "userId",
    "createdAt": "2026-02-05T12:00:00Z",
    "updatedAt": "2026-02-05T12:00:00Z"
  },
  "message": "Branch created successfully"
}
```

#### 2. Get All Branches
**GET** `/branches?page=1&limit=10&isActive=true`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "data": [
    {
      "_id": "branchId",
      "branchName": "New York Office",
      "branchCode": "NYC-001",
      "isActive": true,
      "isHeadOffice": false,
      "createdAt": "2026-02-05T12:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15,
    "itemsPerPage": 10
  }
}
```

#### 3. Get Branch by ID
**GET** `/branches/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "data": { /* complete branch object */ }
}
```

#### 4. Update Branch
**PATCH** `/branches/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (All fields optional)
```json
{
  "branchName": "Updated Name",
  "contactInfo": {
    "phone": "+1-234-567-8999"
  },
  "isActive": true
}
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "data": { /* updated branch */ },
  "message": "Branch updated successfully"
}
```

#### 5. Delete Branch
**DELETE** `/branches/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "message": "Branch deleted successfully"
}
```

#### 6. Add Employee to Branch
**POST** `/branches/:branchId/employees`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "employeeId": "employeeId123"
}
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "data": { /* updated branch with employee added */ },
  "message": "Employee added to branch successfully"
}
```

#### 7. Remove Employee from Branch
**DELETE** `/branches/:branchId/employees/:employeeId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "data": { /* updated branch */ },
  "message": "Employee removed from branch successfully"
}
```

---

## Help Support API

### Overview
A ticketing system for users to request help and support. Features include:
- Ticket creation and management
- Status tracking (open, in_progress, pending, resolved, closed)
- Priority levels
- Message threads
- File attachments
- Assignment to support agents

### Endpoints

#### 1. Create Support Ticket
**POST** `/support-tickets`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "subject": "Cannot access payroll module",
  "description": "I'm getting an error when trying to view the payroll section. The page just shows a loading spinner.",
  "category": "technical", // Options: "technical", "account", "billing", "general", "feature_request", "bug_report"
  "priority": "high", // Options: "low", "medium", "high", "urgent"
  "attachments": [ // Optional
    {
      "url": "https://example.com/screenshot.png",
      "fileName": "error-screenshot.png"
    }
  ]
}
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "data": {
    "_id": "ticketId",
    "ticketNumber": "TKT-1738765200000-00001",
    "subject": "Cannot access payroll module",
    "description": "I'm getting an error...",
    "category": "technical",
    "priority": "high",
    "status": "open",
    "submittedBy": {
      "userId": "userId",
      "userName": "John Doe",
      "userEmail": "john@company.com"
    },
    "companyId": "companyId",
    "companyName": "Company Name",
    "messages": [],
    "createdAt": "2026-02-05T12:00:00Z",
    "updatedAt": "2026-02-05T12:00:00Z"
  },
  "message": "Support ticket created successfully"
}
```

#### 2. Get All Tickets
**GET** `/support-tickets?page=1&limit=10&status=open&category=technical`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (optional)
- `category`: Filter by category (optional)

**Response:**
```json
{
  "status": 200,
  "success": true,
  "data": [
    {
      "_id": "ticketId",
      "ticketNumber": "TKT-1738765200000-00001",
      "subject": "Cannot access payroll module",
      "category": "technical",
      "priority": "high",
      "status": "open",
      "submittedBy": {
        "userName": "John Doe"
      },
      "createdAt": "2026-02-05T12:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10
  }
}
```

#### 3. Get Ticket by ID
**GET** `/support-tickets/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "data": {
    "_id": "ticketId",
    "ticketNumber": "TKT-1738765200000-00001",
    "subject": "Cannot access payroll module",
    "description": "I'm getting an error...",
    "category": "technical",
    "priority": "high",
    "status": "in_progress",
    "submittedBy": { /* user object */ },
    "assignedTo": {
      "supportAgentId": "agentId",
      "supportAgentName": "Support Agent"
    },
    "messages": [
      {
        "senderId": "userId",
        "senderName": "John Doe",
        "senderType": "user",
        "message": "I tried clearing my cache but it didn't help",
        "timestamp": "2026-02-05T12:30:00Z",
        "attachments": []
      }
    ],
    "attachments": [],
    "resolution": null,
    "createdAt": "2026-02-05T12:00:00Z",
    "updatedAt": "2026-02-05T12:30:00Z",
    "lastUpdated": "2026-02-05T12:30:00Z"
  }
}
```

#### 4. Update Ticket
**PATCH** `/support-tickets/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (All fields optional)
```json
{
  "status": "resolved",
  "priority": "medium",
  "assignedTo": {
    "supportAgentId": "agentId",
    "supportAgentName": "Jane Smith"
  },
  "resolution": {
    "resolvedBy": "agentId",
    "resolvedByName": "Jane Smith",
    "resolutionNote": "Issue was caused by browser cache. Cleared cache and it's working now."
  }
}
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "data": { /* updated ticket */ },
  "message": "Ticket updated successfully"
}
```

#### 5. Add Message to Ticket
**POST** `/support-tickets/:id/messages`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "message": "Thank you for your help! It's working now.",
  "attachments": [ // Optional
    {
      "url": "https://example.com/screenshot.png",
      "fileName": "working-screenshot.png"
    }
  ]
}
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "data": { /* updated ticket with new message */ },
  "message": "Message added successfully"
}
```

#### 6. Delete/Close Ticket
**DELETE** `/support-tickets/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "message": "Ticket closed successfully"
}
```

---

## Database Models

### Announcement Model
```javascript
{
  title: String (required),
  content: String (required),
  announcementType: String (enum: 'all', 'department', 'individual'),
  departments: [String],
  targetEmployees: [String],
  companyId: String (required),
  companyName: String (required),
  createdBy: String (required),
  createdByName: String,
  priority: String (enum: 'low', 'medium', 'high'),
  isActive: Boolean,
  expiryDate: Date,
  attachments: [{url: String, fileName: String}],
  timestamps: true
}
```

### Branch Model
```javascript
{
  branchName: String (required),
  branchCode: String (required, unique),
  branchAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  contactInfo: {
    phone: String,
    email: String,
    fax: String
  },
  companyId: String (required),
  companyName: String (required),
  branchManager: {
    managerId: String,
    managerName: String
  },
  employees: [{
    employeeId: String,
    employeeName: String
  }],
  departments: [String],
  isActive: Boolean,
  isHeadOffice: Boolean,
  createdBy: String (required),
  timestamps: true
}
```

### HelpSupport Model
```javascript
{
  ticketNumber: String (unique, auto-generated),
  subject: String (required),
  description: String (required),
  category: String (enum: 'technical', 'account', 'billing', 'general', 'feature_request', 'bug_report'),
  priority: String (enum: 'low', 'medium', 'high', 'urgent'),
  status: String (enum: 'open', 'in_progress', 'pending', 'resolved', 'closed'),
  submittedBy: {
    userId: String (required),
    userName: String (required),
    userEmail: String (required)
  },
  companyId: String (required),
  companyName: String (required),
  assignedTo: {
    supportAgentId: String,
    supportAgentName: String
  },
  attachments: [{url: String, fileName: String, uploadedAt: Date}],
  messages: [{
    senderId: String,
    senderName: String,
    senderType: String (enum: 'user', 'support_agent', 'admin'),
    message: String,
    timestamp: Date,
    attachments: [{url: String, fileName: String}]
  }],
  resolution: {
    resolvedBy: String,
    resolvedByName: String,
    resolutionDate: Date,
    resolutionNote: String
  },
  lastUpdated: Date,
  timestamps: true
}
```

---

## Additional Notes

### Permissions
- All endpoints require authentication via Bearer token
- Admin users can access all company data
- Regular employees see only relevant data filtered by their department/role

### Notifications
- Notifications are automatically created for:
  - New announcements (sent to all targeted recipients)
  - Leave requests and approvals
  - Support ticket status updates
  - Support ticket new messages

### File Attachments
- The API currently expects attachment URLs and file names
- Integration with your existing file upload system (Cloudinary/S3) is recommended
- Use the existing upload endpoints to upload files first, then include the URLs in requests

### Error Responses
All endpoints follow a consistent error format:
```json
{
  "status": 400,
  "success": false,
  "error": "Error message here"
}
```

Common status codes:
- 200: Success
- 400: Bad request (validation error)
- 401: Unauthorized
- 404: Not found
- 500: Server error
