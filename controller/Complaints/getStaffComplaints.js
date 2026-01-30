import dotenv from 'dotenv';
import UserComplaint from '../../model/UserComplaint';
import Employee from '../../model/Employees';
import Company from '../../model/Company';

dotenv.config();

/**
 * Controller for superadmins to get all complaints from their staff members
 * @route GET /api/complaints/staff
 * @description Returns all complaints from staff members in the company (superadmin only)
 */
const getStaffComplaints = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, issueCategory, departmentId, employeeId } = req.query;
        const userId = req.payload.id;
        
        // Check if current user is a superadmin
        let isSuperAdmin = false;
        let companyId;
        
        // First check if it's a company account
        const company = await Company.findOne({ _id: userId });
        
        if (company) {
            isSuperAdmin = company.isSuperAdmin || false;
            companyId = company._id;
        } else {
            // Check if it's an employee with superadmin rights
            const employee = await Employee.findOne({ _id: userId });
            
            if (!employee) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'User not found'
                });
            }
            
            isSuperAdmin = employee.isSuperAdmin || false;
            companyId = employee.companyId;
        }
        
        // Verify user is a superadmin
        if (!isSuperAdmin) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'Only superadmins can access staff complaints'
            });
        }
        
        // Build query to find all complaints in the company
        const query = { 
            companyId: companyId,
            isDeleted: false 
        };
        
        // Apply filters if provided
        if (status) {
            query.status = status;
        }
        
        if (issueCategory) {
            query.issueCategory = issueCategory;
        }
        
        // Filter by specific employee if requested
        if (employeeId) {
            query.userId = employeeId;
        }
        
        // Filter by department if requested (needs an additional query)
        let departmentEmployeeIds = [];
        if (departmentId) {
            // Find all employees in the department
            const departmentEmployees = await Employee.find({ 
                companyId: companyId,
                departmentId: departmentId 
            }).select('_id');
            
            departmentEmployeeIds = departmentEmployees.map(emp => emp._id.toString());
            
            if (departmentEmployeeIds.length > 0) {
                // Add to query - complaints created by employees in this department
                query.userId = { $in: departmentEmployeeIds };
            }
        }
        
        // Execute query with pagination
        const complaints = await UserComplaint.find(query)
            .sort({ createdAt: -1 }) // Most recent first
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .exec();
            
        // Get total count for pagination
        const totalComplaints = await UserComplaint.countDocuments(query);
        
        // Format response data
        const formattedComplaints = complaints.map(complaint => ({
            id: complaint._id,
            userFullName: complaint.userFullName,
            userEmail: complaint.userEmail,
            companyName: complaint.companyName,
            description: complaint.description,
            issueCategory: complaint.issueCategory,
            screenshots: complaint.screenshots || [], // Return array of screenshots
            status: complaint.status,
            createdAt: complaint.createdAt,
            updatedAt: complaint.updatedAt,
            assignedToName: complaint.assignedToName || null,
            assignedTo: complaint.assignedTo || null, // Include assignedTo for superadmins
            resolution: complaint.resolution || null,
            resolutionDate: complaint.resolutionDate || null,
            createdByRole: complaint.createdByRole || 'employee',
            userId: complaint.userId // Include userId for superadmins to identify the creator
        }));
        
        return res.status(200).json({
            status: 200,
            success: true,
            data: formattedComplaints,
            pagination: {
                totalComplaints,
                totalPages: Math.ceil(totalComplaints / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            },
            filters: {
                departmentFiltered: departmentId ? true : false,
                employeeFiltered: employeeId ? true : false,
                statusFiltered: status ? true : false,
                categoryFiltered: issueCategory ? true : false
            }
        });
        
    } catch (error) {
        console.error('Error fetching staff complaints:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An error occurred while fetching staff complaints'
        });
    }
};

export default getStaffComplaints; 