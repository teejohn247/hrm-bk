/**
 * Context Formatter Service
 * Converts raw MongoDB results into clean, structured text for the AI.
 * Updated to match your actual schema — especially nested payrollPeriodData.
 */

const { INTENTS } = require('./intentDetector');

function formatContextForGemini(intent, hrData) {
  if (!hrData || Object.keys(hrData).length === 0) return null;

  const sections = [];

  if (hrData.stats && Object.keys(hrData.stats).length > 0) {
    sections.push(formatStats(hrData.stats));
  }

  switch (intent.primary) {
    case INTENTS.EMPLOYEES:
      if (hrData.employees?.length > 0) sections.push(formatEmployees(hrData.employees));
      break;
    case INTENTS.PAYROLL:
      if (hrData.payrolls?.length > 0)       sections.push(formatPayrolls(hrData.payrolls));
      if (hrData.payrollPeriods?.length > 0) sections.push(formatPayrolls(hrData.payrollPeriods));
      break;
    case INTENTS.ABSENCE:
      if (hrData.absences?.length > 0) sections.push(formatAbsences(hrData.absences));
      break;
    case INTENTS.EXPENSES:
      if (hrData.expenses?.length > 0) sections.push(formatExpenses(hrData.expenses));
      break;
    case INTENTS.APPRAISAL:
      if (hrData.appraisals?.length > 0) sections.push(formatAppraisals(hrData.appraisals));
      break;
    case INTENTS.KPI:
      if (hrData.kpis?.length > 0)           sections.push(formatKpis(hrData.kpis));
      if (hrData.appraisalGroups?.length > 0) sections.push(formatAppraisalGroups(hrData.appraisalGroups));
      if (hrData.employeeKpis?.length > 0)    sections.push(formatEmployeeKpis(hrData.employeeKpis));
      break;
    case INTENTS.APPRAISAL_PERIOD:
      if (hrData.appraisalPeriods?.length > 0) sections.push(formatAppraisalPeriods(hrData.appraisalPeriods));
      if (hrData.appraisalData?.length > 0)    sections.push(formatAppraisalData(hrData.appraisalData));
      break;
    case INTENTS.LEARNING:
      if (hrData.courses?.length > 0) sections.push(formatCourses(hrData.courses));
      break;
    case INTENTS.CALENDAR:
      if (hrData.events?.length > 0) sections.push(formatEvents(hrData.events));
      break;
    case INTENTS.MEETINGS:
      if (hrData.meetings?.length > 0) sections.push(formatMeetings(hrData.meetings));
      break;
    case INTENTS.HR_SETTINGS:
      if (hrData.departments?.length > 0)  sections.push(formatDepartments(hrData.departments));
      if (hrData.branches?.length > 0)     sections.push(formatBranches(hrData.branches));
      if (hrData.designations?.length > 0) sections.push(formatDesignations(hrData.designations));
      if (hrData.holidays?.length > 0)     sections.push(formatHolidays(hrData.holidays));
      break;
    case INTENTS.REPORTS:
      if (hrData.employees?.length > 0)       sections.push(formatEmployeeReport(hrData.employees));
      if (hrData.absences?.length > 0)        sections.push(formatAbsenceReport(hrData.absences));
      if (hrData.expenses?.length > 0)        sections.push(formatExpenseReport(hrData.expenses));
      if (hrData.appraisalData?.length > 0)   sections.push(formatAppraisalData(hrData.appraisalData, 20));
      if (hrData.payrollPeriods?.length > 0)  sections.push(formatPayrolls(hrData.payrollPeriods, 12));
      break;
    default:
      if (hrData.employees?.length > 0)      sections.push(formatEmployees(hrData.employees, 10));
      if (hrData.payrollPeriods?.length > 0) sections.push(formatPayrolls(hrData.payrollPeriods, 3));
      if (hrData.absences?.length > 0)       sections.push(formatAbsences(hrData.absences, 5));
      if (hrData.expenses?.length > 0)       sections.push(formatExpenses(hrData.expenses, 5));
      break;
  }

  if (sections.length === 0) return 'No relevant HR data found for this query.';
  return sections.join('\n\n');
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatStats(stats) {
  const lines = ['## Summary Statistics'];

  if (stats.totalEmployees !== undefined) {
    lines.push(`- Total Employees: ${stats.totalEmployees} (${stats.activeEmployees || 0} active, ${stats.pendingEmployees || 0} pending)`);
  }
  if (stats.byDepartment) {
    const deptStr = Object.entries(stats.byDepartment)
      .sort((a, b) => b[1] - a[1])
      .map(([d, c]) => `${d}: ${c}`)
      .join(', ');
    lines.push(`- By Department: ${deptStr}`);
  }
  if (stats.totalPayrollRuns !== undefined) {
    lines.push(`- Payroll Runs: ${stats.totalPayrollRuns} (${stats.disbursedPayrolls || 0} disbursed, ${stats.pendingPayrolls || 0} pending/approved)`);
    lines.push(`- Total Disbursed: ₦${formatCurrency(stats.totalDisbursed)}`);
    lines.push(`- Total Gross Earnings: ₦${formatCurrency(stats.totalGrossEarnings)}`);
    lines.push(`- Total Deductions: ₦${formatCurrency(stats.totalDeductions)}`);
  }
  if (stats.totalAbsences !== undefined) {
    const decl = stats.declinedAbsences ?? 0;
    lines.push(`- Absence Records: ${stats.totalAbsences} (${stats.pendingAbsences} pending, ${stats.approvedAbsences} approved, ${decl} declined)`);
    if (stats.absencesByType) {
      const typeStr = Object.entries(stats.absencesByType).map(([t, c]) => `${t}: ${c}`).join(', ');
      lines.push(`- By Leave Type: ${typeStr}`);
    }
  }
  if (stats.totalExpenseAmount !== undefined) {
    lines.push(`- Expense Requests: ${stats.totalExpenses} totalling ₦${formatCurrency(stats.totalExpenseAmount)}`);
    lines.push(`- Pending Expense Approvals: ${stats.pendingExpenses}`);
  }
  if (stats.avgKpiScore !== undefined) {
    lines.push(`- Average KPI Score: ${stats.avgKpiScore}/10 across ${stats.totalAppraisals} appraisals`);
  }

  return lines.join('\n');
}

function formatEmployees(employees, limit = 50) {
  const records = employees.slice(0, limit);
  const lines   = [`## Employees (${employees.length} total, showing ${records.length})`];
  lines.push('(Work anniversary = started in a **previous year**; the anniversary is the same month in a later year. Do NOT list anyone who started this month or this year—they have not had an anniversary yet.)');

  for (const emp of records) {
    const name      = emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
    const dept      = emp.department || 'N/A';
    const role      = emp.designation || emp.role || 'N/A';
    const startRaw  = emp.employmentStartDate || emp.startDate;
    let startDate   = 'N/A';
    if (startRaw) {
      if (typeof startRaw === 'string' && /^\d{1,2}-\d{1,2}-\d{4}$/.test(startRaw)) {
        const [d, m, y] = startRaw.split('-').map(Number);
        startDate = new Date(y, m - 1, d).toLocaleDateString('en-NG'); // DD-MM-YYYY
      } else {
        startDate = new Date(startRaw).toLocaleDateString('en-NG');
      }
    }
    const type      = emp.isManager ? 'Manager' : (emp.jobType || 'Staff');
    lines.push(`- ${name} | ${dept} | ${role} | ${type} | ${emp.status || 'N/A'} | Started: ${startDate}`);
  }

  if (employees.length > limit) lines.push(`... and ${employees.length - limit} more`);
  return lines.join('\n');
}

function formatPayrolls(payrolls, limit = 20) {
  const records = payrolls.slice(0, limit);
  const lines   = [`## Payroll Records (${payrolls.length} total)`];

  for (const p of records) {
    const name    = p.payrollPeriodName || p.description || 'Payroll';
    const start   = p.startDate ? new Date(p.startDate).toLocaleDateString('en-NG') : 'N/A';
    const end     = p.endDate   ? new Date(p.endDate).toLocaleDateString('en-NG')   : 'N/A';
    const gross   = p.totalEarnings || p.periodTotals?.totalEarnings || 0;
    const net     = p.netEarnings   || 0;
    const ded     = p.deductions    || p.periodTotals?.totalDeductions || 0;
    const empCount = p.periodTotals?.employeeCount || p.payrollPeriodData?.length || 'N/A';

    lines.push(`- [${p.reference || 'N/A'}] ${name} | ${start} – ${end} | Employees: ${empCount} | Gross: ₦${formatCurrency(gross)} | Deductions: ₦${formatCurrency(ded)} | Net: ₦${formatCurrency(net)} | Status: ${p.status}`);

    // Show top employee breakdown from payrollPeriodData (max 5)
    if (p.payrollPeriodData?.length > 0) {
      lines.push(`  Employee breakdown (${p.payrollPeriodData.length} employees):`);
      p.payrollPeriodData.slice(0, 5).forEach(emp => {
        const empName = emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
        const empNet  = emp.netEarnings || 0;
        const empDept = emp.department || emp.role || 'N/A';
        lines.push(`    • ${empName} (${empDept}) — Net: ₦${formatCurrency(empNet)} | Status: ${emp.status || 'N/A'}`);
      });
      if (p.payrollPeriodData.length > 5) {
        lines.push(`    ... and ${p.payrollPeriodData.length - 5} more employees`);
      }
    }
  }

  return lines.join('\n');
}

function formatAbsences(absences, limit = 50) {
  const records = absences.slice(0, limit);
  const lines   = [`## Absence / Leave Records (${absences.length} total)`];
  lines.push('(For "currently on leave": only leaves spanning today count. If none span today, say "No one is currently on leave today" and list recent/upcoming leaves below — do not say the leave system is empty.)');

  for (const a of records) {
    const name  = a._employeeName || a.fullName || a.employeeName || `Employee ${a.userId || a.employeeId || a.employee}`;
    const dept  = a._department ? ` (${a._department})` : (a.department ? ` (${a.department})` : '');
    const type  = a.leaveTypeName || a.leaveType || a.absenceType || a.type || 'Leave';
    const start = (a.leaveStartDate || a.startDate) ? new Date(a.leaveStartDate || a.startDate).toLocaleDateString('en-NG') : 'N/A';
    const end   = (a.leaveEndDate || a.endDate)   ? new Date(a.leaveEndDate || a.endDate).toLocaleDateString('en-NG')   : 'N/A';
    const days  = a.daysRequested ?? a.daysCount ?? a.numberOfDays ?? a.days ?? '';
    lines.push(`- ${name}${dept} | ${type}${days ? ` (${days} days)` : ''} | ${start} to ${end} | ${a.status}`);
  }

  return lines.join('\n');
}

function formatExpenses(expenses, limit = 50) {
  const records = expenses.slice(0, limit);
  const lines   = [`## Expense Requests (${expenses.length} total)`];

  for (const e of records) {
    const name   = e._employeeName || e.employeeName || `Employee ${e.employeeId || e.employee}`;
    const type   = e.expenseType || e.category || e.type || 'Expense';
    const amount = e.amount || e.totalAmount || 0;
    const date   = e.dateRequested || e.createdAt
      ? new Date(e.dateRequested || e.createdAt).toLocaleDateString('en-NG')
      : 'N/A';
    const approver = e.approver || e.approvedBy || 'N/A';
    lines.push(`- ${name} | ${type} | ₦${formatCurrency(amount)} | ${date} | Approver: ${approver} | ${e.status}`);
  }

  return lines.join('\n');
}

function formatAppraisals(appraisals, limit = 50) {
  const records = appraisals.slice(0, limit);
  const lines   = [`## Appraisal Records (${appraisals.length} total)`];

  for (const a of records) {
    const name   = a._employeeName || `Employee ${a.employeeId || a.employee}`;
    const dept   = a._department ? ` (${a._department})` : '';
    const period = a.period || a.appraisalPeriod || 'N/A';
    const kpi    = a.kpiScore     != null ? `KPI: ${a.kpiScore}`       : '';
    const mgr    = a.managerScore != null ? `Mgr: ${a.managerScore}`   : '';
    const self   = a.selfScore    != null ? `Self: ${a.selfScore}`     : '';
    const overall= a.overallScore != null ? `Overall: ${a.overallScore}` : '';
    const scores = [kpi, mgr, self, overall].filter(Boolean).join(' | ');
    lines.push(`- ${name}${dept} | Period: ${period} | ${scores || 'No scores yet'} | ${a.status || 'N/A'}`);
  }

  return lines.join('\n');
}

function formatCourses(courses, limit = 20) {
  const records = courses.slice(0, limit);
  const lines   = [`## Courses (${courses.length} total)`];

  for (const c of records) {
    lines.push(
      `- "${c.title}" | ${c.category || 'N/A'} | ${c.duration || 'N/A'} mins | ${c.enrolledCount || 0} enrolled | ${c.completionRate || 0}% complete`
    );
  }

  return lines.join('\n');
}

function formatEvents(events, limit = 20) {
  const records = events.slice(0, limit);
  const lines   = [`## Upcoming Events (${events.length} in next 30 days)`];

  for (const e of records) {
    const rawDate = e.date || e.startDate || e.meetingDate;
    const date    = rawDate
      ? new Date(rawDate).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })
      : 'N/A';
    lines.push(`- [${e.type || 'Event'}] ${e.title || 'Untitled'} | ${date}`);
  }

  return lines.join('\n');
}

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '0';
  return Number(amount).toLocaleString('en-NG');
}

// ─── New formatters ───────────────────────────────────────────────────────────

function formatMeetings(meetings, limit = 30) {
  const records = meetings.slice(0, limit);
  const lines   = [`## Upcoming Meetings (${meetings.length} total)`];
  for (const m of records) {
    const start = m.meetingStartTime ? new Date(m.meetingStartTime).toLocaleString('en-NG') : 'N/A';
    const end   = m.meetingEndTime   ? new Date(m.meetingEndTime).toLocaleString('en-NG')   : '';
    const guests = (m.invitedGuests || []).map(g => g.employeeName).filter(Boolean).join(', ') || 'None';
    lines.push(`- "${m.title || 'Meeting'}" | ${start}${end ? ' – ' + end : ''} | Location: ${m.location || 'N/A'} | Organizer: ${m.organizerName || 'N/A'} | Guests: ${guests} | Status: ${m.status || 'N/A'}`);
  }
  return lines.join('\n');
}

function formatDepartments(depts, limit = 50) {
  const lines = [`## Departments (${depts.length} total)`];
  for (const d of depts.slice(0, limit)) {
    lines.push(`- ${d.departmentName} | Manager: ${d.managerName || 'N/A'}`);
  }
  return lines.join('\n');
}

function formatBranches(branches, limit = 50) {
  const lines = [`## Branches (${branches.length} total)`];
  for (const b of branches.slice(0, limit)) {
    const addr = b.branchAddress ? `${b.branchAddress.city || ''}, ${b.branchAddress.state || ''}`.replace(/^,\s*/, '') : 'N/A';
    lines.push(`- ${b.branchName} (${b.branchCode}) | ${addr} | Manager: ${b.branchManager?.managerName || 'N/A'} | ${b.isActive ? 'Active' : 'Inactive'}${b.isHeadOffice ? ' (Head Office)' : ''}`);
  }
  return lines.join('\n');
}

function formatDesignations(desigs, limit = 50) {
  const lines = [`## Designations (${desigs.length} total)`];
  for (const d of desigs.slice(0, limit)) {
    lines.push(`- ${d.designationName} | Grade: ${d.grade || 'N/A'} | Description: ${d.description || 'N/A'}`);
  }
  return lines.join('\n');
}

function formatHolidays(holidays, limit = 30) {
  const lines = [`## Holidays (${holidays.length} total)`];
  for (const h of holidays.slice(0, limit)) {
    lines.push(`- ${h.holidayName} | Date: ${h.date || 'N/A'} | ${h.description || ''}`);
  }
  return lines.join('\n');
}

function formatKpis(kpis, limit = 30) {
  const lines = [`## KPIs (${kpis.length} total)`];
  for (const k of kpis.slice(0, limit)) {
    const assigned = (k.assignedEmployees || []).length;
    lines.push(`- "${k.kpiName}" | Type: ${k.type || 'N/A'} | Target: ${k.remarks?.target || 0} | Weight: ${k.remarks?.weight || 0} | Assigned to: ${assigned} employee(s)`);
  }
  return lines.join('\n');
}

function formatAppraisalGroups(groups, limit = 20) {
  const lines = [`## KPI Groups / Appraisal Groups (${groups.length} total)`];
  for (const g of groups.slice(0, limit)) {
    const kpiCount = (g.groupKpis || []).length;
    const depts    = (g.assignedDepartments || []).map(d => d.department_name).join(', ') || 'All';
    lines.push(`- "${g.groupName}" | KPIs: ${kpiCount} | Weight: ${g.weight || 0}% | Departments: ${depts}`);
  }
  return lines.join('\n');
}

function formatEmployeeKpis(ekpis, limit = 50) {
  const lines = [`## Employee KPIs (${ekpis.length} total)`];
  for (const e of ekpis.slice(0, limit)) {
    const groupCount = (e.kpiGroups || []).length;
    lines.push(`- ${e.employeeName || 'N/A'} | Period: ${e.appraisalPeriodId || 'N/A'} | Groups: ${groupCount} | Manager: ${e.managerName || 'N/A'} | Status: ${e.status || 'N/A'}`);
  }
  return lines.join('\n');
}

function formatAppraisalPeriods(periods, limit = 10) {
  const lines = [`## Appraisal Periods (${periods.length} total)`];
  for (const p of periods.slice(0, limit)) {
    lines.push(`- "${p.appraisalPeriodName}" | ${p.startDate || 'N/A'} – ${p.endDate || 'N/A'} | Status: ${p.status || 'N/A'} | Progress: ${p.progress || 0}% | Active: ${p.active ? 'Yes' : 'No'}`);
  }
  return lines.join('\n');
}

function formatAppraisalData(data, limit = 50) {
  const records = data.slice(0, limit);
  const lines   = [`## Appraisal Records (${data.length} total, showing ${records.length})`];
  for (const a of records) {
    const groupCount   = (a.kpiGroups || []).length;
    const submittedEmp = a.employeeSubmissionDate ? '✓ Employee submitted' : '✗ Employee pending';
    const submittedMgr = a.managerReviewDate      ? '✓ Manager reviewed'  : '✗ Manager pending';
    lines.push(`- ${a.employeeName || 'N/A'} | ${a.department || 'N/A'} | ${a.designation || 'N/A'} | Period: ${a.appraisalPeriodName || 'N/A'} | KPI Groups: ${groupCount} | ${submittedEmp} | ${submittedMgr} | Status: ${a.status || 'N/A'}`);
  }
  return lines.join('\n');
}

// ─── Report formatters ────────────────────────────────────────────────────────

function formatEmployeeReport(employees) {
  const total    = employees.length;
  const active   = employees.filter(e => e.status?.toLowerCase() === 'active').length;
  const pending  = employees.filter(e => e.status?.toLowerCase() === 'pending').length;
  const managers = employees.filter(e => e.isManager).length;

  const byDept = {};
  const byType = {};
  const byGender = {};
  for (const e of employees) {
    const dept = e.department || 'Unknown';
    byDept[dept] = (byDept[dept] || 0) + 1;
    const type = e.jobType || 'Unknown';
    byType[type] = (byType[type] || 0) + 1;
    if (e.gender) byGender[e.gender] = (byGender[e.gender] || 0) + 1;
  }

  const deptStr   = Object.entries(byDept).sort((a, b) => b[1] - a[1]).map(([d, c]) => `${d}: ${c}`).join(', ');
  const typeStr   = Object.entries(byType).map(([t, c]) => `${t}: ${c}`).join(', ');
  const genderStr = Object.entries(byGender).map(([g, c]) => `${g}: ${c}`).join(', ');

  return [
    `## Employee Report`,
    `- Total: ${total} | Active: ${active} | Pending: ${pending} | Managers: ${managers}`,
    `- By Department: ${deptStr}`,
    `- By Employment Type: ${typeStr}`,
    `- By Gender: ${genderStr || 'N/A'}`,
  ].join('\n');
}

function formatAbsenceReport(absences) {
  const total    = absences.length;
  const approved = absences.filter(a => a.status?.toLowerCase() === 'approved').length;
  const pending  = absences.filter(a => a.status?.toLowerCase() === 'pending').length;
  const declined = absences.filter(a => a.status?.toLowerCase() === 'declined').length;
  const totalDays = absences.reduce((s, a) => s + (a.daysRequested || 0), 0);

  const byType = {};
  const byDept = {};
  for (const a of absences) {
    const t = a.leaveTypeName || 'Unknown';
    byType[t] = (byType[t] || 0) + 1;
    if (a.department) byDept[a.department] = (byDept[a.department] || 0) + 1;
  }

  const typeStr = Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([t, c]) => `${t}: ${c}`).join(', ');
  const deptStr = Object.entries(byDept).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([d, c]) => `${d}: ${c}`).join(', ');

  return [
    `## Absence / Leave Report`,
    `- Total Requests: ${total} | Approved: ${approved} | Pending: ${pending} | Declined: ${declined}`,
    `- Total Days Requested: ${totalDays}`,
    `- By Leave Type: ${typeStr}`,
    `- Top Departments: ${deptStr || 'N/A'}`,
  ].join('\n');
}

function formatExpenseReport(expenses) {
  const total    = expenses.length;
  const approved = expenses.filter(e => e.status?.toLowerCase() === 'approved').length;
  const pending  = expenses.filter(e => e.status?.toLowerCase() === 'pending').length;
  const totalAmt = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const approvedAmt = expenses
    .filter(e => e.status?.toLowerCase() === 'approved')
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  const byType = {};
  for (const e of expenses) {
    const t = e.expenseTypeName || 'Unknown';
    byType[t] = (byType[t] || 0) + (parseFloat(e.amount) || 0);
  }
  const typeStr = Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t, v]) => `${t}: ₦${formatCurrency(v)}`).join(', ');

  return [
    `## Expense Report`,
    `- Total Requests: ${total} | Approved: ${approved} | Pending: ${pending}`,
    `- Total Amount: ₦${formatCurrency(totalAmt)} | Approved Amount: ₦${formatCurrency(approvedAmt)}`,
    `- By Expense Type: ${typeStr}`,
  ].join('\n');
}

// ─── Mutation result formatter ────────────────────────────────────────────────

/**
 * Converts a mutationExecutor result object into a short plain-text summary
 * that is injected into the Groq prompt so the AI can narrate the outcome.
 */
function formatMutationResult(result) {
  if (!result) return 'No result returned from the mutation.';

  if (!result.ok) {
    let msg = `Action FAILED: ${result.error || 'Unknown error.'}`;
    if (Array.isArray(result.missingFields) && result.missingFields.length > 0) {
      msg += `\nMissing required fields that must be collected from the user: ${result.missingFields.join(', ')}.`;
      msg += '\nAsk the user for these details in a single friendly message so you can complete the action.';
    }
    return msg;
  }

  const lines = [`Action SUCCEEDED: ${result.message || ''}`];

  if (result.count !== undefined) {
    lines.push(`Records affected: ${result.count}`);
  }

  if (Array.isArray(result.records) && result.records.length > 0) {
    lines.push('Details:');
    for (const r of result.records) {
      const parts = [];
      if (r.employee || r.name) parts.push(r.employee || r.name);
      if (r.type)   parts.push(r.type);
      if (r.dates)  parts.push(r.dates);
      if (r.amount) parts.push(`₦${r.amount}`);
      if (r.status) parts.push(`Status: ${r.status}`);
      if (parts.length) lines.push(`  - ${parts.join(' | ')}`);
    }
  }

  if (result.record && !Array.isArray(result.records)) {
    const r = result.record;
    const parts = [];
    if (r.id)    parts.push(`ID: ${r.id}`);
    if (r.name)  parts.push(r.name);
    if (r.status) parts.push(`Status: ${r.status}`);
    if (r.employmentStartDate != null && r.employmentStartDate !== '') parts.push(`Started: ${r.employmentStartDate}`);
    if (r.startDate != null && r.startDate !== '' && !r.employmentStartDate) parts.push(`Started: ${r.startDate}`);
    if (r.department) parts.push(`Department: ${r.department}`);
    if (r.designation) parts.push(`Designation: ${r.designation}`);
    if (parts.length) lines.push(`Record: ${parts.join(' | ')}`);
  }

  return lines.join('\n');
}

module.exports = { formatContextForGemini, formatMutationResult };