// import dotenv from 'dotenv';
// import Role from '../../model/Role';
// import Company from '../../model/Company';
// import Leave from '../../model/Expense';
// import AppraisalGroup from '../../model/AppraisalGroup';
// import Period from '../../model/AppraisalPeriod';
// import addDepartment from '../../model/Department';
// import Employees from '../../model/Employees';

// const sgMail = require('@sendgrid/mail')

// dotenv.config();

// sgMail.setApiKey(process.env.SENDGRID_KEY);

// const createGroup = async (req, res) => {
//     try {
//         const { 
//             name, 
//             description, 
//             appraisalPeriodId, 
//             departments, 
//             weight, 
//             threshold, 
//             target, 
//             max, 
//             employeesIds,
//             accessLevel
//         } = req.body;

//         // Check if user has permission to create KPI groups
//         // First, determine if the request is from a company admin or an employee
//         let isCompanyAdmin = false;
//         let employee = null;
//         let company = null;

//         // Check if the user is a company admin
//         company = await Company.findOne({ _id: req.payload.id });
        
//         if (company) {
//             isCompanyAdmin = true;
//             console.log("[CreateGroup] Request is from company admin:", company.companyName);
//         } else {
//             // If not a company, look for employee
//             employee = await Employees.findOne({ _id: req.payload.id });
            
//             if (!employee) {
//                 return res.status(404).json({
//                     status: 404,
//                     success: false,
//                     error: 'User not found - neither company nor employee'
//                 });
//             }
            
//             // Get the company from employee's companyId
//             company = await Company.findOne({ _id: employee.companyId });
            
//             if (!company) {
//                 return res.status(404).json({
//                     status: 404,
//                     success: false,
//                     error: 'Company not found for this employee'
//                 });
//             }
//         }
        
//         // Check authorization based on whether it's a company admin or an employee
//         let isAuthorized = false;
        
//         if (isCompanyAdmin) {
//             // Company admins are always authorized
//             isAuthorized = true;
//             console.log("[CreateGroup] Company admin is authorized");
//         } else {
//             // For employees, check their roles and permissions
//             isAuthorized = 
//                 // Check if super admin
//                 employee.isSuperAdmin === true || 
//                 // Check for admin role
//                 employee.role === 'Admin' || 
//                 employee.roleName === 'Admin' ||
//                 // Check for manager role
//                 employee.isManager === true ||
//                 // Check for specific permission in permissions object
//                 (employee.permissions && employee.permissions.appraisalManagement && 
//                 employee.permissions.appraisalManagement.createKPIGroup === true);
                
//             console.log(`[CreateGroup] ${employee.isManager ? 'Manager' : (employee.role === 'Admin' ? 'Admin' : 'Employee')} ${isAuthorized ? 'is' : 'is not'} authorized`);
//         }
        
//         if (!isAuthorized) {
//             console.log("[CreateGroup] User lacks permission to create KPI groups:", req.payload.id);
//             return res.status(403).json({
//                 status: 403,
//                 success: false,
//                 error: 'You do not have permission to create KPI groups'
//             });
//         }

//         // Log who is creating the group
//         if (isCompanyAdmin) {
//             console.log(`[CreateGroup] Company Admin (${company.companyName}) creating KPI group`);
//         } else {
//             console.log(`[CreateGroup] ${employee.isManager ? 'Manager' : (employee.role === 'Admin' ? 'Admin' : 'Employee')} creating KPI group`);
//         }

//         const isEmployeeLevel = accessLevel === "employee";
//         // if (isEmployeeLevel) {
//         //     console.log("Creating group with 'employee' access level - will not assign to employees or departments");
//         // }

//         // We already have the company object from above
//         console.log({company});

//         if (!company) {
//             return res.status(404).json({
//                 status: 404,
//                 success: false,
//                 error: 'Company not found'
//             });
//         }

//         let appraisal = await AppraisalGroup.findOne({ companyId: company._id, groupName: name });
//         let appraisalPeriod = await Period.findOne({ companyId: company._id, _id: appraisalPeriodId });
//         let allEmployees = await Employees.find({ companyId: company._id });
//         let allDepartments = await addDepartment.find({ companyId: company._id });

//         console.log({appraisal})

//         if (!company.companyName) {
//             res.status(400).json({
//                 status: 400,
//                 error: 'Company information is incomplete'
//             })
//             return;
//         }

//         if (appraisal) {
//             res.status(400).json({
//                 status: 400,
//                 error: 'This appraisal name already exist'
//             })
//             return;
//         }

//         if(name == 'General'){
//             let groups = [];
//             let employees = [];
//             let departments = [];
//             let departmentIds = [];

//             // Only collect employee and department data if not employee level
//             if (!isEmployeeLevel) {
//                 for (const employee of allEmployees) {
//                     console.log({ employee });
            
//                     try {
//                         groups.push({
//                             employee_id: employee._id,
//                             employee_name: employee.fullName,
//                         });
            
//                         console.log({ groups });
//                     } catch (err) {
//                         console.error(err);
//                     }
//                 }

//                 for (const department of allDepartments) {
//                     console.log({ department });
            
//                     try {
//                         departments.push({
//                             department_id:department._id,
//                             department_name: department.departmentName,
//                         });
                       
//                         departmentIds.push(department._id);
            
//                         console.log({ departments });
//                     } catch (err) {
//                         console.error(err);
//                     }
//                 }

//                 for (const employee of allEmployees) {
//                     console.log({ employee });
            
//                     try {
//                         employees.push(employee._id);
            
//                         console.log({ employees });
//                     } catch (err) {
//                         console.error(err);
//                     }
//                 }
//             }
    
//            let group = new AppraisalGroup({
//                 groupName: name,
//                 companyId: company._id,
//                 companyName: company.companyName,
//                 description,
//                 weight,
//                 threshold,
//                 target,
//                 max,
//                 accessLevel: accessLevel || "Admin" // Save the access level
//             });
    
//             await group.save().then(async (adm) => {
//                 console.log(adm);
//                 const appraisals = await AppraisalGroup.findOne({_id : adm._id}, {_id: 1, groupName:1, groupKpis: 1, description: 1});

//                 // If it's employee level, return early without assigning
//                 if (isEmployeeLevel) {
//                     res.status(200).json({
//                         status: 200,
//                         success: true,
//                         data: adm,
//                         message: "Group created with employee access level - not assigned to any employees or departments"
//                     });
//                     return;
//                 }
                
//                 // Otherwise continue with assignments
//                 AppraisalGroup.findOneAndUpdate({ _id: adm._id}, { 
//                     $push: { assignedEmployees: groups },
//                },{ upsert: true },
//                     async function (err, result) {
//                         if (err) {
//                             res.status(401).json({
//                                 status: 401,
//                                 success: false,
//                                 error: err
//                             });
//                         } else {
//                             Employees.findOneAndUpdate({ _id:  { $in: employees }}, { 
//                                 $push: {  appraisals },
//                            },{ upsert: true },
//                                 async function (err, result) {
//                                     if (err) {
//                                         res.status(401).json({
//                                             status: 401,
//                                             success: false,
//                                             error: err
//                                         });
//                                     } else {
//                                         console.log(adm);
//                                         console.log({departmentIds});
//                                         AppraisalGroup.findOneAndUpdate({ _id: adm._id}, { 
//                                             $push: { assignedDepartments: departments },
//                                        },{ upsert: true },
//                                             async function (err, result) {
//                                                 if (err) {
//                                                     res.status(401).json({
//                                                         status: 401,
//                                                         success: false,
//                                                         error: err
//                                                     });
//                                                 } else {
//                                                     addDepartment.updateMany({ _id:  { $in: departmentIds }}, { 
//                                                         $push: { departments: {
//                                                             appraisalId: adm._id,
//                                                             appraisalName: adm.groupName,
//                                                         }},
//                                                    },{ upsert: true },
//                                                         async function (err, result) {
//                                                             if (err) {
//                                                                 res.status(401).json({
//                                                                     status: 401,
//                                                                     success: false,
//                                                                     error: err
//                                                                 });
//                                                             } else {
//                                                                 const manager = await AppraisalGroup.findOne({_id: adm._id});
//                                                                 res.status(200).json({
//                                                                     status: 200,
//                                                                     success: true,
//                                                                     data: manager
//                                                                 });
//                                                             }
//                                                         });
//                                                 }
//                                             });
//                                     }
//                                 });
//                         }
//                     });
//             }).catch((err) => {
//                 console.error(err);
//                 res.status(400).json({
//                     status: 400,
//                     success: false,
//                     error: err
//                 });
//             });
//         } else if(name == "specific"){
//             let groups = [];
//             let appraisal = await AppraisalGroup.findOne({ companyId:company._id, groupName: name });
//             let departments = [];
//             let departmentIds = [];

//             if (appraisal) {
//                 res.status(400).json({
//                     status: 400,
//                     error: 'This appraisal name already exist'
//                 })
//                 return;
//             }

//             // Only collect employee data if not employee level
//             if (employeesIds && employeesIds.length > 0) {
//                 for (const groupId of employeesIds) {
//                     console.log({ groupId });
            
//                     try {
//                         const group = await Employees.findOne({ _id: groupId });
//                         console.log({group});
                        
//                         groups.push({
//                             employee_id: groupId,
//                             employee_name: group.employeeName,
//                         });
//                         console.log({ group });
//                     } catch (err) {
//                         console.error(err);
//                     }
//                 }
//             }
    
//            let group = new AppraisalGroup({ 
//                 groupName: name,
//                 companyId: company._id,
//                 companyName: company.companyName,
//                 description,
//                 weight,
//                 threshold,
//                 target,
//                 max,
//                 accessLevel: accessLevel || "Admin" // Save the access level
//             });
    
//             await group.save().then(async (adm) => {
//                 console.log(adm);
//                 const appraisals = await AppraisalGroup.findOne({_id : adm._id}, {_id: 1, groupName:1, groupKpis: 1, description: 1});

//                 // If it's employee level, return early without assigning
//                 if (isEmployeeLevel) {
//                     res.status(200).json({
//                         status: 200,
//                         success: true,
//                         data: adm,
//                         message: "Group created with employee access level - not assigned to any employees or departments"
//                     });
//                     return;
//                 }

//                 AppraisalGroup.findOneAndUpdate({ _id: adm._id}, { 
//                     $push: { assignedEmployees: groups },
//                },{ upsert: true },
//                     async function (err, result) {
//                         if (err) {
//                             res.status(401).json({
//                                 status: 401,
//                                 success: false,
//                                 error: err
//                             });
//                         } else {
//                             Employees.updateMany({ _id:  { $in: employeesIds }}, { 
//                                 $push: {  appraisals },
//                            },{ upsert: true },
//                                 async function (err, result) {
//                                     if (err) {
//                                         res.status(401).json({
//                                             status: 401,
//                                             success: false,
//                                             error: err
//                                         });
//                                     } else {
//                                         const manager = await AppraisalGroup.findOne({_id: adm._id});
//                                         res.status(200).json({
//                                             status: 200,
//                                             success: true,
//                                             data: manager
//                                         });
//                                     }
//                                 });
//                         }
//                     });
//             }).catch((err) => {
//                 console.error(err);
//                 res.status(400).json({
//                     status: 400,
//                     success: false,
//                     error: err
//                 });
//             });
//         } else {
//             let groups = [];
//             let emps = [];
//             let empsNames = [];

//             if (departments && departments.length > 0) {
//                 const employee = await Employees.find({ departmentId: { $in: departments }});
//                 console.log({employee});

//                 if(employee.length > 0){
//                     for (const emp of employee) {
//                         console.log({ emp });
                
//                         try {
//                             console.log({   
//                                 employee_id: emp._id,
//                                 employee_name: emp.fullName,
//                             });
        
//                             empsNames.push({
//                                 employee_id: emp._id,
//                                 employee_name: emp.fullName,
//                             });
//                             emps.push(emp._id);
                
//                         } catch (err) {
//                             console.error(err);
//                         }
//                     }
//                 }
        
//                 for (const groupId of departments) {
//                     console.log({ groupId });
            
//                     try {
//                         const group = await addDepartment.findOne({ _id: groupId });
        
//                         console.log({group});
            
//                         groups.push({
//                             department_id: groupId,
//                             department_name: group.departmentName,
//                         });
            
//                         console.log({ group });
//                     } catch (err) {
//                         console.error(err);
//                     }
//                 }
//             }
    
//            let group = new AppraisalGroup({
//                 groupName: name,
//                 companyId: company._id,
//                 companyName: company.companyName,
//                 description,
//                 weight,
//                 threshold,
//                 target,
//                 max,
//                 accessLevel: accessLevel || "Admin" // Save the access level
//             });
    
//             await group.save().then((adm) => {
//                 console.log(adm);

//                 // If it's employee level, return early without assigning
//                 if (isEmployeeLevel) {
//                     res.status(200).json({
//                         status: 200,
//                         success: true,
//                         data: adm,
//                         message: "Group created with employee access level - not assigned to any employees or departments"
//                     });
//                     return;
//                 }

//                 AppraisalGroup.findOneAndUpdate({ _id: adm._id}, { 
//                     $push: { assignedDepartments: groups },
//                },{ upsert: true },
//                     async function (err, result) {
//                         if (err) {
//                             res.status(401).json({
//                                 status: 401,
//                                 success: false,
//                                 error: err
//                             });
//                         } else {
//                             addDepartment.updateMany({ _id:  { $in: departments }}, { 
//                                 $push: { assignedAppraisals: {
//                                     appraisalId: adm._id,
//                                     appraisalName: adm.groupName,
//                                 }},
//                            },{ upsert: true },
//                                 async function (err, result) {
//                                     if (err) {
//                                         res.status(401).json({
//                                             status: 401,
//                                             success: false,
//                                             error: err
//                                         });
//                                     } else {
//                                         AppraisalGroup.findOneAndUpdate({ _id: adm._id}, { 
//                                             $push: { assignedEmployees: empsNames },
//                                        },{ upsert: true },
//                                             async function (err, result) {
//                                                 if (err) {
//                                                     res.status(401).json({
//                                                         status: 401,
//                                                         success: false,
//                                                         error: err
//                                                     });
//                                                 } else {
//                                                     if(emps.length > 0){
//                                                         const appraisals = await AppraisalGroup.findOne({_id : adm._id}, {_id: 1, groupName:1, groupKpis: 1, description: 1});
//                                                         console.log({emps});
//                                                         console.log({appraisals});

//                                                         Employees.updateMany({ _id:  { $in: emps }}, { 
//                                                             $push: {  appraisals },
//                                                        },{ upsert: true },
//                                                             async function (err, result) {
//                                                                 if (err) {
//                                                                     res.status(401).json({
//                                                                         status: 401,
//                                                                         success: false,
//                                                                         error: err
//                                                                     });
//                                                                 } else {
//                                                                     console.log({result});
//                                                                     const manager = await AppraisalGroup.findOne({_id: adm._id});
//                                                                     res.status(200).json({
//                                                                         status: 200,
//                                                                         success: true,
//                                                                         data: manager
//                                                                     });
//                                                                 }
//                                                             });
//                                                     } else {
//                                                         const manager = await AppraisalGroup.findOne({_id: adm._id});
//                                                         res.status(200).json({
//                                                             status: 200,
//                                                             success: true,
//                                                             data: manager
//                                                         });
//                                                     }
//                                                 }
//                                             });
//                                     }
//                                 });
//                         }
//                     });
//             }).catch((err) => {
//                 console.error(err);
//                 res.status(400).json({
//                     status: 400,
//                     success: false,
//                     error: err
//                 });
//             });
//         }
//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error
//         });
//     }
// };

// export default createGroup;



import dotenv from 'dotenv';
import Company from '../../model/Company';
import AppraisalGroup from '../../model/AppraisalGroup';
import AppraisalPeriod from '../../model/AppraisalPeriod';
import Department from '../../model/Department';
import Employee from '../../model/Employees';

dotenv.config();

/**
 * Create a new KPI appraisal group
 * @route POST /api/appraisal/group/create
 */
const createGroup = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            appraisalPeriodId, 
            departments, 
            weight, 
            threshold, 
            target, 
            max, 
            employeesIds,
            accessLevel
        } = req.body;

        const userId = req.payload.id;

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Group name is required'
            });
        }

        // Check if user is company or employee
        const company = await Company.findOne({ _id: userId });
        const isCompanyAdmin = !!company;

        let employee = null;
        let userCompany = null;
        let isAuthorized = false;

        if (isCompanyAdmin) {
            userCompany = company;
            isAuthorized = true;
            console.log(`[CreateGroup] Company admin creating group: ${company.companyName}`);
        } else {
            employee = await Employee.findOne({ _id: userId });

            if (!employee) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'User not found'
                });
            }

            userCompany = await Company.findOne({ _id: employee.companyId });

            if (!userCompany) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'Company not found'
                });
            }

            // Check employee permissions
            isAuthorized = 
                employee.isSuperAdmin === true || 
                employee.role === 'Admin' || 
                employee.roleName === 'Admin' ||
                employee.isManager === true ||
                employee.permissions?.appraisalManagement?.createKPIGroup === true;

            console.log(`[CreateGroup] Employee ${employee.fullName} authorization: ${isAuthorized}`);
        }

        if (!isAuthorized) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'You do not have permission to create KPI groups'
            });
        }

        // Check if group name already exists
        const existingGroup = await AppraisalGroup.findOne({ 
            companyId: userCompany._id, 
            groupName: name.trim() 
        });

        if (existingGroup) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'This group name already exists'
            });
        }

        // Validate appraisal period if provided
        if (appraisalPeriodId) {
            const period = await AppraisalPeriod.findOne({ 
                _id: appraisalPeriodId,
                companyId: userCompany._id 
            });

            if (!period) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'Appraisal period not found'
                });
            }
        }

        const isEmployeeLevel = accessLevel === 'employee';
        
        // Create the group
        const newGroup = new AppraisalGroup({
            groupName: name.trim(),
            companyId: userCompany._id.toString(),
            companyName: userCompany.companyName,
            description: description || '',
            weight: weight || 0,
            threshold: threshold || 0,
            target: target || 0,
            max: max || 0,
            accessLevel: accessLevel || 'Admin',
            assignedEmployees: [],
            assignedDepartments: [],
            groupKpis: []
        });

        const savedGroup = await newGroup.save();

        console.log(`[CreateGroup] Group "${name}" created with accessLevel: ${accessLevel || 'Admin'}`);

        // If employee-level access, don't assign to anyone
        if (isEmployeeLevel) {
            console.log(`[CreateGroup] Employee-level group created - no auto-assignment`);
            
            return res.status(200).json({
                status: 200,
                success: true,
                data: savedGroup,
                message: 'Group created with employee access level - not assigned to any employees or departments'
            });
        }

        // Determine assignment strategy based on group name
        const groupNameLower = name.trim().toLowerCase();
        
        if (groupNameLower === 'general') {
            // Assign to ALL employees and departments
            await assignToAllEmployeesAndDepartments(savedGroup, userCompany._id);
        } else if (groupNameLower === 'specific') {
            // Assign to specific employees
            await assignToSpecificEmployees(savedGroup, employeesIds);
        } else {
            // Assign to specific departments
            await assignToDepartments(savedGroup, departments);
        }

        // Fetch the updated group with all assignments
        const updatedGroup = await AppraisalGroup.findById(savedGroup._id);

        console.log(`[CreateGroup] Group "${name}" created and assigned successfully`);

        return res.status(200).json({
            status: 200,
            success: true,
            data: updatedGroup,
            message: 'Group created and assigned successfully'
        });

    } catch (error) {
        console.error('[CreateGroup] Error:', {
            error: error.message,
            stack: error.stack,
            userId: req.payload?.id
        });

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Validation error',
                details: error.message
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid ID format',
                details: error.message
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Duplicate group name',
                details: 'A group with this name already exists'
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while creating the group'
        });
    }
};

/**
 * Assign group to all employees and departments in company
 */
async function assignToAllEmployeesAndDepartments(group, companyId) {
    try {
        // Get all employees
        const allEmployees = await Employee.find({ companyId: companyId.toString() });
        
        const employeeAssignments = allEmployees.map(emp => ({
            employee_id: emp._id.toString(),
            employee_name: emp.fullName || `${emp.firstName} ${emp.lastName}`,
            date_assigned: new Date()
        }));

        // Get all departments
        const allDepartments = await Department.find({ companyId: companyId.toString() });
        
        const departmentAssignments = allDepartments.map(dept => ({
            department_id: dept._id.toString(),
            department_name: dept.departmentName,
            date_assigned: new Date()
        }));

        // Update group with assignments
        await AppraisalGroup.findByIdAndUpdate(
            group._id,
            {
                $set: {
                    assignedEmployees: employeeAssignments,
                    assignedDepartments: departmentAssignments
                }
            }
        );

        // Update all departments with this group
        const departmentIds = allDepartments.map(dept => dept._id);
        await Department.updateMany(
            { _id: { $in: departmentIds } },
            {
                $addToSet: {
                    assignedAppraisals: {
                        appraisalId: group._id.toString(),
                        appraisalName: group.groupName
                    }
                }
            }
        );

        // Update all employees with this group
        const employeeIds = allEmployees.map(emp => emp._id);
        const groupSummary = {
            _id: group._id,
            groupName: group.groupName,
            groupKpis: group.groupKpis || []
        };

        await Employee.updateMany(
            { _id: { $in: employeeIds } },
            {
                $addToSet: {
                    assignedAppraisals: {
                        appraisalId: group._id.toString(),
                        appraisalName: group.groupName
                    }
                }
            }
        );

        console.log(`[AssignToAll] Assigned to ${allEmployees.length} employees and ${allDepartments.length} departments`);
    } catch (error) {
        console.error('[AssignToAll] Error:', error);
        throw error;
    }
}

/**
 * Assign group to specific employees
 */
async function assignToSpecificEmployees(group, employeeIds) {
    try {
        if (!employeeIds || employeeIds.length === 0) {
            console.log('[AssignToSpecific] No employees specified');
            return;
        }

        // Get employee details
        const employees = await Employee.find({ _id: { $in: employeeIds } });

        const employeeAssignments = employees.map(emp => ({
            employee_id: emp._id.toString(),
            employee_name: emp.fullName || `${emp.firstName} ${emp.lastName}`,
            date_assigned: new Date()
        }));

        // Update group
        await AppraisalGroup.findByIdAndUpdate(
            group._id,
            {
                $set: {
                    assignedEmployees: employeeAssignments
                }
            }
        );

        // Update employees
        await Employee.updateMany(
            { _id: { $in: employeeIds } },
            {
                $addToSet: {
                    assignedAppraisals: {
                        appraisalId: group._id.toString(),
                        appraisalName: group.groupName
                    }
                }
            }
        );

        console.log(`[AssignToSpecific] Assigned to ${employees.length} specific employees`);
    } catch (error) {
        console.error('[AssignToSpecific] Error:', error);
        throw error;
    }
}

/**
 * Assign group to specific departments and their employees
 */
async function assignToDepartments(group, departmentIds) {
    try {
        if (!departmentIds || departmentIds.length === 0) {
            console.log('[AssignToDepartments] No departments specified');
            return;
        }

        // Get department details
        const depts = await Department.find({ _id: { $in: departmentIds } });

        const departmentAssignments = depts.map(dept => ({
            department_id: dept._id.toString(),
            department_name: dept.departmentName,
            date_assigned: new Date()
        }));

        // Get all employees in these departments
        const employeesInDepts = await Employee.find({ 
            departmentId: { $in: departmentIds } 
        });

        const employeeAssignments = employeesInDepts.map(emp => ({
            employee_id: emp._id.toString(),
            employee_name: emp.fullName || `${emp.firstName} ${emp.lastName}`,
            date_assigned: new Date()
        }));

        // Update group
        await AppraisalGroup.findByIdAndUpdate(
            group._id,
            {
                $set: {
                    assignedDepartments: departmentAssignments,
                    assignedEmployees: employeeAssignments
                }
            }
        );

        // Update departments
        await Department.updateMany(
            { _id: { $in: departmentIds } },
            {
                $addToSet: {
                    assignedAppraisals: {
                        appraisalId: group._id.toString(),
                        appraisalName: group.groupName
                    }
                }
            }
        );

        // Update employees
        if (employeesInDepts.length > 0) {
            const employeeIds = employeesInDepts.map(emp => emp._id);
            await Employee.updateMany(
                { _id: { $in: employeeIds } },
                {
                    $addToSet: {
                        assignedAppraisals: {
                            appraisalId: group._id.toString(),
                            appraisalName: group.groupName
                        }
                    }
                }
            );
        }

        console.log(`[AssignToDepartments] Assigned to ${depts.length} departments and ${employeesInDepts.length} employees`);
    } catch (error) {
        console.error('[AssignToDepartments] Error:', error);
        throw error;
    }
}

export default createGroup;