import LeaveRecords from '../../model/LeaveRecords';
import Employee from '../../model/Employees';
import mongoose from 'mongoose';

/**
 * Detailed diagnostic endpoint for manager leave approvals
 * This endpoint helps diagnose issues with leave records display
 */
const managerLeaveStats = async (req, res) => {
    try {
        const managerId = req.payload.id;
        const companyId = req.payload.companyId;
        const isSuperAdmin = req.payload.isSuperAdmin === true;
        
        console.log("Manager stats request:", {
            managerId,
            companyId,
            isSuperAdmin,
            email: req.payload.email
        });
        
        // Get manager info and status directly from Employee table
        let managerInfo = {};
        let managerDepartment = null;
        let isManager = false;
        
        try {
            console.log(`Finding employee record for user ${managerId}...`);
            const employee = await Employee.findOne({ _id: managerId }).lean();
            
            if (!employee) {
                console.error(`ERROR: Employee with ID ${managerId} not found in Employee collection!`);
            } else {
                // Get manager status directly from employee record
                isManager = employee.isManager === true;
                
                managerInfo = {
                    name: employee.name,
                    email: employee.email,
                    department: employee.department,
                    isManager: isManager,
                    profilePhoto: employee.profilePhoto || ''
                };
                
                // Log employee details for debugging
                console.log("Found employee record:", {
                    id: employee._id,
                    name: employee.name,
                    department: employee.department,
                    departmentType: typeof employee.department,
                    isManager: employee.isManager
                });
                
                // Check if manager has a department
                if (isManager && !employee.department) {
                    console.error(`ERROR: Manager ${employee.name} (${managerId}) has no department assigned!`);
                } else if (isManager && typeof employee.department !== 'string') {
                    console.error(`ERROR: Manager's department is not a string! Type: ${typeof employee.department}`);
                } else if (isManager) {
                    console.log(`SUCCESS: Manager ${employee.name} has department: ${employee.department}`);
                    managerDepartment = employee.department;
                }
            }
        } catch (err) {
            console.error("Error fetching employee info:", err);
        }
        
        // Find all leave records where this user is the approver
        const approvedByManager = await LeaveRecords.find({
            leaveApprover: managerId,
            status: "Approved"
        }).lean();
        
        // Find all records in the manager's department
        let departmentRecords = [];
        if (managerDepartment) {
            departmentRecords = await LeaveRecords.find({
                department: managerDepartment,
                status: "Approved",
                companyId: companyId
            }).lean();
        }
        
        // Get all company records, but if manager (not superadmin) only for their department
        let companyRecordsQuery = {
            companyId: companyId,
            status: "Approved"
        };
        
        // If manager and not superadmin, filter by department
        if (isManager && !isSuperAdmin) {
            if (managerDepartment) {
                companyRecordsQuery.department = managerDepartment;
                console.log(`Filtering records by department: ${managerDepartment}`);
            } else {
                // If manager has no department, return an empty result for security
                console.error(`SECURITY ENFORCEMENT: Manager ${managerId} has no department - returning empty results`);
                return res.status(200).json({
                    status: 200,
                    success: true,
                    data: {
                        manager: {
                            id: managerId,
                            ...managerInfo,
                            isSuperAdmin
                        },
                        leaveRecords: {
                            approvedByManager: 0,
                            inManagerDepartment: 0,
                            totalInCompany: 0,
                            distinctEmployees: 0,
                            departmentCounts: {},
                            byYear: {},
                            employeeImages: {}
                        },
                        error: "No department assigned to this manager"
                    }
                });
            }
        } else if (isSuperAdmin) {
            console.log("SuperAdmin access - showing all departments");
        }
        
        const companyRecords = await LeaveRecords.find(companyRecordsQuery).lean();
        
        // Check departments in the records to make sure filtering worked
        if (companyRecords.length > 0) {
            const departments = [...new Set(companyRecords.map(r => r.department))];
            console.log("Departments in filtered records:", departments);
        }
        
        // Group records by year
        const recordsByYear = {};
        
        companyRecords.forEach(record => {
            let year = null;
            
            // Try to extract year from requestDate first
            if (record.requestDate) {
                // Check for YYYY-MM-DD format
                if (/^\d{4}-\d{2}-\d{2}/.test(record.requestDate)) {
                    year = record.requestDate.substring(0, 4);
                }
                // Check for DD-MM-YYYY format
                else if (/^\d{2}-\d{2}-\d{4}$/.test(record.requestDate)) {
                    year = record.requestDate.substring(6, 10);
                }
            }
            
            // If year is still null, try leaveStartDate
            if (!year && record.leaveStartDate) {
                // Check for YYYY-MM-DD format
                if (/^\d{4}-\d{2}-\d{2}/.test(record.leaveStartDate)) {
                    year = record.leaveStartDate.substring(0, 4);
                }
                // Check for DD-MM-YYYY format
                else if (/^\d{2}-\d{2}-\d{4}$/.test(record.leaveStartDate)) {
                    year = record.leaveStartDate.substring(6, 10);
                }
            }
            
            // If we found a year, add to the appropriate bucket
            if (year) {
                if (!recordsByYear[year]) {
                    recordsByYear[year] = {
                        count: 0,
                        records: []
                    };
                }
                recordsByYear[year].count++;
                recordsByYear[year].records.push({
                    id: record._id.toString(),
                    employee: record.fullName,
                    department: record.department,
                    daysUsed: record.daysUsed,
                    startDate: record.leaveStartDate,
                    endDate: record.leaveEndDate,
                    requestDate: record.requestDate,
                    approver: record.leaveApprover,
                    employeeImage: record.employeeImage || '' // Include employee image from record if available
                });
            }
        });
        
        // Get employee images for employees in results
        const employeeIds = [...new Set(companyRecords.map(r => r.userId?.toString()))].filter(Boolean);
        const employeeImages = {};
        
        if (employeeIds.length > 0) {
            const employees = await Employee.find(
                { _id: { $in: employeeIds } },
                { _id: 1, profilePhoto: 1, name: 1, isManager: 1 }
            ).lean();
            
            employees.forEach(emp => {
                employeeImages[emp._id.toString()] = {
                    profilePhoto: emp.profilePhoto || '',
                    name: emp.name,
                    isManager: emp.isManager || false
                };
            });
        }
        
        // Create a summary of the company data
        const departmentCounts = {};
        companyRecords.forEach(record => {
            if (record.department) {
                if (!departmentCounts[record.department]) {
                    departmentCounts[record.department] = 0;
                }
                departmentCounts[record.department]++;
            }
        });
        
        // Get a list of distinct employees who have taken leave
        const distinctEmployees = [...new Set(companyRecords.map(r => r.userId?.toString()))].filter(Boolean);
        
        // Prepare the response with diagnostic information
        const response = {
            manager: {
                id: managerId,
                ...managerInfo,
                isSuperAdmin
            },
            leaveRecords: {
                approvedByManager: approvedByManager.length,
                inManagerDepartment: departmentRecords.length,
                totalInCompany: companyRecords.length,
                distinctEmployees: distinctEmployees.length,
                departmentCounts,
                byYear: recordsByYear,
                employeeImages: employeeImages
            },
            timestamps: {
                currentTime: new Date().toISOString(),
                currentYear: new Date().getFullYear()
            },
            accessLevel: isSuperAdmin ? 'superadmin' : (isManager ? 'manager' : 'employee'),
            managerDepartment: managerDepartment
        };
        
        res.status(200).json({
            status: 200,
            success: true,
            data: response
        });
        
    } catch (error) {
        console.error("Error in manager leave stats:", error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || "Internal server error"
        });
    }
};

export default managerLeaveStats; 