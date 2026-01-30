# API Testing Documentation

This directory contains tests for verifying API functionality in the ACEALL-ERP-BK system.

## Tests Available

### Fetch Employees Test

The `fetchEmployees.test.js` test verifies that the `fetchEmployees` API endpoint works correctly in different scenarios, with a focus on ensuring that all employees are returned when pagination parameters are omitted or explicitly set as "undefined" strings.

#### What This Test Verifies

1. **No Parameters**: When calling the endpoint with no parameters, all employees should be returned without pagination.
2. **With Pagination**: When `page` and `limit` are provided, pagination should be applied.
3. **With Search**: When `search` is provided, filtered results should be returned.
4. **Explicit "undefined" Parameters**: When parameters are explicitly set to `"undefined"` string values (like `?page=undefined&limit=undefined&search=undefined`), the API should behave the same as when parameters are omitted.
5. **Result Comparison**: The test compares results from different methods to ensure consistency.

#### Running the Test

##### Method 1: Using the Setup Script and Running Test Directly

1. Set up your environment variables:
   ```bash
   node ./tests/setup_env.js
   ```
   Follow the prompts to enter your API URL, admin email, and password.

2. Run the test directly:
   ```bash
   node ./tests/fetchEmployees.test.js
   ```

##### Method 2: Using the Test Runner Script

Run the following command:
```bash
chmod +x ./tests/run_employee_test.sh  # Make the script executable (first time only)
./tests/run_employee_test.sh
```

The script will:
- Check if `.env` file exists, and offer to create it or guide you to the setup script
- Install required dependencies
- Run the test and report results

#### Expected Output

On successful test execution, you should see output like:

```
=== STARTING FETCH EMPLOYEES TESTS ===
Logging in as admin@example.com...
Login successful for admin@example.com

=== TEST 1: Call with no parameters ===
Received XX employees out of XX total
No pagination info provided: ✅

=== TEST 2: Call with pagination ===
Received X employees
Pagination info:
  Total Pages: X
  Current Page: 1
  Total Records: XX

=== TEST 3: Call with search parameter ===
Search for 'a' returned XX employees

=== TEST 4: Call with explicit "undefined" string parameters ===
Received XX employees out of XX total
No pagination info provided: ✅

=== TEST 5: Compare no parameters vs explicit "undefined" parameters ===
Test PASSED: Results match between no parameters and explicit "undefined" parameters ✅

=== FINAL COMPARISON ===
Test PASSED: No parameters returned the most results ✅

=== ALL TESTS COMPLETED SUCCESSFULLY ===
```

## Troubleshooting

If you encounter issues:

1. **Authentication Issues**: Ensure your email and password in the `.env` file are correct.
2. **Connection Issues**: Check that your API server is running and accessible at the URL specified in the `.env` file.
3. **Missing Dependencies**: The test should automatically install dependencies, but if you encounter errors, try:
   ```bash
   npm install --save-dev axios colors dotenv
   ```

## Adding More Tests

To add more tests:

1. Create a new test file in the `tests` directory
2. Follow the pattern in existing tests
3. Update this README to document the new test 