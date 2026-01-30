import LeaveRecords from '../../model/LeaveRecords';
import Employee from '../../model/Employees';
import { parseDate, formatDateDDMMYYYY } from '../../utils/dateUtils';

const leaveRecordsDetails = async (req, res) => {
    try {
        // Get current year or use the one from query
        const currentYear = new Date().getFullYear();
        const queryYear = req.query.year ? parseInt(req.query.year) : currentYear;
        
        // Debug the JWT payload
        console.log("===== JWT PAYLOAD DEBUG =====");
        console.log(JSON.stringify(req.payload, null, 2));
        console.log("============================");
        
        // IMPORTANT: The JWT token shows that companyId is separate from id
        // In the token, id is the user's ID, while companyId is the company they belong to
        const userId = req.payload.id;
        const companyId = req.payload.companyId; // This is the correct company ID
        const isSuperAdmin = req.payload.isSuperAdmin === true;
        
        console.log(`Using company ID: ${companyId} and user ID: ${userId}, isSuperAdmin: ${isSuperAdmin}`);
        
        // UPDATED APPROACH: Always fetch employee record to determine manager status and department
        let departmentFilter = null;
        let managerDepartment = null;
        let isManager = false;
        
        try {
            console.log(`Finding employee record for user ${userId}...`);
            const employee = await Employee.findOne({ _id: userId });
            
            // Check if employee record exists
            if (!employee) {
                console.error(`ERROR: Employee with ID ${userId} not found in Employee collection!`);
            } else {
                console.log("Found employee record:", {
                    id: employee._id,
                    name: employee.name,
                    email: employee.email,
                    department: employee.department,
                    departmentType: typeof employee.department,
                    isManager: employee.isManager
                });
                
                // Get manager status directly from employee record
                isManager = employee.isManager === true;
                
                // If employee is a manager and not a superadmin, get their department for filtering
                if (isManager && !isSuperAdmin) {
                    // Check for department field
                    if (!employee.department) {
                        console.error(`ERROR: Manager ${employee.name} (${userId}) has no department assigned!`);
                    } else if (typeof employee.department !== 'string') {
                        console.error(`ERROR: Manager's department is not a string! Type: ${typeof employee.department}`);
                    } else {
                        console.log(`SUCCESS: Manager ${employee.name} has department: ${employee.department}`);
                        departmentFilter = employee.department;
                        managerDepartment = employee.department;
                    }
                }
            }
        } catch (dbError) {
            console.error("Database error finding employee:", dbError);
        }
        
        // HARD FAIL: If manager has no department, force an empty result
        if (isManager && !isSuperAdmin && !departmentFilter) {
            console.error(`SECURITY ENFORCEMENT: Manager ${userId} has no department - returning empty results`);
            return res.status(200).json({
                status: 200,
                success: true,
                data: [
                    { group: "0-7 days", employees: [] },
                    { group: "8-14 days", employees: [] },
                    { group: "15-21 days", employees: [] },
                    { group: "21+ days", employees: [] }
                ],
                year: queryYear,
                isManager: isManager,
                message: "No department assigned to this manager"
            });
        }
        
        // Build the base match stage using the correct company ID
        const matchStage = {
            status: "Approved",
            companyId: companyId // Use companyId from JWT, not id
        };
        
        // Add department filter for managers - only if they're not superadmin
        if (departmentFilter && !isSuperAdmin) {
            matchStage.department = departmentFilter;
            console.log(`Filtering by department: ${departmentFilter}`);
        } else if (isSuperAdmin) {
            console.log("SuperAdmin access - showing all departments");
        } else if (isManager) {
            console.error("CRITICAL ERROR: Manager has no department filter but no protective return was triggered!");
            // This is a fail-safe. We should never reach this code due to the early return above.
            return res.status(200).json({
                status: 200,
                success: true,
                data: [
                    { group: "0-7 days", employees: [] },
                    { group: "8-14 days", employees: [] },
                    { group: "15-21 days", employees: [] },
                    { group: "21+ days", employees: [] }
                ],
                year: queryYear,
                isManager: isManager,
                message: "No department assigned to this manager (fail-safe triggered)"
            });
        }

        console.log("Using match criteria:", JSON.stringify(matchStage, null, 2));

        // First, get all records to check what we're working with
        const allRecords = await LeaveRecords.find(matchStage).lean();
        
        console.log(`Found ${allRecords.length} total leave records for company ${companyId}`);
        
        // Log sample date formats to diagnose
        if (allRecords.length > 0) {
            const sampleRecord = allRecords[0];
            console.log("Sample record date formats:", {
                requestDate: sampleRecord.requestDate,
                leaveStartDate: sampleRecord.leaveStartDate,
                leaveEndDate: sampleRecord.leaveEndDate,
                department: sampleRecord.department
            });
            
            // Check departments in the records to make sure filtering worked
            const departments = [...new Set(allRecords.map(r => r.department))];
            console.log("Departments in filtered records:", departments);
        }
        
        // Get employee images for all employees in the result
        const employeeIds = [...new Set(allRecords.map(record => record.userId))];
        const employeeImageMap = {};
        
        if (employeeIds.length > 0) {
            const employees = await Employee.find(
                { _id: { $in: employeeIds } },
                { _id: 1, profilePhoto: 1, name: 1 }
            ).lean();
            
            employees.forEach(emp => {
                employeeImageMap[emp._id.toString()] = emp.profilePhoto || '';
            });
            
            console.log(`Fetched ${employees.length} employee images`);
        }
        
        // Use JavaScript to filter by year and group results
        // Step 1: Filter records by year
        const recordsForYear = allRecords.filter(record => {
            // Check requestDate first (if it exists)
            if (record.requestDate) {
                // For YYYY-MM-DD or YYYY-MM-DD... format
                if (record.requestDate.startsWith(queryYear.toString())) {
                    return true;
                }
                
                // For DD-MM-YYYY format
                if (record.requestDate.endsWith(queryYear.toString())) {
                    return true;
                }
            }
            
            // Check leaveStartDate if it exists
            if (record.leaveStartDate) {
                // For YYYY-MM-DD or YYYY-MM-DD... format
                if (record.leaveStartDate.startsWith(queryYear.toString())) {
                    return true;
                }
                
                // For DD-MM-YYYY format
                if (record.leaveStartDate.endsWith(queryYear.toString())) {
                    return true;
                }
            }
            
            return false;
        });
        
        console.log(`Filtered to ${recordsForYear.length} records for year ${queryYear}`);
        
        // Step 2: Group by employee and sum days
        const employeeMap = {};
        
        recordsForYear.forEach(record => {
            const employeeId = record.userId.toString();
            
            // Use record's image if available or fallback to employeeImageMap
            const employeeImage = record.employeeImage || employeeImageMap[employeeId] || '';
            
            if (!employeeMap[employeeId]) {
                employeeMap[employeeId] = {
                    _id: employeeId,
                    totalDaysUsed: 0,
                    employeeName: record.fullName,
                    department: record.department,
                    employeeImage: employeeImage, // Set from record or map
                    leaveRecords: []
                };
            }
            
            // Add this record's days to the total
            employeeMap[employeeId].totalDaysUsed += (record.daysUsed || 0);
            
            // Add this record to the employee's records
            employeeMap[employeeId].leaveRecords.push(record);
        });
        
        // Convert the map to an array
        const employeeTotals = Object.values(employeeMap);
        
        console.log(`Grouped into ${employeeTotals.length} employees with leave records`);
        
        // Define day ranges
        const dayRanges = [
            { range: "0-7 days", min: 0, max: 7 },
            { range: "8-14 days", min: 8, max: 14 },
            { range: "15-21 days", min: 15, max: 21 },
            { range: "21+ days", min: 22, max: Number.MAX_SAFE_INTEGER }
        ];
        
        // Group employees by day ranges
        const result = dayRanges.map(rangeInfo => {
            // Filter employees that fall within this range
            const employeesInRange = employeeTotals.filter(emp => 
                emp.totalDaysUsed >= rangeInfo.min && emp.totalDaysUsed <= rangeInfo.max
            );
            
            // Format dates for each employee's records
            employeesInRange.forEach(employee => {
                if (employee.leaveRecords && employee.leaveRecords.length > 0) {
                    employee.leaveRecords.forEach(record => {
                        try {
                            // Format dates consistently
                            if (record.leaveStartDate) {
                                const startDate = parseDate(record.leaveStartDate);
                                if (startDate) {
                                    record.formattedStartDate = formatDateDDMMYYYY(startDate);
                                }
                            }
                            
                            if (record.leaveEndDate) {
                                const endDate = parseDate(record.leaveEndDate);
                                if (endDate) {
                                    record.formattedEndDate = formatDateDDMMYYYY(endDate);
                                }
                            }
                        } catch (error) {
                            console.error("Error processing dates for record:", record._id, error);
                        }
                    });
                }
            });
            
            return {
                group: rangeInfo.range,
                employees: employeesInRange
            };
        });
        
        // Log result counts
        console.log("Results by group:", result.map(r => ({ 
            group: r.group, 
            employeeCount: r.employees.length 
        })));

        res.status(200).json({
            status: 200,
            success: true,
            data: result,
            year: queryYear,
            isManager: isManager,
            recordsFound: recordsForYear.length,
            employeesFound: employeeTotals.length,
            managerDepartment: managerDepartment,
            isSuperAdmin: isSuperAdmin
        });
        
    } catch (error) {
        console.error("Error in leave records details:", error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || "Internal server error"
        });
    }
};

export default leaveRecordsDetails; 