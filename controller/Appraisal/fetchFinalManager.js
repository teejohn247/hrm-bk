import dotenv from 'dotenv';
import AppraisalData from '../../model/AppraisalData';
import Company from '../../model/Company';
import Employee from '../../model/Employees';

dotenv.config();

/**
 * Fetch appraisal data with role-based access control
 * @route GET /api/appraisal/finalManager/:id
 * @access Private
 */
const fetchFinalManager = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const { id } = req.params; // appraisalPeriodId
        
        // Find the user making the request
        const company = await Company.findById(req.payload.id);
        const employee = await Employee.findOne({ _id: req.payload.id });
        
        // Determine if user is a superAdmin
        const isSuperAdmin = company && company.isSuperAdmin;
        
        // Base pagination options
        const paginationOptions = {
            sort: { _id: -1 },
            limit: limit * 1,
            skip: (page - 1) * limit
        };

        let query = { appraisalPeriodId: id };
        let countQuery = { appraisalPeriodId: id };
        
        // Apply appropriate filters based on user role
        if (company) {
            // User is a company/superAdmin - can see all requests for the company
            query.companyId = company._id;
            countQuery.companyId = company._id;
        } else if (employee && employee.isManager) {
            // User is a manager - can only see requests from their department
            query.department = employee.department;
            query.companyId = employee.companyId;
            countQuery.department = employee.department;
            countQuery.companyId = employee.companyId;
        } else {
            // Regular employee - should only see their own data
            query.employeeId = req.payload.id;
            countQuery.employeeId = req.payload.id;
        }
        
        // Execute the query with pagination
        const appraisalData = await AppraisalData.find(query)
            .sort(paginationOptions.sort)
            .limit(paginationOptions.limit)
            .skip(paginationOptions.skip)
            .exec();
            
        // Get the total count for pagination
        const count = await AppraisalData.find(countQuery).countDocuments();
        
        return res.status(200).json({
            status: 200,
            success: true,
            data: appraisalData,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            isSuperAdmin: !!isSuperAdmin, // Include flag for frontend to know the user's role
            isManager: employee ? !!employee.isManager : false
        });
    } catch (error) {
        console.error('Error fetching appraisal data:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Server error'
        });
    }
};

export default fetchFinalManager;



