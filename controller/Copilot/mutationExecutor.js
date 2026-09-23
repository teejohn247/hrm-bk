// /**
//  * Mutation Executor
//  * Runs the structured mutation produced by mutationBuilder.js against MongoDB.
//  *
//  * Role permissions:
//  *   super_admin / admin  → approve, reject, create, update, delete on all entities
//  *   manager              → approve/reject leave and expense for their reports; no delete
//  *   employee             → create leave/expense for themselves only; no approve/reject/delete
//  *
//  * Returns { ok: true, action, entity, record, message } on success
//  * Returns { ok: false, error: string } on failure
//  */

// const mongoose = require('mongoose');

// // ─── Model imports ─────────────────────────────────────────────────────────────
// let Employee, Company, Absence, ExpenseRequests, AppraisalRequest, Announcement,
//     Department, Branch, Designation, Holiday, SalaryScale,
//     Kpi, AppraisalGroup, AppraisalPeriod, AppraisalData, EmployeeKpi, Meeting;

// try {
//   Employee         = require('../../model/Employees');
//   Company          = require('../../model/Company');
//   Absence          = require('../../model/LeaveRecords').default || require('../../model/LeaveRecords');
//   ExpenseRequests  = require('../../model/ExpenseRequests');
//   AppraisalRequest = require('../../model/AppraisalRequest');
//   Announcement     = require('../../model/Announcement');
//   Department       = require('../../model/Department');
//   Branch           = require('../../model/Branch');
//   Designation      = require('../../model/Designation');
//   Holiday          = require('../../model/Holidays');
//   Kpi              = require('../../model/Kpi');
//   AppraisalGroup   = require('../../model/AppraisalGroup');
//   AppraisalPeriod  = require('../../model/AppraisalPeriod');
//   AppraisalData    = require('../../model/AppraisalData');
//   EmployeeKpi      = require('../../model/EmployeeKpis');
//   Meeting          = require('../../model/Meetings');
//   SalaryScale      = require('../../model/SalaryScale');
// } catch (e) {
//   console.warn('[mutationExecutor] Some models not found:', e.message);
// }

// // ─── Permission matrix ────────────────────────────────────────────────────────

// const PERMISSIONS = {
//   super_admin: ['approve', 'reject', 'create', 'update', 'delete'],
//   admin:       ['approve', 'reject', 'create', 'update', 'delete'],
//   manager:     ['approve', 'reject', 'create', 'update'],
//   employee:    ['create'],
// };

// function hasPermission(userRole, action) {
//   const allowed = PERMISSIONS[userRole] || [];
//   return allowed.includes(action);
// }

// // ─── Main executor ────────────────────────────────────────────────────────────

// /**
//  * @param {object} mutation  - structured object from mutationBuilder
//  * @param {object} context   - { companyId, userId, userRole }
//  * @returns {Promise<{ ok, action, entity, record?, message?, error? }>}
//  */
// async function executeMutation(mutation, context) {
//   const { action, entity, filters = {}, data = {} } = mutation;
//   const { companyId, userId, userRole } = context;

//   if (!hasPermission(userRole, action)) {
//     return {
//       ok:    false,
//       error: `Your role (${userRole}) does not have permission to ${action} ${entity} records.`,
//     };
//   }

//   try {
//     switch (`${action}:${entity}`) {

//       // ── Leave ──────────────────────────────────────────────────────────────

//       case 'approve:leave':
//       case 'reject:leave':
//         return await updateLeaveStatus(action, filters, data, companyId, userId, userRole);

//       case 'create:leave':
//         return await createLeave(data, companyId, userId, userRole);

//       case 'update:leave':
//         return await updateLeave(filters, data, companyId, userId, userRole);

//       case 'delete:leave':
//         return await deleteRecord(Absence, 'leaverecords', filters, companyId, userRole);

//       // ── Expense ────────────────────────────────────────────────────────────

//       case 'approve:expense':
//       case 'reject:expense':
//         return await updateExpenseStatus(action, filters, data, companyId, userId, userRole);

//       case 'create:expense':
//         return await createExpense(data, companyId, userId, userRole);

//       case 'update:expense':
//         return await updateExpense(filters, data, companyId, userId, userRole);

//       case 'delete:expense':
//         return await deleteRecord(ExpenseRequests, 'ExpenseRequests', filters, companyId, userRole);

//       // ── Appraisal ──────────────────────────────────────────────────────────

//       case 'approve:appraisal':
//       case 'reject:appraisal':
//         return await updateAppraisalStatus(action, filters, data, companyId, userId, userRole);

//       case 'update:appraisal':
//         return await updateAppraisal(filters, data, companyId, userId, userRole);

//       // ── Employee ───────────────────────────────────────────────────────────

//       case 'create:employee':
//         return await createEmployee(data, companyId, userId, userRole);

//       case 'update:employee':
//         return await updateEmployee(filters, data, companyId, userId, userRole);

//       case 'delete:employee':
//         return await deleteRecord(Employee, 'Employee', filters, companyId, userRole);

//       // ── Announcement ───────────────────────────────────────────────────────

//       case 'create:announcement':
//         return await createAnnouncement(data, companyId, userId, userRole);

//       case 'delete:announcement':
//         return await deleteRecord(Announcement, 'Announcement', filters, companyId, userRole);

//       // ── Meeting ────────────────────────────────────────────────────────────

//       case 'create:meeting':
//         return await createMeeting(data, companyId, userId, userRole);

//       case 'update:meeting':
//         return await updateMeeting(filters, data, companyId, userRole);

//       case 'delete:meeting':
//         return await deleteRecord(Meeting, 'Meeting', filters, companyId, userRole);

//       // ── HR Settings ────────────────────────────────────────────────────────

//       case 'create:department':
//         return await createDepartment(data, companyId, userId, userRole);

//       case 'update:department':
//         return await updateHRSettingRecord(Department, 'Department', filters, data, companyId, ['departmentName', 'managerId', 'managerName']);

//       case 'delete:department':
//         return await deleteRecord(Department, 'Department', filters, companyId, userRole);

//       case 'create:branch':
//         return await createBranch(data, companyId, userId, userRole);

//       case 'update:branch':
//         return await updateHRSettingRecord(Branch, 'Branch', filters, data, companyId, ['branchName', 'isActive', 'branchAddress']);

//       case 'delete:branch':
//         return await deleteRecord(Branch, 'Branch', filters, companyId, userRole);

//       case 'create:designation':
//         return await createDesignation(data, companyId, userId, userRole);

//       case 'update:designation':
//         return await updateHRSettingRecord(Designation, 'Designation', filters, data, companyId, ['designationName', 'grade', 'description']);

//       case 'delete:designation':
//         return await deleteRecord(Designation, 'Designation', filters, companyId, userRole);

//       case 'create:holiday':
//         return await createHoliday(data, companyId, userId, userRole);

//       case 'update:holiday':
//         return await updateHRSettingRecord(Holiday, 'Holidays', filters, data, companyId, ['holidayName', 'date', 'description']);

//       case 'delete:holiday':
//         return await deleteRecord(Holiday, 'Holidays', filters, companyId, userRole);

//       // ── KPI ────────────────────────────────────────────────────────────────

//       case 'create:kpi':
//         return await createKpi(data, companyId, userId, userRole);

//       case 'update:kpi':
//         return await updateHRSettingRecord(Kpi, 'Kpi', filters, data, companyId, ['kpiName', 'kpiDescription', 'type']);

//       case 'delete:kpi':
//         return await deleteRecord(Kpi, 'Kpi', filters, companyId, userRole);

//       // ── Appraisal Period ───────────────────────────────────────────────────

//       case 'create:appraisalPeriod':
//         return await createAppraisalPeriod(data, companyId, userId, userRole);

//       case 'update:appraisalPeriod':
//       case 'close:appraisalPeriod':
//       case 'activate:appraisalPeriod':
//         return await updateAppraisalPeriod(action, filters, data, companyId, userRole);

//       case 'delete:appraisalPeriod':
//         return await deleteRecord(AppraisalPeriod, 'AppraisalPeriod', filters, companyId, userRole);

//       default:
//         return {
//           ok:    false,
//           error: `Action "${action}" on "${entity}" is not yet supported by the copilot.`,
//         };
//     }
//   } catch (err) {
//     console.error('[mutationExecutor] error:', err.message);
//     return { ok: false, error: `Database error: ${err.message}` };
//   }
// }

// // ─── Leave handlers ───────────────────────────────────────────────────────────

// async function updateLeaveStatus(action, filters, data, companyId, userId, userRole) {
//   const Model = Absence || mongoose.model('leaverecords');
//   const query = buildLookupQuery(filters, companyId);

//   const records = await Model.find(query).lean();
//   if (records.length === 0) {
//     return { ok: false, error: 'No matching leave record found.' };
//   }

//   // Managers can only approve their own reports
//   const toUpdate = userRole === 'manager'
//     ? records.filter(r => r.approverId === String(userId) || !r.approverId)
//     : records;

//   if (toUpdate.length === 0) {
//     return { ok: false, error: 'No leave records found that you are authorised to update.' };
//   }

//   const newStatus    = action === 'approve' ? 'Approved' : 'Declined';
//   const updateFields = {
//     status:          newStatus,
//     approved:        action === 'approve',
//     lastUpdated:     new Date().toISOString(),
//     ...(data.comment ? { decisionMessage: data.comment } : {}),
//   };

//   const ids = toUpdate.map(r => r._id);
//   await Model.updateMany({ _id: { $in: ids } }, { $set: updateFields });

//   const count = ids.length;
//   return {
//     ok:      true,
//     action,
//     entity:  'leave',
//     count,
//     message: `${newStatus} ${count} leave request${count > 1 ? 's' : ''} successfully.`,
//     records: toUpdate.map(r => ({
//       id:       r._id,
//       employee: r.fullName || r.employeeName,
//       type:     r.leaveTypeName,
//       dates:    `${r.leaveStartDate} – ${r.leaveEndDate}`,
//       status:   newStatus,
//     })),
//   };
// }

// async function createLeave(data, companyId, userId, userRole) {
//   const Model = Absence || mongoose.model('leaverecords');

//   // Resolve employee making the request
//   const Emp   = Employee || mongoose.model('Employee');
//   const emp   = await Emp.findById(userId).lean();
//   const Comp  = Company  || mongoose.model('Company');
//   const comp  = await Comp.findById(companyId).lean();

//   if (!emp && userRole === 'employee') {
//     return { ok: false, error: 'Employee record not found for your user ID.' };
//   }

//   const fullName = emp ? `${emp.firstName} ${emp.lastName}`.trim() : (data.fullName || data.employeeName || '');
//   if (!fullName) {
//     return { ok: false, error: 'fullName (employee name) is required to create a leave request. Please specify the employee.' };
//   }

//   const today = new Date().toISOString();
//   const doc = {
//     companyId,
//     companyName:     comp?.companyName || '',
//     userId:          String(userId),
//     fullName,
//     leaveTypeId:     data.leaveTypeId  || data.leaveType || 'manual',
//     leaveTypeName:   data.leaveTypeName || data.leaveType || 'Leave',
//     leaveStartDate:  data.leaveStartDate || today.slice(0, 10),
//     leaveEndDate:    data.leaveEndDate   || today.slice(0, 10),
//     leaveApprover:   data.leaveApprover  || 'Manager',
//     approver:        data.approver       || 'Manager',
//     requestMessage:  data.reason         || data.description || '',
//     status:          'Pending',
//     approved:        false,
//     requestDate:     today,
//     department:      emp?.department || data.department || '',
//   };

//   const record = await Model.create(doc);
//   return {
//     ok:      true,
//     action:  'create',
//     entity:  'leave',
//     message: `Leave request created successfully (${doc.leaveTypeName}: ${doc.leaveStartDate} – ${doc.leaveEndDate}).`,
//     record:  { id: record._id, status: 'Pending', ...doc },
//   };
// }

// async function updateLeave(filters, data, companyId, userId, userRole) {
//   const Model   = Absence || mongoose.model('leaverecords');
//   const query   = buildLookupQuery(filters, companyId);
//   const record  = await Model.findOne(query).lean();

//   if (!record) return { ok: false, error: 'No matching leave record found.' };

//   const allowed = pickAllowed(data, ['leaveStartDate', 'leaveEndDate', 'leaveTypeName', 'requestMessage', 'decisionMessage']);
//   if (Object.keys(allowed).length === 0) {
//     return { ok: false, error: 'No updatable fields provided.' };
//   }

//   await Model.updateOne({ _id: record._id }, { $set: { ...allowed, lastUpdated: new Date().toISOString() } });
//   return {
//     ok:      true,
//     action:  'update',
//     entity:  'leave',
//     message: `Leave record updated (${Object.keys(allowed).join(', ')}).`,
//     record:  { id: record._id, ...allowed },
//   };
// }

// // ─── Expense handlers ─────────────────────────────────────────────────────────

// async function updateExpenseStatus(action, filters, data, companyId, userId, userRole) {
//   const Model  = ExpenseRequests || mongoose.model('ExpenseRequests');
//   const query  = buildLookupQuery(filters, companyId);
//   const records = await Model.find(query).lean();

//   if (records.length === 0) return { ok: false, error: 'No matching expense request found.' };

//   const newStatus    = action === 'approve' ? 'Approved' : 'Declined';
//   const updateFields = {
//     status:          newStatus,
//     approved:        action === 'approve',
//     dateOfApproval:  new Date().toISOString(),
//     approverId:      String(userId),
//     ...(data.comment ? { comment: data.comment } : {}),
//   };

//   const ids = records.map(r => r._id);
//   await Model.updateMany({ _id: { $in: ids } }, { $set: updateFields });

//   const count = ids.length;
//   return {
//     ok:      true,
//     action,
//     entity:  'expense',
//     count,
//     message: `${newStatus} ${count} expense request${count > 1 ? 's' : ''} successfully.`,
//     records: records.map(r => ({
//       id:       r._id,
//       employee: r.employeeName,
//       type:     r.expenseTypeName,
//       amount:   r.amount,
//       status:   newStatus,
//     })),
//   };
// }

// async function createExpense(data, companyId, userId, userRole) {
//   const Model = ExpenseRequests || mongoose.model('ExpenseRequests');
//   const Emp   = Employee || mongoose.model('Employee');
//   const Comp  = Company  || mongoose.model('Company');

//   const emp  = await Emp.findById(userId).lean();
//   const comp = await Comp.findById(companyId).lean();

//   if (!data.amount) return { ok: false, error: 'Amount is required to create an expense request.' };

//   const doc = {
//     companyId,
//     companyName:    comp?.companyName || '',
//     employeeId:     String(userId),
//     employeeName:   emp ? `${emp.firstName} ${emp.lastName}`.trim() : (data.employeeName || ''),
//     expenseTypeId:  data.expenseTypeId  || 'manual',
//     expenseTypeName:data.expenseTypeName || data.expenseType || 'Expense',
//     expenseDate:    data.expenseDate ? new Date(data.expenseDate) : new Date(),
//     amount:         String(data.amount),
//     description:    data.description || data.reason || '',
//     status:         'Pending',
//     approved:       false,
//     dateRequested:  new Date().toISOString(),
//   };

//   const record = await Model.create(doc);
//   return {
//     ok:      true,
//     action:  'create',
//     entity:  'expense',
//     message: `Expense request created: ₦${doc.amount} for ${doc.expenseTypeName}.`,
//     record:  { id: record._id, status: 'Pending', ...doc },
//   };
// }

// async function updateExpense(filters, data, companyId, userId, userRole) {
//   const Model  = ExpenseRequests || mongoose.model('ExpenseRequests');
//   const query  = buildLookupQuery(filters, companyId);
//   const record = await Model.findOne(query).lean();

//   if (!record) return { ok: false, error: 'No matching expense request found.' };

//   const allowed = pickAllowed(data, ['amount', 'description', 'expenseTypeName', 'expenseDate', 'comment']);
//   if (Object.keys(allowed).length === 0) {
//     return { ok: false, error: 'No updatable fields provided.' };
//   }

//   await Model.updateOne({ _id: record._id }, { $set: allowed });
//   return {
//     ok:      true,
//     action:  'update',
//     entity:  'expense',
//     message: `Expense record updated (${Object.keys(allowed).join(', ')}).`,
//     record:  { id: record._id, ...allowed },
//   };
// }

// // ─── Appraisal handlers ───────────────────────────────────────────────────────

// async function updateAppraisalStatus(action, filters, data, companyId, userId, userRole) {
//   const Model   = AppraisalRequest || mongoose.model('AppraisalRequests');
//   const query   = buildLookupQuery(filters, companyId);
//   const records = await Model.find(query).lean();

//   if (records.length === 0) return { ok: false, error: 'No matching appraisal record found.' };

//   const newStatus    = action === 'approve' ? 'Approved' : 'Declined';
//   const updateFields = {
//     status:          newStatus,
//     approverId:      String(userId),
//     dateOfApproval:  new Date().toISOString(),
//     ...(data.comment ? { comment: data.comment } : {}),
//   };

//   const ids = records.map(r => r._id);
//   await Model.updateMany({ _id: { $in: ids } }, { $set: updateFields });

//   const count = ids.length;
//   return {
//     ok:      true,
//     action,
//     entity:  'appraisal',
//     count,
//     message: `${newStatus} ${count} appraisal request${count > 1 ? 's' : ''}.`,
//     records: records.map(r => ({
//       id:       r._id,
//       employee: r.employeeName,
//       kpi:      r.kpiName,
//       status:   newStatus,
//     })),
//   };
// }

// async function updateAppraisal(filters, data, companyId, userId, userRole) {
//   const Model  = AppraisalRequest || mongoose.model('AppraisalRequests');
//   const query  = buildLookupQuery(filters, companyId);
//   const record = await Model.findOne(query).lean();

//   if (!record) return { ok: false, error: 'No matching appraisal record found.' };

//   const allowed = pickAllowed(data, ['comment', 'status', 'managerReviewDate']);
//   await Model.updateOne({ _id: record._id }, { $set: allowed });

//   return {
//     ok:      true,
//     action:  'update',
//     entity:  'appraisal',
//     message: `Appraisal record updated.`,
//     record:  { id: record._id, ...allowed },
//   };
// }

// // ─── Employee handlers ────────────────────────────────────────────────────────

// async function updateEmployee(filters, data, companyId, userId, userRole) {
//   const Model = Employee || mongoose.model('Employee');
//   const query = buildLookupQuery(filters, companyId);

//   const emp = await Model.findOne(query).lean();
//   if (!emp) return { ok: false, error: 'No matching employee found.' };

//   // Only allow safe, non-credential fields
//   const allowed = pickAllowed(data, [
//     'status', 'department', 'designation', 'phoneNumber',
//     'address', 'jobType', 'salaryScale', 'salaryLevel',
//   ]);

//   if (Object.keys(allowed).length === 0) {
//     return { ok: false, error: 'No updatable fields provided (passwords and emails cannot be changed via copilot).' };
//   }

//   await Model.updateOne({ _id: emp._id }, { $set: allowed });

//   return {
//     ok:      true,
//     action:  'update',
//     entity:  'employee',
//     message: `Employee "${emp.firstName} ${emp.lastName}" updated (${Object.keys(allowed).join(', ')}).`,
//     record:  { id: emp._id, name: `${emp.firstName} ${emp.lastName}`, ...allowed },
//   };
// }

// async function createEmployee(data, companyId, userId, userRole) {
//   const DeptModel  = Department  || mongoose.model('Department');
//   const DesigModel = Designation || mongoose.model('Designation');

//   // Normalise aliased field names from LLM extraction
//   if (!data.departmentName && data.department)   data.departmentName   = data.department;
//   if (!data.designationName && data.designation) data.designationName  = data.designation;

//   // Required field check
//   const missing = [];
//   if (!data.firstName)                              missing.push('first name');
//   if (!data.lastName)                               missing.push('last name');
//   if (!data.email)                                  missing.push('email');
//   if (!data.departmentName && !data.departmentId)   missing.push('department name');
//   if (!data.designationName && !data.designationId) missing.push('designation/job title');
//   if (!data.employmentStartDate)                    missing.push('employment start date');
//   if (!data.employmentType)                         missing.push('employment type (e.g. Full-time, Part-time, Contract, Permanent)');

//   if (missing.length > 0) {
//     return {
//       ok:    false,
//       error: `Missing required fields: ${missing.join(', ')}. Please provide all of them.`,
//       missingFields: missing,
//     };
//   }

//   // Build a companyId $or query to handle ObjectId vs string storage mismatch
//   let cid = companyId;
//   let oid = null;
//   try { oid = new mongoose.Types.ObjectId(companyId); } catch (_) {}
//   const companyMatch = oid
//     ? { $or: [{ companyId: cid }, { companyId: oid }] }
//     : { companyId: cid };

//   // Resolve department — try by ID first, then by name with companyId match
//   let dept = null;
//   if (data.departmentId) {
//     dept = await DeptModel.findById(data.departmentId).lean();
//   } else {
//     const nameRegex = new RegExp(`^${data.departmentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
//     dept = await DeptModel.findOne({ ...(oid ? { $or: [{ companyId: cid }, { companyId: oid }] } : { companyId: cid }), departmentName: nameRegex }).lean();
//     // Fallback: search without companyId in case it's stored differently
//     if (!dept) dept = await DeptModel.findOne({ departmentName: nameRegex }).lean();
//   }
//   if (!dept) {
//     return { ok: false, error: `Department "${data.departmentName}" was not found. Please check the spelling or create it first.` };
//   }

//   // Resolve designation — same pattern
//   let desig = null;
//   if (data.designationId) {
//     desig = await DesigModel.findById(data.designationId).lean();
//   } else {
//     const nameRegex = new RegExp(`^${data.designationName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
//     desig = await DesigModel.findOne({ ...(oid ? { $or: [{ companyId: cid }, { companyId: oid }] } : { companyId: cid }), designationName: nameRegex }).lean();
//     if (!desig) desig = await DesigModel.findOne({ designationName: nameRegex }).lean();
//   }
//   if (!desig) {
//     return { ok: false, error: `Designation "${data.designationName}" was not found. Please check the spelling or create it first.` };
//   }

//   // Call the real inviteEmployee controller so the invitation email is sent
//   const inviteEmployee = (() => {
//     try {
//       return require('../../controller/Employers/createEmployers').default
//           || require('../../controller/Employers/createEmployers');
//     } catch (_) { return null; }
//   })();

//   if (!inviteEmployee) {
//     return { ok: false, error: 'Employee creation controller not available.' };
//   }

//   return new Promise((resolve) => {
//     const fakeReq = {
//       body: {
//         firstName:           data.firstName,
//         lastName:            data.lastName,
//         email:               data.email,
//         phoneNumber:         data.phoneNumber   || '',
//         dateOfBirth:         data.dateOfBirth   || '',
//         gender:              data.gender        || '',
//         departmentId:        dept._id.toString(),
//         designationId:       desig._id.toString(),
//         employmentType:      data.employmentType,
//         employmentStartDate: data.employmentStartDate,
//         companyRole:         data.companyRole || data.role || '',
//         salaryScaleId:       data.salaryScaleId || '',
//         reportingTo:         data.reportingTo   || '',
//       },
//       // auth middleware sets req.payload.id = companyId
//       payload: { id: companyId },
//     };

//     const fakeRes = {
//       _code: 200,
//       status(code) { this._code = code; return this; },
//       json(body) {
//         if (this._code >= 400) {
//           resolve({ ok: false, error: body.error || body.message || 'Failed to create employee.' });
//         } else {
//           resolve({
//             ok:      true,
//             action:  'create',
//             entity:  'employee',
//             message: `Employee "${data.firstName} ${data.lastName}" created successfully. An invitation email has been sent to ${data.email} so they can set up their account/password.`,
//             record:  {
//               id:          body.data?._id,
//               name:        `${data.firstName} ${data.lastName}`,
//               email:       data.email,
//               department:  dept.departmentName,
//               designation: desig.designationName,
//               employeeCode: body.data?.employeeCode,
//             },
//           });
//         }
//       },
//     };

//     Promise.resolve(inviteEmployee(fakeReq, fakeRes)).catch(err => {
//       resolve({ ok: false, error: err.message || 'Failed to create employee.' });
//     });
//   });
// }

// // ─── Announcement handlers ────────────────────────────────────────────────────

// async function createAnnouncement(data, companyId, userId, userRole) {
//   const Model = Announcement || mongoose.model('Announcement');

//   if (!data.title && !data.content) {
//     return { ok: false, error: 'Title or content is required to create an announcement.' };
//   }

//   const Emp    = Employee || mongoose.model('Employee');
//   const Comp   = Company  || mongoose.model('Company');
//   const emp    = await Emp.findById(userId).lean().catch(() => null);
//   const comp   = await Comp.findById(companyId).lean().catch(() => null);

//   const doc = {
//     companyId,
//     companyName: comp?.companyName || '',
//     title:       data.title || 'Announcement',
//     content:     data.content || data.description || '',
//     createdBy:   String(userId),
//     createdByName: emp ? `${emp.firstName} ${emp.lastName}`.trim() : 'Admin',
//     status:      'Active',
//     createdAt:   new Date(),
//   };

//   const record = await Model.create(doc);
//   return {
//     ok:      true,
//     action:  'create',
//     entity:  'announcement',
//     message: `Announcement "${doc.title}" created successfully.`,
//     record:  { id: record._id, ...doc },
//   };
// }

// // ─── Meeting handlers ─────────────────────────────────────────────────────────

// async function createMeeting(data, companyId, userId, userRole) {
//   if (!data.meetingStartTime || !data.meetingEndTime) {
//     return { ok: false, error: 'Meeting start time and end time are required.' };
//   }

//   // Resolve invitedGuests to array of email strings (the real controller expects emails)
//   const rawGuests = data.invitedGuests || [];
//   const guestEmails = [];
//   const unresolvedNames = [];

//   for (const g of rawGuests) {
//     const email = typeof g === 'string' && g.includes('@') ? g : (g?.email || g?.guestEmail);
//     const name  = typeof g === 'string' ? g : (g?.employeeName || g?.name);
//     if (email) {
//       guestEmails.push(email);
//     } else if (name) {
//       const emp = await resolveEmployeeByName(name, companyId);
//       if (emp?.email) {
//         guestEmails.push(emp.email);
//       } else {
//         unresolvedNames.push(name);
//       }
//     }
//   }

//   if (guestEmails.length === 0) {
//     const hint = unresolvedNames.length
//       ? `Could not find employee(s): ${unresolvedNames.join(', ')}. Please check the spelling or use their email address.`
//       : 'At least one valid guest (email or employee name) is required for the meeting.';
//     return { ok: false, error: hint };
//   }

//   const createMeetingController = (() => {
//     try {
//       return require('../../controller/Meeting/createMeeting').default
//           || require('../../controller/Meeting/createMeeting');
//     } catch (_) { return null; }
//   })();

//   if (!createMeetingController) {
//     return { ok: false, error: 'Meeting creation controller not available.' };
//   }

//   return new Promise((resolve) => {
//     const fakeReq = {
//       body: {
//         title:            data.title || 'Team Meeting',
//         description:      data.description || '',
//         location:         data.location || 'Online',
//         meetingStartTime: data.meetingStartTime,
//         meetingEndTime:   data.meetingEndTime,
//         invitedGuests:    guestEmails,
//         timeZone:         data.timeZone || 'UTC',
//       },
//       payload: { id: userId },
//     };

//     const fakeRes = {
//       _code: 200,
//       status(code) { this._code = code; return this; },
//       json(body) {
//         if (this._code >= 400) {
//           resolve({ ok: false, error: body.error || body.message || 'Failed to create meeting.' });
//         } else {
//           const d = body.data;
//           resolve({
//             ok:      true,
//             action:  'create',
//             entity:  'meeting',
//             message: body.message || `Meeting "${fakeReq.body.title}" created and invitations sent to ${guestEmails.length} guest(s).`,
//             record:  {
//               id:       d?._id,
//               title:    d?.title || fakeReq.body.title,
//               time:     d?.meetingStartTime,
//               location: d?.location,
//               meetLink: body.meetLink,
//             },
//           });
//         }
//       },
//     };

//     Promise.resolve(createMeetingController(fakeReq, fakeRes)).catch(err => {
//       resolve({ ok: false, error: err.message || 'Failed to create meeting.' });
//     });
//   });
// }

// async function updateMeeting(filters, data, companyId, userRole) {
//   const Model  = Meeting || mongoose.model('Meeting');
//   const query  = { companyId: String(companyId) };
//   if (filters.recordId) {
//     try { query._id = new mongoose.Types.ObjectId(filters.recordId); } catch (_) {}
//   } else if (filters.name || data.title) {
//     query.title = new RegExp(filters.name || data.title, 'i');
//   }

//   const record = await Model.findOne(query).lean();
//   if (!record) return { ok: false, error: 'No matching meeting found.' };

//   const allowed = pickAllowed(data, ['title', 'description', 'location', 'meetingStartTime', 'meetingEndTime', 'status']);
//   if (allowed.meetingStartTime) allowed.meetingStartTime = new Date(allowed.meetingStartTime);
//   if (allowed.meetingEndTime)   allowed.meetingEndTime   = new Date(allowed.meetingEndTime);

//   await Model.updateOne({ _id: record._id }, { $set: allowed });
//   return {
//     ok: true, action: 'update', entity: 'meeting',
//     message: `Meeting "${record.title}" updated.`,
//     record:  { id: record._id, ...allowed },
//   };
// }

// // ─── HR Settings handlers ─────────────────────────────────────────────────────

// async function createDepartment(data, companyId, userId, userRole) {
//   const Model = Department || mongoose.model('Department');
//   const Comp  = Company    || mongoose.model('Company');
//   const comp  = await Comp.findById(companyId).lean().catch(() => null);

//   if (!data.departmentName) return { ok: false, error: 'Department name is required.' };

//   const doc = {
//     companyId,
//     companyName:  comp?.companyName || '',
//     departmentName: data.departmentName,
//     managerId:    data.managerId || '',
//     managerName:  data.managerName || '',
//   };

//   const record = await Model.create(doc);
//   return {
//     ok: true, action: 'create', entity: 'department',
//     message: `Department "${doc.departmentName}" created successfully.`,
//     record:  { id: record._id, name: doc.departmentName },
//   };
// }

// async function createBranch(data, companyId, userId, userRole) {
//   const Model = Branch  || mongoose.model('Branch');
//   const Comp  = Company || mongoose.model('Company');
//   const comp  = await Comp.findById(companyId).lean().catch(() => null);

//   if (!data.branchName || !data.branchCode) {
//     return { ok: false, error: 'Branch name and branch code are required.' };
//   }

//   const doc = {
//     companyId,
//     companyName:  comp?.companyName || '',
//     branchName:   data.branchName,
//     branchCode:   data.branchCode,
//     branchAddress:data.branchAddress || {},
//     createdBy:    String(userId),
//     isActive:     true,
//     isHeadOffice: data.isHeadOffice || false,
//   };

//   const record = await Model.create(doc);
//   return {
//     ok: true, action: 'create', entity: 'branch',
//     message: `Branch "${doc.branchName}" (${doc.branchCode}) created successfully.`,
//     record:  { id: record._id, name: doc.branchName, code: doc.branchCode },
//   };
// }

// async function createDesignation(data, companyId, userId, userRole) {
//   const Model = Designation || mongoose.model('Designation');
//   const Comp  = Company     || mongoose.model('Company');
//   const comp  = await Comp.findById(companyId).lean().catch(() => null);

//   if (!data.designationName) return { ok: false, error: 'Designation name is required.' };

//   const doc = {
//     companyId,
//     companyName:     comp?.companyName || '',
//     designationName: data.designationName,
//     description:     data.description || '',
//     grade:           data.grade || 1,
//   };

//   const record = await Model.create(doc);
//   return {
//     ok: true, action: 'create', entity: 'designation',
//     message: `Designation "${doc.designationName}" (Grade ${doc.grade}) created.`,
//     record:  { id: record._id, name: doc.designationName, grade: doc.grade },
//   };
// }

// async function createHoliday(data, companyId, userId, userRole) {
//   const Model = Holiday || mongoose.model('Holidays');
//   const Comp  = Company || mongoose.model('Company');
//   const comp  = await Comp.findById(companyId).lean().catch(() => null);

//   if (!data.holidayName || !data.date) {
//     return { ok: false, error: 'Holiday name and date (YYYY-MM-DD) are required.' };
//   }

//   const doc = {
//     companyId,
//     companyName:  comp?.companyName || '',
//     holidayName:  data.holidayName,
//     date:         data.date,
//     description:  data.description || '',
//   };

//   const record = await Model.create(doc);
//   return {
//     ok: true, action: 'create', entity: 'holiday',
//     message: `Holiday "${doc.holidayName}" on ${doc.date} added.`,
//     record:  { id: record._id, name: doc.holidayName, date: doc.date },
//   };
// }

// async function updateHRSettingRecord(Model, modelName, filters, data, companyId, allowedFields) {
//   if (!Model) {
//     try { Model = mongoose.model(modelName); } catch (e) {
//       return { ok: false, error: `Model ${modelName} not available.` };
//     }
//   }

//   const query = { companyId: String(companyId) };
//   if (filters.recordId) {
//     try { query._id = new mongoose.Types.ObjectId(filters.recordId); } catch (_) {}
//   } else if (filters.name) {
//     const nameField = allowedFields[0]; // first field is usually the name field
//     query[nameField] = new RegExp(filters.name, 'i');
//   }

//   const record = await Model.findOne(query).lean();
//   if (!record) return { ok: false, error: `No matching ${modelName} record found.` };

//   const allowed = pickAllowed(data, allowedFields);
//   if (Object.keys(allowed).length === 0) {
//     return { ok: false, error: 'No updatable fields provided.' };
//   }

//   await Model.updateOne({ _id: record._id }, { $set: allowed });
//   return {
//     ok: true, action: 'update', entity: modelName.toLowerCase(),
//     message: `${modelName} record updated (${Object.keys(allowed).join(', ')}).`,
//     record:  { id: record._id, ...allowed },
//   };
// }

// // ─── KPI handlers ─────────────────────────────────────────────────────────────

// async function createKpi(data, companyId, userId, userRole) {
//   const Model = Kpi     || mongoose.model('Kpi');
//   const Comp  = Company || mongoose.model('Company');
//   const comp  = await Comp.findById(companyId).lean().catch(() => null);

//   if (!data.kpiName) return { ok: false, error: 'KPI name is required.' };

//   const doc = {
//     companyId,
//     companyName:    comp?.companyName || '',
//     kpiName:        data.kpiName,
//     kpiDescription: data.kpiDescription || '',
//     type:           data.type || 'percentage',
//     createdBy:      String(userId),
//     createdByRole:  userRole,
//     remarks: {
//       weight:    data.weight    || 0,
//       threshold: data.threshold || 0,
//       target:    data.target    || 0,
//       max:       data.max       || 100,
//     },
//   };

//   const record = await Model.create(doc);
//   return {
//     ok: true, action: 'create', entity: 'kpi',
//     message: `KPI "${doc.kpiName}" created successfully.`,
//     record:  { id: record._id, name: doc.kpiName, type: doc.type },
//   };
// }

// // ─── Appraisal Period handlers ────────────────────────────────────────────────

// async function createAppraisalPeriod(data, companyId, userId, userRole) {
//   const Model = AppraisalPeriod || mongoose.model('AppraisalPeriod');
//   const Comp  = Company         || mongoose.model('Company');
//   const comp  = await Comp.findById(companyId).lean().catch(() => null);

//   if (!data.appraisalPeriodName) {
//     return { ok: false, error: 'Appraisal period name is required.' };
//   }

//   const doc = {
//     companyId,
//     companyName:         comp?.companyName || '',
//     appraisalPeriodName: data.appraisalPeriodName,
//     description:         data.description  || '',
//     startDate:           data.startDate    || new Date().toISOString().slice(0, 10),
//     endDate:             data.endDate      || '',
//     status:              'Set KPIs',
//     progress:            0,
//     active:              false,
//   };

//   const record = await Model.create(doc);
//   return {
//     ok: true, action: 'create', entity: 'appraisalPeriod',
//     message: `Appraisal period "${doc.appraisalPeriodName}" created (status: Set KPIs).`,
//     record:  { id: record._id, name: doc.appraisalPeriodName, startDate: doc.startDate, endDate: doc.endDate },
//   };
// }

// async function updateAppraisalPeriod(action, filters, data, companyId, userRole) {
//   const Model = AppraisalPeriod || mongoose.model('AppraisalPeriod');
//   const query = { companyId: String(companyId) };

//   if (filters.recordId) {
//     try { query._id = new mongoose.Types.ObjectId(filters.recordId); } catch (_) {}
//   } else if (filters.periodName || filters.name) {
//     query.appraisalPeriodName = new RegExp(filters.periodName || filters.name, 'i');
//   }

//   const record = await Model.findOne(query).lean();
//   if (!record) return { ok: false, error: 'No matching appraisal period found.' };

//   let updateFields = {};
//   if (action === 'close') {
//     updateFields = { status: 'Closed', active: false };
//   } else if (action === 'activate') {
//     updateFields = { status: 'Set KPIs', active: true };
//   } else {
//     updateFields = pickAllowed(data, ['appraisalPeriodName', 'startDate', 'endDate', 'status', 'description', 'progress', 'active']);
//   }

//   await Model.updateOne({ _id: record._id }, { $set: updateFields });
//   const actionLabel = action === 'close' ? 'Closed' : action === 'activate' ? 'Activated' : 'Updated';
//   return {
//     ok: true, action, entity: 'appraisalPeriod',
//     message: `Appraisal period "${record.appraisalPeriodName}" ${actionLabel}.`,
//     record:  { id: record._id, name: record.appraisalPeriodName, ...updateFields },
//   };
// }

// // ─── Generic delete ───────────────────────────────────────────────────────────

// async function deleteRecord(Model, modelName, filters, companyId, userRole) {
//   if (userRole !== 'admin' && userRole !== 'super_admin') {
//     return { ok: false, error: 'Only admins can delete records.' };
//   }
//   if (!Model) {
//     Model = mongoose.model(modelName);
//   }

//   const query  = buildLookupQuery(filters, companyId);
//   const record = await Model.findOne(query).lean();
//   if (!record) return { ok: false, error: 'No matching record found to delete.' };

//   await Model.deleteOne({ _id: record._id });
//   return {
//     ok:      true,
//     action:  'delete',
//     message: `Record (ID: ${record._id}) deleted successfully.`,
//     record:  { id: record._id },
//   };
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// /**
//  * Builds a MongoDB query from the LLM-extracted filters object.
//  * Tries to match by ID first, then by employee name substring, then pending status.
//  */
// /**
//  * Returns a MongoDB $or array that matches companyId as both string and ObjectId,
//  * handling the common case where the field is declared String but stored as ObjectId.
//  */
// function companyIdMatch(companyId) {
//   const cid = String(companyId);
//   try {
//     const oid = new mongoose.Types.ObjectId(cid);
//     return [{ companyId: cid }, { companyId: oid }];
//   } catch (_) {
//     return [{ companyId: cid }];
//   }
// }

// /**
//  * Resolves an employee by name within a company.
//  * Uses plain string companyId — NO ObjectId conversion (employees store it as string).
//  *
//  * Lookup order (stops at first match):
//  * 1. Exact fullName, company scoped          ← catches "Pelumi Stephen" exactly
//  * 2. Partial fullName (parts in sequence)    ← catches partial matches
//  * 3. firstName + lastName combo              ← catches split name entry
//  * 4. Exact fullName, NO company scope        ← fallback if companyId format differs
//  * 5. Any-part match, NO company scope        ← broadest fallback
//  */
// async function resolveEmployeeByName(name, companyId) {
//   const Emp = Employee || mongoose.model('Employee');
//   if (!name) return null;

//   const searchName = String(name).trim();
//   const nameParts  = searchName.split(/\s+/);
//   const cid        = String(companyId);
//   // Escape special regex chars in the search name
//   const esc        = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

//   // 1. Exact fullName, company scoped (plain string — most reliable)
//   let emp = await Emp.findOne({
//     companyId: cid,
//     fullName:  new RegExp('^' + esc(searchName) + '$', 'i'),
//   }).select('_id email firstName lastName fullName companyId').lean();
//   if (emp) return emp;

//   // 2. Partial fullName (all parts in sequence), company scoped
//   emp = await Emp.findOne({
//     companyId: cid,
//     fullName:  new RegExp(nameParts.map(esc).join('.*'), 'i'),
//   }).select('_id email firstName lastName fullName companyId').lean();
//   if (emp) return emp;

//   // 3. firstName + lastName combo, company scoped
//   if (nameParts.length >= 2) {
//     emp = await Emp.findOne({
//       companyId: cid,
//       firstName: new RegExp('^' + esc(nameParts[0]), 'i'),
//       lastName:  new RegExp(esc(nameParts[nameParts.length - 1]) + '$', 'i'),
//     }).select('_id email firstName lastName fullName companyId').lean();
//     if (emp) return emp;
//   }

//   // 4. Exact fullName, no company scope (catches ObjectId vs string mismatch)
//   emp = await Emp.findOne({
//     fullName: new RegExp('^' + esc(searchName) + '$', 'i'),
//   }).select('_id email firstName lastName fullName companyId').lean();
//   if (emp) return emp;

//   // 5. Broadest fallback — any part, any company
//   const anyPart = new RegExp(nameParts.map(esc).join('|'), 'i');
//   return await Emp.findOne({
//     $or: [
//       { fullName:  new RegExp(nameParts.map(esc).join('.*'), 'i') },
//       { firstName: anyPart },
//       { lastName:  anyPart },
//     ],
//   }).select('_id email firstName lastName fullName companyId').lean() || null;
// }

// function buildLookupQuery(filters = {}, companyId) {
//   // Match companyId as both string and ObjectId
//   const companyOr = companyIdMatch(companyId);
//   const query = companyOr.length > 1
//     ? { $or: companyOr }
//     : { companyId: String(companyId) };

//   if (filters.recordId) {
//     try { query._id = new mongoose.Types.ObjectId(filters.recordId); }
//     catch (_) {}
//   }

//   if (filters.employeeId) {
//     query.employeeId = String(filters.employeeId);
//   } else if (filters.employeeName) {
//     const nameParts = filters.employeeName.split(/\s+/);
//     const nameRegex = new RegExp(nameParts.join('|'), 'i');
//     const nameOr = [
//       { fullName:     new RegExp(nameParts.join('\\s+'), 'i') },
//       { fullName:     nameRegex },
//       { employeeName: nameRegex },
//       { firstName:    nameRegex },
//       { lastName:     nameRegex },
//     ];
//     // Merge with existing $or (companyId) using $and
//     if (query.$or) {
//       const existing = query.$or;
//       delete query.$or;
//       query.$and = [{ $or: existing }, { $or: nameOr }];
//     } else {
//       query.$or = nameOr;
//     }
//   }

//   if (filters.status) {
//     query.status = new RegExp(filters.status, 'i');
//   }

//   if (filters.leaveType) {
//     query.leaveTypeName = new RegExp(filters.leaveType, 'i');
//   }

//   return query;
// }

// /** Returns only the listed keys from an object that have truthy values */
// function pickAllowed(obj, keys) {
//   const out = {};
//   for (const k of keys) {
//     if (obj[k] !== undefined && obj[k] !== null) out[k] = obj[k];
//   }
//   return out;
// }

// module.exports = { executeMutation };

/**
 * Mutation Executor
 * Runs the structured mutation produced by mutationBuilder.js against MongoDB.
 *
 * Role permissions:
 *   super_admin / admin  → approve, reject, create, update, delete on all entities
 *   manager              → approve/reject leave and expense for their reports; no delete
 *   employee             → create leave/expense for themselves only; no approve/reject/delete
 */

const mongoose = require('mongoose');

// ─── Model imports ─────────────────────────────────────────────────────────────
let Employee, Company, Absence, ExpenseRequests, AppraisalRequest, Announcement,
    Department, Branch, Designation, Holiday, SalaryScale,
    Kpi, AppraisalGroup, AppraisalPeriod, AppraisalData, EmployeeKpi, Meeting;

try {
  Employee         = require('../../model/Employees');
  Company          = require('../../model/Company');
  Absence          = require('../../model/LeaveRecords').default || require('../../model/LeaveRecords');
  ExpenseRequests  = require('../../model/ExpenseRequests');
  AppraisalRequest = require('../../model/AppraisalRequest');
  Announcement     = require('../../model/Announcement');
  Department       = require('../../model/Department');
  Branch           = require('../../model/Branch');
  Designation      = require('../../model/Designation');
  Holiday          = require('../../model/Holidays');
  Kpi              = require('../../model/Kpi');
  AppraisalGroup   = require('../../model/AppraisalGroup');
  AppraisalPeriod  = require('../../model/AppraisalPeriod');
  AppraisalData    = require('../../model/AppraisalData');
  EmployeeKpi      = require('../../model/EmployeeKpis');
  Meeting          = require('../../model/Meetings');
  SalaryScale      = require('../../model/SalaryScale');
} catch (e) {
  console.warn('[mutationExecutor] Some models not found:', e.message);
}

// ─── Permission matrix ────────────────────────────────────────────────────────

const PERMISSIONS = {
  super_admin: ['approve', 'reject', 'create', 'update', 'assign', 'delete'],
  admin:       ['approve', 'reject', 'create', 'update', 'assign', 'delete'],
  manager:     ['approve', 'reject', 'create', 'update'],
  employee:    ['create'],
};

function hasPermission(userRole, action) {
  return (PERMISSIONS[userRole] || []).includes(action);
}

// ─── Main executor ────────────────────────────────────────────────────────────

async function executeMutation(mutation, context) {
  const { action, entity, filters = {}, data = {} } = mutation;
  const { companyId, userId, userRole } = context;

  if (!hasPermission(userRole, action)) {
    return { ok: false, error: `Your role (${userRole}) does not have permission to ${action} ${entity} records.` };
  }

  try {
    switch (`${action}:${entity}`) {
      case 'approve:leave':
      case 'create:leaveType': return await createLeaveType(data, companyId, userId, userRole);

      case 'reject:leave':    return await updateLeaveStatus(action, filters, data, companyId, userId, userRole);
      case 'create:leave':    return await createLeave(data, companyId, userId, userRole);
      case 'update:leave':    return await updateLeave(filters, data, companyId, userId, userRole);
      case 'delete:leave':    return await deleteRecord(Absence, 'leaverecords', filters, companyId, userRole);

      case 'create:expenseType': return await createExpenseType(data, companyId, userId, userRole);

      case 'approve:expense':
      case 'reject:expense':  return await updateExpenseStatus(action, filters, data, companyId, userId, userRole);
      case 'create:expense':  return await createExpense(data, companyId, userId, userRole);
      case 'update:expense':  return await updateExpense(filters, data, companyId, userId, userRole);
      case 'delete:expense':  return await deleteRecord(ExpenseRequests, 'ExpenseRequests', filters, companyId, userRole);

      case 'approve:appraisal':
      case 'reject:appraisal': return await updateAppraisalStatus(action, filters, data, companyId, userId, userRole);
      case 'update:appraisal': return await updateAppraisal(filters, data, companyId, userId, userRole);

      case 'create:employee': return await createEmployee(data, companyId, userId, userRole);
      case 'update:employee': return await updateEmployee(filters, data, companyId, userId, userRole);
      case 'delete:employee': return await deleteRecord(Employee, 'Employee', filters, companyId, userRole);

      case 'create:announcement': return await createAnnouncement(data, companyId, userId, userRole);
      case 'delete:announcement': return await deleteRecord(Announcement, 'Announcement', filters, companyId, userRole);

      case 'create:meeting': return await createMeeting(data, companyId, userId, userRole);
      case 'update:meeting': return await updateMeeting(filters, data, companyId, userRole);
      case 'delete:meeting': return await deleteRecord(Meeting, 'Meeting', filters, companyId, userRole);

      case 'create:department': return await createDepartment(data, companyId, userId, userRole);
      case 'update:department': return await updateHRSettingRecord(Department, 'Department', filters, data, companyId, ['departmentName', 'managerId', 'managerName']);
      case 'delete:department': return await deleteRecord(Department, 'Department', filters, companyId, userRole);

      case 'create:branch': return await createBranch(data, companyId, userId, userRole);
      case 'update:branch': return await updateBranch(filters, data, companyId, userId, userRole);
      case 'delete:branch': return await deleteRecord(Branch, 'Branch', filters, companyId, userRole);

      case 'create:designation': return await createDesignation(data, companyId, userId, userRole);
      case 'update:designation': return await updateHRSettingRecord(Designation, 'Designation', filters, data, companyId, ['designationName', 'grade', 'description']);
      case 'delete:designation': return await deleteRecord(Designation, 'Designation', filters, companyId, userRole);

      case 'create:holiday': return await createHoliday(data, companyId, userId, userRole);
      case 'update:holiday': return await updateHRSettingRecord(Holiday, 'Holidays', filters, data, companyId, ['holidayName', 'date', 'description']);
      case 'delete:holiday': return await deleteRecord(Holiday, 'Holidays', filters, companyId, userRole);

      case 'create:kpi': return await createKpi(data, companyId, userId, userRole);
      case 'update:kpi': return await updateHRSettingRecord(Kpi, 'Kpi', filters, data, companyId, ['kpiName', 'kpiDescription', 'type']);
      case 'delete:kpi': return await deleteRecord(Kpi, 'Kpi', filters, companyId, userRole);

      case 'create:payrollPeriod': return await createPayrollPeriod(data, companyId, userId, userRole);
      case 'assign:employeeSalary': return await assignSalaryScaleToEmployee(filters, data, companyId, userId, userRole);

      case 'create:appraisalPeriod':  return await createAppraisalPeriod(data, companyId, userId, userRole);
      case 'update:appraisalPeriod':
      case 'close:appraisalPeriod':
      case 'activate:appraisalPeriod': return await updateAppraisalPeriod(action, filters, data, companyId, userRole);
      case 'delete:appraisalPeriod':  return await deleteRecord(AppraisalPeriod, 'AppraisalPeriod', filters, companyId, userRole);

      default:
        return { ok: false, error: `Action "${action}" on "${entity}" is not yet supported by the copilot.` };
    }
  } catch (err) {
    console.error('[mutationExecutor] error:', err.message);
    return { ok: false, error: `Database error: ${err.message}` };
  }
}

// ─── Leave handlers ───────────────────────────────────────────────────────────

async function updateLeaveStatus(action, filters, data, companyId, userId, userRole) {
  const Model   = Absence || mongoose.model('leaverecords');
  const query   = buildLookupQuery(filters, companyId);
  const records = await Model.find(query).lean();
  if (records.length === 0) return { ok: false, error: 'No matching leave record found.' };

  const toUpdate    = userRole === 'manager' ? records.filter(r => r.approverId === String(userId) || !r.approverId) : records;
  if (toUpdate.length === 0) return { ok: false, error: 'No leave records found that you are authorised to update.' };

  const newStatus    = action === 'approve' ? 'Approved' : 'Declined';
  const updateFields = { status: newStatus, approved: action === 'approve', lastUpdated: new Date().toISOString(), ...(data.comment ? { decisionMessage: data.comment } : {}) };
  const ids          = toUpdate.map(r => r._id);
  await Model.updateMany({ _id: { $in: ids } }, { $set: updateFields });

  return {
    ok: true, action, entity: 'leave', count: ids.length,
    message: `${newStatus} ${ids.length} leave request${ids.length > 1 ? 's' : ''} successfully.`,
    records: toUpdate.map(r => ({ id: r._id, employee: r.fullName || r.employeeName, type: r.leaveTypeName, dates: `${r.leaveStartDate} – ${r.leaveEndDate}`, status: newStatus })),
  };
}

// ─── Leave type (HR settings category) ───────────────────────────────────────

async function createLeaveType(data, companyId, userId, userRole) {
  const name = data.leaveName || data.name || '';
  if (!name || !String(name).trim()) return { ok: false, error: 'Leave type name is required.' };

  const createController = (() => {
    try { return require('../../controller/Leave/createLeave').default || require('../../controller/Leave/createLeave'); }
    catch (_) { return null; }
  })();
  if (!createController) return { ok: false, error: 'Leave type controller not available.' };

  return new Promise((resolve) => {
    const fakeReq = {
      body: {
        leaveName: String(name).trim(),
        description: data.description || '',
        colorCode: data.colorCode || '',
      },
      payload: { id: companyId },  // controller expects company id for lookup
    };
    const fakeRes = {
      _code: 200,
      status(code) { this._code = code; return this; },
      json(body) {
        if (this._code >= 400) resolve({ ok: false, error: body.error || body.message || 'Failed to create leave type.' });
        else {
          resolve({
            ok: true,
            action: 'create',
            entity: 'leaveType',
            message: body.message || body.data || `Leave type "${name}" created successfully.`,
            record: { leaveName: name, description: data.description || '' },
          });
        }
      },
    };
    Promise.resolve(createController(fakeReq, fakeRes)).catch(err => resolve({ ok: false, error: err.message || 'Failed to create leave type.' }));
  });
}

async function createLeave(data, companyId, userId, userRole) {
  const Model = Absence || mongoose.model('leaverecords');
  const Emp   = Employee || mongoose.model('Employee');
  const Comp  = Company  || mongoose.model('Company');
  const emp   = await Emp.findById(userId).lean();
  const comp  = await Comp.findById(companyId).lean();

  const fullName = emp ? `${emp.firstName} ${emp.lastName}`.trim() : (data.fullName || data.employeeName || '');
  if (!fullName) return { ok: false, error: 'fullName is required to create a leave request.' };

  const today = new Date().toISOString();
  const doc = {
    companyId, companyName: comp?.companyName || '',
    userId: String(userId), fullName,
    leaveTypeId: data.leaveTypeId || 'manual',
    leaveTypeName: data.leaveTypeName || data.leaveType || 'Leave',
    leaveStartDate: data.leaveStartDate || today.slice(0, 10),
    leaveEndDate:   data.leaveEndDate   || today.slice(0, 10),
    leaveApprover:  data.leaveApprover  || 'Manager',
    approver:       data.approver       || 'Manager',
    requestMessage: data.reason         || data.description || '',
    status: 'Pending', approved: false, requestDate: today,
    department: emp?.department || data.department || '',
  };
  const record = await Model.create(doc);
  return { ok: true, action: 'create', entity: 'leave', message: `Leave request created (${doc.leaveTypeName}: ${doc.leaveStartDate} – ${doc.leaveEndDate}).`, record: { id: record._id, status: 'Pending' } };
}

async function updateLeave(filters, data, companyId, userId, userRole) {
  const Model  = Absence || mongoose.model('leaverecords');
  const record = await Model.findOne(buildLookupQuery(filters, companyId)).lean();
  if (!record) return { ok: false, error: 'No matching leave record found.' };
  const allowed = pickAllowed(data, ['leaveStartDate', 'leaveEndDate', 'leaveTypeName', 'requestMessage', 'decisionMessage']);
  if (!Object.keys(allowed).length) return { ok: false, error: 'No updatable fields provided.' };
  await Model.updateOne({ _id: record._id }, { $set: { ...allowed, lastUpdated: new Date().toISOString() } });
  return { ok: true, action: 'update', entity: 'leave', message: `Leave record updated (${Object.keys(allowed).join(', ')}).`, record: { id: record._id, ...allowed } };
}

// ─── Expense handlers ─────────────────────────────────────────────────────────

async function updateExpenseStatus(action, filters, data, companyId, userId, userRole) {
  const Model   = ExpenseRequests || mongoose.model('ExpenseRequests');
  const records = await Model.find(buildLookupQuery(filters, companyId)).lean();
  if (!records.length) return { ok: false, error: 'No matching expense request found.' };

  const newStatus    = action === 'approve' ? 'Approved' : 'Declined';
  const updateFields = { status: newStatus, approved: action === 'approve', dateOfApproval: new Date().toISOString(), approverId: String(userId), ...(data.comment ? { comment: data.comment } : {}) };
  await Model.updateMany({ _id: { $in: records.map(r => r._id) } }, { $set: updateFields });

  return {
    ok: true, action, entity: 'expense', count: records.length,
    message: `${newStatus} ${records.length} expense request${records.length > 1 ? 's' : ''} successfully.`,
    records: records.map(r => ({ id: r._id, employee: r.employeeName, type: r.expenseTypeName, amount: r.amount, status: newStatus })),
  };
}

// ─── Expense type (HR settings category) ─────────────────────────────────────

async function createExpenseType(data, companyId, userId, userRole) {
  const name = data.expenseType || data.name || '';
  if (!name || !String(name).trim()) return { ok: false, error: 'Expense type name is required.' };

  const createController = (() => {
    try { return require('../../controller/Expense/createExpense').default || require('../../controller/Expense/createExpense'); }
    catch (_) { return null; }
  })();
  if (!createController) return { ok: false, error: 'Expense type controller not available.' };

  return new Promise((resolve) => {
    const fakeReq = {
      body: {
        expenseType: String(name).trim(),
        description: data.description || '',
      },
      payload: { id: companyId },  // controller expects company id for lookup
    };
    const fakeRes = {
      _code: 200,
      status(code) { this._code = code; return this; },
      json(body) {
        if (this._code >= 400) resolve({ ok: false, error: body.error || body.message || 'Failed to create expense type.' });
        else {
          const d = body.data;
          resolve({
            ok: true,
            action: 'create',
            entity: 'expenseType',
            message: body.message || `Expense type "${name}" created successfully.`,
            record: { id: d?._id, expenseType: d?.expenseType || name, description: d?.description },
          });
        }
      },
    };
    Promise.resolve(createController(fakeReq, fakeRes)).catch(err => resolve({ ok: false, error: err.message || 'Failed to create expense type.' }));
  });
}

async function createExpense(data, companyId, userId, userRole) {
  const Model = ExpenseRequests || mongoose.model('ExpenseRequests');
  const Emp   = Employee || mongoose.model('Employee');
  const Comp  = Company  || mongoose.model('Company');
  const emp   = await Emp.findById(userId).lean();
  const comp  = await Comp.findById(companyId).lean();
  if (!data.amount) return { ok: false, error: 'Amount is required to create an expense request.' };
  const doc = {
    companyId, companyName: comp?.companyName || '',
    employeeId: String(userId),
    employeeName: emp ? `${emp.firstName} ${emp.lastName}`.trim() : (data.employeeName || ''),
    expenseTypeId: data.expenseTypeId || 'manual',
    expenseTypeName: data.expenseTypeName || data.expenseType || 'Expense',
    expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
    amount: String(data.amount), description: data.description || data.reason || '',
    status: 'Pending', approved: false, dateRequested: new Date().toISOString(),
  };
  const record = await Model.create(doc);
  return { ok: true, action: 'create', entity: 'expense', message: `Expense request created: ₦${doc.amount} for ${doc.expenseTypeName}.`, record: { id: record._id, status: 'Pending' } };
}

async function updateExpense(filters, data, companyId, userId, userRole) {
  const Model  = ExpenseRequests || mongoose.model('ExpenseRequests');
  const record = await Model.findOne(buildLookupQuery(filters, companyId)).lean();
  if (!record) return { ok: false, error: 'No matching expense request found.' };
  const allowed = pickAllowed(data, ['amount', 'description', 'expenseTypeName', 'expenseDate', 'comment']);
  if (!Object.keys(allowed).length) return { ok: false, error: 'No updatable fields provided.' };
  await Model.updateOne({ _id: record._id }, { $set: allowed });
  return { ok: true, action: 'update', entity: 'expense', message: `Expense record updated.`, record: { id: record._id, ...allowed } };
}

// ─── Appraisal handlers ───────────────────────────────────────────────────────

async function updateAppraisalStatus(action, filters, data, companyId, userId, userRole) {
  const Model   = AppraisalRequest || mongoose.model('AppraisalRequests');
  const records = await Model.find(buildLookupQuery(filters, companyId)).lean();
  if (!records.length) return { ok: false, error: 'No matching appraisal record found.' };
  const newStatus = action === 'approve' ? 'Approved' : 'Declined';
  await Model.updateMany({ _id: { $in: records.map(r => r._id) } }, { $set: { status: newStatus, approverId: String(userId), dateOfApproval: new Date().toISOString(), ...(data.comment ? { comment: data.comment } : {}) } });
  return { ok: true, action, entity: 'appraisal', count: records.length, message: `${newStatus} ${records.length} appraisal request${records.length > 1 ? 's' : ''}.` };
}

async function updateAppraisal(filters, data, companyId, userId, userRole) {
  const Model  = AppraisalRequest || mongoose.model('AppraisalRequests');
  const record = await Model.findOne(buildLookupQuery(filters, companyId)).lean();
  if (!record) return { ok: false, error: 'No matching appraisal record found.' };
  const allowed = pickAllowed(data, ['comment', 'status', 'managerReviewDate']);
  await Model.updateOne({ _id: record._id }, { $set: allowed });
  return { ok: true, action: 'update', entity: 'appraisal', message: 'Appraisal record updated.', record: { id: record._id, ...allowed } };
}

// ─── Employee handlers ────────────────────────────────────────────────────────

/** Normalize date string to DD/MM/YYYY for storage/display. Accepts DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD. */
function normalizeEmploymentStartDate(val) {
  if (val == null || val === '') return null;
  const s = String(val).trim();
  const parts = s.split(/[-/]/).map(p => p.trim()).filter(Boolean);
  if (parts.length !== 3) return s;
  let day, month, year;
  if (parts[0].length === 4 && parseInt(parts[0], 10) >= 1900) {
    year = parts[0]; month = parts[1].padStart(2, '0'); day = parts[2].padStart(2, '0');
  } else {
    day = parts[0].padStart(2, '0'); month = parts[1].padStart(2, '0'); year = parts[2];
  }
  return `${day}/${month}/${year}`;
}

async function updateEmployee(filters, data, companyId, userId, userRole) {
  const Model = Employee || mongoose.model('Employee');
  const cid   = String(companyId);
  const esc   = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // ── 1. Find target employee ───────────────────────────────────────────────
  const emp = await Model.findOne(buildLookupQuery(filters, cid)).lean();
  if (!emp) return { ok: false, error: `Employee "${filters.employeeName || filters.recordId || '(unknown)'}" not found.` };

  // ── 2. Map copilot field names → controller field names ───────────────────
  // updateEmployeeAdmin (Doc 2) accepts:
  //   firstName, lastName, email, phoneNumber, dateOfBirth, maritalStatus,
  //   gender, address, city, country, nationality, personalEmail,
  //   companyRole, employmentType, employmentStartDate,
  //   departmentId, designationId, salaryScaleId
  // It IGNORES: status, jobType, salaryScale, salaryLevel — causes false positives!

  const FIELD_MAP = {
    phoneNumber:          'phoneNumber',
    phone:                'phoneNumber',
    address:              'address',
    gender:               'gender',
    maritalStatus:        'maritalStatus',
    nationality:          'nationality',
    city:                 'city',
    country:              'country',
    firstName:            'firstName',
    lastName:             'lastName',
    companyRole:          'companyRole',
    role:                 'companyRole',
    employmentType:       'employmentType',
    jobType:              'employmentType',    // alias fix — was silently ignored before
    employmentStartDate:  'employmentStartDate',
    startDate:            'employmentStartDate',
    salaryScaleId:        'salaryScaleId',
    personalEmail:        'personalEmail',
    dateOfBirth:          'dateOfBirth',
    dob:                  'dateOfBirth',
    nextOfKinFullName:    'nextOfKinFullName',
    nextOfKinPhoneNumber: 'nextOfKinPhoneNumber',
    nextOfKinRelationship:'nextOfKinRelationship',
    nextOfKinAddress:     'nextOfKinAddress',
    nextOfKinGender:      'nextOfKinGender',
  };

  // status is NOT in the controller — must be direct DB update to avoid false positive
  const DIRECT_DB_FIELDS = ['status'];

  const controllerBody = {};
  const directUpdate   = {};
  const unsupportedFields = [];

  for (const [key, val] of Object.entries(data)) {
    if (val === undefined || val === null || val === '') continue;
    if (DIRECT_DB_FIELDS.includes(key)) {
      directUpdate[key] = val;
    } else if (FIELD_MAP[key]) {
      controllerBody[FIELD_MAP[key]] = val;
    } else if (!['department', 'designation', 'salaryScale', 'salaryLevel'].includes(key)) {
      controllerBody[key] = val; // pass through unknown scalar fields
    } else {
      unsupportedFields.push(key);
    }
  }

  // Normalize employment start date so it is stored consistently (DD/MM/YYYY)
  if (controllerBody.employmentStartDate != null && controllerBody.employmentStartDate !== '') {
    controllerBody.employmentStartDate = normalizeEmploymentStartDate(controllerBody.employmentStartDate) || controllerBody.employmentStartDate;
  }

  // ── 3. Resolve department name → departmentId ─────────────────────────────
  const DeptModel  = Department  || mongoose.model('Department');
  const DesigModel = Designation || mongoose.model('Designation');
  let deptRecord, desigRecord;

  if (data.department || data.departmentName) {
    const name = data.department || data.departmentName;
    deptRecord = await DeptModel.findOne({ companyId: cid, departmentName: new RegExp('^' + esc(name) + '$', 'i') }).lean()
              || await DeptModel.findOne({ departmentName: new RegExp('^' + esc(name) + '$', 'i') }).lean();
    if (!deptRecord) return { ok: false, error: `Department "${name}" not found. Check spelling or create it first.` };
    controllerBody.departmentId = deptRecord._id.toString();
  }
  if (data.departmentId) controllerBody.departmentId = data.departmentId;

  // ── 4. Resolve designation name → designationId ───────────────────────────
  if (data.designation || data.designationName) {
    const name = data.designation || data.designationName;
    desigRecord = await DesigModel.findOne({ companyId: cid, designationName: new RegExp('^' + esc(name) + '$', 'i') }).lean()
               || await DesigModel.findOne({ designationName: new RegExp('^' + esc(name) + '$', 'i') }).lean();
    if (!desigRecord) return { ok: false, error: `Designation "${name}" not found. Check spelling or create it first.` };
    controllerBody.designationId = desigRecord._id.toString();
  }
  if (data.designationId) controllerBody.designationId = data.designationId;

  // ── 5. Guard: nothing to update ───────────────────────────────────────────
  const hasController = Object.keys(controllerBody).length > 0;
  const hasDirect     = Object.keys(directUpdate).length > 0;
  if (!hasController && !hasDirect) {
    const hint = unsupportedFields.length
      ? `Cannot update "${unsupportedFields.join(', ')}" via copilot. Supported fields: department, designation, phoneNumber, address, gender, employmentType, companyRole, status, maritalStatus, nationality, city, country, startDate, dateOfBirth.`
      : 'No updatable fields provided.';
    return { ok: false, error: hint };
  }

  // ── 6. Direct DB update for fields the controller doesn't handle ──────────
  if (hasDirect) {
    await Model.updateOne({ _id: emp._id }, { $set: directUpdate });
  }

  // ── 7. If no controller fields, we're done ────────────────────────────────
  if (!hasController) {
    return { ok: true, action: 'update', entity: 'employee',
      message: `Employee "${emp.firstName} ${emp.lastName}" updated (${Object.keys(directUpdate).join(', ')}).`,
      record:  { id: emp._id, ...directUpdate } };
  }

  // ── 8. Route to correct controller ───────────────────────────────────────
  //
  // TWO controllers exist with DIFFERENT signatures:
  //
  // updateEmployeeAdmin: req.params.id = target employee, req.payload.id = companyId
  //   → Used when admin/super_admin updates ANY employee
  //   → Handles: departmentId, designationId, salaryScaleId, employmentType,
  //               companyRole, firstName, lastName, phoneNumber, address, etc.
  //
  // updateEmployee (self-update): req.payload.id = logged-in employee (IS the target)
  //   → Does NOT accept params.id — finds employee by payload.id only
  //   → NEVER use this from copilot when updating another employee — it would
  //     update the logged-in user, not the target, causing the false positive!
  //
  // COPILOT RULE: Always use updateEmployeeAdmin with payload.id = companyId.
  // For employee self-service updates, use direct DB (avoids routing ambiguity).

  // Fields ONLY in updateEmployeeAdmin (admin controller), not in updateEmployee:
  const ADMIN_ONLY_FIELDS = ['departmentId', 'designationId', 'salaryScaleId', 'companyRole', 'employmentType', 'employmentStartDate'];
  const needsAdminController = ADMIN_ONLY_FIELDS.some(f => controllerBody[f] !== undefined);

  // Fields shared by both controllers (safe for direct DB update):
  const SELF_UPDATE_FIELDS = ['phoneNumber','address','gender','maritalStatus','nationality',
    'city','country','firstName','lastName','personalEmail','dateOfBirth',
    'nextOfKinFullName','nextOfKinPhoneNumber','nextOfKinRelationship','nextOfKinAddress','nextOfKinGender'];

  // If updating an employee-only (non-admin) field AND we only have userId (not companyId),
  // fall back to direct DB update — safer than calling the wrong controller.
  const isAdminContext = !!companyId; // companyId always present in copilot context

  if (!isAdminContext && !needsAdminController) {
    // Employee self-service fallback — direct DB (avoids calling wrong controller)
    const safeUpdates = { ...directUpdate };
    for (const f of SELF_UPDATE_FIELDS) { if (controllerBody[f] !== undefined) safeUpdates[f] = controllerBody[f]; }
    if (safeUpdates.firstName || safeUpdates.lastName) {
      safeUpdates.fullName = `${safeUpdates.firstName || emp.firstName} ${safeUpdates.lastName || emp.lastName}`;
    }
    await Model.updateOne({ _id: emp._id }, { $set: safeUpdates });
    return { ok: true, action: 'update', entity: 'employee',
      message: `Employee "${emp.firstName} ${emp.lastName}" updated (${Object.keys(safeUpdates).join(', ')}).`,
      record: { id: emp._id, ...safeUpdates } };
  }

  // Admin path: always use updateEmployeeAdmin with payload.id = companyId
  const adminController = (() => {
    try { return require('../../controller/Employers/updateEmployeeAdmin').default || require('../../controller/Employers/updateEmployeeAdmin'); }
    catch (_) { return null; }
  })();

  // Fallback: controller not loadable — direct DB with full field mapping
  if (!adminController) {
    const allUpdates = { ...directUpdate };
    if (deptRecord)  { allUpdates.departmentId = deptRecord._id.toString(); allUpdates.department = deptRecord.departmentName; allUpdates.managerId = deptRecord.managerId; allUpdates.managerName = deptRecord.managerName; }
    if (desigRecord) { allUpdates.designationId = desigRecord._id.toString(); allUpdates.designation = desigRecord.designationName; allUpdates.designationName = desigRecord.designationName; }
    for (const f of [...SELF_UPDATE_FIELDS, ...ADMIN_ONLY_FIELDS]) {
      if (controllerBody[f] !== undefined) allUpdates[f] = controllerBody[f];
    }
    if (allUpdates.firstName || allUpdates.lastName) {
      allUpdates.fullName = `${allUpdates.firstName || emp.firstName} ${allUpdates.lastName || emp.lastName}`;
    }
    await Model.updateOne({ _id: emp._id }, { $set: allUpdates });
    return { ok: true, action: 'update', entity: 'employee',
      message: `Employee "${emp.firstName} ${emp.lastName}" updated.`,
      record: { id: emp._id, ...allUpdates } };
  }

  // Call updateEmployeeAdmin:
  //   req.params.id  = target employee _id
  //   req.payload.id = companyId  ← CRITICAL: must be companyId, not userId
  //                                  Controller does Company.findById(payload.id) for audit trail
  //                                  Passing a userId here causes audit trail to fail silently
  return new Promise((resolve) => {
    const fakeReq = {
      params:  { id: emp._id.toString() },
      payload: { id: cid },          // ← always companyId
      body:    controllerBody,
    };

    const fakeRes = {
      _code: 200,
      status(c) { this._code = c; return this; },
      json(resBody) {
        if (this._code >= 400) {
          resolve({ ok: false, error: resBody.error || resBody.message || 'Update failed.' });
        } else {
          const allUpdated = { ...controllerBody, ...directUpdate };
          // Use actual persisted values from controller response when available
          if (resBody && resBody.data && typeof resBody.data === 'object') {
            if (resBody.data.employmentStartDate != null) allUpdated.employmentStartDate = resBody.data.employmentStartDate;
            if (resBody.data.startDate != null) allUpdated.startDate = resBody.data.startDate;
          }
          resolve({ ok: true, action: 'update', entity: 'employee',
            message: `Employee "${emp.firstName} ${emp.lastName}" updated (${Object.keys(allUpdated).join(', ')}).`,
            record:  { id: emp._id, name: `${emp.firstName} ${emp.lastName}`, ...allUpdated } });
        }
      },
    };

    Promise.resolve(adminController(fakeReq, fakeRes)).catch(err =>
      resolve({ ok: false, error: err.message || 'Update failed.' })
    );
  });
}

async function createEmployee(data, companyId, userId, userRole) {
  const DeptModel  = Department  || mongoose.model('Department');
  const DesigModel = Designation || mongoose.model('Designation');

  if (!data.departmentName && data.department)   data.departmentName  = data.department;
  if (!data.designationName && data.designation) data.designationName = data.designation;

  const missing = [];
  if (!data.firstName)                              missing.push('first name');
  if (!data.lastName)                               missing.push('last name');
  if (!data.email)                                  missing.push('email');
  if (!data.departmentName && !data.departmentId)   missing.push('department name');
  if (!data.designationName && !data.designationId) missing.push('designation/job title');
  if (!data.employmentStartDate)                    missing.push('employment start date');
  if (!data.employmentType)                         missing.push('employment type (e.g. Full-time, Part-time, Contract, Permanent)');
  if (missing.length > 0) return { ok: false, error: `Missing required fields: ${missing.join(', ')}.`, missingFields: missing };

  const cid = String(companyId);
  const deptQ  = { departmentName:   new RegExp(`^${data.departmentName?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,  'i') };
  const desigQ = { designationName:  new RegExp(`^${data.designationName?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };

  const dept  = data.departmentId  ? await DeptModel.findById(data.departmentId).lean()
    : await DeptModel.findOne({ companyId: cid, ...deptQ }).lean()
    || await DeptModel.findOne(deptQ).lean();

  const desig = data.designationId ? await DesigModel.findById(data.designationId).lean()
    : await DesigModel.findOne({ companyId: cid, ...desigQ }).lean()
    || await DesigModel.findOne(desigQ).lean();

  if (!dept)  return { ok: false, error: `Department "${data.departmentName}" not found. Check spelling or create it first.` };
  if (!desig) return { ok: false, error: `Designation "${data.designationName}" not found. Check spelling or create it first.` };

  const inviteEmployee = (() => {
    try { return require('../../controller/Employers/createEmployers').default || require('../../controller/Employers/createEmployers'); }
    catch (_) { return null; }
  })();
  if (!inviteEmployee) return { ok: false, error: 'Employee creation controller not available.' };

  return new Promise((resolve) => {
    const fakeReq = {
      body: {
        firstName: data.firstName, lastName: data.lastName, email: data.email,
        phoneNumber: data.phoneNumber || '', dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || '', departmentId: dept._id.toString(),
        designationId: desig._id.toString(), employmentType: data.employmentType,
        employmentStartDate: data.employmentStartDate, companyRole: data.companyRole || '',
        salaryScaleId: data.salaryScaleId || '', reportingTo: data.reportingTo || '',
      },
      payload: { id: companyId },
    };
    const fakeRes = {
      _code: 200,
      status(code) { this._code = code; return this; },
      json(body) {
        if (this._code >= 400) resolve({ ok: false, error: body.error || body.message || 'Failed to create employee.' });
        else resolve({ ok: true, action: 'create', entity: 'employee', message: `Employee "${data.firstName} ${data.lastName}" created. Invitation sent to ${data.email}.`, record: { id: body.data?._id, name: `${data.firstName} ${data.lastName}`, email: data.email, department: dept.departmentName, designation: desig.designationName } });
      },
    };
    Promise.resolve(inviteEmployee(fakeReq, fakeRes)).catch(err => resolve({ ok: false, error: err.message }));
  });
}

// ─── Announcement ─────────────────────────────────────────────────────────────

async function createAnnouncement(data, companyId, userId, userRole) {
  const Model = Announcement || mongoose.model('Announcement');
  if (!data.title && !data.content) return { ok: false, error: 'Title or content is required.' };
  const emp  = await (Employee || mongoose.model('Employee')).findById(userId).lean().catch(() => null);
  const comp = await (Company  || mongoose.model('Company')).findById(companyId).lean().catch(() => null);
  const doc  = { companyId, companyName: comp?.companyName || '', title: data.title || 'Announcement', content: data.content || data.description || '', createdBy: String(userId), createdByName: emp ? `${emp.firstName} ${emp.lastName}`.trim() : 'Admin', status: 'Active', createdAt: new Date() };
  const record = await Model.create(doc);
  return { ok: true, action: 'create', entity: 'announcement', message: `Announcement "${doc.title}" created.`, record: { id: record._id } };
}

// ─── Meeting ──────────────────────────────────────────────────────────────────

async function createMeeting(data, companyId, userId, userRole) {
  if (!data.meetingStartTime || !data.meetingEndTime) {
    return { ok: false, error: 'Meeting start time and end time are required.' };
  }

  const rawGuests   = data.invitedGuests || [];
  const guestEmails = [];
  const unresolvedNames = [];

  for (const g of rawGuests) {
    const email = typeof g === 'string' && g.includes('@') ? g : (g?.email || g?.guestEmail);
    const name  = typeof g === 'string' ? g : (g?.employeeName || g?.name);
    if (email) {
      guestEmails.push(email);
    } else if (name) {
      // ── FIXED: uses updated resolveEmployeeByName with plain string companyId ──
      const emp = await resolveEmployeeByName(name, companyId);
      if (emp?.email) {
        console.log(`[createMeeting] Resolved "${name}" → ${emp.email}`);
        guestEmails.push(emp.email);
      } else {
        console.warn(`[createMeeting] Could not resolve employee: "${name}" for companyId="${companyId}"`);
        unresolvedNames.push(name);
      }
    }
  }

  if (guestEmails.length === 0) {
    const hint = unresolvedNames.length
      ? `Could not find employee(s): ${unresolvedNames.join(', ')}. Check spelling or use their email address directly.`
      : 'At least one valid guest email or employee name is required.';
    return { ok: false, error: hint };
  }

  const createMeetingController = (() => {
    try { return require('../../controller/Meeting/createMeeting').default || require('../../controller/Meeting/createMeeting'); }
    catch (_) { return null; }
  })();
  if (!createMeetingController) return { ok: false, error: 'Meeting creation controller not available.' };

  return new Promise((resolve) => {
    const fakeReq = {
      body: {
        title:            data.title || 'Team Meeting',
        description:      data.description || '',
        location:         data.location || 'Online',
        meetingStartTime: data.meetingStartTime,
        meetingEndTime:   data.meetingEndTime,
        invitedGuests:    guestEmails,
        timeZone:         data.timeZone || 'UTC',
      },
      payload: { id: userId || companyId },  // companyId when Super Admin (userId undefined)
    };
    const fakeRes = {
      _code: 200,
      status(code) { this._code = code; return this; },
      json(body) {
        if (this._code >= 400) resolve({ ok: false, error: body.error || body.message || 'Failed to create meeting.' });
        else {
          const d = body.data;
          resolve({ ok: true, action: 'create', entity: 'meeting', message: body.message || `Meeting "${fakeReq.body.title}" created and invitations sent to ${guestEmails.length} guest(s).`, record: { id: d?._id, title: d?.title || fakeReq.body.title, time: d?.meetingStartTime, location: d?.location, meetLink: body.meetLink } });
        }
      },
    };
    Promise.resolve(createMeetingController(fakeReq, fakeRes)).catch(err => resolve({ ok: false, error: err.message }));
  });
}

// ─── Payroll period ───────────────────────────────────────────────────────────

async function createPayrollPeriod(data, companyId, userId, userRole) {
  const name = data.payrollPeriodName || data.name || '';
  const startDate = data.startDate;
  const endDate = data.endDate;

  if (!name || !name.trim()) return { ok: false, error: 'Payroll period name is required.' };
  if (!startDate || !endDate) return { ok: false, error: 'Start date and end date are required.' };

  const createController = (() => {
    try { return require('../../controller/Payroll/payrollPeriodData').default || require('../../controller/Payroll/payrollPeriodData'); }
    catch (_) { return null; }
  })();
  if (!createController) return { ok: false, error: 'Payroll period controller not available.' };

  return new Promise((resolve) => {
    const fakeReq = {
      body: {
        payrollPeriodName: String(name).trim(),
        description: data.description || '',
        startDate,
        endDate,
      },
      payload: { id: userId || companyId },  // companyId when Super Admin (userId undefined)
    };
    const fakeRes = {
      _code: 200,
      status(code) { this._code = code; return this; },
      json(body) {
        if (this._code >= 400) {
          const payload = { ok: false, error: body.error || body.message || 'Failed to create payroll period.' };
          if (body.invalidEmployees?.length) payload.invalidEmployees = body.invalidEmployees;
          resolve(payload);
        }
        else {
          const d = body.data;
          resolve({
            ok: true,
            action: 'create',
            entity: 'payrollPeriod',
            message: body.message || `Payroll period "${name}" created successfully.`,
            record: { id: d?._id, name: d?.payrollPeriodName || name, periodId: d?.reference, startDate: d?.startDate, endDate: d?.endDate, status: d?.status },
          });
        }
      },
    };
    Promise.resolve(createController(fakeReq, fakeRes)).catch(err => resolve({ ok: false, error: err.message || 'Failed to create payroll period.' }));
  });
}

// ─── Assign salary scale to employee ──────────────────────────────────────────

async function assignSalaryScaleToEmployee(filters, data, companyId, userId, userRole) {
  const employeeName = filters.employeeName || filters.name || '';
  const scaleName = data.salaryScaleName || data.salaryScale || '';
  const levelName = data.salaryLevelName || data.salaryLevel || '';

  if (!employeeName || !scaleName || !levelName) {
    return { ok: false, error: 'Employee name, salary scale name, and salary level name are required. Example: Assign Standard level Grade 1 to John Doe.' };
  }

  const emp = await resolveEmployeeByName(String(employeeName).trim(), companyId);
  if (!emp) return { ok: false, error: `Employee "${employeeName}" not found.` };

  const Model = SalaryScale || mongoose.model('SalaryScaleSchema');
  const scale = await Model.findOne({ companyId: String(companyId), name: new RegExp('^' + String(scaleName).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }).lean();
  if (!scale) return { ok: false, error: `Salary scale "${scaleName}" not found. Check available scales in HR Settings → Payroll.` };

  const levels = (scale.salaryScaleLevels || []);
  const level = levels.find(l => (l.levelName || '').toLowerCase() === String(levelName).trim().toLowerCase())
    || levels.find(l => new RegExp('^' + String(levelName).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i').test(l.levelName || ''));
  if (!level) return { ok: false, error: `Salary level "${levelName}" not found in scale "${scale.name}". Available levels: ${levels.map(l => l.levelName || 'Unnamed').join(', ')}.` };

  const assignController = (() => {
    try { return require('../../controller/salaryScale/assignSalaryScale').default || require('../../controller/salaryScale/assignSalaryScale'); }
    catch (_) { return null; }
  })();
  if (!assignController) return { ok: false, error: 'Assign salary scale controller not available.' };

  return new Promise((resolve) => {
    const fakeReq = {
      body: { employeeIds: [emp._id.toString()], salaryScaleId: scale._id.toString(), salaryLevelId: level._id.toString() },
      payload: { id: userId || companyId },
    };
    const fakeRes = {
      _code: 200,
      status(code) { this._code = code; return this; },
      json(body) {
        if (this._code >= 400) resolve({ ok: false, error: body.error || body.message || 'Failed to assign salary scale.' });
        else resolve({
          ok: true,
          action: 'assign',
          entity: 'employeeSalary',
          message: body.message || `Salary scale "${scale.name}" (${level.levelName}) assigned to ${emp.fullName || employeeName}.`,
          record: { employeeId: emp._id, salaryScaleId: scale._id, salaryLevelId: level._id },
        });
      },
    };
    Promise.resolve(assignController(fakeReq, fakeRes)).catch(err => resolve({ ok: false, error: err.message || 'Failed to assign salary scale.' }));
  });
}

async function updateMeeting(filters, data, companyId, userRole) {
  const Model  = Meeting || mongoose.model('Meeting');
  const query  = { companyId: String(companyId) };
  if (filters.recordId) { try { query._id = new mongoose.Types.ObjectId(filters.recordId); } catch (_) {} }
  else if (filters.name || data.title) query.title = new RegExp(filters.name || data.title, 'i');
  const record = await Model.findOne(query).lean();
  if (!record) return { ok: false, error: 'No matching meeting found.' };
  const allowed = pickAllowed(data, ['title', 'description', 'location', 'meetingStartTime', 'meetingEndTime', 'status']);
  if (allowed.meetingStartTime) allowed.meetingStartTime = new Date(allowed.meetingStartTime);
  if (allowed.meetingEndTime)   allowed.meetingEndTime   = new Date(allowed.meetingEndTime);
  await Model.updateOne({ _id: record._id }, { $set: allowed });
  return { ok: true, action: 'update', entity: 'meeting', message: `Meeting "${record.title}" updated.`, record: { id: record._id, ...allowed } };
}

// ─── HR Settings ──────────────────────────────────────────────────────────────

async function createDepartment(data, companyId, userId, userRole) {
  const Model = Department || mongoose.model('Department');
  const comp  = await (Company || mongoose.model('Company')).findById(companyId).lean().catch(() => null);
  if (!data.departmentName) return { ok: false, error: 'Department name is required.' };
  const record = await Model.create({ companyId, companyName: comp?.companyName || '', departmentName: data.departmentName, managerId: data.managerId || '', managerName: data.managerName || '' });
  return { ok: true, action: 'create', entity: 'department', message: `Department "${data.departmentName}" created.`, record: { id: record._id } };
}

async function createBranch(data, companyId, userId, userRole) {
  const Model = Branch  || mongoose.model('Branch');
  const comp  = await (Company || mongoose.model('Company')).findById(companyId).lean().catch(() => null);
  const branchName = data.branchName ? String(data.branchName).trim() : '';
  if (!branchName) return { ok: false, error: 'Branch name is required.' };

  // Derive branch code from name when not provided (e.g. "Mainland Head Office" → "MHO")
  let branchCode = data.branchCode ? String(data.branchCode).trim() : '';
  if (!branchCode) {
    const words = branchName.split(/\s+/).filter(Boolean);
    branchCode = words.map(w => (w[0] || '').toUpperCase()).join('').replace(/[^A-Z0-9]/g, '') || branchName.slice(0, 5).toUpperCase().replace(/\s/g, '');
    if (!branchCode) branchCode = 'BRANCH';
  }

  const record = await Model.create({ companyId, companyName: comp?.companyName || '', branchName, branchCode, branchAddress: data.branchAddress || {}, createdBy: String(userId || companyId), isActive: true, isHeadOffice: data.isHeadOffice || false });
  return { ok: true, action: 'create', entity: 'branch', message: `Branch "${branchName}" (${branchCode}) created.`, record: { id: record._id } };
}

async function updateBranch(filters, data, companyId, userId, userRole) {
  const Model = Branch || mongoose.model('Branch');
  const cid = String(companyId);
  const query = { companyId: cid };
  if (filters.recordId) {
    try { query._id = new mongoose.Types.ObjectId(filters.recordId); } catch (_) {}
  } else if (filters.name || data.branchName) {
    const name = (filters.name || data.branchName || '').trim();
    if (name) query.branchName = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  } else if (filters.branchCode || data.branchCode) {
    const code = (filters.branchCode || data.branchCode || '').trim();
    if (code) query.branchCode = new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }
  const branch = await Model.findOne(query).lean();
  if (!branch) return { ok: false, error: 'No matching branch found.' };

  let branchManagerId = null;
  let branchAdminId = null;
  if (data.branchManagerName && String(data.branchManagerName).trim()) {
    const manager = await resolveEmployeeByName(String(data.branchManagerName).trim(), cid);
    if (!manager) return { ok: false, error: `Branch manager "${data.branchManagerName}" not found.` };
    branchManagerId = manager._id.toString();
  }
  if (data.branchAdminName && String(data.branchAdminName).trim()) {
    const admin = await resolveEmployeeByName(String(data.branchAdminName).trim(), cid);
    if (!admin) return { ok: false, error: `Branch admin "${data.branchAdminName}" not found.` };
    branchAdminId = admin._id.toString();
  }

  const updateController = (() => {
    try { return require('../../controller/Branch/updateBranch').default || require('../../controller/Branch/updateBranch'); }
    catch (_) { return null; }
  })();
  if (!updateController) return { ok: false, error: 'Branch update controller not available.' };

  const body = {};
  if (data.branchName && String(data.branchName).trim()) body.branchName = String(data.branchName).trim();
  if (data.branchCode && String(data.branchCode).trim()) body.branchCode = String(data.branchCode).trim();
  if (data.branchAddress) body.branchAddress = data.branchAddress;
  if (data.isActive !== undefined) body.isActive = data.isActive;
  if (data.isHeadOffice !== undefined) body.isHeadOffice = data.isHeadOffice;
  if (branchManagerId !== null) body.branchManagerId = branchManagerId;
  if (branchAdminId !== null) body.branchAdminId = branchAdminId;

  if (!Object.keys(body).length) return { ok: false, error: 'No updatable branch fields provided (e.g. branchName, branchManagerName, branchAdminName).' };

  return new Promise((resolve) => {
    const fakeReq = {
      params: { id: branch._id.toString() },
      body,
      payload: { id: userId || companyId },
    };
    const fakeRes = {
      _code: 200,
      status(code) { this._code = code; return this; },
      json(body) {
        if (this._code >= 400) resolve({ ok: false, error: body.error || body.message || 'Failed to update branch.' });
        else {
          const d = body.data;
          const parts = [];
          if (d?.branchName) parts.push(`"${d.branchName}"`);
          if (branchManagerId && d?.branchManager?.managerName) parts.push(`manager: ${d.branchManager.managerName}`);
          if (branchAdminId && d?.branchAdmin?.adminName) parts.push(`admin: ${d.branchAdmin.adminName}`);
          resolve({
            ok: true,
            action: 'update',
            entity: 'branch',
            message: body.message || `Branch ${parts.length ? parts.join(', ') : 'updated'} successfully.`,
            record: { id: d?._id, branchName: d?.branchName, branchManager: d?.branchManager, branchAdmin: d?.branchAdmin },
          });
        }
      },
    };
    Promise.resolve(updateController(fakeReq, fakeRes)).catch(err => resolve({ ok: false, error: err.message || 'Failed to update branch.' }));
  });
}

async function createDesignation(data, companyId, userId, userRole) {
  const Model = Designation || mongoose.model('Designation');
  const comp  = await (Company || mongoose.model('Company')).findById(companyId).lean().catch(() => null);
  if (!data.designationName) return { ok: false, error: 'Designation name is required.' };
  const record = await Model.create({ companyId, companyName: comp?.companyName || '', designationName: data.designationName, description: data.description || '', grade: data.grade || 1 });
  return { ok: true, action: 'create', entity: 'designation', message: `Designation "${data.designationName}" (Grade ${data.grade || 1}) created.`, record: { id: record._id } };
}

async function createHoliday(data, companyId, userId, userRole) {
  const Model = Holiday || mongoose.model('Holidays');
  const comp  = await (Company || mongoose.model('Company')).findById(companyId).lean().catch(() => null);
  if (!data.holidayName || !data.date) return { ok: false, error: 'Holiday name and date (YYYY-MM-DD) are required.' };
  const record = await Model.create({ companyId, companyName: comp?.companyName || '', holidayName: data.holidayName, date: data.date, description: data.description || '' });
  return { ok: true, action: 'create', entity: 'holiday', message: `Holiday "${data.holidayName}" on ${data.date} added.`, record: { id: record._id } };
}

async function updateHRSettingRecord(Model, modelName, filters, data, companyId, allowedFields) {
  if (!Model) { try { Model = mongoose.model(modelName); } catch (e) { return { ok: false, error: `Model ${modelName} not available.` }; } }
  const query = { companyId: String(companyId) };
  if (filters.recordId) { try { query._id = new mongoose.Types.ObjectId(filters.recordId); } catch (_) {} }
  else if (filters.name) query[allowedFields[0]] = new RegExp(filters.name, 'i');
  const record = await Model.findOne(query).lean();
  if (!record) return { ok: false, error: `No matching ${modelName} record found.` };
  const allowed = pickAllowed(data, allowedFields);
  if (!Object.keys(allowed).length) return { ok: false, error: 'No updatable fields provided.' };
  await Model.updateOne({ _id: record._id }, { $set: allowed });
  return { ok: true, action: 'update', entity: modelName.toLowerCase(), message: `${modelName} updated.`, record: { id: record._id, ...allowed } };
}

async function createKpi(data, companyId, userId, userRole) {
  const Model = Kpi || mongoose.model('Kpi');
  const comp  = await (Company || mongoose.model('Company')).findById(companyId).lean().catch(() => null);
  if (!data.kpiName) return { ok: false, error: 'KPI name is required.' };
  const record = await Model.create({ companyId, companyName: comp?.companyName || '', kpiName: data.kpiName, kpiDescription: data.kpiDescription || '', type: data.type || 'percentage', createdBy: String(userId), createdByRole: userRole, remarks: { weight: data.weight || 0, threshold: data.threshold || 0, target: data.target || 0, max: data.max || 100 } });
  return { ok: true, action: 'create', entity: 'kpi', message: `KPI "${data.kpiName}" created.`, record: { id: record._id } };
}

async function createAppraisalPeriod(data, companyId, userId, userRole) {
  const Model = AppraisalPeriod || mongoose.model('AppraisalPeriod');
  const comp  = await (Company || mongoose.model('Company')).findById(companyId).lean().catch(() => null);
  if (!data.appraisalPeriodName) return { ok: false, error: 'Appraisal period name is required.' };
  const record = await Model.create({ companyId, companyName: comp?.companyName || '', appraisalPeriodName: data.appraisalPeriodName, description: data.description || '', startDate: data.startDate || new Date().toISOString().slice(0, 10), endDate: data.endDate || '', status: 'Set KPIs', progress: 0, active: false });
  return { ok: true, action: 'create', entity: 'appraisalPeriod', message: `Appraisal period "${data.appraisalPeriodName}" created.`, record: { id: record._id } };
}

async function updateAppraisalPeriod(action, filters, data, companyId, userRole) {
  const Model = AppraisalPeriod || mongoose.model('AppraisalPeriod');
  const query = { companyId: String(companyId) };
  if (filters.recordId) { try { query._id = new mongoose.Types.ObjectId(filters.recordId); } catch (_) {} }
  else if (filters.periodName || filters.name) query.appraisalPeriodName = new RegExp(filters.periodName || filters.name, 'i');
  const record = await Model.findOne(query).lean();
  if (!record) return { ok: false, error: 'No matching appraisal period found.' };
  const updateFields = action === 'close' ? { status: 'Closed', active: false } : action === 'activate' ? { status: 'Set KPIs', active: true } : pickAllowed(data, ['appraisalPeriodName', 'startDate', 'endDate', 'status', 'description', 'progress', 'active']);
  await Model.updateOne({ _id: record._id }, { $set: updateFields });
  return { ok: true, action, entity: 'appraisalPeriod', message: `Appraisal period "${record.appraisalPeriodName}" ${action === 'close' ? 'closed' : action === 'activate' ? 'activated' : 'updated'}.`, record: { id: record._id, ...updateFields } };
}

// ─── Generic delete ───────────────────────────────────────────────────────────

async function deleteRecord(Model, modelName, filters, companyId, userRole) {
  if (userRole !== 'admin' && userRole !== 'super_admin') return { ok: false, error: 'Only admins can delete records.' };
  if (!Model) Model = mongoose.model(modelName);
  const record = await Model.findOne(buildLookupQuery(filters, companyId)).lean();
  if (!record) return { ok: false, error: 'No matching record found to delete.' };
  await Model.deleteOne({ _id: record._id });
  return { ok: true, action: 'delete', message: `Record (ID: ${record._id}) deleted.`, record: { id: record._id } };
}

// ─── FIXED: resolveEmployeeByName ────────────────────────────────────────────
// Uses plain string companyId — NO ObjectId conversion.
// Employees store companyId as a string, ObjectId conversion breaks the query.

async function resolveEmployeeByName(name, companyId) {
  const Emp = Employee || mongoose.model('Employee');
  if (!name) return null;

  const searchName = String(name).trim();
  const nameParts  = searchName.split(/\s+/);
  const cid        = String(companyId);
  const esc        = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  console.log(`[resolveEmployee] Looking for "${searchName}" in company ${cid}`);

  // 1. Exact fullName, company scoped (plain string — most reliable)
  let emp = await Emp.findOne({ companyId: cid, fullName: new RegExp('^' + esc(searchName) + '$', 'i') })
    .select('_id email firstName lastName fullName companyId').lean();
  if (emp) { console.log('[resolveEmployee] ✅ exact fullName match:', emp.email); return emp; }

  // 2. Partial fullName (parts in sequence), company scoped
  emp = await Emp.findOne({ companyId: cid, fullName: new RegExp(nameParts.map(esc).join('.*'), 'i') })
    .select('_id email firstName lastName fullName companyId').lean();
  if (emp) { console.log('[resolveEmployee] ✅ partial fullName match:', emp.email); return emp; }

  // 3. firstName + lastName, company scoped
  if (nameParts.length >= 2) {
    emp = await Emp.findOne({ companyId: cid, firstName: new RegExp('^' + esc(nameParts[0]), 'i'), lastName: new RegExp(esc(nameParts[nameParts.length - 1]) + '$', 'i') })
      .select('_id email firstName lastName fullName companyId').lean();
    if (emp) { console.log('[resolveEmployee] ✅ firstName+lastName match:', emp.email); return emp; }
  }

  // 4. Exact fullName, no company scope (catches ObjectId/string storage mismatch)
  emp = await Emp.findOne({ fullName: new RegExp('^' + esc(searchName) + '$', 'i') })
    .select('_id email firstName lastName fullName companyId').lean();
  if (emp) { console.log('[resolveEmployee] ✅ fullName match (no company scope):', emp.email); return emp; }

  // 5. Broadest fallback — any part, any company
  const anyPart = new RegExp(nameParts.map(esc).join('|'), 'i');
  emp = await Emp.findOne({ $or: [{ fullName: new RegExp(nameParts.map(esc).join('.*'), 'i') }, { firstName: anyPart }, { lastName: anyPart }] })
    .select('_id email firstName lastName fullName companyId').lean();
  if (emp) { console.log('[resolveEmployee] ✅ broad fallback match:', emp.email); return emp; }

  console.warn(`[resolveEmployee] ❌ Could not find "${searchName}" in any scope`);
  return null;
}

// ─── FIXED: buildLookupQuery ─────────────────────────────────────────────────
// Uses plain string companyId — no ObjectId conversion for leave/expense/appraisal queries

function buildLookupQuery(filters = {}, companyId) {
  const query = { companyId: String(companyId) };  // plain string — no ObjectId conversion

  if (filters.recordId) {
    try { query._id = new mongoose.Types.ObjectId(filters.recordId); } catch (_) {}
  }

  if (filters.employeeId) {
    query.employeeId = String(filters.employeeId);
  } else if (filters.employeeName) {
    const nameParts = filters.employeeName.split(/\s+/);
    const esc       = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const nameOr    = [
      { fullName:     new RegExp(nameParts.map(esc).join('\\s+'), 'i') },
      { fullName:     new RegExp(nameParts.map(esc).join('.*'), 'i') },
      { employeeName: new RegExp(nameParts.map(esc).join('.*'), 'i') },
      { firstName:    new RegExp(esc(nameParts[0]), 'i') },
      { lastName:     new RegExp(esc(nameParts[nameParts.length - 1]), 'i') },
    ];
    query.$or = nameOr;
  }

  if (filters.status)    query.status        = new RegExp(filters.status,    'i');
  if (filters.leaveType) query.leaveTypeName = new RegExp(filters.leaveType, 'i');

  return query;
}

function pickAllowed(obj, keys) {
  const out = {};
  for (const k of keys) { if (obj[k] !== undefined && obj[k] !== null) out[k] = obj[k]; }
  return out;
}

module.exports = { executeMutation };