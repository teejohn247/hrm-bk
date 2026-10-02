# Makers ERP - Complete API & Integration Guide
## Signup, Onboarding & General Settings Implementation

This guide provides end-to-end documentation for the **9 core user screens** across Authentication, Onboarding, and General Settings:
1. **Create Your Account** (`/signup`)
2. **Verify Your Email** (`/verify`)
3. **Set Your Password** (`/set-password`)
4. **Welcome & Workspace Setup** (`/onboarding` Step 1)
5. **Choose Your Modules** (`/onboarding` Step 2)
6. **Invite Employees** (`/onboarding` Step 3)
7. **Account Information Settings** (`/app/settings/general-settings/account-info`)
8. **Modules, Roles & Permissions Settings** (`/app/settings/general-settings/roles-permissions`)
9. **Billing & Subscriptions Settings** (`/app/settings/general-settings/subscription/history`)

---

## 🧭 Flow Architecture

```
[1. /signup]  ──> POST /signUp               ──> [2. /verify]
[2. /verify]  ──> POST /verify-otp            ──> [3. /set-password]
[3. /set-pw]  ──> POST /setPassword           ──> [4. /onboarding - Profile]
[4. Profile]  ──> POST /onboarding/workspace  ──> [5. /onboarding - Modules]
[5. Modules]  ──> POST /onboarding/modules    ──> [6. /onboarding - Invite]
[6. Invite]   ──> POST /onboarding/invite-employees OR /skip-invite ──> [Dashboard Ready]

General Settings (Authenticated / Settings Drawer):
├─ [7. Account Information]     ──> GET & PATCH /company/account-info
├─ [8. Roles & Permissions]     ──> GET & PATCH /company/roles-permissions & POST /company/roles
└─ [9. Billing & Subscriptions] ──> GET /company/billing-subscriptions & POST /subscriptions/cancel
```

---

## 📱 Section 1: Signup & Initial Onboarding Flow

### Screen 1: Create Your Account (`/signup`)
* **Purpose**: User registers with Account Type (`Company`), Company Name, and Work Email. Validates email uniqueness, creates an OTP record (10-minute expiry), and dispatches the 6-digit code via email.
* **HTTP Method**: `POST`
* **Route**: `/api/v1/signUp` *(alias: `/api/v1/auth/signup`)*
* **Auth Required**: None (Public)

#### Request Body
```json
{
  "accountType": "Company",
  "companyName": "Globex Corp",
  "email": "admin@globex.com"
}
```

#### Response (`200 OK`)
```json
{
  "status": 200,
  "success": true,
  "message": "A 6-digit verification code has been sent to admin@globex.com",
  "data": {
    "email": "admin@globex.com",
    "companyName": "Globex Corp",
    "accountType": "Company"
  }
}
```

---

### Screen 2: Verify Your Email (`/verify`)

#### 2A. Submit 6-Digit OTP Code
* **Purpose**: Validates the 6-digit code. Returns a temporary `token` for password setup.
* **HTTP Method**: `POST`
* **Route**: `/api/v1/verify-otp` *(alias: `/api/v1/verifyOtp`)*
* **Auth Required**: None (Public)

##### Request Body
```json
{
  "email": "admin@globex.com",
  "otp": "492817"
}
```
*(Accepts `"otp"` or `"code"`)*

##### Response (`200 OK`)
```json
{
  "status": 200,
  "success": true,
  "message": "Email verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "email": "admin@globex.com",
    "companyName": "Globex Corp",
    "accountType": "Company",
    "isVerified": true
  }
}
```

#### 2B. Resend OTP Code
* **Purpose**: User clicks "Resend OTP" if the timer expires.
* **HTTP Method**: `POST`
* **Route**: `/api/v1/resend-otp` *(alias: `/api/v1/resendOtp`)*
* **Auth Required**: None (Public)

##### Request Body
```json
{
  "email": "admin@globex.com"
}
```

##### Response (`200 OK`)
```json
{
  "status": 200,
  "success": true,
  "message": "A new 6-digit verification code has been sent to admin@globex.com"
}
```

---

### Screen 3: Set Your Password (`/set-password`)
* **Purpose**: Creates the secure bcrypt hash for the password, creates/updates the Company record in MongoDB, creates default appraisal groups, and returns the full authentication JWT.
* **HTTP Method**: `POST`
* **Route**: `/api/v1/setPassword` *(alias: `/api/v1/set-password`)*
* **Auth Required**: None (Pass verification token in body or header)

#### Request Body
```json
{
  "email": "admin@globex.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (`200 OK`)
```json
{
  "status": 200,
  "success": true,
  "message": "Password set successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "673f8a12bc4e5f9810a44d11",
    "companyName": "Globex Corp",
    "email": "admin@globex.com",
    "accountType": "Company",
    "firstTimeLogin": true,
    "onboardingStep": 1,
    "onboardingCompleted": false,
    "activeStatus": true,
    "status": true
  }
}
```

---

### Screen 4: Welcome & Workspace Setup (`/onboarding` Step 1)

#### 4A. Dropdown Options
1. **Industry List**:
   * **Route**: `GET /api/v1/onboarding/industries` *(or `/api/v1/pull-industry`)*
   * **Response (`200 OK`)**:
     ```json
     {
       "status": 200,
       "success": true,
       "data": [
         { "_id": "6512...", "industryName": "Technology & Software" },
         { "_id": "6513...", "industryName": "Finance & Banking" },
         { "_id": "6514...", "industryName": "Manufacturing & Production" },
         { "_id": "6515...", "industryName": "Healthcare & Pharmaceuticals" },
         { "_id": "6516...", "industryName": "Education & Training" },
         { "_id": "6517...", "industryName": "Retail & E-commerce" },
         { "_id": "6518...", "industryName": "Construction & Real Estate" },
         { "_id": "6519...", "industryName": "Logistics & Supply Chain" },
         { "_id": "6520...", "industryName": "Other" }
       ]
     }
     ```
2. **Company Sizes**:
   * **Route**: `GET /api/v1/onboarding/company-sizes`
   * **Response (`200 OK`)**:
     ```json
     {
       "status": 200,
       "success": true,
       "data": ["1-10", "11-50", "51-200", "201-500", "500+"]
     }
     ```

#### 4B. Save Workspace Profile
* **Purpose**: Persists company name, industry, and size.
* **HTTP Method**: `POST` *(or `PATCH`)*
* **Route**: `/api/v1/onboarding/workspace`
* **Headers**: `Authorization: Bearer <auth_token>`

##### Request Body
```json
{
  "companyName": "Globex Corp",
  "industry": "Technology & Software",
  "companySize": "11-50",
  "companyAddress": "123 Innovation Drive"
}
```

##### Response (`200 OK`)
```json
{
  "status": 200,
  "success": true,
  "message": "Workspace profile saved successfully",
  "data": {
    "_id": "673f8a12bc4e5f9810a44d11",
    "companyName": "Globex Corp",
    "industry": "Technology & Software",
    "companySize": "11-50",
    "onboardingStep": 2
  }
}
```

---

### Screen 5: Choose Your Modules (`/onboarding` Step 2)

#### 5A. Available Modules Catalog
* **Route**: `GET /api/v1/onboarding/modules`
* **Response (`200 OK`)**:
  ```json
  {
    "status": 200,
    "success": true,
    "data": [
      {
        "key": "hr",
        "moduleId": 1,
        "name": "Human Resources Module",
        "description": "Manage employees, payroll, appraisals, leave requests, and attendance.",
        "icon": "users",
        "isDefault": true
      },
      {
        "key": "accounting",
        "moduleId": 6,
        "name": "Accounting Module",
        "description": "Financial ledger, invoicing, expense tracking, accounts, and financial reports.",
        "icon": "wallet",
        "isDefault": true
      },
      {
        "key": "supplyChain",
        "moduleId": 2,
        "name": "Supply Chain Module",
        "description": "Order fulfillment, stock inventory, purchase orders, and supplier directory.",
        "icon": "box",
        "isDefault": true
      }
    ]
  }
  ```

#### 5B. Select & Activate Modules
* **Purpose**: Activates selected modules in `companyFeatures.modules` and sets up default system roles (`Super Admin`, `Manager`, `Staff`).
* **HTTP Method**: `POST`
* **Route**: `/api/v1/onboarding/modules` *(alias: `/api/v1/onboarding/select-modules`)*
* **Headers**: `Authorization: Bearer <auth_token>`

##### Request Body
```json
{
  "modules": ["hr", "accounting", "supplyChain"]
}
```

##### Response (`200 OK`)
```json
{
  "status": 200,
  "success": true,
  "message": "Modules configured successfully.",
  "data": {
    "_id": "673f8a12bc4e5f9810a44d11",
    "companyName": "Globex Corp",
    "onboardingStep": 3,
    "companyFeatures": {
      "subscriptionStatus": { "isActive": true, "plan": "Standard Trial" },
      "modules": [
        { "key": "hr", "moduleId": 1, "active": true, "moduleName": "Human Resources Module" },
        { "key": "accounting", "moduleId": 6, "active": true, "moduleName": "Accounting Module" },
        { "key": "supplyChain", "moduleId": 2, "active": true, "moduleName": "Supply Chain Module" }
      ]
    }
  }
}
```

---

### Screen 6: Invite Employees (`/onboarding` Step 3)
*(Matches UI: dynamic email list, "+ Add Another", "SEND INVITES", "SKIP FOR NOW")*

#### 6A. Send Invitations
* **Purpose**: Takes an array of employee email addresses, creates pending `Employee` accounts linked to the company, and dispatches branded email invitations containing a one-click `/set-password` link.
* **HTTP Method**: `POST`
* **Route**: `/api/v1/onboarding/invite-employees` *(alias: `/api/v1/onboarding/invite`)*
* **Headers**: `Authorization: Bearer <auth_token>`

##### Request Body
```json
{
  "emails": [
    "sarah.connor@globex.com",
    "john.doe@globex.com",
    "alex.smith@globex.com"
  ]
}
```

##### Response (`200 OK`)
```json
{
  "status": 200,
  "success": true,
  "message": "3 invitation(s) sent successfully",
  "data": {
    "totalInvited": 3,
    "invitations": [
      { "email": "sarah.connor@globex.com", "status": "sent" },
      { "email": "john.doe@globex.com", "status": "sent" },
      { "email": "alex.smith@globex.com", "status": "sent" }
    ],
    "onboardingCompleted": true
  }
}
```

#### 6B. Skip For Now
* **Purpose**: User clicks "SKIP FOR NOW" to bypass sending employee invitations and proceed directly to their ERP workspace.
* **HTTP Method**: `POST`
* **Route**: `/api/v1/onboarding/skip-invite` *(alias: `/api/v1/onboarding/skip`)*
* **Headers**: `Authorization: Bearer <auth_token>`

##### Request Body
```json
{}
```

##### Response (`200 OK`)
```json
{
  "status": 200,
  "success": true,
  "message": "Employee invitation step skipped. Welcome to your workspace!",
  "data": {
    "onboardingCompleted": true,
    "onboardingStep": 3
  }
}
```

---

## ⚙️ Section 2: General Settings Endpoints

### Screen 7: Account Information (`/app/settings/general-settings/account-info`)
*(Matches UI: Logo upload, Company Name, Super Admin Email, Date Joined, Address, Country, State, City, Language, Currency, Live Card Preview, "Save Changes")*

#### 7A. Fetch Account Information
* **Purpose**: Loads company details for the form and right-side preview card.
* **HTTP Method**: `GET`
* **Route**: `/api/v1/company/account-info` *(also enhanced: `/api/v1/fetchCompany`)*
* **Headers**: `Authorization: Bearer <auth_token>`

##### Response (`200 OK`)
```json
{
  "status": 200,
  "success": true,
  "data": {
    "_id": "673f8a12bc4e5f9810a44d11",
    "companyName": "Globex Corp",
    "email": "admin@globex.com",
    "superAdminEmail": "admin@globex.com",
    "dateJoined": "2024-11-20T10:00:00.000Z",
    "companyAddress": "Plot 14B Admiralty Way, Lekki Phase 1",
    "country": "Nigeria",
    "state": "Lagos",
    "city": "Ikeja",
    "language": "English",
    "currency": "USD",
    "companyLogo": "https://res.cloudinary.com/demo/image/upload/v1/company_logo.png",
    "industry": "Technology & Software",
    "companySize": "11-50",
    "accountType": "Company",
    "activeStatus": true,
    "status": true,
    "onboardingCompleted": true
  }
}
```

#### 7B. Save Changes (Update Profile)
* **Purpose**: Updates editable company fields.
* **HTTP Method**: `PATCH`
* **Route**: `/api/v1/company/account-info` *(also `/api/v1/updateCompanyByCompany`)*
* **Headers**: `Authorization: Bearer <auth_token>`

##### Request Body
```json
{
  "companyName": "Globex Enterprise Ltd",
  "companyAddress": "Plot 14B Admiralty Way, Lekki Phase 1",
  "country": "Nigeria",
  "state": "Lagos",
  "city": "Ikeja",
  "language": "English",
  "currency": "USD",
  "companyLogo": "https://res.cloudinary.com/demo/image/upload/v1/updated_logo.png"
}
```

##### Response (`200 OK`)
```json
{
  "status": 200,
  "success": true,
  "message": "Account information updated successfully",
  "data": {
    "_id": "673f8a12bc4e5f9810a44d11",
    "companyName": "Globex Enterprise Ltd",
    "email": "admin@globex.com",
    "superAdminEmail": "admin@globex.com",
    "dateJoined": "2024-11-20T10:00:00.000Z",
    "companyAddress": "Plot 14B Admiralty Way, Lekki Phase 1",
    "country": "Nigeria",
    "state": "Lagos",
    "city": "Ikeja",
    "language": "English",
    "currency": "USD",
    "companyLogo": "https://res.cloudinary.com/demo/image/upload/v1/updated_logo.png",
    "industry": "Technology & Software",
    "companySize": "11-50"
  }
}
```

#### 7C. Upload Company Logo
* **Purpose**: Dedicated image uploader endpoint (stores directly in Cloudinary/GCS).
* **HTTP Method**: `PATCH`
* **Route**: `/api/v1/company/account-info/logo`
* **Headers**: `Authorization: Bearer <auth_token>`, `Content-Type: multipart/form-data`
* **Form Field**: `companyLogo` (file)

##### Response (`200 OK`)
```json
{
  "status": 200,
  "success": true,
  "message": "Company logo updated successfully",
  "data": {
    "companyLogo": "https://res.cloudinary.com/makers/image/upload/v172.../logo.png"
  }
}
```

---

### Screen 8: Modules, Roles & Permissions (`/app/settings/general-settings/roles-permissions`)
*(Matches UI: "+ Add New Role", "Save Changes", Module active/inactive switch, Permissions table with checkboxes for Super Admin, Manager, Staff, Custom Roles)*

#### 8A. Fetch Modules, Roles & Permissions Matrix
* **Purpose**: Loads the entire configuration matrix for the page.
* **HTTP Method**: `GET`
* **Route**: `/api/v1/company/roles-permissions`
* **Headers**: `Authorization: Bearer <auth_token>`

##### Response (`200 OK`)
```json
{
  "status": 200,
  "success": true,
  "data": {
    "companyId": "673f8a12bc4e5f9810a44d11",
    "modules": [
      {
        "moduleId": 1,
        "key": "hr",
        "moduleName": "Human Resources Module",
        "active": true,
        "description": "Manage employees, payroll, appraisals, leave requests, and attendance."
      },
      {
        "moduleId": 6,
        "key": "accounting",
        "moduleName": "Accounting Module",
        "active": true,
        "description": "Financial ledger, invoicing, expense tracking, accounts, and financial reports."
      },
      {
        "moduleId": 2,
        "key": "supplyChain",
        "moduleName": "Supply Chain Module",
        "active": true,
        "description": "Order fulfillment, stock inventory, purchase orders, and supplier directory."
      }
    ],
    "roles": [
      {
        "roleId": "673f8a...",
        "roleName": "Super Admin",
        "description": "Full access to all platform resources",
        "isSystem": true,
        "permissions": ["Manage Employees", "Approve Leaves", "View Payroll", "Manage Invoices"]
      },
      {
        "roleId": "673f8b...",
        "roleName": "Manager",
        "description": "Department management and operational approvals",
        "isSystem": true,
        "permissions": ["Approve Leaves", "View Employees"]
      },
      {
        "roleId": "673f8c...",
        "roleName": "Staff",
        "description": "Standard employee self-service access",
        "isSystem": true,
        "permissions": ["Apply for Leave", "View Payslip"]
      }
    ],
    "matrix": [
      {
        "moduleKey": "hr",
        "moduleName": "Human Resources Module",
        "permissionKey": "Manage Employees",
        "permissionName": "Manage Employees",
        "roles": {
          "Super Admin": true,
          "Manager": false,
          "Staff": false
        }
      },
      {
        "moduleKey": "hr",
        "moduleName": "Human Resources Module",
        "permissionKey": "Approve Leaves",
        "permissionName": "Approve Leave Requests",
        "roles": {
          "Super Admin": true,
          "Manager": true,
          "Staff": false
        }
      }
    ]
  }
}
```

#### 8B. Create New Custom Role ("+ Add New Role")
* **Purpose**: Creates a custom role for the company workspace.
* **HTTP Method**: `POST`
* **Route**: `/api/v1/company/roles`
* **Headers**: `Authorization: Bearer <auth_token>`

##### Request Body
```json
{
  "roleName": "Finance Analyst",
  "description": "Handles ledger reconciliation and invoice creation",
  "permissions": ["View Invoices", "Create Invoices", "View Expenses"]
}
```

##### Response (`201 Created`)
```json
{
  "status": 201,
  "success": true,
  "message": "Role Finance Analyst created successfully",
  "data": {
    "_id": "6740b2a9f1...",
    "roleName": "Finance Analyst",
    "description": "Handles ledger reconciliation and invoice creation",
    "permissions": ["View Invoices", "Create Invoices", "View Expenses"],
    "companyId": "673f8a12bc4e5f9810a44d11"
  }
}
```

#### 8C. Save Roles & Permissions Changes ("Save Changes")
* **Purpose**: Updates module active switches and assigns permission sets to roles.
* **HTTP Method**: `PATCH`
* **Route**: `/api/v1/company/roles-permissions`
* **Headers**: `Authorization: Bearer <auth_token>`

##### Request Body
```json
{
  "moduleUpdates": [
    { "moduleId": 1, "name": "Human Resources Module", "active": true },
    { "moduleId": 6, "name": "Accounting Module", "active": true },
    { "moduleId": 2, "name": "Supply Chain Module", "active": false }
  ],
  "roleUpdates": [
    {
      "roleName": "Super Admin",
      "permissions": ["Manage Employees", "Approve Leaves", "View Payroll", "Manage Invoices"]
    },
    {
      "roleName": "Manager",
      "permissions": ["Approve Leaves", "View Employees", "View Expenses"]
    },
    {
      "roleName": "Staff",
      "permissions": ["Apply for Leave", "View Payslip"]
    }
  ]
}
```

##### Response (`200 OK`)
```json
{
  "status": 200,
  "success": true,
  "message": "Roles and permissions updated successfully",
  "data": {
    "rolesUpdated": 3
  }
}
```

---

### Screen 9: Billing & Subscriptions (`/app/settings/general-settings/subscription/history`)
*(Matches UI: Current Plan Card with $29/month, Credit Card preview, Billing History Table, "Cancel Subscription", "Manage Subscription", "Manage Card")*

#### 9A. Fetch Billing & Subscription Details
* **Purpose**: Populates the Current Plan card, Card details preview, and Billing History table.
* **HTTP Method**: `GET`
* **Route**: `/api/v1/company/billing-subscriptions`
* **Headers**: `Authorization: Bearer <auth_token>`

##### Response (`200 OK`)
```json
{
  "status": 200,
  "success": true,
  "data": {
    "currentPlan": {
      "name": "Standard Plan",
      "amount": 29,
      "billingCycle": "monthly",
      "currency": "USD",
      "status": "Active",
      "startDate": "2024-11-01T00:00:00.000Z",
      "nextBillingDate": "2024-12-01T00:00:00.000Z",
      "planFeatures": [
        "Up to 50 employees",
        "Human Resources Module",
        "Accounting Module",
        "Standard Support"
      ]
    },
    "paymentMethod": {
      "cardBrand": "Mastercard",
      "cardLastFour": "1234",
      "cardholderName": "Globex Corp Admin",
      "expirationDate": "08/26"
    },
    "billingHistory": [
      {
        "invoiceId": "INV-2024-001",
        "date": "2024-11-01T00:00:00.000Z",
        "amount": 29,
        "currency": "USD",
        "status": "Paid",
        "downloadUrl": "/api/v1/invoices/INV-2024-001.pdf"
      },
      {
        "invoiceId": "INV-2024-002",
        "date": "2024-10-01T00:00:00.000Z",
        "amount": 29,
        "currency": "USD",
        "status": "Paid",
        "downloadUrl": "/api/v1/invoices/INV-2024-002.pdf"
      }
    ]
  }
}
```

#### 9B. Cancel Subscription ("Cancel Subscription" Button)
* **Purpose**: Initiates subscription cancellation and updates company subscription status.
* **HTTP Method**: `POST`
* **Route**: `/api/v1/subscriptions/cancel` *(alias: `/api/v1/company/cancel-subscription`)*
* **Headers**: `Authorization: Bearer <auth_token>`

##### Request Body
```json
{
  "reason": "Upgrading to customized enterprise tier"
}
```

##### Response (`200 OK`)
```json
{
  "status": 200,
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "status": "Cancelled",
    "subscriptionStatus": {
      "isActive": false,
      "plan": "Standard Plan",
      "cancelledAt": "2024-11-20T12:00:00.000Z"
    }
  }
}
```

#### 9C. Update Payment Method ("Manage Card" Button)
* **Purpose**: Saves new cardholder name, card brand, last four digits, and expiration date.
* **HTTP Method**: `PATCH`
* **Route**: `/api/v1/company/payment-method`
* **Headers**: `Authorization: Bearer <auth_token>`

##### Request Body
```json
{
  "cardBrand": "Visa",
  "cardLastFour": "8899",
  "cardholderName": "Sarah Connor",
  "expirationDate": "12/28"
}
```

##### Response (`200 OK`)
```json
{
  "status": 200,
  "success": true,
  "message": "Payment method updated successfully",
  "data": {
    "cardBrand": "Visa",
    "cardLastFour": "8899",
    "cardholderName": "Sarah Connor",
    "expirationDate": "12/28"
  }
}
```

---

## 💻 Section 3: Frontend TypeScript Service Example

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ErpApiService {
  private baseUrl = 'http://localhost:8800/api/v1';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // 1. Sign Up
  signUp(accountType: string, companyName: string, email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/signUp`, { accountType, companyName, email });
  }

  // 2. Verify & Resend OTP
  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify-otp`, { email, otp });
  }

  resendOtp(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/resend-otp`, { email });
  }

  // 3. Set Password
  setPassword(payload: { email: string; password: string; confirmPassword?: string; token?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/setPassword`, payload);
  }

  // 4. Onboarding Workspace Setup
  getIndustries(): Observable<any> {
    return this.http.get(`${this.baseUrl}/onboarding/industries`);
  }

  getCompanySizes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/onboarding/company-sizes`);
  }

  saveWorkspace(data: { companyName: string; industry: string; companySize: string; companyAddress?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/onboarding/workspace`, data, { headers: this.getAuthHeaders() });
  }

  // 5. Modules
  getModules(): Observable<any> {
    return this.http.get(`${this.baseUrl}/onboarding/modules`);
  }

  selectModules(modules: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/onboarding/modules`, { modules }, { headers: this.getAuthHeaders() });
  }

  // 6. Invite Employees (Screenshot 1)
  inviteEmployees(emails: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/onboarding/invite-employees`, { emails }, { headers: this.getAuthHeaders() });
  }

  skipInvite(): Observable<any> {
    return this.http.post(`${this.baseUrl}/onboarding/skip-invite`, {}, { headers: this.getAuthHeaders() });
  }

  // 7. Account Information (Screenshot 2)
  getAccountInfo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/company/account-info`, { headers: this.getAuthHeaders() });
  }

  updateAccountInfo(accountData: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/company/account-info`, accountData, { headers: this.getAuthHeaders() });
  }

  uploadCompanyLogo(formData: FormData): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.patch(`${this.baseUrl}/company/account-info/logo`, formData, { headers });
  }

  // 8. Modules, Roles & Permissions (Screenshot 3)
  getRolesAndPermissions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/company/roles-permissions`, { headers: this.getAuthHeaders() });
  }

  updateRolesAndPermissions(payload: { moduleUpdates?: any[]; roleUpdates?: any[] }): Observable<any> {
    return this.http.patch(`${this.baseUrl}/company/roles-permissions`, payload, { headers: this.getAuthHeaders() });
  }

  addNewRole(roleData: { roleName: string; description?: string; permissions?: string[] }): Observable<any> {
    return this.http.post(`${this.baseUrl}/company/roles`, roleData, { headers: this.getAuthHeaders() });
  }

  // 9. Billing & Subscriptions (Screenshot 4)
  getBillingAndSubscriptions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/company/billing-subscriptions`, { headers: this.getAuthHeaders() });
  }

  cancelSubscription(reason?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/subscriptions/cancel`, { reason }, { headers: this.getAuthHeaders() });
  }

  updatePaymentMethod(cardData: { cardBrand: string; cardLastFour: string; cardholderName: string; expirationDate: string }): Observable<any> {
    return this.http.patch(`${this.baseUrl}/company/payment-method`, cardData, { headers: this.getAuthHeaders() });
  }
}
```

---

## 🛠️ Section 4: Interactive Swagger UI

* **Interactive Swagger UI**: `http://localhost:8800/api-docs`
* **Raw OpenAPI 3.0 JSON**: `http://localhost:8800/api-docs.json`
