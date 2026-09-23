// /**
//  * Data Fetcher Service
//  * Executes MongoDB queries directly via Mongoose — no API tokens needed.
//  *
//  * Payroll: TWO collections — PayrollPeriod (headers) + periodPayData (employee records)
//  *
//  * LeaveRecords actual field names (verified from DB):
//  *   fullName, leaveTypeName, leaveStartDate, leaveEndDate,
//  *   daysRequested, daysLeft, status, approved, leaveApprover,
//  *   requestDate, requestMessage, decisionMessage, department,
//  *   companyId (stored as plain STRING — no ObjectId conversion)
//  */

// const mongoose = require('mongoose');

// // ─── Model imports ─────────────────────────────────────────────────────────────
// let Employee, Company, PayrollPeriod, PeriodPayData,
//     Absence, ExpenseRequests, AppraisalRequest,
//     Course, CourseProgress, Meeting,
//     Department, Branch, Designation, Holiday,
//     Kpi, AppraisalGroup, AppraisalPeriod, AppraisalData, EmployeeKpi,
//     Announcement;

// try {
//   Employee         = require('../../model/Employees');
//   Company          = require('../../model/Company');
//   PayrollPeriod    = require('../../model/PayrollPeriod');
//   PeriodPayData    = require('../../model/PeriodPayData');
//   Absence          = require('../../model/LeaveRecords').default || require('../../model/LeaveRecords');
//   ExpenseRequests  = require('../../model/ExpenseRequests');
//   AppraisalRequest = require('../../model/AppraisalRequest');
//   Course           = require('../../model/Course').default || require('../../model/Course');
//   CourseProgress   = require('../../model/CourseProgress').default || require('../../model/CourseProgress');
//   Meeting          = require('../../model/Meetings');
//   Department       = require('../../model/Department');
//   Branch           = require('../../model/Branch');
//   Designation      = require('../../model/Designation');
//   Holiday          = require('../../model/Holidays');
//   Kpi              = require('../../model/Kpi');
//   AppraisalGroup   = require('../../model/AppraisalGroup');
//   AppraisalPeriod  = require('../../model/AppraisalPeriod');
//   AppraisalData    = require('../../model/AppraisalData');
//   EmployeeKpi      = require('../../model/EmployeeKpis');
//   Announcement     = require('../../model/Announcement');
// } catch (e) {
//   console.warn('[dataFetcher] Some models not found:', e.message);
// }

// const MODEL_MAP = {
//   employees:        () => Employee         || mongoose.model('Employee'),
//   payrollPeriods:   () => PayrollPeriod    || mongoose.model('PayrollPeriod'),
//   payrollData:      () => PeriodPayData    || mongoose.model('periodPayData'),
//   absences:         () => Absence          || mongoose.model('leaverecords'),
//   expenses:         () => ExpenseRequests  || mongoose.model('ExpenseRequests'),
//   appraisals:       () => AppraisalRequest || mongoose.model('AppraisalRequests'),
//   courses:          () => Course           || mongoose.model('Course'),
//   enrollments:      () => CourseProgress   || mongoose.model('CourseProgress'),
//   events:           () => Meeting          || mongoose.model('Meeting'),
//   meetings:         () => Meeting          || mongoose.model('Meeting'),
//   departments:      () => Department       || mongoose.model('Department'),
//   branches:         () => Branch           || mongoose.model('Branch'),
//   designations:     () => Designation      || mongoose.model('Designation'),
//   holidays:         () => Holiday          || mongoose.model('Holidays'),
//   kpis:             () => Kpi              || mongoose.model('Kpi'),
//   appraisalGroups:  () => AppraisalGroup   || mongoose.model('AppraisalGroup'),
//   appraisalPeriods: () => AppraisalPeriod  || mongoose.model('AppraisalPeriod'),
//   appraisalData:    () => AppraisalData    || mongoose.model('appraisalData'),
//   employeeKpis:     () => EmployeeKpi      || mongoose.model('EmployeeKpi'),
//   announcements:    () => Announcement     || mongoose.model('Announcement'),
// };

// // ─── Main Fetch Function ──────────────────────────────────────────────────────

// async function fetchHRData(intent, queryConfig) {
//   const results = {};
//   const sources = [];

//   // Special handling for payroll — two-collection join
//   if (queryConfig.collections.includes('payrollPeriods')) {
//     const payrollResults = await fetchPayrollData(queryConfig, intent);
//     Object.assign(results, payrollResults);
//     if (results.payrollPeriods?.length > 0)
//       sources.push(`payrollPeriods (${results.payrollPeriods.length} periods)`);
//     if (results.payrollData?.length > 0)
//       sources.push(`payrollData (${results.payrollData.length} employee records)`);
//   }

//   const otherCollections = queryConfig.collections.filter(
//     c => c !== 'payrollPeriods' && c !== 'payrollData'
//   );

//   const promises = otherCollections.map(async (collectionName) => {
//     const config = queryConfig[collectionName];
//     if (!config) return;

//     try {
//       const Model = MODEL_MAP[collectionName]?.();
//       if (!Model) {
//         console.warn(`[dataFetcher] No model for: ${collectionName}`);
//         return;
//       }

//       // LeaveRecords companyId is a plain string — no ObjectId conversion
//       const query = { ...config.query };
//       if (collectionName === 'absences' && query.companyId) {
//         query.companyId = String(query.companyId);
//       }

//       let q = Model.find(query);
//       if (config.projection) q = q.select(config.projection);
//       if (config.sort)       q = q.sort(config.sort);
//       if (config.limit)      q = q.limit(config.limit);

//       const data = await q.lean().exec();
//       results[collectionName] = data;
//       if (data.length > 0) sources.push(`${collectionName} (${data.length} records)`);
//     } catch (error) {
//       console.error(`[dataFetcher] Error querying ${collectionName}:`, error.message);
//       results[collectionName] = [];
//     }
//   });

//   await Promise.all(promises);

//   if (results.employees) {
//     const employeeMap = buildEmployeeMap(results.employees);
//     enrichWithEmployeeNames(results, employeeMap);
//   }

//   results.stats   = computeStats(intent.primary, results);
//   results.sources = sources;

//   return results;
// }

// // ─── Payroll Two-Collection Fetch ─────────────────────────────────────────────

// async function fetchPayrollData(queryConfig, intent) {
//   const results = {};
//   try {
//     const PeriodModel  = MODEL_MAP['payrollPeriods']?.();
//     const PayDataModel = MODEL_MAP['payrollData']?.();
//     if (!PeriodModel) { console.warn('[dataFetcher] PayrollPeriod model not found'); return results; }

//     const config = queryConfig['payrollPeriods'];
//     let q = PeriodModel.find(config.query);
//     if (config.sort)  q = q.sort(config.sort);
//     if (config.limit) q = q.limit(config.limit);

//     const periods = await q.lean().exec();
//     results.payrollPeriods = periods;
//     if (periods.length === 0 || !PayDataModel) return results;

//     const periodIds = periods.map(p => p._id.toString());
//     const payData   = await PayDataModel.find({ payrollPeriodId: { $in: periodIds } })
//       .select({ companyId:1, payrollPeriodId:1, employeeId:1, firstName:1, lastName:1,
//         fullName:1, department:1, designation:1, role:1,
//         totalEarnings:1, netEarnings:1, deductions:1, dynamicFields:1, status:1 })
//       .lean().exec();

//     results.payrollData = payData;

//     const payDataByPeriod = {};
//     for (const pd of payData) {
//       const key = pd.payrollPeriodId?.toString();
//       if (!payDataByPeriod[key]) payDataByPeriod[key] = [];
//       payDataByPeriod[key].push(pd);
//     }

//     results.payrollPeriods = periods.map(p => ({
//       ...p,
//       _employeeRecords: payDataByPeriod[p._id.toString()] || [],
//     }));
//   } catch (error) {
//     console.error('[dataFetcher] fetchPayrollData error:', error.message);
//     results.payrollPeriods = [];
//     results.payrollData    = [];
//   }
//   return results;
// }

// // ─── Single Fetchers ──────────────────────────────────────────────────────────

// async function fetchEmployeeById(employeeId, companyId) {
//   try {
//     const Model = MODEL_MAP['employees']?.();
//     if (!Model) return null;
//     return await Model.findOne({ _id: employeeId, companyId }).lean().exec();
//   } catch (error) {
//     console.error('[dataFetcher] fetchEmployeeById error:', error.message);
//     return null;
//   }
// }

// async function fetchCompanyById(companyId) {
//   try {
//     if (!Company) return null;
//     return await Company.findById(companyId).select('companyName email companyAddress').lean().exec();
//   } catch (error) {
//     console.error('[dataFetcher] fetchCompanyById error:', error.message);
//     return null;
//   }
// }

// // ─── CSV Export Functions ─────────────────────────────────────────────────────

// async function fetchPayrollForCsv(companyId, limit = 500) {
//   try {
//     const PeriodModel  = MODEL_MAP['payrollPeriods']?.();
//     const PayDataModel = MODEL_MAP['payrollData']?.();
//     if (!PeriodModel || !PayDataModel) return [];

//     const cid     = String(companyId);
//     const periods = await PeriodModel.find({ companyId: cid })
//       .sort({ createdAt: -1 }).limit(20).lean().exec();
//     if (!periods.length) return [];

//     const rows = [];
//     for (const p of periods) {
//       const payData = await PayDataModel
//         .find({ payrollPeriodId: p._id.toString() })
//         .select('firstName lastName fullName department designation role totalEarnings deductions netEarnings status dynamicFields')
//         .limit(limit).lean().exec();

//       for (const pd of payData) {
//         const dyn = pd.dynamicFields || {};
//         rows.push({
//           periodName:             p.payrollPeriodName || '',
//           periodStart:            p.startDate || '',
//           periodEnd:              p.endDate || '',
//           reference:              p.reference || '',
//           periodStatus:           p.status || '',
//           employeeName:           pd.fullName || `${pd.firstName || ''} ${pd.lastName || ''}`.trim(),
//           department:             pd.department || '',
//           designation:            pd.designation || pd.role || '',
//           totalEarnings:          pd.totalEarnings ?? 0,
//           deductions:             pd.deductions ?? 0,
//           netEarnings:            pd.netEarnings ?? 0,
//           employeeStatus:         pd.status || '',
//           salaries:               dyn.salaries ?? dyn.basicSalary ?? '',
//           bonus:                  dyn.bonus ?? '',
//           transportAllowance:     dyn.transportAllowance ?? '',
//           accommodationAllowance: dyn.accommodationAllowance ?? '',
//           feedingAllowance:       dyn.feedingAllowance ?? '',
//           pension:                dyn.pension ?? '',
//           tax:                    dyn.tax ?? dyn.payeTax ?? '',
//         });
//       }
//     }
//     return rows;
//   } catch (e) {
//     console.error('[dataFetcher] fetchPayrollForCsv error:', e.message);
//     return [];
//   }
// }

// /**
//  * FIXED: Direct DB query — no controller/token needed.
//  * Bypasses the old getAdminRecords controller that required auth middleware.
//  * Uses actual LeaveRecords field names confirmed from your MongoDB.
//  */
// async function fetchLeaveForCsv(companyId, limit = 500) {
//   try {
//     const Model = MODEL_MAP['absences']?.();
//     if (!Model) {
//       console.warn('[dataFetcher] LeaveRecords model not available');
//       return [];
//     }

//     // companyId in LeaveRecords is a plain STRING — do not convert to ObjectId
//     const cid  = String(companyId);
//     const docs = await Model.find({ companyId: cid })
//       .select(
//         'fullName department leaveTypeName leaveStartDate leaveEndDate ' +
//         'daysRequested daysLeft status approved leaveApprover approver ' +
//         'requestDate requestMessage decisionMessage userId'
//       )
//       .sort({ requestDate: -1 })
//       .limit(limit)
//       .lean()
//       .exec();

//     console.log(`[dataFetcher] fetchLeaveForCsv: found ${docs.length} records for companyId=${cid}`);

//     // Debug: if nothing found, log what's actually in the collection
//     if (docs.length === 0) {
//       const total  = await Model.countDocuments({});
//       const sample = await Model.findOne({}).select('companyId fullName status').lean();
//       console.warn(
//         `[dataFetcher] LeaveRecords total=${total}. ` +
//         `Sample companyId="${sample?.companyId}" (${typeof sample?.companyId}), ` +
//         `name="${sample?.fullName}", status="${sample?.status}"`
//       );
//     }

//     return docs.map(d => ({
//       employeeName:    d.fullName || '',
//       department:      d.department || '',
//       leaveType:       d.leaveTypeName || '',
//       startDate:       d.leaveStartDate || '',
//       endDate:         d.leaveEndDate || '',
//       daysRequested:   d.daysRequested ?? 0,
//       daysLeft:        d.daysLeft ?? '',
//       status:          d.status || '',
//       approved:        d.approved ? 'Yes' : 'No',
//       approver:        d.leaveApprover || d.approver || '',
//       requestDate:     d.requestDate
//         ? new Date(d.requestDate).toLocaleDateString('en-NG')
//         : '',
//       requestMessage:  d.requestMessage || '',
//       decisionMessage: d.decisionMessage || '',
//     }));
//   } catch (e) {
//     console.error('[dataFetcher] fetchLeaveForCsv error:', e.message);
//     return [];
//   }
// }

// async function fetchExpenseForCsv(companyId, limit = 500) {
//   try {
//     const Model = MODEL_MAP['expenses']?.();
//     if (!Model) return [];
//     const docs = await Model.find({ companyId: String(companyId) })
//       .select('employeeName expenseTypeName amount expenseDate status description')
//       .sort({ expenseDate: -1, createdAt: -1 })
//       .limit(limit)
//       .lean()
//       .exec();
//     return docs.map(d => ({
//       employeeName: d.employeeName || '',
//       expenseType:  d.expenseTypeName || '',
//       amount:       d.amount ?? 0,
//       expenseDate:  d.expenseDate
//         ? (typeof d.expenseDate === 'string' ? d.expenseDate : new Date(d.expenseDate).toISOString().slice(0, 10))
//         : '',
//       status:       d.status || '',
//       description:  d.description || '',
//     }));
//   } catch (e) {
//     console.error('[dataFetcher] fetchExpenseForCsv error:', e.message);
//     return [];
//   }
// }

// async function fetchEmployeeForCsv(companyId, limit = 500) {
//   try {
//     const Model = MODEL_MAP['employees']?.();
//     if (!Model) return [];
//     const docs = await Model.find({ companyId: String(companyId) })
//       .select('firstName lastName fullName email department designation role jobType status startDate gender isManager')
//       .sort({ createdAt: -1 })
//       .limit(limit)
//       .lean()
//       .exec();
//     return docs.map(d => ({
//       fullName:    d.fullName || `${d.firstName || ''} ${d.lastName || ''}`.trim(),
//       email:       d.email || '',
//       department:  d.department?.name || d.department || '',
//       designation: d.designation || d.role || '',
//       jobType:     d.jobType || '',
//       status:      d.status || '',
//       startDate:   d.startDate || '',
//       gender:      d.gender || '',
//       isManager:   d.isManager ? 'Yes' : 'No',
//     }));
//   } catch (e) {
//     console.error('[dataFetcher] fetchEmployeeForCsv error:', e.message);
//     return [];
//   }
// }

// async function fetchReportForCsv(companyId, reportType) {
//   const type = String(reportType || 'payroll').toLowerCase();
//   switch (type) {
//     case 'leave':
//     case 'absence':   return fetchLeaveForCsv(companyId);
//     case 'expense':   return fetchExpenseForCsv(companyId);
//     case 'employee':
//     case 'employees': return fetchEmployeeForCsv(companyId);
//     case 'payroll':
//     default:          return fetchPayrollForCsv(companyId);
//   }
// }

// // ─── Internal Helpers ─────────────────────────────────────────────────────────

// function buildEmployeeMap(employees) {
//   const map = {};
//   for (const emp of employees) {
//     map[emp._id.toString()] = {
//       name:        emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
//       department:  emp.department?.name || emp.department,
//       designation: emp.designation || emp.role,
//     };
//   }
//   return map;
// }

// function enrichWithEmployeeNames(results, employeeMap) {
//   const targets = ['absences', 'expenses', 'appraisals', 'enrollments'];
//   for (const collection of targets) {
//     if (!results[collection]) continue;
//     results[collection] = results[collection].map((record) => {
//       const empId = (record.userId || record.employeeId || record.employee)?.toString();
//       const emp   = empId && employeeMap[empId];
//       return emp ? { ...record, _employeeName: emp.name, _department: emp.department } : record;
//     });
//   }
// }

// function computeStats(primaryIntent, results) {
//   const stats = {};

//   if (results.employees) {
//     stats.totalEmployees   = results.employees.length;
//     stats.activeEmployees  = results.employees.filter(e => e.status?.toLowerCase() === 'active').length;
//     stats.pendingEmployees = results.employees.filter(e => e.status?.toLowerCase() === 'pending').length;
//     const deptCounts = {};
//     for (const emp of results.employees) {
//       const dept = emp.department?.name || emp.department || 'Unknown';
//       deptCounts[dept] = (deptCounts[dept] || 0) + 1;
//     }
//     stats.byDepartment = deptCounts;
//   }

//   if (results.payrollPeriods) {
//     const periods = results.payrollPeriods;
//     stats.totalPayrollRuns   = periods.length;
//     stats.disbursedPayrolls  = periods.filter(p =>
//       p.status?.toLowerCase() === 'disbursed' || p.periodPayrollDisbursed === true).length;
//     stats.pendingPayrolls    = periods.filter(p =>
//       ['pending', 'approved'].includes(p.status?.toLowerCase())).length;
//     stats.totalGrossEarnings = periods.reduce((sum, p) => sum + (p.totalEarnings || 0), 0);
//     stats.totalDeductions    = periods.reduce((sum, p) => sum + (p.deductions || 0), 0);
//     stats.totalDisbursed     = periods
//       .filter(p => p.status?.toLowerCase() === 'disbursed' || p.periodPayrollDisbursed === true)
//       .reduce((sum, p) => sum + (p.netEarnings || 0), 0);
//     if (results.payrollData) {
//       stats.totalPayrollEmployees = new Set(results.payrollData.map(d => d.employeeId)).size;
//     }
//   }

//   if (results.absences) {
//     stats.totalAbsences    = results.absences.length;
//     stats.pendingAbsences  = results.absences.filter(a => a.status?.toLowerCase() === 'pending').length;
//     stats.approvedAbsences = results.absences.filter(a => a.status?.toLowerCase() === 'approved').length;
//     stats.declinedAbsences = results.absences.filter(a => a.status?.toLowerCase() === 'declined').length;
//     const typeCounts = {};
//     for (const a of results.absences) {
//       const type = a.leaveTypeName || a.leaveType || 'Unknown';
//       typeCounts[type] = (typeCounts[type] || 0) + 1;
//     }
//     stats.absencesByType = typeCounts;
//   }

//   if (results.expenses) {
//     stats.totalExpenses      = results.expenses.length;
//     stats.totalExpenseAmount = results.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
//     stats.pendingExpenses    = results.expenses.filter(e => e.status?.toLowerCase() === 'pending').length;
//     stats.approvedExpenses   = results.expenses.filter(e => e.status?.toLowerCase() === 'approved').length;
//   }

//   if (results.appraisals) {
//     const scored = results.appraisals.filter(a => a.kpiScore != null);
//     stats.totalAppraisals = results.appraisals.length;
//     if (scored.length > 0) {
//       stats.avgKpiScore = (scored.reduce((sum, a) => sum + a.kpiScore, 0) / scored.length).toFixed(1);
//     }
//   }

//   return stats;
// }

// // ─── Role Resolution ──────────────────────────────────────────────────────────

// async function resolveCopilotContext(companyId, userId, userRole = 'employee') {
//   if (companyId) {
//     const resolvedRole = await getCompanyRole(companyId, userId);
//     return { companyId: String(companyId), userId: userId ? String(userId) : undefined, userRole: resolvedRole };
//   }
//   if (!userId) return null;
//   const userIdStr = String(userId);
//   try {
//     const company = Company ? await Company.findById(userIdStr).select('_id isSuperAdmin').lean().exec() : null;
//     if (company) return { companyId: userIdStr, userId: userIdStr, userRole: company.isSuperAdmin ? 'super_admin' : 'admin' };
//     const employee = Employee ? await Employee.findById(userIdStr).select('companyId isManager').lean().exec() : null;
//     if (employee?.companyId) return { companyId: String(employee.companyId), userId: userIdStr, userRole: employee.isManager ? 'manager' : 'employee' };
//   } catch (e) {
//     console.error('[dataFetcher] resolveCopilotContext error:', e.message);
//   }
//   return null;
// }

// async function getCompanyRole(companyId, userId) {
//   if (!userId) return 'super_admin';
//   const userIdStr = String(userId);
//   try {
//     const company  = Company  ? await Company.findById(userIdStr).select('isSuperAdmin').lean().exec() : null;
//     if (company)  return company.isSuperAdmin ? 'super_admin' : 'admin';
//     const employee = Employee ? await Employee.findById(userIdStr).select('isManager').lean().exec() : null;
//     if (employee) return employee.isManager ? 'manager' : 'employee';
//   } catch (e) { console.error('[dataFetcher] getCompanyRole error:', e.message); }
//   return 'super_admin';
// }

// module.exports = {
//   fetchHRData,
//   fetchEmployeeById,
//   fetchCompanyById,
//   fetchPayrollForCsv,
//   fetchLeaveForCsv,
//   fetchExpenseForCsv,
//   fetchEmployeeForCsv,
//   fetchReportForCsv,
//   resolveCopilotContext,
//   getCompanyRole,
// };


/**
 * Data Fetcher Service
 * Executes MongoDB queries directly via Mongoose — no API tokens needed.
 *
 * Payroll: TWO collections — PayrollPeriod (headers) + periodPayData (employee records)
 *
 * LeaveRecords actual field names (verified from DB):
 *   fullName, leaveTypeName, leaveStartDate, leaveEndDate,
 *   daysRequested, daysLeft, status, approved, leaveApprover,
 *   requestDate, requestMessage, decisionMessage, department,
 *   companyId (stored as plain STRING — no ObjectId conversion)
 */

const mongoose = require('mongoose');

// ─── Model imports ─────────────────────────────────────────────────────────────
let Employee, Company, PayrollPeriod, PeriodPayData,
    Absence, ExpenseRequests, AppraisalRequest,
    Course, CourseProgress, Meeting,
    Department, Branch, Designation, Holiday,
    Kpi, AppraisalGroup, AppraisalPeriod, AppraisalData, EmployeeKpi,
    Announcement, SalaryScale;

try {
  Employee         = require('../../model/Employees');
  Company          = require('../../model/Company');
  PayrollPeriod    = require('../../model/PayrollPeriod');
  PeriodPayData    = require('../../model/PeriodPayData');
  Absence          = require('../../model/LeaveRecords').default || require('../../model/LeaveRecords');
  ExpenseRequests  = require('../../model/ExpenseRequests');
  AppraisalRequest = require('../../model/AppraisalRequest');
  Course           = require('../../model/Course').default || require('../../model/Course');
  CourseProgress   = require('../../model/CourseProgress').default || require('../../model/CourseProgress');
  Meeting          = require('../../model/Meetings');
  Department       = require('../../model/Department');
  Branch           = require('../../model/Branch');
  Designation      = require('../../model/Designation');
  Holiday          = require('../../model/Holidays');
  Kpi              = require('../../model/Kpi');
  AppraisalGroup   = require('../../model/AppraisalGroup');
  AppraisalPeriod  = require('../../model/AppraisalPeriod');
  AppraisalData    = require('../../model/AppraisalData');
  EmployeeKpi      = require('../../model/EmployeeKpis');
  Announcement     = require('../../model/Announcement');
  SalaryScale      = require('../../model/SalaryScale');
} catch (e) {
  console.warn('[dataFetcher] Some models not found:', e.message);
}

const MODEL_MAP = {
  employees:        () => Employee         || mongoose.model('Employee'),
  payrollPeriods:   () => PayrollPeriod    || mongoose.model('PayrollPeriod'),
  payrollData:      () => PeriodPayData    || mongoose.model('periodPayData'),
  absences:         () => Absence          || mongoose.model('leaverecords'),
  expenses:         () => ExpenseRequests  || mongoose.model('ExpenseRequests'),
  appraisals:       () => AppraisalRequest || mongoose.model('AppraisalRequests'),
  courses:          () => Course           || mongoose.model('Course'),
  enrollments:      () => CourseProgress   || mongoose.model('CourseProgress'),
  events:           () => Meeting          || mongoose.model('Meeting'),
  meetings:         () => Meeting          || mongoose.model('Meeting'),
  departments:      () => Department       || mongoose.model('Department'),
  branches:         () => Branch           || mongoose.model('Branch'),
  designations:     () => Designation      || mongoose.model('Designation'),
  holidays:         () => Holiday          || mongoose.model('Holidays'),
  kpis:             () => Kpi              || mongoose.model('Kpi'),
  appraisalGroups:  () => AppraisalGroup   || mongoose.model('AppraisalGroup'),
  appraisalPeriods: () => AppraisalPeriod  || mongoose.model('AppraisalPeriod'),
  appraisalData:    () => AppraisalData    || mongoose.model('appraisalData'),
  employeeKpis:     () => EmployeeKpi      || mongoose.model('EmployeeKpi'),
  announcements:    () => Announcement     || mongoose.model('Announcement'),
};

// ─── Main Fetch Function ──────────────────────────────────────────────────────

async function fetchHRData(intent, queryConfig) {
  const results = {};
  const sources = [];

  // Special handling for payroll — two-collection join
  if (queryConfig.collections.includes('payrollPeriods')) {
    const payrollResults = await fetchPayrollData(queryConfig, intent);
    Object.assign(results, payrollResults);
    if (results.payrollPeriods?.length > 0)
      sources.push(`payrollPeriods (${results.payrollPeriods.length} periods)`);
    if (results.payrollData?.length > 0)
      sources.push(`payrollData (${results.payrollData.length} employee records)`);
  }

  const otherCollections = queryConfig.collections.filter(
    c => c !== 'payrollPeriods' && c !== 'payrollData'
  );

  const promises = otherCollections.map(async (collectionName) => {
    const config = queryConfig[collectionName];
    if (!config) return;

    try {
      const Model = MODEL_MAP[collectionName]?.();
      if (!Model) {
        console.warn(`[dataFetcher] No model for: ${collectionName}`);
        return;
      }

      // Enforce companyId so results are always scoped to one company (never cross-company)
      const query = { ...config.query };
      if (query.companyId) {
        const cid = String(query.companyId);
        const companyMatch = (() => {
          try {
            const oid = new mongoose.Types.ObjectId(cid);
            return { $or: [{ companyId: cid }, { companyId: oid }] };
          } catch (_) {
            return { companyId: cid };
          }
        })();
        delete query.companyId;
        if (query.$and) {
          query.$and = [companyMatch, ...query.$and];
        } else {
          Object.assign(query, companyMatch);
        }
      }

      let q = Model.find(query);
      if (config.projection) q = q.select(config.projection);
      if (config.sort)       q = q.sort(config.sort);
      if (config.limit)      q = q.limit(config.limit);

      const data = await q.lean().exec();
      results[collectionName] = data;
      if (data.length > 0) sources.push(`${collectionName} (${data.length} records)`);
    } catch (error) {
      console.error(`[dataFetcher] Error querying ${collectionName}:`, error.message);
      results[collectionName] = [];
    }
  });

  await Promise.all(promises);

  if (results.employees) {
    const employeeMap = buildEmployeeMap(results.employees);
    enrichWithEmployeeNames(results, employeeMap);
  }

  results.stats   = computeStats(intent.primary, results);
  results.sources = sources;

  return results;
}

// ─── Payroll Two-Collection Fetch ─────────────────────────────────────────────

async function fetchPayrollData(queryConfig, intent) {
  const results = {};
  try {
    const PeriodModel  = MODEL_MAP['payrollPeriods']?.();
    const PayDataModel = MODEL_MAP['payrollData']?.();
    if (!PeriodModel) { console.warn('[dataFetcher] PayrollPeriod model not found'); return results; }

    const config = queryConfig['payrollPeriods'];
    let q = PeriodModel.find(config.query);
    if (config.sort)  q = q.sort(config.sort);
    if (config.limit) q = q.limit(config.limit);

    const periods = await q.lean().exec();
    results.payrollPeriods = periods;
    if (periods.length === 0 || !PayDataModel) return results;

    const periodIds = periods.map(p => p._id.toString());
    const payData   = await PayDataModel.find({ payrollPeriodId: { $in: periodIds } })
      .select({ companyId:1, payrollPeriodId:1, employeeId:1, firstName:1, lastName:1,
        fullName:1, department:1, designation:1, role:1,
        totalEarnings:1, netEarnings:1, deductions:1, dynamicFields:1, status:1 })
      .lean().exec();

    results.payrollData = payData;

    const payDataByPeriod = {};
    for (const pd of payData) {
      const key = pd.payrollPeriodId?.toString();
      if (!payDataByPeriod[key]) payDataByPeriod[key] = [];
      payDataByPeriod[key].push(pd);
    }

    results.payrollPeriods = periods.map(p => ({
      ...p,
      _employeeRecords: payDataByPeriod[p._id.toString()] || [],
    }));
  } catch (error) {
    console.error('[dataFetcher] fetchPayrollData error:', error.message);
    results.payrollPeriods = [];
    results.payrollData    = [];
  }
  return results;
}

// ─── Single Fetchers ──────────────────────────────────────────────────────────

async function fetchEmployeeById(employeeId, companyId) {
  try {
    const Model = MODEL_MAP['employees']?.();
    if (!Model) return null;
    return await Model.findOne({ _id: employeeId, companyId }).lean().exec();
  } catch (error) {
    console.error('[dataFetcher] fetchEmployeeById error:', error.message);
    return null;
  }
}

async function fetchCompanyById(companyId) {
  try {
    if (!Company) return null;
    return await Company.findById(companyId).select('companyName email companyAddress').lean().exec();
  } catch (error) {
    console.error('[dataFetcher] fetchCompanyById error:', error.message);
    return null;
  }
}

// ─── CSV Export Functions ─────────────────────────────────────────────────────

async function fetchPayrollForCsv(companyId, limit = 500) {
  try {
    const PeriodModel  = MODEL_MAP['payrollPeriods']?.();
    const PayDataModel = MODEL_MAP['payrollData']?.();
    if (!PeriodModel || !PayDataModel) return [];

    const cid     = String(companyId);
    const periods = await PeriodModel.find({ companyId: cid })
      .sort({ createdAt: -1 }).limit(20).lean().exec();
    if (!periods.length) return [];

    const rows = [];
    for (const p of periods) {
      const payData = await PayDataModel
        .find({ payrollPeriodId: p._id.toString() })
        .select('firstName lastName fullName department designation role totalEarnings deductions netEarnings status dynamicFields')
        .limit(limit).lean().exec();

      for (const pd of payData) {
        const dyn = pd.dynamicFields || {};
        rows.push({
          periodName:             p.payrollPeriodName || '',
          periodStart:            p.startDate || '',
          periodEnd:              p.endDate || '',
          reference:              p.reference || '',
          periodStatus:           p.status || '',
          employeeName:           pd.fullName || `${pd.firstName || ''} ${pd.lastName || ''}`.trim(),
          department:             pd.department || '',
          designation:            pd.designation || pd.role || '',
          totalEarnings:          pd.totalEarnings ?? 0,
          deductions:             pd.deductions ?? 0,
          netEarnings:            pd.netEarnings ?? 0,
          employeeStatus:         pd.status || '',
          salaries:               dyn.salaries ?? dyn.basicSalary ?? '',
          bonus:                  dyn.bonus ?? '',
          transportAllowance:     dyn.transportAllowance ?? '',
          accommodationAllowance: dyn.accommodationAllowance ?? '',
          feedingAllowance:       dyn.feedingAllowance ?? '',
          pension:                dyn.pension ?? '',
          tax:                    dyn.tax ?? dyn.payeTax ?? '',
        });
      }
    }
    return rows;
  } catch (e) {
    console.error('[dataFetcher] fetchPayrollForCsv error:', e.message);
    return [];
  }
}

/**
 * FIXED: Direct DB query — no controller/token needed.
 * Bypasses the old getAdminRecords controller that required auth middleware.
 * Uses actual LeaveRecords field names confirmed from your MongoDB.
 */
async function fetchLeaveForCsv(companyId, limit = 500) {
  try {
    const Model = MODEL_MAP['absences']?.();
    if (!Model) {
      console.warn('[dataFetcher] LeaveRecords model not available');
      return [];
    }

    // companyId may be stored as string or ObjectId — query both
    const cid = String(companyId);
    let cidOr = [{ companyId: cid }];
    try {
      const mongoose = require('mongoose');
      cidOr.push({ companyId: new mongoose.Types.ObjectId(cid) });
    } catch (_) {}
    const docs = await Model.find({ $or: cidOr })
      .select(
        'fullName department leaveTypeName leaveStartDate leaveEndDate ' +
        'daysRequested daysLeft status approved leaveApprover approver ' +
        'requestDate requestMessage decisionMessage userId'
      )
      .sort({ requestDate: -1 })
      .limit(limit)
      .lean()
      .exec();

    console.log(`[dataFetcher] fetchLeaveForCsv: found ${docs.length} records for companyId=${cid}`);

    // Debug: if nothing found, log what's actually in the collection
    if (docs.length === 0) {
      const total  = await Model.countDocuments({});
      const sample = await Model.findOne({}).select('companyId fullName status').lean();
      console.warn(
        `[dataFetcher] LeaveRecords total=${total}. ` +
        `Sample companyId="${sample?.companyId}" (${typeof sample?.companyId}), ` +
        `name="${sample?.fullName}", status="${sample?.status}"`
      );
    }

    return docs.map(d => ({
      employeeName:    d.fullName || '',
      department:      d.department || '',
      leaveType:       d.leaveTypeName || '',
      startDate:       d.leaveStartDate || '',
      endDate:         d.leaveEndDate || '',
      daysRequested:   d.daysRequested ?? 0,
      daysLeft:        d.daysLeft ?? '',
      status:          d.status || '',
      approved:        d.approved ? 'Yes' : 'No',
      approver:        d.leaveApprover || d.approver || '',
      requestDate:     d.requestDate
        ? new Date(d.requestDate).toLocaleDateString('en-NG')
        : '',
      requestMessage:  d.requestMessage || '',
      decisionMessage: d.decisionMessage || '',
    }));
  } catch (e) {
    console.error('[dataFetcher] fetchLeaveForCsv error:', e.message);
    return [];
  }
}

async function fetchExpenseForCsv(companyId, limit = 500) {
  try {
    const Model = MODEL_MAP['expenses']?.();
    if (!Model) return [];
    const cid = String(companyId);
    let cidOr = [{ companyId: cid }];
    try { const mongoose = require('mongoose'); cidOr.push({ companyId: new mongoose.Types.ObjectId(cid) }); } catch (_) {}
    const docs = await Model.find({ $or: cidOr })
      .select('employeeName expenseTypeName amount expenseDate status description')
      .sort({ expenseDate: -1, createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
    return docs.map(d => ({
      employeeName: d.employeeName || '',
      expenseType:  d.expenseTypeName || '',
      amount:       d.amount ?? 0,
      expenseDate:  d.expenseDate
        ? (typeof d.expenseDate === 'string' ? d.expenseDate : new Date(d.expenseDate).toISOString().slice(0, 10))
        : '',
      status:       d.status || '',
      description:  d.description || '',
    }));
  } catch (e) {
    console.error('[dataFetcher] fetchExpenseForCsv error:', e.message);
    return [];
  }
}

async function fetchEmployeeForCsv(companyId, limit = 500) {
  try {
    const Model = MODEL_MAP['employees']?.();
    if (!Model) return [];
    const cid = String(companyId);
    let cidOr = [{ companyId: cid }];
    try { const mongoose = require('mongoose'); cidOr.push({ companyId: new mongoose.Types.ObjectId(cid) }); } catch (_) {}
    const docs = await Model.find({ $or: cidOr })
      .select('firstName lastName fullName email department designation role jobType status startDate gender isManager')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
    return docs.map(d => ({
      fullName:    d.fullName || `${d.firstName || ''} ${d.lastName || ''}`.trim(),
      email:       d.email || '',
      department:  d.department?.name || d.department || '',
      designation: d.designation || d.role || '',
      jobType:     d.jobType || '',
      status:      d.status || '',
      startDate:   d.startDate || '',
      gender:      d.gender || '',
      isManager:   d.isManager ? 'Yes' : 'No',
    }));
  } catch (e) {
    console.error('[dataFetcher] fetchEmployeeForCsv error:', e.message);
    return [];
  }
}

async function fetchReportForCsv(companyId, reportType) {
  const type = String(reportType || 'payroll').toLowerCase();
  switch (type) {
    case 'leave':
    case 'absence':   return fetchLeaveForCsv(companyId);
    case 'expense':   return fetchExpenseForCsv(companyId);
    case 'employee':
    case 'employees': return fetchEmployeeForCsv(companyId);
    case 'payroll':
    default:          return fetchPayrollForCsv(companyId);
  }
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function buildEmployeeMap(employees) {
  const map = {};
  for (const emp of employees) {
    map[emp._id.toString()] = {
      name:        emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
      department:  emp.department?.name || emp.department,
      designation: emp.designation || emp.role,
    };
  }
  return map;
}

function enrichWithEmployeeNames(results, employeeMap) {
  const targets = ['absences', 'expenses', 'appraisals', 'enrollments'];
  for (const collection of targets) {
    if (!results[collection]) continue;
    results[collection] = results[collection].map((record) => {
      const empId = (record.userId || record.employeeId || record.employee)?.toString();
      const emp   = empId && employeeMap[empId];
      return emp ? { ...record, _employeeName: emp.name, _department: emp.department } : record;
    });
  }
}

function computeStats(primaryIntent, results) {
  const stats = {};

  if (results.employees) {
    stats.totalEmployees   = results.employees.length;
    stats.activeEmployees  = results.employees.filter(e => e.status?.toLowerCase() === 'active').length;
    stats.pendingEmployees = results.employees.filter(e => e.status?.toLowerCase() === 'pending').length;
    const deptCounts = {};
    for (const emp of results.employees) {
      const dept = emp.department?.name || emp.department || 'Unknown';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    }
    stats.byDepartment = deptCounts;
  }

  if (results.payrollPeriods) {
    const periods = results.payrollPeriods;
    stats.totalPayrollRuns   = periods.length;
    stats.disbursedPayrolls  = periods.filter(p =>
      p.status?.toLowerCase() === 'disbursed' || p.periodPayrollDisbursed === true).length;
    stats.pendingPayrolls    = periods.filter(p =>
      ['pending', 'approved'].includes(p.status?.toLowerCase())).length;
    stats.totalGrossEarnings = periods.reduce((sum, p) => sum + (p.totalEarnings || 0), 0);
    stats.totalDeductions    = periods.reduce((sum, p) => sum + (p.deductions || 0), 0);
    stats.totalDisbursed     = periods
      .filter(p => p.status?.toLowerCase() === 'disbursed' || p.periodPayrollDisbursed === true)
      .reduce((sum, p) => sum + (p.netEarnings || 0), 0);
    if (results.payrollData) {
      stats.totalPayrollEmployees = new Set(results.payrollData.map(d => d.employeeId)).size;
    }
  }

  if (results.absences) {
    stats.totalAbsences    = results.absences.length;
    stats.pendingAbsences  = results.absences.filter(a => a.status?.toLowerCase() === 'pending').length;
    stats.approvedAbsences = results.absences.filter(a => a.status?.toLowerCase() === 'approved').length;
    stats.declinedAbsences = results.absences.filter(a => a.status?.toLowerCase() === 'declined').length;
    const typeCounts = {};
    for (const a of results.absences) {
      const type = a.leaveTypeName || a.leaveType || 'Unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }
    stats.absencesByType = typeCounts;
  }

  if (results.expenses) {
    stats.totalExpenses      = results.expenses.length;
    stats.totalExpenseAmount = results.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    stats.pendingExpenses    = results.expenses.filter(e => e.status?.toLowerCase() === 'pending').length;
    stats.approvedExpenses   = results.expenses.filter(e => e.status?.toLowerCase() === 'approved').length;
  }

  if (results.appraisals) {
    const scored = results.appraisals.filter(a => a.kpiScore != null);
    stats.totalAppraisals = results.appraisals.length;
    if (scored.length > 0) {
      stats.avgKpiScore = (scored.reduce((sum, a) => sum + a.kpiScore, 0) / scored.length).toFixed(1);
    }
  }

  return stats;
}

// ─── Role Resolution ──────────────────────────────────────────────────────────

async function resolveCopilotContext(companyId, userId, userRole = 'employee') {
  if (companyId) {
    const resolvedRole = await getCompanyRole(companyId, userId);
    return { companyId: String(companyId), userId: userId ? String(userId) : undefined, userRole: resolvedRole };
  }
  if (!userId) return null;
  const userIdStr = String(userId);
  try {
    const company = Company ? await Company.findById(userIdStr).select('_id isSuperAdmin').lean().exec() : null;
    if (company) return { companyId: userIdStr, userId: userIdStr, userRole: company.isSuperAdmin ? 'super_admin' : 'admin' };
    const employee = Employee ? await Employee.findById(userIdStr).select('companyId isManager').lean().exec() : null;
    if (employee?.companyId) return { companyId: String(employee.companyId), userId: userIdStr, userRole: employee.isManager ? 'manager' : 'employee' };
  } catch (e) {
    console.error('[dataFetcher] resolveCopilotContext error:', e.message);
  }
  return null;
}

async function getCompanyRole(companyId, userId) {
  if (!userId) return 'super_admin';
  const userIdStr = String(userId);
  try {
    const company  = Company  ? await Company.findById(userIdStr).select('isSuperAdmin').lean().exec() : null;
    if (company)  return company.isSuperAdmin ? 'super_admin' : 'admin';
    const employee = Employee ? await Employee.findById(userIdStr).select('isManager').lean().exec() : null;
    if (employee) return employee.isManager ? 'manager' : 'employee';
  } catch (e) { console.error('[dataFetcher] getCompanyRole error:', e.message); }
  return 'super_admin';
}

/**
 * Fetch salary scales for a company (name, levels with id and levelName)
 * Used when payroll period creation fails due to missing salary configuration
 */
async function fetchSalaryScales(companyId) {
  const Model = SalaryScale || mongoose.model('SalaryScaleSchema');
  const cid = String(companyId);
  const scales = await Model.find({ companyId: cid }).select('name _id salaryScaleLevels').lean();
  return (scales || []).map(s => ({
    id: s._id?.toString(),
    name: s.name,
    levels: (s.salaryScaleLevels || []).map(l => ({
      id: l._id?.toString(),
      levelName: l.levelName || 'Unnamed',
    })).filter(l => l.id),
  })).filter(s => s.levels?.length > 0);
}

module.exports = {
  fetchHRData,
  fetchEmployeeById,
  fetchCompanyById,
  fetchSalaryScales,
  fetchPayrollForCsv,
  fetchLeaveForCsv,
  fetchExpenseForCsv,
  fetchEmployeeForCsv,
  fetchReportForCsv,
  resolveCopilotContext,
  getCompanyRole,
};