/**
 * Query Builder Service
 *
 * Payroll uses TWO collections:
 *   payrollPeriods — PayrollPeriod model (period headers)
 *                    startDate/endDate are STRINGS not Dates
 *   payrollData    — periodPayData model (employee pay records)
 *                    linked to period via payrollPeriodId
 *
 * dataFetcher.js handles the two-collection join automatically
 * when 'payrollPeriods' appears in collections[].
 */

const { INTENTS } = require('./intentDetector');

function buildMongoQuery(intent, companyId, userId, userRole) {
  // All searches must be scoped to a company — never run cross-company or global
  if (companyId == null || companyId === '') {
    throw new Error('companyId is required for all queries; data is always scoped to a single company.');
  }
  const companyIdStr = String(companyId);
  const baseFilter = { companyId: companyIdStr };
  const roleFilter = applyRoleFilter(userRole, userId, baseFilter);
  const filters    = applyIntentFilters(intent.filters, roleFilter);

  switch (intent.primary) {
    case INTENTS.EMPLOYEES:       return buildEmployeeQuery(filters, intent);
    case INTENTS.PAYROLL:         return buildPayrollQuery(filters, intent);
    case INTENTS.ABSENCE:         return buildAbsenceQuery(filters, intent);
    case INTENTS.EXPENSES:        return buildExpenseQuery(filters, intent);
    case INTENTS.APPRAISAL:       return buildAppraisalQuery(filters, intent);
    case INTENTS.KPI:             return buildKpiQuery(filters, intent);
    case INTENTS.APPRAISAL_PERIOD:return buildAppraisalPeriodQuery(filters, intent);
    case INTENTS.LEARNING:        return buildLearningQuery(filters, intent);
    case INTENTS.CALENDAR:        return buildCalendarQuery(filters, intent);
    case INTENTS.MEETINGS:        return buildMeetingsQuery(filters, intent);
    case INTENTS.HR_SETTINGS:     return buildHRSettingsQuery(filters, intent);
    case INTENTS.REPORTS:         return buildReportsQuery(filters, intent);
    default:                      return buildGeneralQuery(filters);
  }
}

// ─── Collection builders ──────────────────────────────────────────────────────

function buildEmployeeQuery(filters, intent) {
  const query = { ...filters };
  if (filters.status)     query.status = capitalize(filters.status);
  if (filters.department) query.department = filters.department;

  return {
    collections: ['employees'],
    employees: {
      query,
      projection: {
        firstName: 1, lastName: 1, fullName: 1, email: 1,
        department: 1, designation: 1, role: 1,
        jobType: 1, status: 1, startDate: 1, employmentStartDate: 1, isManager: 1,
      },
      sort:  { createdAt: -1 },
      limit: 50,
    },
  };
}

function buildPayrollQuery(filters, intent) {
  // Always query by companyId only — no role $or filter on payroll
  // startDate/endDate are STRINGS so we can't do date range queries on them
  const query = { companyId: filters.companyId };

  // If user asks for a specific status
  if (filters.status) query.status = capitalize(filters.status);

  return {
    // dataFetcher detects 'payrollPeriods' and automatically fetches
    // payrollData (periodPayData) for those periods too
    collections: ['payrollPeriods'],
    payrollPeriods: {
      query,
      projection: {
        _id: 1,
        companyId: 1,
        payrollPeriodName: 1,
        description: 1,
        reference: 1,
        startDate: 1,         // stored as String
        endDate: 1,           // stored as String
        date: 1,
        totalEarnings: 1,
        netEarnings: 1,
        deductions: 1,
        status: 1,
        periodStatusApproved: 1,
        periodPayrollDisbursed: 1,
        approvers: 1,
        createdAt: 1,
        updatedAt: 1,
      },
      sort:  { createdAt: -1 },
      limit: 20,
    },
  };
}

function buildAbsenceQuery(filters, intent) {
  const query = { ...filters };
  if (filters.status) query.status = capitalize(filters.status);

  // LeaveRecords uses leaveStartDate/leaveEndDate (strings), not startDate
  if (intent.filters?.time) {
    const { month, year } = intent.filters.time;
    if (month && year) {
      const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const endStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
      query.leaveStartDate = { $gte: startStr, $lt: endStr };
    }
  }

  return {
    collections: ['absences', 'employees'],
    absences: {
      query,
      projection: {
        userId: 1, employeeId: 1, employee: 1,
        fullName: 1, leaveTypeName: 1, leaveType: 1, absenceType: 1, type: 1,
        leaveStartDate: 1, leaveEndDate: 1, startDate: 1, endDate: 1,
        status: 1, requestDate: 1, dateSubmitted: 1, createdAt: 1,
        daysRequested: 1, daysCount: 1, numberOfDays: 1, days: 1,
        reason: 1,
      },
      sort:  { requestDate: -1, createdAt: -1 },
      limit: 100,
    },
    employees: {
      query: { companyId: filters.companyId },
      projection: { firstName: 1, lastName: 1, fullName: 1, department: 1, employmentStartDate: 1, startDate: 1 },
      limit: 100,
    },
  };
}

function buildExpenseQuery(filters, intent) {
  const query = { ...filters };
  if (filters.status) query.status = capitalize(filters.status);

  if (intent.filters?.time) {
    const { month, year } = intent.filters.time;
    if (month && year) {
      query.createdAt = {
        $gte: new Date(year, month - 1, 1),
        $lt:  new Date(year, month, 1),
      };
    }
  }

  return {
    collections: ['expenses'],
    expenses: {
      query,
      projection: {
        employeeId: 1, employee: 1, employeeName: 1,
        expenseType: 1, category: 1, type: 1,
        amount: 1, totalAmount: 1,
        dateRequested: 1, createdAt: 1,
        approver: 1, approvedBy: 1,
        status: 1, description: 1, note: 1,
      },
      sort:  { createdAt: -1 },
      limit: 50,
    },
  };
}

function buildAppraisalQuery(filters, intent) {
  const query = { ...filters };
  if (filters.department) query.department = filters.department;

  return {
    collections: ['appraisals', 'employees'],
    appraisals: {
      query,
      projection: {
        employeeId: 1, employee: 1,
        period: 1, appraisalPeriod: 1,
        kpiScore: 1, managerScore: 1, selfScore: 1, overallScore: 1,
        status: 1, updatedAt: 1, createdAt: 1,
      },
      sort:  { updatedAt: -1 },
      limit: 50,
    },
    employees: {
      query: { companyId: filters.companyId },
      projection: { firstName: 1, lastName: 1, fullName: 1, department: 1, designation: 1, employmentStartDate: 1, startDate: 1 },
      limit: 100,
    },
  };
}

function buildLearningQuery(filters, intent) {
  return {
    collections: ['courses', 'enrollments'],
    courses: {
      query: { companyId: filters.companyId },
      projection: {
        title: 1, category: 1, duration: 1,
        enrolledCount: 1, completionRate: 1, createdAt: 1,
      },
      sort:  { enrolledCount: -1 },
      limit: 20,
    },
    enrollments: {
      query: { companyId: filters.companyId },
      projection: {
        employeeId: 1, employee: 1,
        courseId: 1, course: 1,
        progress: 1, completedAt: 1, status: 1,
      },
      limit: 100,
    },
  };
}

function buildCalendarQuery(filters, intent) {
  const now        = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    collections: ['events'],
    events: {
      query: {
        companyId: filters.companyId,
        $or: [
          { date:        { $gte: now, $lte: thirtyDays } },
          { startDate:   { $gte: now, $lte: thirtyDays } },
          { meetingDate: { $gte: now, $lte: thirtyDays } },
        ],
      },
      projection: {
        title: 1, date: 1, startDate: 1, meetingDate: 1,
        type: 1, participants: 1, attendees: 1, description: 1,
      },
      sort:  { date: 1, startDate: 1 },
      limit: 20,
    },
  };
}

function buildGeneralQuery(filters) {
  return {
    collections: ['employees', 'payrollPeriods', 'absences', 'expenses'],
    employees: {
      query: { companyId: filters.companyId },
      projection: { firstName: 1, lastName: 1, department: 1, status: 1, employmentStartDate: 1, startDate: 1 },
      limit: 100,
    },
    payrollPeriods: {
      query: { companyId: filters.companyId },
      projection: {
        reference: 1, payrollPeriodName: 1,
        totalEarnings: 1, netEarnings: 1, deductions: 1,
        status: 1, startDate: 1, endDate: 1,
        periodPayrollDisbursed: 1,
      },
      sort:  { createdAt: -1 },
      limit: 5,
    },
    absences: {
      query: { companyId: filters.companyId },
      projection: { fullName: 1, leaveTypeName: 1, leaveStartDate: 1, leaveEndDate: 1, daysRequested: 1, status: 1, requestDate: 1 },
      sort: { requestDate: -1 },
      limit: 100,
    },
    expenses: {
      query: { companyId: filters.companyId },
      limit: 50,
    },
  };
}

// ─── New query builders ───────────────────────────────────────────────────────

function buildKpiQuery(filters, intent) {
  const base = { companyId: filters.companyId };
  return {
    collections: ['kpis', 'appraisalGroups', 'employeeKpis'],
    kpis: {
      query: base,
      projection: { kpiName: 1, kpiDescription: 1, type: 1, remarks: 1, assignedEmployees: 1, departments: 1, createdBy: 1 },
      sort:  { createdAt: -1 },
      limit: 50,
    },
    appraisalGroups: {
      query: base,
      projection: { groupName: 1, description: 1, weight: 1, threshold: 1, groupKpis: 1, assignedDesignations: 1, assignedDepartments: 1 },
      limit: 20,
    },
    employeeKpis: {
      query: { ...base, ...(filters.employeeId ? { employeeId: filters.employeeId } : {}) },
      projection: { employeeName: 1, employeeId: 1, status: 1, appraisalPeriodId: 1, kpiGroups: 1, managerName: 1 },
      sort:  { createdAt: -1 },
      limit: 50,
    },
  };
}

function buildAppraisalPeriodQuery(filters, intent) {
  const base = { companyId: filters.companyId };
  return {
    collections: ['appraisalPeriods', 'appraisalData', 'employees'],
    appraisalPeriods: {
      query: base,
      projection: { appraisalPeriodName: 1, startDate: 1, endDate: 1, status: 1, progress: 1, active: 1 },
      sort:  { createdAt: -1 },
      limit: 10,
    },
    appraisalData: {
      query: { ...base, ...(filters.status ? { status: new RegExp(filters.status, 'i') } : {}) },
      projection: { employeeName: 1, department: 1, designation: 1, appraisalPeriodName: 1, status: 1, kpiGroups: 1, managerName: 1, employeeSubmissionDate: 1, managerReviewDate: 1 },
      sort:  { createdAt: -1 },
      limit: 100,
    },
    employees: {
      query: { companyId: filters.companyId },
      projection: { firstName: 1, lastName: 1, fullName: 1, department: 1, designation: 1, employmentStartDate: 1, startDate: 1 },
      limit: 200,
    },
  };
}

function buildMeetingsQuery(filters, intent) {
  const now  = new Date();
  const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return {
    collections: ['meetings'],
    meetings: {
      query: {
        companyId: filters.companyId,
        meetingStartTime: { $gte: now, $lte: soon },
      },
      projection: { title: 1, description: 1, meetingStartTime: 1, meetingEndTime: 1, location: 1, organizerName: 1, invitedGuests: 1, status: 1, meetLink: 1 },
      sort:  { meetingStartTime: 1 },
      limit: 30,
    },
  };
}

function buildHRSettingsQuery(filters, intent) {
  const base = { companyId: filters.companyId };
  return {
    collections: ['departments', 'branches', 'designations', 'holidays'],
    departments: {
      query: base,
      projection: { departmentName: 1, managerId: 1, managerName: 1, assignedAppraisals: 1 },
      limit: 100,
    },
    branches: {
      query: base,
      projection: { branchName: 1, branchCode: 1, branchAddress: 1, branchManager: 1, isActive: 1, isHeadOffice: 1 },
      limit: 50,
    },
    designations: {
      query: base,
      projection: { designationName: 1, grade: 1, description: 1, leaveTypes: 1, expenseCard: 1 },
      limit: 100,
    },
    holidays: {
      query: base,
      projection: { holidayName: 1, date: 1, description: 1 },
      sort:  { date: 1 },
      limit: 50,
    },
  };
}

function buildReportsQuery(filters, intent) {
  const base    = { companyId: filters.companyId };
  const now     = new Date();
  const yearAgo = new Date(now.getFullYear(), 0, 1);

  return {
    collections: ['employees', 'absences', 'expenses', 'appraisalData', 'payrollPeriods'],
    employees: {
      query: base,
      projection: { firstName: 1, lastName: 1, fullName: 1, department: 1, designation: 1, jobType: 1, status: 1, startDate: 1, employmentStartDate: 1, gender: 1, isManager: 1 },
      limit: 500,
    },
    absences: {
      query: base,
      projection: { fullName: 1, department: 1, leaveTypeName: 1, leaveStartDate: 1, leaveEndDate: 1, daysRequested: 1, status: 1, requestDate: 1 },
      sort:  { requestDate: -1 },
      limit: 200,
    },
    expenses: {
      query: base,
      projection: { employeeName: 1, expenseTypeName: 1, amount: 1, expenseDate: 1, status: 1, department: 1 },
      sort:  { expenseDate: -1 },
      limit: 200,
    },
    appraisalData: {
      query: base,
      projection: { employeeName: 1, department: 1, designation: 1, status: 1, appraisalPeriodName: 1, kpiGroups: 1 },
      limit: 200,
    },
    payrollPeriods: {
      query: { companyId: filters.companyId },
      projection: { payrollPeriodName: 1, totalEarnings: 1, netEarnings: 1, deductions: 1, status: 1, startDate: 1, endDate: 1 },
      sort:  { createdAt: -1 },
      limit: 12,
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applyRoleFilter(userRole, userId, baseFilter) {
  // LeaveRecords use userId; other collections use employeeId/employee
  const empRefs = [{ employeeId: userId }, { employee: userId }, { userId: userId }];
  const mgrRefs = [...empRefs, { managerId: userId }, { manager: userId }];
  switch (userRole) {
    case 'employee':
      return { ...baseFilter, $or: empRefs };
    case 'manager':
      return { ...baseFilter, $or: mgrRefs };
    case 'admin':
    case 'super_admin':
    default:
      return baseFilter;
  }
}

function applyIntentFilters(intentFilters, baseFilter) {
  if (!intentFilters) return baseFilter;
  const filters = { ...baseFilter };
  if (intentFilters.entity) Object.assign(filters, intentFilters.entity);
  return filters;
}

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

module.exports = { buildMongoQuery };