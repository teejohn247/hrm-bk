import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Leave from '../../model/Expense';
import AppraisalGroup from '../../model/Kpi';
import Group from '../../model/AppraisalGroup';
import Employees from '../../model/Employees';
import AppraisalData from '../../model/AppraisalData';
import Department from '../../model/Department';

const sgMail = require('@sendgrid/mail')

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

/**
 * Verification function to check if a KPI was properly assigned
 * @param {String} kpiId - The ID of the KPI to verify
 * @param {String} kpiName - The name of the KPI for logs
 */
const verifyKPIAssignment = async (kpiId, kpiName) => {
    try {
        console.log(`[verifyKPIAssignment] Starting verification for KPI: ${kpiName} (${kpiId})`);
        
        // Check departments
        const departmentsWithKPI = await Department.find({ "assignedAppraisals.appraisalId": kpiId });
        console.log(`[verifyKPIAssignment] KPI is assigned to ${departmentsWithKPI.length} departments`);
        if (departmentsWithKPI.length > 0) {
            departmentsWithKPI.forEach(dept => {
                console.log(`[verifyKPIAssignment] Department: ${dept.departmentName} (${dept._id})`);
            });
        } else {
            console.log(`[verifyKPIAssignment] WARNING: KPI is not assigned to any departments!`);
        }
        
        // Check employees
        const employeesWithKPI = await Employees.find({ "assignedAppraisals.appraisalId": kpiId });
        console.log(`[verifyKPIAssignment] KPI is assigned to ${employeesWithKPI.length} employees`);
        if (employeesWithKPI.length > 0) {
            employeesWithKPI.forEach(emp => {
                console.log(`[verifyKPIAssignment] Employee: ${emp.fullName} (${emp._id})`);
            });
        } else {
            console.log(`[verifyKPIAssignment] WARNING: KPI is not assigned to any employees!`);
        }
        
        // Check if assigned to general groups
        const groupsWithKPI = await Group.find({ "groupKpis.kpiId": kpiId });
        console.log(`[verifyKPIAssignment] KPI is assigned to ${groupsWithKPI.length} groups`);
        
        return {
            departmentCount: departmentsWithKPI.length,
            employeeCount: employeesWithKPI.length,
            groupCount: groupsWithKPI.length
        };
    } catch (error) {
        console.error(`[verifyKPIAssignment] Error during verification:`, error);
        return {
            departmentCount: 0,
            employeeCount: 0,
            groupCount: 0,
            error: error.message
        };
    }
};

/**
 * Helper function to update employees with KPI assignments
 * @param {Array} employeeIds - Array of employee IDs
 * @param {Object} kpi - The KPI object to assign
 * @param {Object} appraisals - The appraisals to add
 */
const updateEmployeesWithKPI = async (employeeIds, kpi, appraisals) => {
    try {
        if (!employeeIds || employeeIds.length === 0) {
            console.log(`[updateEmployeesWithKPI] No employee IDs provided, skipping update`);
            return;
        }

        console.log(`[updateEmployeesWithKPI] Starting update for ${employeeIds.length} employees with KPI: ${kpi.kpiName} (${kpi._id})`);
        console.log(`[updateEmployeesWithKPI] Appraisals object to add: ${JSON.stringify(appraisals || {})}`);
        
        // First, verify the employees exist
        const employeesFound = await Employees.find({ _id: { $in: employeeIds } }).select('_id fullName');
        console.log(`[updateEmployeesWithKPI] Found ${employeesFound.length} out of ${employeeIds.length} requested employees`);
        
        if (employeesFound.length === 0) {
            console.log(`[updateEmployeesWithKPI] WARNING: No employees found with the provided IDs!`);
            return;
        }
        
        const validEmployeeIds = employeesFound.map(emp => emp._id);
        
        // Update appraisals array - but only if appraisals object is provided
        if (appraisals) {
            const appraisalsResult = await Employees.updateMany(
                { _id: { $in: validEmployeeIds } }, 
                { $push: { appraisals } },
                { upsert: true }
            );
            
            console.log(`[updateEmployeesWithKPI] Updated appraisals array for ${appraisalsResult.modifiedCount} employees`);
        } else {
            console.log(`[updateEmployeesWithKPI] No appraisals object provided, skipping appraisals update`);
        }
        
        // Always update assignedAppraisals array since it has a consistent structure
        const assignedResult = await Employees.updateMany(
            { _id: { $in: validEmployeeIds } }, 
            { $push: { assignedAppraisals: {
                appraisalId: kpi._id,
                appraisalName: kpi.kpiName,
                dateAssigned: new Date().toISOString()
            }}},
            { upsert: true }
        );
        
        console.log(`[updateEmployeesWithKPI] Updated assignedAppraisals array for ${assignedResult.modifiedCount} employees`);
        
        // Verify data was saved correctly by checking multiple sample employees
        const sampleSize = Math.min(3, validEmployeeIds.length);
        for (let i = 0; i < sampleSize; i++) {
            const sampleEmp = await Employees.findOne({ _id: validEmployeeIds[i] });
            console.log(`[updateEmployeesWithKPI] Verification - Sample employee ${i+1}: ${sampleEmp.fullName} has ${sampleEmp.assignedAppraisals?.length || 0} assigned appraisals`);
            const hasKPI = sampleEmp.assignedAppraisals?.some(a => a.appraisalId.toString() === kpi._id.toString());
            console.log(`[updateEmployeesWithKPI] Verification - KPI exists in sample employee ${i+1}: ${hasKPI}`);
        }
    } catch (err) {
        console.error("[updateEmployeesWithKPI] Error updating employees with KPI:", err);
        console.error("[updateEmployeesWithKPI] Error details:", err.message);
        console.error("[updateEmployeesWithKPI] Error stack:", err.stack);
    }
};

const createKPI = async (req, res) => {
    try {
        console.log("[createKPI] Starting KPI creation process...");
        
        const { 
            name, 
            description, 
            group, 
            employeeIds, 
            departmentIds,
            fields, 
            weight, 
            threshold, 
            target, 
            max,
            type 
        } = req.body;

        console.log(`[createKPI] Request parameters - Name: ${name}, Group: ${group}, DepartmentIds: ${JSON.stringify(departmentIds || [])}, EmployeeIds: ${JSON.stringify(employeeIds || [])}`);

        // First, check if the user is a company account or an employee
        let company = await Company.findOne({ _id: req.payload.id });
        let userIsEmployee = false;
        let userIsManager = false;
        let userIsSuperAdmin = false;
        let userIsAdmin = false;
        let employee;

        // If not a company account, check if it's an employee
        if (!company) {
            employee = await Employees.findOne({ _id: req.payload.id });
            if (!employee) {
                return res.status(401).json({
                    status: 401,
                    error: 'Unauthorized: User account not found'
                });
            }
            
            userIsEmployee = true;
            userIsManager = employee.isManager === true;
            userIsSuperAdmin = employee.isSuperAdmin === true;
            
            // Check if employee is an admin based on permissions
            userIsAdmin = userIsSuperAdmin || 
                (employee.permissions?.appraisalManagement?.createKPIGroup === true) || 
                employee.roleName === 'Admin' || 
                employee.role === 'Admin';
                
            console.log(`[createKPI] User roles - Employee: ${userIsEmployee}, Manager: ${userIsManager}, Admin: ${userIsAdmin}, SuperAdmin: ${userIsSuperAdmin}`);
            
            // Get the company information from the employee's record
            company = await Company.findOne({ _id: employee.companyId });
            if (!company) {
                return res.status(400).json({
                    status: 400,
                    error: 'Company not found for this employee'
                });
            }
        } else {
            // This is a company account (automatically has admin permissions)
            userIsAdmin = true;
            userIsSuperAdmin = company.isSuperAdmin === true;
            console.log(`[createKPI] User is a company account with roles - Admin: ${userIsAdmin}, SuperAdmin: ${userIsSuperAdmin}`);
        }

        // Check if the KPI name already exists for the same group and user context
        console.log(`[createKPI] Checking if KPI name "${name}" already exists in group "${group}"`);
        
        // First, find all KPIs with the same name in this company
        let existingKpis = await AppraisalGroup.find({ 
            companyId: company._id, 
            kpiName: name 
        });
        
        if (existingKpis.length > 0) {
            console.log(`[createKPI] Found ${existingKpis.length} existing KPIs with name "${name}"`);
            
            // Get all groups where these KPIs are assigned
            const kpiIds = existingKpis.map(kpi => kpi._id);
            const groupsWithKpis = await Group.find({ 
                "groupKpis.kpiId": { $in: kpiIds }
            });
            
            console.log(`[createKPI] These KPIs are assigned to ${groupsWithKpis.length} groups`);
            
            // Check if any of these KPIs are in the current target group AND have overlapping employees/departments
            let conflictFound = false;
            
            for (const existingGroup of groupsWithKpis) {
                // Skip if not the target group
                if (existingGroup._id.toString() !== group) {
                    continue;
                }
                
                // This KPI exists in our target group, check for employee/department overlap
                const kpisInGroup = existingGroup.groupKpis.filter(
                    kpi => kpiIds.some(id => kpi.kpiId.toString() === id.toString())
                );
                
                for (const kpi of kpisInGroup) {
                    let hasOverlap = false;
                    
                    // Check employee overlap
                    if (employeeIds && employeeIds.length > 0 && kpi.employees && kpi.employees.length > 0) {
                        const overlap = employeeIds.some(id => 
                            kpi.employees.some(empId => empId.toString() === id)
                        );
                        
                        if (overlap) {
                            console.log(`[createKPI] Employee overlap found with existing KPI in same group`);
                            hasOverlap = true;
                        }
                    }
                    
                    // Check department overlap
                    if (!hasOverlap && departmentIds && departmentIds.length > 0 && kpi.departments && kpi.departments.length > 0) {
                        const overlap = departmentIds.some(id => 
                            kpi.departments.some(deptId => deptId.toString() === id)
                        );
                        
                        if (overlap) {
                            console.log(`[createKPI] Department overlap found with existing KPI in same group`);
                            hasOverlap = true;
                        }
                    }
                    
                    if (hasOverlap) {
                        conflictFound = true;
                        break;
                    }
                }
                
                if (conflictFound) break;
            }
            
            if (conflictFound) {
                console.log(`[createKPI] KPI name "${name}" already exists in this group for overlapping employees/departments`);
                return res.status(400).json({
                    status: 400,
                    error: 'A KPI with this name already exists for this group and user context'
                });
            } else {
                console.log(`[createKPI] KPI name "${name}" exists but doesn't conflict with current context, allowing creation`);
            }
        }

        // Find the group and check permission based on accessLevel
        const kpiGroup = await Group.findOne({ _id: group });
        if (!kpiGroup) {
            return res.status(404).json({
                status: 404,
                error: 'KPI group not found'
            });
        }

        console.log(`[createKPI] Found KPI group: ${kpiGroup.groupName} with accessLevel: ${kpiGroup.accessLevel}`);

        // Check if the user has permission to create KPI in this group based on accessLevel
        const accessLevel = kpiGroup.accessLevel || 'Admin'; // Default to Admin if not specified
        
        // Permission check logic
        let hasPermission = false;
        
        if (userIsSuperAdmin || (userIsAdmin && !userIsEmployee)) {
            // Super Admins and Company Admins can create KPIs in any group
            hasPermission = true;
            console.log(`[createKPI] Permission granted - User is a SuperAdmin or Company Admin`);
        } else if (userIsAdmin && accessLevel === 'Admin') {
            // Employee Admins can create KPIs in groups with Admin accessLevel
            hasPermission = true;
            console.log(`[createKPI] Permission granted - Employee Admin can access Admin level group`);
        } else if (userIsManager && (accessLevel === 'Manager' || accessLevel === 'Employee')) {
            // Managers can create KPIs in groups with Manager or Employee accessLevel
            hasPermission = true;
            console.log(`[createKPI] Permission granted - Manager can access ${accessLevel} level group`);
        } else if (userIsEmployee && accessLevel === 'Employee') {
            // Regular employees can only create KPIs in groups with Employee accessLevel
            hasPermission = true;
            console.log(`[createKPI] Permission granted - Employee can access Employee level group`);
        }

        if (!hasPermission) {
            return res.status(403).json({
                status: 403,
                error: `You don't have permission to create KPIs in this group. Required access level: ${accessLevel}`
            });
        }

        // Continue with existing KPI creation logic...
  
        if (!company.companyName) {
            return res.status(400).json({
                status: 400,
                error: 'No company has been created for this account'
            });
        }

        // Set up the values according to the schema structure
        const kpiData = {
            kpiName: name,
            companyId: company._id, // Use the company ID from either the user or the employee's company
            companyName: company.companyName,
            description,
            weight: Number(weight) || 0,
            threshold: Number(threshold) || 0,
            target: Number(target) || 0,
            max: Number(max) || 0,
            type: type,
            employees: employeeIds,
            departments: departmentIds,
            remarks: {
                type: type,
                weight: Number(weight) || 0,
                threshold: Number(threshold) || 0,
                target: Number(target) || 0,
                max: Number(max) || 0,
                employeeRatingId: "",
                employeeName: "",
                managerRatingId: "",
                managerName: "",
                employeeComment: "",
                managerComment: "",
                managerOverallComment: "",
                employeeSubmissionDate: "",
                managerReviewDate: "",
                managerSignature: false,
                employeeSignature: false
            },
            fields: fields || {},
            // Track who created this KPI
            createdBy: req.payload.id,
            createdByRole: userIsSuperAdmin ? 'superadmin' : (userIsAdmin ? 'admin' : (userIsManager ? 'manager' : 'employee'))
        };

        console.log('[createKPI] KPI data prepared:', JSON.stringify(kpiData, null, 2));

        // Instead of checking for specific groups, check if employeeIds is provided
        if(employeeIds && employeeIds.length > 0) {
            console.log(`[createKPI] Processing KPI assignment with ${employeeIds.length} employees`);
            let groups = [];
    
            for (const employeeId of employeeIds) {
                console.log({ employeeId });
        
                try {
                    const employee = await Employees.findOne({ _id: employeeId });

                    console.log({employee})
                    
                    if (employee) {
                    groups.push({
                            employee_id: employeeId,
                            employee_name: employee.fullName,
                    });
                    } else {
                        console.error(`[createKPI] Employee with ID ${employeeId} not found`);
                    }
                } catch (err) {
                    console.error(`[createKPI] Error finding employee ${employeeId}:`, err);
                }
            }
    
            // Add assignedEmployees to the kpiData using the created groups array that includes employee names
            kpiData.assignedEmployees = groups;
 
            // For KPIs with a single employee, set the employeeId directly
            // Use the first valid employeeId from the request rather than from groups
            if (employeeIds.length > 0) {
                kpiData.employeeId = employeeIds[0];
                const employeeName = groups.find(g => g.employee_id === employeeIds[0])?.employee_name || 'Unknown';
                console.log(`[createKPI] Setting employeeId ${kpiData.employeeId} directly for KPI for employee ${employeeName}`);
            }

            // Handle departments if provided
            let departments = [];
            let departmentEmployeeIds = []; // Track employees from departments separately
            if (departmentIds && departmentIds.length > 0) {
                console.log(`[createKPI] Processing ${departmentIds.length} departments for KPI assignment`);
                
                for (const deptId of departmentIds) {
                    try {
                        const department = await Department.findOne({ _id: deptId });
                        if (department) {
                            departments.push({
                                department_id: deptId,
                                department_name: department.departmentName,
                            });
                            
                            // Also find all employees in this department to assign KPI
                            const deptEmployees = await Employees.find({ departmentId: deptId });
                            if (deptEmployees && deptEmployees.length > 0) {
                                for (const emp of deptEmployees) {
                                    const empId = emp._id.toString();
                                    
                                    // Only add if not already in the employeeIds list
                                    if (!employeeIds.includes(empId) && !departmentEmployeeIds.includes(empId)) {
                                        departmentEmployeeIds.push(empId);
                                        
                                        // Add to groups for display/tracking
                                        groups.push({
                                            employee_id: empId,
                                            employee_name: emp.fullName
                                        });
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
                // Update the kpiData with complete employee list
                kpiData.assignedEmployees = groups;
            }

            // Combine all employee IDs for operations that need the complete list
            const allEmployeeIds = [...employeeIds, ...departmentEmployeeIds];

            // Log the final KPI data to be saved
            console.log(`[createKPI] Final KPI data to be saved:`, JSON.stringify({
                kpiName: kpiData.kpiName,
                employeeId: kpiData.employeeId,
                assignedEmployees: kpiData.assignedEmployees?.length || 0,
                totalEmployeeIds: allEmployeeIds.length
            }, null, 2));

            await new AppraisalGroup(kpiData).save().then(async (adm) => {
                console.log(`[createKPI] KPI saved successfully with ID: ${adm._id}`);
                console.log({adm})
                const appraisals = await Group.findOne({_id : group}, {_id: 1, groupName:1, groupKpis: 1, description: 1})
                
                console.log({appraisals})

                // Create a groupKpiData object with consistent structure
                const groupKpiData = {
                    kpiId: adm._id,
                    kpiName: name,
                    kpiDescription: description,
                    weight: Number(weight) || 0,
                    threshold: Number(threshold) || 0,
                    target: Number(target) || 0,
                    max: Number(max) || 0,
                    type: type || 'percentage',
                    remarks: kpiData.remarks, // Use the same remarks structure
                    employeeId: kpiData.employeeId, // Include the employeeId to enable proper filtering
                    employeeName: kpiData.assignedEmployees?.find(e => e.employee_id === kpiData.employeeId)?.employee_name || '',
                    // Store the full arrays of employee and department IDs
                    employees: employeeIds || [],
                    departments: departmentIds || []
                };
                
                // UPDATE THE GROUP WITH THE NEW KPI
                try {
                    // Add the KPI to the AppraisalGroup's groupKpis array
                    const updateGroupResult = await Group.findByIdAndUpdate(
                        group, 
                        { $push: { groupKpis: groupKpiData } }, 
                        { new: true }
                    );
                    
                    console.log(`[createKPI] Added KPI to AppraisalGroup (${group}): ${updateGroupResult ? 'Success' : 'Failed'}`);
                    if (updateGroupResult) {
                        console.log(`[createKPI] Group now has ${updateGroupResult.groupKpis.length} KPIs`);
                    }
                } catch (groupUpdateError) {
                    console.error(`[createKPI] Error updating AppraisalGroup with new KPI:`, groupUpdateError);
                }

                // First, handle the case for employees with a consolidated KPI entry
                if (allEmployeeIds.length > 0) {
                    console.log(`[createKPI] Adding consolidated KPI entry for ${allEmployeeIds.length} employees to AppraisalData`);
                    
                    // Create a single KPI with all employee assignments
                    const consolidatedKpiData = {
                        ...groupKpiData,
                        type: type || 'percentage',
                        assignedEmployees: groups.map(employee => ({
                            employeeId: employee.employee_id,
                            employeeName: employee.employee_name
                        }))
                    };
                    
                    try {
                        // Add a single KPI entry with all employee assignments to the AppraisalData
                        const updateResult = await AppraisalData.updateMany(
                            { companyId: req.payload.id },
                            { $push: { "kpiGroups.$[group].groupKpis": consolidatedKpiData } },
                            { arrayFilters: [{ "group.groupId": group }] }
                        );
                        
                        console.log(`[createKPI] Added consolidated KPI with ${groups.length} employee assignments to AppraisalData (matched ${updateResult.matchedCount}, modified ${updateResult.modifiedCount})`);
                    } catch (err) {
                        console.error(`[createKPI] Error adding consolidated KPI to AppraisalData:`, err);
                    }
                }

                try {
                    console.log(`[createKPI] Updating AppraisalData for company ${req.payload.id}`);
                    
                    // Run verification before sending response
                    await verifyKPIAssignment(adm._id, adm.kpiName);
                    
                    // Get the updated document with all changes
                    const updatedKpi = await AppraisalGroup.findById(adm._id);
                    
                                                            res.status(200).json({
                                                                status: 200,
                                                                success: true,
                        data: updatedKpi,
                        permissions: {
                            createdBy: userIsEmployee ? 'employee' : 'company',
                            role: userIsSuperAdmin ? 'superadmin' : (userIsAdmin ? 'admin' : (userIsManager ? 'manager' : 'employee')),
                            accessLevel: accessLevel
                        }
                    });
                } catch (appraisalDataError) {
                    console.error(`[createKPI] Error updating AppraisalData:`, appraisalDataError);
                    res.status(401).json({
                        status: 401,
                        success: false,
                        error: appraisalDataError
                    });
                }
            })
        } else {
            // When no employeeIds provided, handle as general KPI
            console.log(`[createKPI] Processing general KPI assignment without employee IDs`);
            
            // Handle departments if provided
            let departments = [];
            let allEmployeeIds = [];
            
            if (departmentIds && departmentIds.length > 0) {
                console.log(`[createKPI] Processing ${departmentIds.length} departments for KPI assignment`);
                
                for (const deptId of departmentIds) {
                    try {
                        const department = await Department.findOne({ _id: deptId });
                        if (department) {
                            departments.push({
                                department_id: deptId,
                                department_name: department.departmentName,
                            });

                            // Find employees in this department to assign KPI
                            const deptEmployees = await Employees.find({ departmentId: deptId });
                            if (deptEmployees && deptEmployees.length > 0) {
                                const employeeData = deptEmployees.map(emp => ({
                                    employee_id: emp._id,
                                    employee_name: emp.fullName
                                }));
                                
                                // Add to all employee IDs list for later update
                                allEmployeeIds = [...allEmployeeIds, ...deptEmployees.map(emp => emp._id)];
                                
                                if (!kpiData.assignedEmployees) {
                                    kpiData.assignedEmployees = employeeData;
                                } else {
                                    kpiData.assignedEmployees = [...kpiData.assignedEmployees, ...employeeData];
                                }
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
                
                // Assign departments to KPI data
                if (departments.length > 0) {
                    kpiData.assignedDepartments = departments;
                }
            }

            // Set employeeId for general case too if employees are present
            if (kpiData.assignedEmployees && kpiData.assignedEmployees.length > 0) {
                kpiData.employeeId = kpiData.assignedEmployees[0].employee_id;
                console.log(`[createKPI] Setting employeeId ${kpiData.employeeId} directly for KPI for employee ${kpiData.assignedEmployees[0].employee_name}`);
            }

            // Log the final KPI data to be saved
            console.log(`[createKPI] Final KPI data to be saved:`, JSON.stringify({
                kpiName: kpiData.kpiName,
                employeeId: kpiData.employeeId,
                assignedEmployees: kpiData.assignedEmployees?.length || 0
            }, null, 2));

            // Use the same kpiData structure for non-specific groups
            let groups1 = new AppraisalGroup(kpiData);

            await groups1.save().then(async (adm) => {
                console.log(`[createKPI] KPI saved successfully with ID: ${adm._id}`);
                console.log({adm})

                // Create a groupKpiData object with consistent structure
                const groupKpiData = {
                    kpiId: adm._id,
                    kpiName: name,
                    weight: Number(weight) || 0,
                    threshold: Number(threshold) || 0,
                    target: Number(target) || 0,
                    max: Number(max) || 0,
                    kpiDescription: description,
                    type: type || 'percentage',
                    remarks: kpiData.remarks, // Use the same remarks structure
                    employeeId: kpiData.employeeId, // Include the employeeId to enable proper filtering
                    employeeName: kpiData.assignedEmployees?.find(e => e.employee_id === kpiData.employeeId)?.employee_name || '',
                    // Store the full arrays of employee and department IDs
                    employees: allEmployeeIds || [],
                    departments: departmentIds || []
                };

                // UPDATE THE GROUP WITH THE NEW KPI
                try {
                    // Add the KPI to the AppraisalGroup's groupKpis array
                    const updateGroupResult = await Group.findByIdAndUpdate(
                        group, 
                        { $push: { groupKpis: groupKpiData } }, 
                        { new: true }
                    );
                    
                    console.log(`[createKPI] Added KPI to AppraisalGroup (${group}): ${updateGroupResult ? 'Success' : 'Failed'}`);
                    if (updateGroupResult) {
                        console.log(`[createKPI] Group now has ${updateGroupResult.groupKpis.length} KPIs`);
                    }
                } catch (groupUpdateError) {
                    console.error(`[createKPI] Error updating AppraisalGroup with new KPI:`, groupUpdateError);
                }

                // First, handle the case for employees with a consolidated KPI entry
                if (allEmployeeIds.length > 0) {
                    console.log(`[createKPI] Adding consolidated KPI entry for ${allEmployeeIds.length} employees to AppraisalData`);
                    
                    // Create a single KPI with all employee assignments
                    const consolidatedKpiData = {
                        ...groupKpiData,
                        type: type || 'percentage',
                        assignedEmployees: groups.map(employee => ({
                            employeeId: employee.employee_id,
                            employeeName: employee.employee_name
                        }))
                    };
                    
                    try {
                        // Add a single KPI entry with all employee assignments to the AppraisalData
                        const updateResult = await AppraisalData.updateMany(
                            { companyId: req.payload.id },
                            { $push: { "kpiGroups.$[group].groupKpis": consolidatedKpiData } },
                            { arrayFilters: [{ "group.groupId": group }] }
                        );
                        
                        console.log(`[createKPI] Added consolidated KPI with ${groups.length} employee assignments to AppraisalData (matched ${updateResult.matchedCount}, modified ${updateResult.modifiedCount})`);
                    } catch (err) {
                        console.error(`[createKPI] Error adding consolidated KPI to AppraisalData:`, err);
                    }
                }

                try {
                    console.log(`[createKPI] Updating AppraisalData for company ${req.payload.id}`);
                    
                    // Run verification before sending response
                    await verifyKPIAssignment(adm._id, adm.kpiName);
                    
                    // Get the updated document with all changes
                    const updatedKpi = await AppraisalGroup.findById(adm._id);
                    
                                    res.status(200).json({
                                        status: 200,
                                        success: true,
                        data: updatedKpi,
                        permissions: {
                            createdBy: userIsEmployee ? 'employee' : 'company',
                            role: userIsSuperAdmin ? 'superadmin' : (userIsAdmin ? 'admin' : (userIsManager ? 'manager' : 'employee')),
                            accessLevel: accessLevel
                        }
                    });
                } catch (appraisalDataError) {
                    console.error(`[createKPI] Error updating AppraisalData:`, appraisalDataError);
                    res.status(401).json({
                        status: 401,
                        success: false,
                        error: appraisalDataError
                    });
                }
            })
        }
    } catch (error) {
        console.error("Error in createKPI:", error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An unexpected error occurred'
        });
    }
}

export default createKPI;



