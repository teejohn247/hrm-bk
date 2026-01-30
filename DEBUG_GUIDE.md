# Leave Records Debugging Guide

## Issues Fixed

1. **Empty Leave Records for Manager**
   - We've fixed the issue where a manager's approved leaves weren't showing up in the leave records details page due to using the wrong company ID.

2. **Manager Seeing All Departments' Leave Records**
   - We've fixed the issue where managers could see leave records from all departments instead of just their own department.
   - Added more robust checks to ensure manager's department is correctly identified.
   - Implemented stronger security measures to prevent department data leakage.
   - Now using the `isManager` flag directly from the Employee database record instead of relying on JWT fields.

3. **Missing Employee Images**
   - We've fixed the issue where employee profile pictures weren't appearing in the leave records list.
   - Added code to retrieve images both from the record itself and the employee collection.
   - Ensured images are properly propagated to the top level of the employee objects.

## Root Causes

1. **Company ID Mismatch**: The system was incorrectly using the manager's user ID (`req.payload.id`) instead of the company ID (`req.payload.companyId`) when querying for leave records.

2. **Department Field Issues**: 
   - Manager's department field was not being properly checked
   - The department filter wasn't being correctly applied when retrieving records
   - When a manager had no department assigned, the system wasn't properly restricting access

3. **JWT Token Structure**: In your JWT token, there are several important fields:
   - `id`: This is the user/manager's ID
   - `companyId`: This is the company the user belongs to
   - `isSuperAdmin`: Boolean flag indicating whether the user is a superadmin (can see all departments)

4. **Image Field Handling**: 
   - Employee images were stored in the leave records but not being correctly propagated to the top-level employee objects
   - Some inconsistencies between how images were retrieved from different collections

## Solutions Implemented

1. **Used Correct Company ID**: Updated the code to explicitly use `req.payload.companyId` when querying leave records.

2. **Implemented Role-Based Access Control**:
   - Superadmins can see all departments' leave records
   - Managers can only see their own department's leave records
   - Now getting manager status directly from the Employee database record instead of relying on JWT fields
   - Added proper checks for the `isSuperAdmin` flag
   - Added multiple security checks to prevent managers without departments from seeing any records

3. **Added Robust Department Checking**:
   - Added extensive logging to identify when a manager's department is missing
   - Added checks for department field type and existence
   - Multiple fail-safes to prevent unauthorized data access
   - More reliable manager status checking directly from the database

4. **Fixed Employee Images**: 
   - Properly retrieves images from both the leave record and the employee collection
   - Uses the most specific image source available (record first, then employee collection)
   - Ensures images are included in both the top-level employee object and the leave records

5. **Enhanced Logging and Diagnostics**:
   - Added detailed logging of departments found in the filtered records
   - Added type checking for critical fields
   - Improved error messages for easier debugging
   - Clear logging of employee record details including manager status

## How to Test the Fixes

1. **Access Leave Records Page with Manager Account**: You should now only see leave records from your department.
   - Verify that Gideon (Development manager) only sees Development department leaves
   - Verify that other managers only see their respective department's leaves

2. **Access with Superadmin Account**: You should see records from all departments.

3. **Check for Employee Images**: The records should now include employee profile photos at both:
   - The top level of each employee object
   - Within each individual leave record

4. **Verify Department Filtering**: You can check the server logs to see:
   - What department the system detected for your user
   - What departments were found in the filtered records
   - Any warnings about missing departments

5. **Check Diagnostic Info**: You can access the diagnostic endpoint at:
   ```
   GET /managerLeaveStats
   ```
   This will show detailed information including:
   - Your detected department
   - Records filtered by your department
   - Employee images and counts
   - Your manager status directly from the database

## Checking Manager Status and Department

To ensure an employee is properly set up as a manager:

1. **Check the Employee record**:
   - Make sure the `isManager` field is set to `true`
   - Ensure the `department` field is properly set to the department they manage
   - Both fields must be correctly set for department filtering to work

2. **No Need to Update JWT**:
   - The system now reads manager status directly from the database
   - The JWT token only needs to have the correct `companyId` and user `id`
   - The `isSuperAdmin` flag is still used from the JWT if available

3. **Example Employee Record Fields**:
   ```
   {
     "_id": "66d199304e94a9db4c54a68c",
     "name": "Gideon Adejoh",
     "email": "gideon.adejoh@aceall.io",
     "department": "Development",
     "isManager": true,
     "profilePhoto": "https://some-photo-url.png"
   }
   ```

## If Issues Persist

1. Check the server logs for any errors or warnings:
   - Look for "ERROR:" messages which indicate problems with manager or department identification
   - Check for "SECURITY ENFORCEMENT" messages which indicate access restrictions
   - Look for log entries showing the employee record that was retrieved

2. Verify that your employee record has the correct department assigned:
   - Check the Employee collection
   - Ensure the department field is a string (not null, undefined, or an object)
   - Ensure the `isManager` field is set to `true`
   - Make sure the department matches the one you expect to be part of

3. Verify that the leave records have the correct:
   - Company ID (matching your JWT token's `companyId`)
   - Department ID (should match your department exactly)
   - Manager (leaveApprover) ID
   - Status ("Approved")

4. If a manager can't see any records:
   - Confirm they have a department assigned in their Employee record
   - Verify there are leave records with that exact department name
   - Verify their `isManager` flag is set to `true` in the database
   - Check if they might be a superadmin (if `isSuperAdmin` is `true`, department filtering is bypassed)

## Your JWT Token

The token you provided decodes to the following information:
```
{
  "id": "66d199304e94a9db4c54a68c",
  "isSuperAdmin": false,
  "email": "gideon.adejoh@aceall.io",
  "companyId": "66a11b26eb482386493a0c0a",
  "iat": 1747644325,
  "exp": 1748508325
}
```

This confirms that your token has separate `id` and `companyId` fields and the `isSuperAdmin` flag is set to `false`.

**Note**: The system now reads manager status directly from the Employee database record, so you don't need to add an `isManager` field to your JWT. Just make sure the Employee record has `isManager: true` set correctly. 