import dotenv from 'dotenv';
import AppraisalGroup from '../../model/AppraisalGroup';
import Employees from '../../model/Employees';
import Department from '../../model/Department';
import Company from '../../model/Company';

const sgMail = require('@sendgrid/mail')

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const fetchGroups = async (req, res) => {
    try {
        const { page, limit } = req.query;
        let query = {};
        let employee = null;
        let isAdmin = false;
        let isManager = false;
        let isSuperAdmin = false;
        let managedDepartmentIds = []; // Track departments managed by this user
        let managedEmployeeIds = []; // Track employees in managed departments
        
        // First check if user is a company/super admin or an employee
        try {
            // Check if this is a company/super admin
            const company = await Company.findOne({ _id: req.payload.id });
            
            if (company) {
                // This is a company account
                isAdmin = true;
                isSuperAdmin = company.isSuperAdmin || false;
                query = { companyId: req.payload.id };
                console.log("[fetchGroups] User is a company admin");
            } else {
                // Try to find as employee
                employee = await Employees.findOne({ _id: req.payload.id });
                
                if (!employee) {
                    // If neither company nor employee, return error
                    return res.status(404).json({
                        status: 404,
                        success: false,
                        error: 'User not found'
                    });
                }
                
                // Check if employee is a super admin
                if (employee.isSuperAdmin) {
                    isSuperAdmin = true;
                    isAdmin = true;
                    query = { companyId: employee.companyId };
                    console.log("[fetchGroups] User is a super admin employee");
                }
                // Check if employee has admin permissions
                else if (employee.permissions?.appraisalManagement?.createKPIGroup || 
                    employee.roleName === 'Admin' || 
                    employee.role === 'Admin') {
                    isAdmin = true;
                    query = { companyId: employee.companyId };
                    console.log("[fetchGroups] User is an admin employee");
                } 
                // Check if employee is a manager using isManager flag
                else if (employee.isManager === true) {
                    isManager = true;
                    
                    // Find all departments this employee manages
                    const managedDepartments = await Department.find({ 
                        companyId: employee.companyId,
                        managerId: req.payload.id 
                    });
                    
                    console.log(`[fetchGroups] Found ${managedDepartments.length} departments managed by this user`);
                    
                    if (managedDepartments.length > 0) {
                        // Store the department IDs for later use in KPI filtering
                        managedDepartmentIds = managedDepartments.map(dept => dept._id.toString());
                        
                        // Find all employees in these departments
                        const employeesInDepartments = await Employees.find({
                            companyId: employee.companyId,
                            departmentId: { $in: managedDepartmentIds }
                        }).select('_id');
                        
                        managedEmployeeIds = employeesInDepartments.map(emp => emp._id.toString());
                        console.log(`[fetchGroups] Found ${managedEmployeeIds.length} employees in managed departments`);
                        
                        // Query to find groups that are either:
                        // 1. Assigned to departments the user manages
                        // 2. Assigned directly to the user
                        query = { 
                            companyId: employee.companyId,
                            $or: [
                                { "assignedDepartments.department_id": { $in: managedDepartmentIds } },
                                { "assignedEmployees.employee_id": req.payload.id }
                            ]
                        };
                    } else if (employee.departmentId) {
                        // If user is marked as manager but doesn't manage any departments explicitly,
                        // check if they are the manager of their own department
                        const ownDepartment = await Department.findOne({
                            _id: employee.departmentId,
                            managerId: req.payload.id
                        });
                        
                        if (ownDepartment) {
                            managedDepartmentIds = [ownDepartment._id.toString()];
                            
                            // Find all employees in this department
                            const employeesInDepartment = await Employees.find({
                                companyId: employee.companyId,
                                departmentId: employee.departmentId
                            }).select('_id');
                            
                            managedEmployeeIds = employeesInDepartment.map(emp => emp._id.toString());
                            console.log(`[fetchGroups] Manager manages own department with ${managedEmployeeIds.length} employees`);
                            
                            // Query to find groups assigned to this department or to the user
                            query = { 
                                companyId: employee.companyId,
                                $or: [
                                    { "assignedDepartments.department_id": employee.departmentId },
                                    { "assignedEmployees.employee_id": req.payload.id }
                                ]
                            };
                        } else {
                            // If no department found, just show groups assigned to this employee
                            query = { 
                                companyId: employee.companyId,
                                "assignedEmployees.employee_id": req.payload.id 
                            };
                            console.log("[fetchGroups] Manager without managed departments, showing only assigned groups");
                        }
                    } else {
                        // If no department found, just show groups assigned to this employee
                        query = { 
                            companyId: employee.companyId,
                            "assignedEmployees.employee_id": req.payload.id 
                        };
                        console.log("[fetchGroups] Manager without department, showing only assigned groups");
                    }
                } 
                // Regular employee - only see groups assigned to them
                else {
                    query = { 
                        companyId: employee.companyId,
                        "assignedEmployees.employee_id": req.payload.id 
                    };
                    console.log("[fetchGroups] User is a regular employee");
                }
            }
        } catch (error) {
            console.error("[fetchGroups] Error determining user role:", error);
            // Return error instead of using fallback query
            return res.status(500).json({
                status: 500,
                success: false,
                error: "Error determining user role"
            });
        }

        console.log("[fetchGroups] Query for fetching groups:", query);
        
        // Fetch documents with filtering by access level
        const groups = await AppraisalGroup.find(query)
            .sort({ groupName: 1 }) // Sort alphabetically
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            
        // Filter KPIs based on user role
        const filteredGroups = groups.map(group => {
            // Create a copy of the group object that we can modify
            const filteredGroup = { ...group.toObject() };
            
            // Filter the groupKpis array if it exists
            if (filteredGroup.groupKpis && filteredGroup.groupKpis.length > 0) {
                // Admin/SuperAdmin see all KPIs
                if (isAdmin || isSuperAdmin) {
                    // No filtering needed - keep all KPIs
                } else if (isManager && managedEmployeeIds.length > 0) {
                    // For managers, show:
                    // 1. All general KPIs (no employeeId)
                    // 2. KPIs assigned to the manager
                    // 3. KPIs assigned to employees in departments they manage
                    filteredGroup.groupKpis = filteredGroup.groupKpis.filter(kpi => {
                        // Include KPIs with no employeeId and no employees array (general KPIs)
                        if (!kpi.employeeId && (!kpi.employees || kpi.employees.length === 0)) return true;
                        
                        // Include KPIs assigned to the manager
                        if (kpi.employeeId === req.payload.id) return true;
                        
                        // Include KPIs where manager is in the employees array
                        if (kpi.employees && Array.isArray(kpi.employees) && kpi.employees.includes(req.payload.id)) return true;
                        
                        // Include KPIs assigned to employees in departments they manage
                        if (kpi.employeeId && managedEmployeeIds.includes(kpi.employeeId)) return true;
                        
                        // Include KPIs with employees array that contains any managed employees
                        if (kpi.employees && Array.isArray(kpi.employees)) {
                            return kpi.employees.some(empId => managedEmployeeIds.includes(empId));
                        }
                        
                        return false;
                    });
                    
                    console.log(`[fetchGroups] Manager view: Filtered to ${filteredGroup.groupKpis.length} KPIs`);
                } else {
                    // For regular employees
                    filteredGroup.groupKpis = filteredGroup.groupKpis.filter(kpi => {
                        // Include KPIs with no employeeId and no employees array (general KPIs)
                        if (!kpi.employeeId && (!kpi.employees || kpi.employees.length === 0)) return true;
                        
                        // For KPIs with employeeId, ONLY show if it matches the current user ID
                        if (kpi.employeeId === req.payload.id) return true;
                        
                        // For KPIs with employees array, ONLY show if the current user ID is in the array
                        if (kpi.employees && Array.isArray(kpi.employees) && kpi.employees.includes(req.payload.id)) return true;
                        
                        // Otherwise, don't show this KPI to this employee
                        return false;
                    });
                    
                    console.log(`[fetchGroups] Employee view: Filtered to ${filteredGroup.groupKpis.length} KPIs`);
                }
            }
            
            return filteredGroup;
        });

        const count = await AppraisalGroup.find(query).countDocuments();
        
        res.status(200).json({
            status: 200,
            success: true,
            data: filteredGroups,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            userRole: isSuperAdmin ? 'superadmin' : (isAdmin ? 'admin' : (isManager ? 'manager' : 'employee')),
            // Include manager info for debugging
            managerInfo: isManager ? {
                managedDepartments: managedDepartmentIds,
                managedEmployeesCount: managedEmployeeIds.length
            } : null
        });

    } catch (error) {
        console.error("[fetchGroups] Error fetching groups:", error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error
        });
    }
};

export default fetchGroups;



