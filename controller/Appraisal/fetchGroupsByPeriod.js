// import dotenv from 'dotenv';
// import AppraisalGroup from '../../model/AppraisalData';
// import Appraisals from '../../model/AppraisalGroup';
// import Employee from '../../model/Employees';
// import Department from '../../model/Department';
// import Company from '../../model/Company';
// import Period from '../../model/AppraisalPeriod';

// const sgMail = require('@sendgrid/mail')

// dotenv.config();

// sgMail.setApiKey(process.env.SENDGRID_KEY);

// const fetchGroupsByPeriod = async (req, res) => {
//     try {
//         console.log(`[fetchGroupsByPeriod] Starting fetch for employeeId: ${req.params.employeeId}, periodId: ${req.params.appraisalPeriodId}`);
//         const { employeeId, appraisalPeriodId } = req.params;

//         // Determine user role and access levels
//         let isAdmin = false;
//         let isManager = false;
//         let isSuperAdmin = false;
//         let managedDepartmentIds = []; // Track departments managed by this user
//         let managedEmployeeIds = []; // Track employees in managed departments
        
//         // Get the employee record
//         const employee = await Employee.findOne({_id: employeeId});
//         if (!employee) {
//             return res.status(404).json({
//                 status: 404,
//                 success: false,
//                 error: 'Employee not found'
//             });
//         }
        
//         console.log(`[fetchGroupsByPeriod] Found employee: ${employee.firstName} ${employee.lastName}, department: ${employee.departmentId || 'None'}`);
        
//         // Get appraisal period information to check progress
//         let skipPeriodFilter = false;
//         let appraisalPeriod = null;
        
//         if (appraisalPeriodId) {
//             appraisalPeriod = await Period.findOne({_id: appraisalPeriodId});
//             if (appraisalPeriod && (appraisalPeriod.progress === 0 || appraisalPeriod.progress === 1)) {
//                 skipPeriodFilter = true;
//                 console.log(`[fetchGroupsByPeriod] Appraisal period progress is ${appraisalPeriod.progress}, fetching latest groups without period filter`);
//             }
            
//             // Ensure date fields from appraisal period are properly formatted
//             if (appraisalPeriod) {
//                 appraisalPeriod = appraisalPeriod.toObject();
//                 // Make sure dates are in ISO format for consistency
//                 if (appraisalPeriod.startDate) {
//                     appraisalPeriod.startDate = new Date(appraisalPeriod.startDate).toISOString();
//                 }
//                 if (appraisalPeriod.endDate) {
//                     appraisalPeriod.endDate = new Date(appraisalPeriod.endDate).toISOString();
//                 }
//                 if (appraisalPeriod.activeDate) {
//                     appraisalPeriod.activeDate = new Date(appraisalPeriod.activeDate).toISOString();
//                 }
//                 if (appraisalPeriod.inactiveDate) {
//                     appraisalPeriod.inactiveDate = new Date(appraisalPeriod.inactiveDate).toISOString();
//                 }
//             }
//         }
//         // Determine user role
//         if (employee.isSuperAdmin) {
//             isSuperAdmin = true;
//             isAdmin = true;
//             console.log("[fetchGroupsByPeriod] User is a super admin employee");
//         }
//         // Check if employee has admin permissions
//         else if (employee.permissions?.appraisalManagement?.createKPIGroup || 
//             employee.roleName === 'Admin' || 
//             employee.role === 'Admin') {
//             isAdmin = true;
//             console.log("[fetchGroupsByPeriod] User is an admin employee");
//         } 
//         // Check if employee is a manager using isManager flag
//         else if (employee.isManager === true) {
//             isManager = true;
            
//             // Find all departments this employee manages
//             const managedDepartments = await Department.find({ 
//                 companyId: employee.companyId,
//                 managerId: employeeId 
//             });
            
//             console.log(`[fetchGroupsByPeriod] Found ${managedDepartments.length} departments managed by this user`);
            
//             if (managedDepartments.length > 0) {
//                 // Store the department IDs for later use in KPI filtering
//                 managedDepartmentIds = managedDepartments.map(dept => dept._id.toString());
                
//                 // Find all employees in these departments
//                 const employeesInDepartments = await Employee.find({
//                     companyId: employee.companyId,
//                     departmentId: { $in: managedDepartmentIds }
//                 }).select('_id');
                
//                 managedEmployeeIds = employeesInDepartments.map(emp => emp._id.toString());
//                 console.log(`[fetchGroupsByPeriod] Found ${managedEmployeeIds.length} employees in managed departments`);
//             } else if (employee.departmentId) {
//                 // Check if they are the manager of their own department
//                 const ownDepartment = await Department.findOne({
//                     _id: employee.departmentId,
//                     managerId: employeeId
//                 });
                
//                 if (ownDepartment) {
//                     managedDepartmentIds = [ownDepartment._id.toString()];
                    
//                     // Find all employees in this department
//                     const employeesInDepartment = await Employee.find({
//                         companyId: employee.companyId,
//                         departmentId: employee.departmentId
//                     }).select('_id');
                    
//                     managedEmployeeIds = employeesInDepartment.map(emp => emp._id.toString());
//                     console.log(`[fetchGroupsByPeriod] Manager manages own department with ${managedEmployeeIds.length} employees`);
//                 }
//             }
//         }

//         // First get the appraisal data for this employee and period
//         // If skipPeriodFilter is true, don't filter by appraisalPeriodId
//         const appraisalGroupsQuery = skipPeriodFilter ? 
//             { employeeId: employeeId } : 
//             { employeeId: employeeId, appraisalPeriodId: appraisalPeriodId };
            
//         const appraisalGroups = await AppraisalGroup.find(appraisalGroupsQuery)
//             .sort({ createdAt: -1 })
//         .limit(1);

//         // Find groups assigned to this employee
//         // No period filter needed here since we're just looking at the groups
//         let groupsQuery = {
//             assignedEmployees: {
//               $elemMatch: {
//                 employee_id: employeeId
//               }
//             }
//         };

//         let departmentGroupIds = [];
//         // If the employee has a department, also include groups assigned to their department
//         // This ensures new employees automatically have access to all KPI groups assigned to their department
//         if (employee.departmentId) {
//             const department = await Department.findOne({ _id: employee.departmentId });
            
//             if (department) {
//                 console.log(`[fetchGroupsByPeriod] Found employee's department: ${department.name || department._id}`);
                
//                 // Even if department.assignedAppraisals is empty, we'll check for groups assigned to this department
//                 // by searching in the Appraisals collection
                
//                 // First, try to get assigned groups from department's assignedAppraisals array if it exists
//                 if (department.assignedAppraisals && department.assignedAppraisals.length > 0) {
//                     // Extract appraisal group IDs assigned to this department
//                     departmentGroupIds = department.assignedAppraisals.map(group => 
//                         group.appraisalId ? group.appraisalId.toString() : group.appraisalId
//                     ).filter(id => id); // Remove any null/undefined values
                    
//                     console.log(`[fetchGroupsByPeriod] Found ${departmentGroupIds.length} groups in department.assignedAppraisals`);
//                 } else {
//                     console.log(`[fetchGroupsByPeriod] Department has no assignedAppraisals array, checking directly in Appraisals collection`);
//                 }
                
//                 // Additionally, search for groups that have this department assigned in their assignedDepartments array
//                 // This handles cases where the department record wasn't updated but the group has the department assigned
//                 const groupsWithDepartment = await Appraisals.find({
//                     "assignedDepartments.department_id": employee.departmentId.toString()
//                 }, { _id: 1 });
                
//                 if (groupsWithDepartment && groupsWithDepartment.length > 0) {
//                     const additionalGroupIds = groupsWithDepartment.map(g => g._id.toString());
//                     console.log(`[fetchGroupsByPeriod] Found ${additionalGroupIds.length} additional groups with department assigned directly`);
                    
//                     // Merge with existing department group IDs, avoiding duplicates
//                     departmentGroupIds = [...new Set([...departmentGroupIds, ...additionalGroupIds])];
//                 }
                
//                 // For early appraisal periods, include ALL company groups if none were found through regular means
//                 if ((skipPeriodFilter || (appraisalPeriod && (appraisalPeriod.progress === 0 || appraisalPeriod.progress === 1))) && 
//                     departmentGroupIds.length === 0) {
                    
//                     console.log(`[fetchGroupsByPeriod] Early appraisal stage (progress ${appraisalPeriod?.progress}) - checking for company-wide groups`);
                    
//                     // Get all groups for this company
//                     const companyGroups = await Appraisals.find({
//                         companyId: employee.companyId
//                     }, { _id: 1 });
                    
//                     if (companyGroups && companyGroups.length > 0) {
//                         departmentGroupIds = [...new Set([...departmentGroupIds, ...companyGroups.map(g => g._id.toString())])];
//                         console.log(`[fetchGroupsByPeriod] Early stage inheritance: Found ${departmentGroupIds.length} company-wide groups`);
//                     }
//                 }
//             } else {
//                 console.log(`[fetchGroupsByPeriod] WARNING: Employee has departmentId ${employee.departmentId} but department not found`);
//             }
            
//             if (departmentGroupIds.length > 0) {
//                 console.log(`[fetchGroupsByPeriod] Found total of ${departmentGroupIds.length} department/company groups`);
                
//                 // Modify query to include both directly assigned groups and department groups
//                 groupsQuery = {
//                     $or: [
//                         groupsQuery, // Original query for direct employee assignments
//                         { _id: { $in: departmentGroupIds } } // Department/Company groups
//                     ]
//                 };
//             } else {
//                 console.log(`[fetchGroupsByPeriod] No department groups found for departmentId ${employee.departmentId}`);
//             }
//         } else {
//             console.log(`[fetchGroupsByPeriod] Employee has no department assigned`);
//         }

//         // Include direct appraisal period lookups for specific groups
//         // This is useful when directly accessing a specific group via ID
//         if (appraisalPeriodId) {
//             // Check if the appraisalPeriodId is actually a group ID (direct group lookup)
//             const directGroup = await Appraisals.findOne({ _id: appraisalPeriodId });
//             if (directGroup) {
//                 console.log(`[fetchGroupsByPeriod] Direct group lookup detected for group: ${directGroup.groupName}`);
//                 // Add this specific group to the query
//                 groupsQuery = {
//                     $or: [
//                         groupsQuery,
//                         { _id: appraisalPeriodId }
//                     ]
//                 };
//             }
//         }

//         console.log(`[fetchGroupsByPeriod] Executing final groups query:`, JSON.stringify(groupsQuery));
//         const groups = await Appraisals.find(
//             groupsQuery, 
//             {_id: 1, groupName: 1, groupKpis: 1, description: 1, weight: 1, threshold: 1, target: 1, max: 1, accessLevel: 1, 
//              assignedEmployees: 1, assignedDepartments: 1, companyId: 1}
//         );

//         console.log(`[fetchGroupsByPeriod] Found ${groups.length} total groups matching criteria`);

//           if (groups.length > 0) {
//             // Initialize a result object
//             let resultData = appraisalGroups.length > 0 ? appraisalGroups[0].toObject() : {};
            
//             // If resultData is empty (for new users), populate it with the employee data
//             if (Object.keys(resultData).length === 0 || !resultData.employeeId) {
//                 // Add essential employee data to match the structure for existing employees
//                 resultData = {
//                     employeeId: employee._id.toString(),
//                     firstName: employee.firstName || '',
//                     lastName: employee.lastName || '',
//                     fullName: employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`,
//                     appraisalPeriodId: appraisalPeriodId || '',
//                     appraisalPeriodName: appraisalPeriod?.appraisalPeriodName || '',
//                     appraisalPeriodProgress: appraisalPeriod?.progress || 0,
//                     appraisalPeriodStatus: appraisalPeriod?.status || '',
//                     companyId: employee.companyId || '',
//                     companyName: employee.companyName || '',
//                     companyRole: employee.companyRole || '',
//                     createdAt: employee.createdAt || new Date(),
//                     department: employee.department || '',
//                     designation: employee.designation || employee.designationName || '',
//                     employeeSubmissionDate: employee.employeeSubmissionDate || new Date(),
//                     endDate: appraisalPeriod?.endDate || '',
//                     startDate: appraisalPeriod?.startDate || '',
//                     activeDate: appraisalPeriod?.activeDate || employee.startDate || '',
//                     inactiveDate: appraisalPeriod?.inactiveDate || employee.endDate || '',
//                     profilePic: employee.profilePic || employee.profilePics || '',
//                     profilePics: employee.profilePic || employee.profilePics || '', // Include both for compatibility
//                     status: employee.status || 'Pending',
//                     updatedAt: employee.updatedAt || new Date(),
//                     kpiGroups: []
//                 };
                
//                 console.log(`[fetchGroupsByPeriod] Created complete data object for new employee ${employee.fullName || employee._id}`);
//             }
            
//             if (!resultData.kpiGroups) {
//                 resultData.kpiGroups = [];
//             }

//             // Track already processed group IDs to prevent duplicates
//             const processedGroupIds = new Set();
            
//             // Create a fresh kpiGroups array to ensure consistent structure
//             resultData.kpiGroups = [];

//             // Process and filter each group
//             for (const group of groups) {
//                 // Skip if we've already processed this group
//                 if (processedGroupIds.has(group._id.toString())) {
//                     continue;
//                 }
                
//                 // Mark this group as processed
//                 processedGroupIds.add(group._id.toString());
                
//               const plainGroup = group.toObject();

//                 // Check if this employee is already part of this group's assignedEmployees
//                 const isDirectlyAssigned = plainGroup.assignedEmployees && 
//                     plainGroup.assignedEmployees.some(emp => emp.employee_id.toString() === employeeId);
                
//                 // For early appraisal stages or department-inherited groups, auto-assign the employee if not already assigned
//                 const isDepartmentGroup = departmentGroupIds.includes(plainGroup._id.toString());
//                 const isEarlyStage = appraisalPeriod && (appraisalPeriod.progress === 0 || appraisalPeriod.progress === 1);
                
//                 // Auto-assign if either:
//                 // 1. This is a department group and employee not directly assigned yet
//                 // 2. This is early stage appraisal and employee not directly assigned yet
//                 if ((!isDirectlyAssigned) && (isDepartmentGroup || isEarlyStage)) {
//                     console.log(`[fetchGroupsByPeriod] Auto-assigning employee to group "${plainGroup.groupName}" (dept: ${isDepartmentGroup}, early: ${isEarlyStage})`);
                    
//                     try {
//                         // Add them to the group for future queries
//                         await Appraisals.findByIdAndUpdate(
//                             plainGroup._id,
//                             { 
//                                 $addToSet: { // Using $addToSet instead of $push to avoid duplicates
//                                     assignedEmployees: {
//                                         employee_id: employeeId,
//                                         employee_name: employee.fullName || `${employee.firstName} ${employee.lastName}`,
//                                         date_assigned: new Date()
//                                     } 
//                                 } 
//                             }
//                         );
                        
//                         // Also update the employee record if assignedAppraisals exists
//                         const employeeToUpdate = await Employee.findById(employeeId);
//                         const hasAssignedAppraisals = employeeToUpdate && employeeToUpdate.assignedAppraisals && Array.isArray(employeeToUpdate.assignedAppraisals);
                        
//                         if (hasAssignedAppraisals) {
//                             // Check if this group is already in the employee's assignedAppraisals
//                             const isAlreadyAssignedToEmployee = employeeToUpdate.assignedAppraisals.some(
//                                 app => app.appraisalId && app.appraisalId.toString() === plainGroup._id.toString()
//                             );
                            
//                             if (!isAlreadyAssignedToEmployee) {
//                                 // Push to existing array
//                                 await Employee.findByIdAndUpdate(
//                                     employeeId,
//                                     {
//                                         $addToSet: { // Using $addToSet instead of $push to avoid duplicates
//                                             assignedAppraisals: {
//                                                 appraisalId: plainGroup._id,
//                                                 appraisalName: plainGroup.groupName
//                                             }
//                                         }
//                                     }
//                                 );
//                             }
//                         } else {
//                             // Create the assignedAppraisals array if it doesn't exist
//                             await Employee.findByIdAndUpdate(
//                                 employeeId,
//                                 {
//                                     $set: {
//                                         assignedAppraisals: [{
//                                             appraisalId: plainGroup._id,
//                                             appraisalName: plainGroup.groupName
//                                         }]
//                                     }
//                                 }
//                             );
//                         }
                        
//                         console.log(`[fetchGroupsByPeriod] Successfully auto-assigned employee to group "${plainGroup.groupName}"`);
//                     } catch (err) {
//                         console.error(`[fetchGroupsByPeriod] Error auto-assigning employee to group:`, err);
//                         // Continue processing even if auto-assignment fails
//                     }
//                 }

//                 // Ensure consistent structure for all groups
//                 const formattedGroup = {
//                     groupId: plainGroup._id.toString(), // Always include groupId property
//                     _id: plainGroup._id.toString(),     // Keep _id for backward compatibility
//                     groupName: plainGroup.groupName || "",
//                     description: plainGroup.description || null,
//                     weight: plainGroup.weight || 0,
//                     threshold: plainGroup.threshold || 0,
//                     target: plainGroup.target || 0,
//                     max: plainGroup.max || 0,
//                     accessLevel: plainGroup.accessLevel || "Admin",
//                     groupKpis: [] // Default empty array
//                 };
                
//                 // Filter KPIs if they exist
//                 if (plainGroup.groupKpis && plainGroup.groupKpis.length > 0) {
//                     const groupId = plainGroup._id.toString();
//                     console.log(`[fetchGroupsByPeriod] Processing KPIs for group ${groupId} (${plainGroup.groupName}): ${plainGroup.groupKpis.length} KPIs, accessLevel: ${plainGroup.accessLevel}`);
                    
//                     // Check if this is an admin group with no specific employee assignments
//                     const isAdminAccessLevel = plainGroup.accessLevel === "Admin";
//                     const hasNoEmployeeAssignments = plainGroup.groupKpis.every(kpi => 
//                         !kpi.employeeId && (!kpi.employees || kpi.employees.length === 0)
//                     );
                    
//                     // IMPORTANT: Prevent initialization of empty array before filtering
//                     // This was causing the visibility check to fail
//                     if (isAdminAccessLevel) {
//                         console.log(`[fetchGroupsByPeriod] ADMIN GROUP CHECK for group ${groupId} (${plainGroup.groupName}): 
//                             - Total KPIs: ${plainGroup.groupKpis.length}
//                             - hasNoEmployeeAssignments: ${hasNoEmployeeAssignments} 
//                             - isEarlyStage: ${isEarlyStage}
//                             - isDepartmentGroup: ${isDepartmentGroup}
//                             - Employee departmentId: ${employee.departmentId || 'None'}
//                             - First KPI example: ${plainGroup.groupKpis.length > 0 ? JSON.stringify(plainGroup.groupKpis[0]) : 'None'}
//                         `);
//                     }
                    
//                     // Admin/SuperAdmin see all KPIs
//                     if (isAdmin || isSuperAdmin) {
//                         // No filtering needed - keep all KPIs
//                         formattedGroup.groupKpis = plainGroup.groupKpis;
//                         console.log(`[fetchGroupsByPeriod] Admin/SuperAdmin view: Showing all ${formattedGroup.groupKpis.length} KPIs for group ${groupId}`);
//                     } else if (isManager && managedEmployeeIds.length > 0) {
//                         // For managers, show:
//                         // 1. All general KPIs (no employeeId)
//                         // 2. KPIs assigned to the manager
//                         // 3. KPIs assigned to employees in departments they manage
//                         formattedGroup.groupKpis = plainGroup.groupKpis.filter(kpi => {
//                             // Include KPIs with no employeeId and no employees array (general KPIs)
//                             if (!kpi.employeeId && (!kpi.employees || kpi.employees.length === 0)) return true;
                            
//                             // Include KPIs assigned to the manager
//                             if (kpi.employeeId === employeeId) return true;
                            
//                             // Include KPIs where manager is in the employees array
//                             if (kpi.employees && Array.isArray(kpi.employees) && kpi.employees.includes(employeeId)) return true;
                            
//                             // Include KPIs assigned to employees in departments they manage
//                             if (kpi.employeeId && managedEmployeeIds.includes(kpi.employeeId)) return true;
                            
//                             // Include KPIs with employees array that contains any managed employees
//                             if (kpi.employees && Array.isArray(kpi.employees)) {
//                                 return kpi.employees.some(empId => managedEmployeeIds.includes(empId));
//                             }
                            
//                             return false;
//                         });
                        
//                         console.log(`[fetchGroupsByPeriod] Manager view: Filtered to ${formattedGroup.groupKpis.length} KPIs for group ${groupId}`);
//                     } else {
//                         // For regular employees:
//                         // 1. Always show all KPIs in admin groups if the employee's department is assigned to this group
//                         // 2. Always show all KPIs in admin groups during early appraisal stages
//                         // 3. Show general KPIs from department groups

//                         // Special case: this is an admin group 
//                         // AND either it's an early stage, or the employee's department is assigned to this group
//                         const showAllKpisInAdminGroup = isAdminAccessLevel && 
//                                                       (isEarlyStage || isDepartmentGroup);
                        
//                         // If all conditions are met to show all KPIs for admin group:
//                         if (showAllKpisInAdminGroup) {
//                             console.log(`[fetchGroupsByPeriod] Employee view: SHOWING ALL ${plainGroup.groupKpis.length} KPIs for admin group ${groupId}`);
//                             formattedGroup.groupKpis = [...plainGroup.groupKpis]; // Use spread operator to create a new array
//                         } else {
//                             // Log if we're filtering KPIs when we perhaps shouldn't be
//                             if (isAdminAccessLevel && plainGroup.groupKpis.length > 0) {
//                                 console.log(`[fetchGroupsByPeriod] WARNING: Filtering KPIs for admin group ${groupId}. Conditions not met:
//                                     - isEarlyStage: ${isEarlyStage}
//                                     - isDepartmentGroup: ${isDepartmentGroup}
//                                     - showAllKpisInAdminGroup: ${showAllKpisInAdminGroup}
//                                 `);
//                             }

//                             // For non-admin groups or when conditions aren't met, apply standard filtering
//                             formattedGroup.groupKpis = plainGroup.groupKpis.filter(kpi => {
//                                 // Include KPIs with no employeeId and no employees array (general KPIs)
//                                 // In early stages, always show general KPIs to everyone
//                                 if (isEarlyStage && !kpi.employeeId && (!kpi.employees || kpi.employees.length === 0)) return true;
                                
//                                 // Otherwise, only show general KPIs from employee's own department groups
//                                 if (!kpi.employeeId && (!kpi.employees || kpi.employees.length === 0) && isDepartmentGroup) return true;
                                
//                                 // For KPIs with employeeId, ONLY show if it matches the current user ID
//                                 if (kpi.employeeId === employeeId) return true;
                                
//                                 // For KPIs with employees array, ONLY show if the current user ID is in the array
//                                 if (kpi.employees && Array.isArray(kpi.employees) && kpi.employees.includes(employeeId)) return true;
                                
//                                 // Otherwise, don't show this KPI to this employee
//                                 return false;
//                             });
                            
//                             console.log(`[fetchGroupsByPeriod] Employee view: Filtered to ${formattedGroup.groupKpis.length} KPIs for group ${groupId}`);
//                         }
//                     }
                    
//                     // Final check - if we're still getting an empty array for an admin group, override
//                     if (isAdminAccessLevel && formattedGroup.groupKpis.length === 0 && plainGroup.groupKpis.length > 0) {
//                         console.log(`[fetchGroupsByPeriod] OVERRIDE: Admin group ${groupId} has KPIs but visibility rules filtered them all out. Showing all KPIs.`);
//                         formattedGroup.groupKpis = [...plainGroup.groupKpis];
//                     }
//                 }
                
//                 // Add the formatted group to the result
//                 resultData.kpiGroups.push(formattedGroup);
//             }

//             // Add the companyRole to resultData
//             resultData.companyRole = employee.companyRole;
            
//             // Track if we included department-level groups
//             const includedDepartmentGroups = employee.departmentId && departmentGroupIds.length > 0;

//             // Track if we included all company groups for users in early appraisal stages
//             const includedAllCompanyGroups = skipPeriodFilter && 
//                 appraisalPeriod && 
//                 (appraisalPeriod.progress === 0 || appraisalPeriod.progress === 1);

//             res.status(200).json({
//               status: 200,
//               success: true,
//                 data: resultData,
//                 periodInfo: skipPeriodFilter ? {
//                     progress: appraisalPeriod?.progress,
//                     periodFiltered: false,
//                     earlyStageInheritance: includedAllCompanyGroups ? {
//                         enabled: true,
//                         message: "All company groups (including Company Objectives) are visible to all users during early appraisal phases"
//                     } : undefined
//                 } : {
//                     periodFiltered: true
//                 },
//                 // Include department groups info
//                 departmentGroups: includedDepartmentGroups ? {
//                     included: true,
//                     count: departmentGroupIds.length,
//                     message: "KPI groups assigned to employee's department were automatically included"
//                 } : undefined,
//                 // Include manager info for debugging
//                 managerInfo: isManager ? {
//                     managedDepartments: managedDepartmentIds,
//                     managedEmployeesCount: managedEmployeeIds.length
//                 } : null
//             });
//           } else {
//             console.log("No matching groups found.");
            
//             // Prepare a full employee data object even if no groups were found
//             let resultData = appraisalGroups.length > 0 ? appraisalGroups[0].toObject() : {
//                 employeeId: employee._id.toString(),
//                 firstName: employee.firstName || '',
//                 lastName: employee.lastName || '',
//                 fullName: employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`,
//                 appraisalPeriodId: appraisalPeriodId || '',
//                 appraisalPeriodName: appraisalPeriod?.appraisalPeriodName || '',
//                 appraisalPeriodProgress: appraisalPeriod?.progress || 0,
//                 appraisalPeriodStatus: appraisalPeriod?.status || '',
//                 companyId: employee.companyId || '',
//                 companyName: employee.companyName || '',
//                 companyRole: employee.companyRole || '',
//                 createdAt: employee.createdAt || new Date(),
//                 department: employee.department || '',
//                 designation: employee.designation || employee.designationName || '',
//                 endDate: employee.endDate || '',
//                 startDate: employee.startDate || '',
//                 activeDate: appraisalPeriod?.activeDate || employee.startDate || '',
//                 inactiveDate: appraisalPeriod?.inactiveDate || employee.endDate || '',
//                 employeeSubmissionDate: employee.employeeSubmissionDate || new Date(),
//                 profilePic: employee.profilePic || employee.profilePics || '',
//                 profilePics: employee.profilePic || employee.profilePics || '', // Include both for compatibility
//                 status: employee.status || 'Pending',
//                 updatedAt: employee.updatedAt || new Date(),
//                 kpiGroups: []
//             };
            
//             console.log(`[fetchGroupsByPeriod] Created complete data object for employee with no groups: ${employee.fullName || employee._id}`);
            
//             // Track if we included all company groups for users in early appraisal stages
//             const includedAllCompanyGroups = skipPeriodFilter && 
//                 appraisalPeriod && 
//                 (appraisalPeriod.progress === 0 || appraisalPeriod.progress === 1);
            
//             res.status(200).json({
//                 status: 200,
//                 success: true,
//                 data: resultData,
//                 periodInfo: skipPeriodFilter ? {
//                     progress: appraisalPeriod?.progress,
//                     periodFiltered: false,
//                     earlyStageInheritance: includedAllCompanyGroups ? {
//                         enabled: true,
//                         message: "All company groups (including Company Objectives) are visible to all users during early appraisal phases"
//                     } : undefined
//                 } : {
//                     periodFiltered: true
//                 },
//                 message: "No matching groups found"
//             });
//           }
//     } catch (error) {
//         console.error("[fetchGroupsByPeriod] Error:", error);
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error.message || error
//         });
//     }
// }

// export default fetchGroupsByPeriod;



import dotenv from 'dotenv';
import AppraisalData from '../../model/AppraisalData';
import AppraisalGroup from '../../model/AppraisalGroup';
import EmployeeKpi from '../../model/EmployeeKpis';
import Employee from '../../model/Employees';
import Department from '../../model/Department';
import Company from '../../model/Company';
import AppraisalPeriod from '../../model/AppraisalPeriod';

dotenv.config();

const fetchGroupsByPeriod = async (req, res) => {
    try {
        const { employeeId, appraisalPeriodId } = req.params;

        console.log(`[fetchGroupsByPeriod] Fetching for employeeId: ${employeeId}, periodId: ${appraisalPeriodId}`);

        // Get employee details
        const employee = await Employee.findOne({ _id: employeeId });
        
        if (!employee) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Employee not found'
            });
        }

        // Get appraisal period
        const appraisalPeriod = await AppraisalPeriod.findOne({ _id: appraisalPeriodId });
        
        if (!appraisalPeriod) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Appraisal period not found'
            });
        }

        // Check if employee has submitted KPI for this period
        const employeeKpiSubmission = await EmployeeKpi.findOne({
            employeeId: employeeId.toString(),
            appraisalPeriodId: appraisalPeriodId
        });

        // Get AppraisalData (which stores the merged view)
        let appraisalData = await AppraisalData.findOne({
            employeeId: employeeId.toString(),
            appraisalPeriodId: appraisalPeriodId
        });

        // If employee has submitted KPI, use that data
        // Otherwise, fetch the template groups assigned to the employee
        let kpiGroups = [];

        if (employeeKpiSubmission && employeeKpiSubmission.kpiGroups) {
            // Employee has submitted - use their submitted data
            console.log(`[fetchGroupsByPeriod] Found employee submission with ${employeeKpiSubmission.kpiGroups.length} groups`);
            kpiGroups = employeeKpiSubmission.kpiGroups;
        } else if (appraisalData && appraisalData.kpiGroups) {
            // AppraisalData exists (template) - use it
            console.log(`[fetchGroupsByPeriod] Found appraisal data with ${appraisalData.kpiGroups.length} groups`);
            kpiGroups = appraisalData.kpiGroups;
        } else {
            // No submission and no template - fetch fresh from groups
            console.log(`[fetchGroupsByPeriod] No submission found, fetching template groups`);
            
            // Find groups assigned to employee or their department
            const groupsQuery = {
                $or: [
                    // Direct employee assignment
                    {
                        assignedEmployees: {
                            $elemMatch: { employee_id: employeeId }
                        }
                    }
                ]
            };

            // Add department groups if employee has department
            if (employee.departmentId) {
                groupsQuery.$or.push({
                    'assignedDepartments.department_id': employee.departmentId.toString()
                });
            }

            const assignedGroups = await AppraisalGroup.find(groupsQuery);
            
            console.log(`[fetchGroupsByPeriod] Found ${assignedGroups.length} assigned groups`);

            // Format groups for response
            kpiGroups = assignedGroups.map(group => ({
                groupId: group._id.toString(),
                _id: group._id.toString(),
                groupName: group.groupName,
                description: group.description || null,
                weight: group.weight || 0,
                threshold: group.threshold || 0,
                target: group.target || 0,
                max: group.max || 0,
                accessLevel: group.accessLevel || 'Employee',
                groupKpis: group.groupKpis || []
            }));
        }

        // Build response data
        const responseData = {
            _id: appraisalData?._id || employeeKpiSubmission?._id,
            employeeId: employeeId.toString(),
            firstName: employee.firstName,
            lastName: employee.lastName,
            fullName: employee.fullName || `${employee.firstName} ${employee.lastName}`,
            profilePic: employee.profilePic || employee.profilePics || '',
            profilePics: employee.profilePic || employee.profilePics || '',
            email: employee.email,
            companyId: employee.companyId,
            companyName: employee.companyName,
            companyRole: employee.companyRole || '',
            department: employee.department || '',
            designation: employee.designation || employee.designationName || '',
            managerName: employee.managerName || '',
            managerId: employee.managerId || '',
            appraisalPeriodId,
            appraisalPeriodName: appraisalPeriod.appraisalPeriodName,
            appraisalPeriodProgress: appraisalPeriod.progress,
            appraisalPeriodStatus: appraisalPeriod.status,
            startDate: appraisalPeriod.startDate,
            endDate: appraisalPeriod.endDate,
            activeDate: appraisalPeriod.activeDate,
            inactiveDate: appraisalPeriod.inactiveDate,
            status: employeeKpiSubmission?.status || appraisalData?.status || 'Pending',
            employeeSubmissionDate: employeeKpiSubmission?.employeeSignedDate || appraisalData?.employeeSubmissionDate,
            employeeSignStatus: employeeKpiSubmission?.employeeSignStatus || false,
            managerSignStatus: employeeKpiSubmission?.managerSignStatus || false,
            matrixScore: employeeKpiSubmission?.matrixScore || [],
            kpiGroups,
            createdAt: appraisalData?.createdAt || employeeKpiSubmission?.createdAt || new Date(),
            updatedAt: appraisalData?.updatedAt || employeeKpiSubmission?.updatedAt || new Date()
        };

        // Determine if this is manager view
        const isManager = employee.isManager === true;
        let managedEmployeeIds = [];

        if (isManager) {
            const managedDepartments = await Department.find({
                companyId: employee.companyId,
                managerId: employeeId
            });

            if (managedDepartments.length > 0) {
                const managedDepartmentIds = managedDepartments.map(dept => dept._id.toString());
                const employeesInDepartments = await Employee.find({
                    companyId: employee.companyId,
                    departmentId: { $in: managedDepartmentIds }
                }).select('_id');

                managedEmployeeIds = employeesInDepartments.map(emp => emp._id.toString());
            }
        }

        console.log(`[fetchGroupsByPeriod] Returning data with ${kpiGroups.length} groups`);

        return res.status(200).json({
            status: 200,
            success: true,
            data: responseData,
            hasSubmission: !!employeeKpiSubmission,
            periodInfo: {
                periodFiltered: true,
                progress: appraisalPeriod.progress
            },
            managerInfo: isManager ? {
                isManager: true,
                managedEmployeesCount: managedEmployeeIds.length
            } : null
        });

    } catch (error) {
        console.error('[fetchGroupsByPeriod] Error:', {
            error: error.message,
            stack: error.stack
        });

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid ID format',
                details: error.message
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while fetching KPI groups'
        });
    }
};

export default fetchGroupsByPeriod;