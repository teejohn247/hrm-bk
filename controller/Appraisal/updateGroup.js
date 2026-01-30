import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Leave from '../../model/Expense';
import AppraisalGroup from '../../model/AppraisalGroup';
import createGroup from './CreateGroup';
import addDepartment from '../../model/Department';
import Employees from '../../model/Employees';

const sgMail = require('@sendgrid/mail')

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const updateGroup = async (req, res) => {
    try {
        // Extract both potential department parameters from the request body
        // First check for departments (used by frontend), then fall back to departmentIds (used in backend)
        const { name, description, accessLevel, departments = [], departmentIds = [], weight, threshold, target, max } = req.body;

        // Use departments if provided, otherwise use departmentIds
        const deptIdsToUse = Array.isArray(departments) && departments.length > 0 ? departments : departmentIds;
        
        // Ensure departmentIds is an array
        const safeDepartmentIds = Array.isArray(deptIdsToUse) ? deptIdsToUse : [];
        
        console.log("[updateGroup] Safe departmentIds:", safeDepartmentIds);
        console.log("[updateGroup] Source parameter:", Array.isArray(departments) && departments.length > 0 ? "departments" : "departmentIds");

        // Check if user has permission to update KPI groups
        // First, determine if the request is from a company admin or an employee
        let isCompanyAdmin = false;
        let employee = null;
        let company = null;

        // Check if the user is a company admin
        company = await Company.findOne({ _id: req.payload.id });
        
        if (company) {
            isCompanyAdmin = true;
            console.log("[updateGroup] Request is from company admin:", company.companyName);
        } else {
            // If not a company, look for employee
            employee = await Employees.findOne({ _id: req.payload.id });
            
            if (!employee) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'User not found - neither company nor employee'
                });
            }
            
            // Get the company from employee's companyId
            company = await Company.findOne({ _id: employee.companyId });
            
            if (!company) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'Company not found for this employee'
                });
            }
        }
        
        // Check authorization based on whether it's a company admin or an employee
        let isAuthorized = false;
        
        if (isCompanyAdmin) {
            // Company admins are always authorized
            isAuthorized = true;
            console.log("[updateGroup] Company admin is authorized");
        } else {
            // For employees, check their roles and permissions
            isAuthorized = 
                // Check if super admin
                employee.isSuperAdmin === true || 
                // Check for admin role
                employee.role === 'Admin' || 
                employee.roleName === 'Admin' ||
                // Check for manager role
                employee.isManager === true ||
                // Check for specific permission in permissions object
                (employee.permissions && employee.permissions.appraisalManagement && 
                 employee.permissions.appraisalManagement.createKPIGroup === true);
                
            console.log(`[updateGroup] ${employee.isManager ? 'Manager' : (employee.role === 'Admin' ? 'Admin' : 'Employee')} ${isAuthorized ? 'is' : 'is not'} authorized`);
        }
        
        if (!isAuthorized) {
            console.log("[updateGroup] User lacks permission to update KPI groups:", req.payload.id);
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'You do not have permission to update KPI groups'
            });
        }

        // Log who is updating the group
        if (isCompanyAdmin) {
            console.log(`[updateGroup] Company Admin (${company.companyName}) updating KPI group`);
        } else {
            console.log(`[updateGroup] ${employee.isManager ? 'Manager' : (employee.role === 'Admin' ? 'Admin' : 'Employee')} updating KPI group`);
        }

        // We already have the company object from above

        // Get the appraisal group and related data
        let appraisalName = await AppraisalGroup.findOne({ companyId: company._id, groupName: name });
        let appraisal = await AppraisalGroup.findOne({ _id: req.params.id });

        if (!appraisal) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Appraisal group not found'
            });
        }

        // Only fetch departments if we have department IDs
        let allDepartments = [];
        if (safeDepartmentIds.length > 0) {
            allDepartments = await addDepartment.find({ _id: { $in: safeDepartmentIds } });
        }

        console.log({appraisal});

        if (!company.companyName) {
            res.status(400).json({
                status: 400,
                error: 'Company information is incomplete'
            });
            return;
        }

        if (appraisalName && String(appraisalName._id) !== req.params.id) {
            res.status(400).json({
                status: 400,
                error: 'This appraisal name already exists on another group'
            });
            return;
        }

        // Extract all old departments from the current appraisal
        let oldDepartmentIds = [];
        if (appraisal.assignedDepartments && appraisal.assignedDepartments.length > 0) {
            oldDepartmentIds = appraisal.assignedDepartments.map(dept => 
                dept.department_id ? dept.department_id.toString() : null
            ).filter(id => id !== null); // Filter out any null values
        }
        console.log({ oldDepartmentIds });

        // Extract all old employees from the current appraisal
        let oldEmployeeIds = [];
        if (appraisal.assignedEmployees && appraisal.assignedEmployees.length > 0) {
            oldEmployeeIds = appraisal.assignedEmployees.map(emp => 
                emp.employee_id ? emp.employee_id.toString() : null
            ).filter(id => id !== null); // Filter out any null values
        }
        console.log({ oldEmployeeIds });

        // Convert all safeDepartmentIds to strings for consistent comparison
        const normalizedDeptIds = safeDepartmentIds.map(id => id.toString());

        // Determine departments to add and remove
        const departmentsToAdd = [];
        const departmentIdsToAdd = [];
        
        // Populate departments to add by comparing with normalized IDs
        for (const department of allDepartments) {
            const deptId = department._id.toString();
            
            // Check if the department is already in the appraisal group's assignedDepartments
            const alreadyAssignedToAppraisal = oldDepartmentIds.includes(deptId);
            
            // Only add departments that are not already assigned to the appraisal
            if (!alreadyAssignedToAppraisal) {
                departmentsToAdd.push({
                    department_id: deptId,
                    department_name: department.departmentName,
                });
                console.log({departmentsToAdd});
                departmentIdsToAdd.push(deptId);
            }
        }
        
        // Determine departments to remove (those in old list but not in new list)
        const departmentIdsToRemove = oldDepartmentIds.filter(oldId => 
            !normalizedDeptIds.includes(oldId)
        );
        
        console.log({ 
            departmentsToAdd, 
            departmentIdsToAdd, 
            departmentIdsToRemove,
            normalizedDeptIds
        });

        try {
            // First, update the basic information of the appraisal group
            const updatedAppraisal = await AppraisalGroup.findOneAndUpdate(
                { _id: req.params.id }, 
                { 
                    $set: { 
                        groupName: name || appraisal.groupName,
                        companyId: company._id,
                        companyName: company.companyName,
                        description: description || appraisal.description,
                        weight: weight !== undefined ? weight : appraisal.weight,
                        threshold: threshold !== undefined ? threshold : appraisal.threshold,
                        target: target !== undefined ? target : appraisal.target,
                        max: max !== undefined ? max : appraisal.max,
                        accessLevel: accessLevel || appraisal.accessLevel,
                    }
                },
                { new: true }
            );
            
            if (!updatedAppraisal) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'Failed to update appraisal group'
                });
            }
            
            console.log('[updateGroup] Basic information updated');
            
            // Get the appraisal reference to send to employees
            const appraisalRef = {
                _id: updatedAppraisal._id,
                groupName: updatedAppraisal.groupName,
                groupKpis: updatedAppraisal.groupKpis,
                description: updatedAppraisal.description
            };
            
            // STEP 1: Remove appraisal from departments that are no longer assigned
            let departmentsRemoved = 0;
            if (departmentIdsToRemove.length > 0) {
                const removeResult = await addDepartment.updateMany(
                    { _id: { $in: departmentIdsToRemove } },
                    { $pull: { assignedAppraisals: { appraisalId: req.params.id } } }
                );
                departmentsRemoved = removeResult.modifiedCount || 0;
                console.log('[updateGroup] Removed appraisal from', departmentsRemoved, 'departments');
            }
            
            // STEP 2: Add appraisal to newly assigned departments
            let departmentsAdded = 0;
            if (departmentIdsToAdd.length > 0) {
                const deptAppraisalData = {
                    appraisalId: req.params.id,
                    appraisalName: updatedAppraisal.groupName
                };
                
                const addResult = await addDepartment.updateMany(
                    { _id: { $in: departmentIdsToAdd } },
                    { $push: { assignedAppraisals: deptAppraisalData } }
                );
                departmentsAdded = addResult.modifiedCount || 0;
                console.log('[updateGroup] Added appraisal to', departmentsAdded, 'departments');
            }
            
            // STEP 3: Update the appraisal group itself with department changes
            
            // First, remove departments that should be removed
            if (departmentIdsToRemove.length > 0) {
                await AppraisalGroup.findOneAndUpdate(
                    { _id: req.params.id },
                    { 
                        $pull: { 
                            assignedDepartments: { 
                                department_id: { $in: departmentIdsToRemove } 
                            } 
                        } 
                    }
                );
                console.log('[updateGroup] Removed', departmentIdsToRemove.length, 'departments from appraisal group');
            }
            
            // Then add the new departments
            if (departmentsToAdd.length > 0) {
                await AppraisalGroup.findOneAndUpdate(
                    { _id: req.params.id },
                    { $push: { assignedDepartments: { $each: departmentsToAdd } } }
                );
                console.log('[updateGroup] Added', departmentsToAdd.length, 'departments to appraisal group');
            }
            
            // STEP 4: Handle employee assignments based on department changes
            
            // Find all employees in the new departments
            let departmentEmployees = [];
            if (normalizedDeptIds.length > 0) {
                departmentEmployees = await Employees.find({ 
                    departmentId: { $in: normalizedDeptIds }
                });
            }
            
            console.log({ departmentEmployees: departmentEmployees.length });
            
            // Prepare employee data for updates
            const employeesToAdd = [];
            const employeeIdsToAdd = [];
            
            // Find employees that are in the new departments but not already assigned
            if (departmentEmployees.length > 0) {
                for (const emp of departmentEmployees) {
                    const empId = emp._id.toString();
                    // Check if employee is already assigned to this appraisal group
                    const exists = oldEmployeeIds.includes(empId);
                    
                    if (!exists) {
                        employeesToAdd.push({
                            employee_id: empId,
                            employee_name: emp.fullName,
                        });
                        employeeIdsToAdd.push(empId);
                    }
                }
            }
            
            // Get all employee IDs from departments that will remain assigned
            const employeeIdsInNewDepts = departmentEmployees.map(emp => emp._id.toString());
            
            // Find employees to remove - those that are no longer in any assigned department
            const employeeIdsToRemove = oldEmployeeIds.filter(id => 
                !employeeIdsInNewDepts.includes(id)
            );
            
            console.log({ 
                employeesToAdd, 
                employeeIdsToAdd, 
                employeeIdsToRemove,
                employeeIdsInNewDepts
            });
            
            // STEP 5: Remove appraisal from employees no longer assigned
            let employeesRemoved = 0;
            if (employeeIdsToRemove.length > 0) {
                const removeResult = await Employees.updateMany(
                    { _id: { $in: employeeIdsToRemove } },
                    { $pull: { appraisals: { _id: updatedAppraisal._id } } }
                );
                employeesRemoved = removeResult.modifiedCount || 0;
                console.log('[updateGroup] Removed appraisal from', employeesRemoved, 'employees');
                
                // Also remove employees from the appraisal group
                await AppraisalGroup.findOneAndUpdate(
                    { _id: req.params.id },
                    { 
                        $pull: { 
                            assignedEmployees: { 
                                employee_id: { $in: employeeIdsToRemove } 
                            } 
                        } 
                    }
                );
                console.log('[updateGroup] Removed', employeeIdsToRemove.length, 'employees from appraisal group');
            }
            
            // STEP 6: Add employees to the appraisal group
            let employeesAddedToGroup = 0;
            if (employeesToAdd.length > 0) {
                const addResult = await AppraisalGroup.findOneAndUpdate(
                    { _id: req.params.id },
                    { $push: { assignedEmployees: { $each: employeesToAdd } } }
                );
                employeesAddedToGroup = employeesToAdd.length;
                console.log('[updateGroup] Added', employeesAddedToGroup, 'employees to appraisal group');
            }
            
            // STEP 7: Add appraisal to newly assigned employees
            let employeesAddedAppraisal = 0;
            if (employeeIdsToAdd.length > 0) {
                const addResult = await Employees.updateMany(
                    { _id: { $in: employeeIdsToAdd } },
                    { $push: { appraisals: appraisalRef } }
                );
                employeesAddedAppraisal = addResult.modifiedCount || 0;
                console.log('[updateGroup] Added appraisal to', employeesAddedAppraisal, 'employee records');
            }
            
            // Return success response
            return res.status(200).json({
                status: 200,
                success: true,
                data: {
                    message: "KPI group updated successfully",
                    updated: {
                        departments: {
                            added: departmentsAdded,
                            removed: departmentsRemoved
                        },
                        employees: {
                            added: employeesAddedAppraisal,
                            removed: employeesRemoved
                        }
                    }
                }
            });
            
        } catch (updateError) {
            console.error('[updateGroup] Error during updates:', updateError);
            return res.status(500).json({
                status: 500,
                success: false,
                error: updateError.message || updateError
            });
        }
    } catch (error) {
        console.error('[updateGroup] Outer error:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error
        });
    }
}
export default updateGroup;