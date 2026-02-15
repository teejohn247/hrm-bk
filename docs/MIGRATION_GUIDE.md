# Migration Guide: Controllers and Models for Feature Modules

This document lists all controllers, models, and related files you need to copy for each feature module when migrating to another project. Copy these files exactly to replicate functionality.

**Base Path:** All paths are relative to project root `/Users/fullcircle_dev/Downloads/ACEALL-ERP-BK`

---

## 1. PAYROLL

### Models
| File | Path |
|------|------|
| Payroll | `model/Payroll.js` |
| PayrollPeriod | `model/PayrollPeriod.js` |
| PeriodPayData | `model/PeriodPayData.js` |
| SalaryScale | `model/SalaryScale.js` |
| Debit | `model/Debit.js` |
| Credits | `model/Credits.js` |

### Controllers
| File | Path |
|------|------|
| createPayroll | `controller/Payroll/createPayroll.js` |
| fetchPayroll | `controller/Payroll/fetchPayroll.js` |
| updatePayroll | `controller/Payroll/updatePayroll.js` |
| payrollPeriod | `controller/Payroll/payrollPeriod.js` |
| payrollPeriodData | `controller/Payroll/payrollPeriodData.js` |
| createPeriodPayData | `controller/Payroll/createPeriodPayData.js` |
| fetchPayrollPeriod | `controller/Payroll/fetchPayrollPeriod.js` |
| fetchPayrollPeriodDetails | `controller/Payroll/fetchPayrollPeriodDetails.js` |
| fetchPayrollPrd | `controller/Payroll/fetchPayrollPrd.js` |
| fetchPayrollData | `controller/Payroll/fetchPayrollData.js` |
| updatePayrollPeriod | `controller/Payroll/updatePayrollPeriod.js` |
| updatePeriodData | `controller/Payroll/updatePeriodData.js` |
| deletePeriod | `controller/Payroll/deletePeriod.js` |
| createCredits | `controller/Payroll/createCredits.js` |
| createDebit | `controller/Payroll/createDebit.js` |
| fetchCredits | `controller/Payroll/fetchCredits.js` |
| fetchDebits | `controller/Payroll/fetchDebits.js` |
| updateCredit | `controller/Payroll/updateCredit.js` |
| updateDebits | `controller/Payroll/updateDebits.js` |
| deleteDebit | `controller/Payroll/deleteDebit.js` |
| deleteCredit | `controller/Payroll/deleteCredit.js` |
| approvePayroll | `controller/Payroll/approvePayroll.js` |
| disbursePayroll | `controller/Payroll/disbursePayroll.js` |
| payrollGraph | `controller/Payroll/payrollGraph.js` |
| grossSalary | `controller/Payroll/grossSalary.js` |
| netSalary | `controller/Payroll/netSalary.js` |
| payrollSettings | `controller/Payroll/payrollSettings.js` |
| payrollYears | `controller/Payroll/payrollYears.js` |
| updatePayrollStatus | `controller/Payroll/updatePayrollStatus.js` |
| exportPayroll | `controller/Exports/exportPayroll.js` |

### Salary Scale (Payroll-related)
| File | Path |
|------|------|
| createSalaryScale | `controller/salaryScale/createSalaryScale.js` |
| fetchSalaryScale | `controller/salaryScale/fetchSalaryScale.js` |
| updateSalaryScale | `controller/salaryScale/updateSalaryScale.js` |
| deleteSalaryscale | `controller/salaryScale/deleteSalaryscale.js` |
| assignSalaryScale | `controller/salaryScale/assignSalaryScale.js` |
| assignDesignation | `controller/salaryScale/assignDesignation.js` |

---

## 2. APPRAISALS

### Models
| File | Path |
|------|------|
| AppraisalGroup | `model/AppraisalGroup.js` |
| AppraisalPeriod | `model/AppraisalPeriod.js` |
| AppraisalData | `model/AppraisalData.js` |
| Kpi | `model/Kpi.js` |
| EmployeeKpis | `model/EmployeeKpis.js` |
| AppraisalRequest | `model/AppraisalRequest.js` |
| FinalRating | `model/FinalRating.js` |
| Rating | `model/Rating.js` |
| CheckInForm | `model/CheckInForm.js` |

### Controllers
| File | Path |
|------|------|
| CreateGroup | `controller/Appraisal/CreateGroup.js` |
| createKPI | `controller/Appraisal/createKPI.js` |
| createRating | `controller/Appraisal/createRating.js` |
| appraisalPeriod | `controller/Appraisal/appraisalPeriod.js` |
| createFinal | `controller/Appraisal/createFinal.js` |
| assignKpisToGroups | `controller/Appraisal/assignKpisToGroups.js` |
| fetchGroups | `controller/Appraisal/fetchGroups.js` |
| fetchKPIs | `controller/Appraisal/fetchKPIs.js` |
| fetchRatings | `controller/Appraisal/fetchRatings.js` |
| fetchFinal | `controller/Appraisal/fetchFinal.js` |
| fetchPeriod | `controller/Appraisal/fetchPeriod.js` |
| updateKpi | `controller/Appraisal/updateKpi.js` |
| updatePeriod | `controller/Appraisal/updatePeriod.js` |
| updateRating | `controller/Appraisal/updateRating.js` |
| updateGroup | `controller/Appraisal/updateGroup.js` |
| updateFinal | `controller/Appraisal/updateFinal.js` |
| deleteKPI | `controller/Appraisal/deleteKPI.js` |
| deletePeriod | `controller/Appraisal/deletePeriod.js` |
| deleteRating | `controller/Appraisal/deleteRating.js` |
| deleteGroup | `controller/Appraisal/deleteGroup.js` |
| deleteFinal | `controller/Appraisal/deleteFinal.js` |
| assignGroupsDepartment | `controller/Appraisal/assignGroupsDepartment.js` |
| assignGroupsDesignation | `controller/Appraisal/assignGroupsDesignation.js` |
| assignGroupsEmployees | `controller/Appraisal/assignGroupsEmployees.js` |
| fillAppraisal | `controller/Appraisal/fillAppraisal.js` |
| fetchFinalManager | `controller/Appraisal/fetchFinalManager.js` |
| employeeKpi | `controller/Appraisal/employeeKpi.js` |
| RateKPI | `controller/Appraisal/RateKPI.js` |
| fetchAppraisalPeriodDetails | `controller/Appraisal/fetchAppraisalPeriodDetails.js` |
| fetchGroupsByPeriod | `controller/Appraisal/fetchGroupsByPeriod.js` |
| fetchGroupsByDesignation | `controller/Appraisal/fetchGroupsByDesignation.js` |
| fetchGroupsByDeparment | `controller/Appraisal/fetchGroupsByDeparment.js` |
| fetchGroupsByEmployee | `controller/Appraisal/fetchGroupsByEmployee.js` |
| updateEmployeeAppraisalStatus | `controller/Appraisal/updateEmployeeAppraisalStatus.js` |
| updateAppraisalPeriod | `controller/Appraisal/updateAppraisalPeriod.js` |
| checkInFormController | `controller/Appraisal/checkInFormController.js` |

---

## 3. LEAVE

### Models
| File | Path |
|------|------|
| Leaves | `model/Leaves.js` |
| LeaveRecords | `model/LeaveRecords.js` |

### Controllers
| File | Path |
|------|------|
| createLeave | `controller/Leave/createLeave.js` |
| updateLeave | `controller/Leave/updateLeave.js` |
| fetchLeave | `controller/Leave/fetchLeave.js` |
| fetchLeaveDetails | `controller/Leave/fetchLeaveDetails.js` |
| deleteLeave | `controller/Leave/deleteLeave.js` |
| leaveDetails | `controller/Leave/leaveDetails.js` |
| leaveRecordsDetails | `controller/Leave/leaveRecordsDetails.js` |
| managerLeaveStats | `controller/Leave/managerLeaveStats.js` |
| updateLeaveType | `controller/Leave/updateLeaveType.js` |
| fetchLeaveByEmployeeId | `controller/Leave/fetchLeaveByEmployeeId.js` |

### Employee Leave (in Employers controller)
| File | Path |
|------|------|
| leaveApplication | `controller/Employers/leaveApplication.js` |
| leaveAction | `controller/Employers/leaveAction.js` |
| getLeaveRecords | `controller/Employers/getLeaveRecords.js` |
| updateLeaveApplication | `controller/Employers/updateLeaveApplication.js` |
| deleteLeaveApplication | `controller/Employers/deleteLeaveApplication.js` |
| getAdminRecords | `controller/Employers/getAdminRecords.js` |
| getAdminApprovedRecords | `controller/Employers/getAdminApprovedRecords.js` |
| fetchLeaveRequests | `controller/Employers/fetchLeaveRequests.js` |
| fetchLeaveRequestsAdmin | `controller/Employers/fetchLeaveRequestsAdmin.js` |
| fetchLeaveRequestsDetails | `controller/Employers/fetchLeaveRequestsDetails.js` |
| fetchLeaveReqDetails | `controller/Employers/fetchLeaveReqDetails.js` |

### Cron (Leave-related)
| File | Path |
|------|------|
| daysUsed | `cron/daysUsed.js` |

### Designation Leave (adds leave to designations)
| File | Path |
|------|------|
| addDesignationLeave | `controller/createDesignation/addDesignationLeave.js` |

---

## 4. ANNOUNCEMENTS

### Models
| File | Path |
|------|------|
| Announcement | `model/Announcement.js` |

### Controllers
| File | Path |
|------|------|
| createAnnouncement | `controller/Announcement/createAnnouncement.js` |
| fetchAnnouncements | `controller/Announcement/fetchAnnouncements.js` |
| fetchAnnouncementById | `controller/Announcement/fetchAnnouncementById.js` |
| updateAnnouncement | `controller/Announcement/updateAnnouncement.js` |
| deleteAnnouncement | `controller/Announcement/deleteAnnouncement.js` |

---

## 5. NOTIFICATIONS

### Models
| File | Path |
|------|------|
| Notification | `model/Notification.js` |

### Controllers
| File | Path |
|------|------|
| fetchNotifications | `controller/Notification/fetchNotifications.js` |
| readNotification | `controller/Notification/readNotification.js` |
| createNotification | `controller/Notification/createNotification.js` |
| editNotifications | `controller/Notification/editNotifications.js` |
| deleteNotification | `controller/Notification/deleteNotification.js` |
| sendNotification | `controller/Notification/sendNotification.js` |
| assignNotification | `controller/Notification/assignNotification.js` |
| enableNotification | `controller/Notification/enableNotification.js` |
| disableNotification | `controller/Notification/disableNotification.js` |
| fetchNotificationLogs | `controller/Notification/fetchNotificationLogs.js` |

---

## 6. CALENDAR

### Models
| File | Path |
|------|------|
| Holidays | `model/Holidays.js` |
| Meetings | `model/Meetings.js` |

### Controllers (Holiday/Calendar)
| File | Path |
|------|------|
| calender | `controller/Holiday/calender.js` |
| createHoliday | `controller/Holiday/createHoliday.js` |
| updateHolidays | `controller/Holiday/updateHolidays.js` |
| fetchHoliday | `controller/Holiday/fetchHoliday.js` |
| fetchHolidayDetails | `controller/Holiday/fetchHolidayDetails.js` |
| deleteHoliday | `controller/Holiday/deleteHoliday.js` |
| leaveDetails | `controller/Holiday/leaveDetails.js` |

### Controllers (Meeting/Calendar)
| File | Path |
|------|------|
| createMeeting | `controller/Meeting/createMeeting.js` |
| updateMeeting | `controller/Meeting/updateMeeting.js` |
| fetchMeeting | `controller/Meeting/fetchMeeting.js` |
| fetchMeetingDetails | `controller/Meeting/fetchMeetingDetails.js` |
| deleteMeeting | `controller/Meeting/deleteMeeting.js` |
| fetchCalender | `controller/Meeting/fetchCalender.js` |
| leaveDetails | `controller/Meeting/leaveDetails.js` |

---

## 7. REPORTS

> **Note:** This project uses "Exports" and graph endpoints for reporting rather than a dedicated Reports module.

### Report/Export Controllers
| File | Path | Description |
|------|------|-------------|
| exportPayroll | `controller/Exports/exportPayroll.js` | Payroll export report |
| exportEmployees | `controller/Employers/exportEmployees.js` | Employee export report |
| payrollGraph | `controller/Payroll/payrollGraph.js` | Payroll analytics graph |
| expenseGraph | `controller/Expense/expenseGraph.js` | Expense analytics graph |
| leaveDetails | `controller/Leave/leaveDetails.js` | Leave stats report |
| leaveRecordsDetails | `controller/Leave/leaveRecordsDetails.js` | Leave records report |
| managerLeaveStats | `controller/Leave/managerLeaveStats.js` | Manager leave stats |

---

## 8. EXPENSE

### Models
| File | Path |
|------|------|
| Expense | `model/Expense.js` |
| ExpenseRequests | `model/ExpenseRequests.js` |

### Controllers
| File | Path |
|------|------|
| createExpense | `controller/Expense/createExpense.js` |
| fetchExpense | `controller/Expense/fetchExpense.js` |
| fetchExpenseDetails | `controller/Expense/fetchExpenseDetails.js` |
| updateExpense | `controller/Expense/updateExpense.js` |
| deleteExpense | `controller/Expense/deleteExpense.js` |
| approveExpenseRequests | `controller/Expense/approveExpenseRequests.js` |
| updateExpenseRequest | `controller/Expense/updateExpenseRequest.js` |
| deleteExpenseRequest | `controller/Expense/deleteExpenseRequest.js` |
| expenseGraph | `controller/Expense/expenseGraph.js` |

### Employee Expense (in Employers controller)
| File | Path |
|------|------|
| createExpenseRequest | `controller/Employers/createExpenseRequest.js` |
| setExpense | `controller/Employers/setExpense.js` |
| assignApproval | `controller/Employers/assignApproval.js` |

---

## 9. EMPLOYEE

### Models
| File | Path |
|------|------|
| Employees | `model/Employees.js` |
| Department | `model/Department.js` |
| Designation | `model/Designation.js` |
| Role | `model/Role.js` |

### Controllers
| File | Path |
|------|------|
| createEmployers | `controller/Employers/createEmployers.js` |
| fetchEmployees | `controller/Employers/fetchEmployees.js` |
| fetchSpecificEmployee | `controller/Employers/fetchSpecificEmployee.js` |
| updateEmployeeAdmin | `controller/Employers/updateEmployeeAdmin.js` |
| updateEmployee | `controller/Employers/updateEmployee.js` |
| deleteEmployer | `controller/Employers/deleteEmployer.js` |
| bulkEmployees | `controller/Employers/bulkEmployees.js` |
| searchEmployee | `controller/Employers/searchEmployee.js` |
| verifyEmployee | `controller/Employers/verifyEmployee.js` |
| completeAccount | `controller/Employers/completeAccount.js` |
| assignManagerEmployee | `controller/Employers/assignManagerEmployee.js` |
| addPaymentInformation | `controller/Employers/addPaymentInformation.js` |
| updatePayment | `controller/Employers/updatePayment.js` |
| addPaymentAdmin | `controller/Employers/addPaymentAdmin.js` |
| addTable | `controller/Employers/addTable.js` |
| fetchEmployeesByDepartment | `controller/Employers/fetchEmployeesByDepartment.js` |
| fetchEmployeesByManager | `controller/Employers/fetchEmployeesByManager.js` |
| exportEmployees | `controller/Employers/exportEmployees.js` |

### Department Controllers
| File | Path |
|------|------|
| addDepartment | `controller/Department/addDepartment.js` |
| fetchDepartment | `controller/Department/fetchDepartment.js` |
| updateDepartment | `controller/Department/updateDepartment.js` |
| deleteDepartment | `controller/Department/deleteDepartment.js` |
| assignManager | `controller/Department/assignManager.js` |

### Designation Controllers
| File | Path |
|------|------|
| createDesignation | `controller/createDesignation/createDesignation.js` |
| fetchDesignation | `controller/createDesignation/fetchDesignation.js` |
| updateDesignation | `controller/createDesignation/updateDesignation.js` |
| deleteDesignation | `controller/createDesignation/deleteDesignation.js` |
| assignDesignation | `controller/createDesignation/assignDesignation.js` |
| addDesignationLeave | `controller/createDesignation/addDesignationLeave.js` |
| addDesignationHmo | `controller/createDesignation/addDesignationHmo.js` |

---

## SHARED DEPENDENCIES

These models/controllers are used by multiple modules. Copy them if not already present:

### Core Models
- `model/Company.js` - Used by almost all modules
- `model/Role.js` - Roles and permissions
- `model/Designation.js` - Employee designations
- `model/Department.js` - Departments

### Utils
- `utils/dateUtils.js` - Used by Leave, Payroll, etc.
- `config/email.js` - Email sending
- `emailTemplate/index.js` - Email templates

### Middleware
- `middleware/auth.js` - JWT authentication
- `middleware/uploadFile.js` - File uploads

---

## ROUTE REGISTRATION

After copying files, register routes in your main route file. Key route patterns from `routes/adminRoute.js`:

- **Payroll:** `/createPayroll`, `/fetchPayroll`, `/fetchPayrollPeriods`, `/payrollGraph/:year`, etc.
- **Appraisals:** `/createKpiGroups`, `/createKpis`, `/fetchAppraisalGroups`, `/employeeFillAppraisal`, etc.
- **Leave:** `/createLeave`, `/leaveApplication`, `/leaveAction`, `/getLeaveRecords`, etc.
- **Announcements:** `/announcements` (CRUD)
- **Notifications:** `/notifications`, `/notifications/markAsRead/:id`
- **Calendar:** `/fetchCalendar`, `/createHoliday`, `/fetchHolidays`, `/createMeeting`, `/fetchMeetings`
- **Reports:** `/exportPayroll/:id`, `/exportEmployees`, `/leaveGraphDetails`
- **Expense:** `/createExpenseType`, `/createExpenseRequests`, `/expenseAction`, etc.
- **Employee:** `/addEmployee`, `/fetchEmployees`, `/updateEmployee`, etc.

Refer to `routes/adminRoute.js` lines 600-950 for exact route definitions and middleware usage.

---

## COPY COMMANDS (Unix/Mac)

Use these commands to copy entire module folders:

```bash
# Set source and destination
SOURCE="/Users/fullcircle_dev/Downloads/ACEALL-ERP-BK"
DEST="/Users/fullcircle_dev/Documents/GitHub/ERP-BK"

# Payroll
cp -r $SOURCE/controller/Payroll $DEST/controller/
cp -r $SOURCE/controller/Exports $DEST/controller/
cp -r $SOURCE/controller/salaryScale $DEST/controller/
cp $SOURCE/model/Payroll.js $SOURCE/model/PayrollPeriod.js $SOURCE/model/PeriodPayData.js \
   $SOURCE/model/SalaryScale.js $SOURCE/model/Debit.js $SOURCE/model/Credits.js $DEST/model/

# Appraisals
cp -r $SOURCE/controller/Appraisal $DEST/controller/
cp $SOURCE/model/AppraisalGroup.js $SOURCE/model/AppraisalPeriod.js $SOURCE/model/AppraisalData.js \
   $SOURCE/model/Kpi.js $SOURCE/model/EmployeeKpis.js $SOURCE/model/AppraisalRequest.js \
   $SOURCE/model/FinalRating.js $SOURCE/model/Rating.js $SOURCE/model/CheckInForm.js $DEST/model/

# Leave
cp -r $SOURCE/controller/Leave $DEST/controller/
cp $SOURCE/model/Leaves.js $SOURCE/model/LeaveRecords.js $DEST/model/
cp $SOURCE/cron/daysUsed.js $DEST/cron/

# Announcements
cp -r $SOURCE/controller/Announcement $DEST/controller/
cp $SOURCE/model/Announcement.js $DEST/model/

# Notifications
cp -r $SOURCE/controller/Notification $DEST/controller/
cp $SOURCE/model/Notification.js $DEST/model/

# Calendar
cp -r $SOURCE/controller/Holiday $DEST/controller/
cp -r $SOURCE/controller/Meeting $DEST/controller/
cp $SOURCE/model/Holidays.js $SOURCE/model/Meetings.js $DEST/model/

# Expense
cp -r $SOURCE/controller/Expense $DEST/controller/
cp $SOURCE/model/Expense.js $SOURCE/model/ExpenseRequests.js $DEST/model/

# Employee (partial - Employers has mixed concerns)
cp -r $SOURCE/controller/Employers $DEST/controller/
cp -r $SOURCE/controller/Department $DEST/controller/
cp -r $SOURCE/controller/createDesignation $DEST/controller/
cp $SOURCE/model/Employees.js $SOURCE/model/Department.js $SOURCE/model/Designation.js $DEST/model/
```

---

## IMPORTANT NOTES

1. **Employers controller** handles both Employee and Leave/Expense requests. Copy the entire folder; it's tightly coupled.
2. **CreateDesignation** contains `addDesignationLeave` and `addDesignationHmo` - needed for Leave setup.
3. **Requests controller** - `fetchRequests`, `approvedRequests` - used for approval workflows (Leave, Expense).
4. **Check import paths** - Ensure all controller imports point to correct model paths in your target project.
5. **Environment variables** - Copy any `.env` variables related to email, storage, etc.
