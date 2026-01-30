# KPI Name Uniqueness Test

This test verifies that the KPI name uniqueness check in `createKPI.js` works correctly, allowing users to create KPIs with the same name in different contexts.

## What This Test Verifies

The test validates that:

1. KPIs with different names can be created (basic functionality)
2. KPIs with the same name in the same group for the same employees are rejected (duplicate prevention)
3. KPIs with the same name in the same group but for different employees are allowed (employee-specific uniqueness)
4. KPIs with the same name in different groups are allowed (group-specific uniqueness)
5. KPIs with the same name for different departments are allowed (department-specific uniqueness)
6. KPIs with the same name and overlapping employees are rejected (partial overlap detection)

## Prerequisites

- Node.js installed
- Running instance of the ACEALL-ERP-BK API server
- Valid company admin credentials with permissions to create KPI groups

## Setup and Running the Test

### Option 1: Using the provided shell script (recommended)

1. Make the script executable:
   ```bash
   chmod +x ./tests/run_kpi_test.sh
   ```

2. Run the script:
   ```bash
   ./tests/run_kpi_test.sh
   ```

   - The script will create a `.env` file if one doesn't exist
   - It will install required dependencies
   - You'll need to update the `.env` file with your actual credentials

### Option 2: Manual setup

1. Create a `.env` file in the project root with the following content:
   ```
   # API configuration
   API_BASE_URL=http://localhost:5000/api
   
   # Test credentials (replace with actual values)
   COMPANY_ADMIN_EMAIL=your_admin_email@example.com
   COMPANY_ADMIN_PASSWORD=your_password
   EMPLOYEE_EMAIL=your_employee_email@example.com
   EMPLOYEE_PASSWORD=your_password
   
   # Auth token (optional, will be obtained through login if not provided)
   AUTH_TOKEN=
   ```

2. Install the required dependencies:
   ```bash
   npm install --save-dev axios colors dotenv
   ```

3. Run the test:
   ```bash
   node ./tests/createKPI.test.js
   ```

## Test Requirements

The test requires:
- At least 2 KPI groups in the system
- At least 4 employees in the system
- At least 2 departments in the system
- The logged-in user must have permission to create KPIs in the available groups

## Expected Output

The test will display its progress and results in the console. Successful tests will show a green ✅ indicator, while failed tests will show a red ❌ indicator.

When all tests pass, you should see:
```
=== ALL TESTS COMPLETED ===
Created X KPIs during testing
Tests finished
```

## Troubleshooting

If you encounter issues:

1. **Authentication failures**: Make sure your credentials in `.env` are correct
2. **Permission errors**: Ensure your admin account has permissions to create KPIs
3. **Not enough data**: Ensure your system has enough KPI groups, employees, and departments
4. **API connectivity**: Verify your API server is running and accessible at the URL in `.env`

For API-specific error messages, check the console output for detailed information returned from the server. 