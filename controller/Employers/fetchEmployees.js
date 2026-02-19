


// import dotenv from 'dotenv';
// import Employee from '../../model/Employees';
// import EmployeeTable from '../../model/EmployeeTable';
// import Company from '../../model/Company';

// dotenv.config();

// /**
//  * Fetch employees with advanced filtering and optional pagination
//  * Supports both employee and company (super admin) access
//  */
// const fetchEmployees = async (req, res) => {
//     try {
//         const {
//             page,
//             limit,
//             firstName,
//             lastName,
//             managerName,
//             companyName,
//             department,
//             designation,
//             employeeCode,
//             gender,
//             email,
//             employmentStartDate,
//             search
//         } = req.query;

//         const userId = req.payload.id;

//         // Parse pagination parameters
//         const pageNum = page && page !== 'undefined' ? Math.max(1, parseInt(page)) : null;
//         const limitNum = limit && limit !== 'undefined' ? Math.min(100, Math.max(1, parseInt(limit))) : null;
//         const isPaginated = pageNum !== null && limitNum !== null;

//         // Build filter query
//         const filterQuery = {};

//         // Handle search (searches across multiple fields)
//         if (search && search !== 'undefined' && search !== '') {
//             filterQuery.$or = [
//                 { firstName: { $regex: search, $options: 'i' } },
//                 { lastName: { $regex: search, $options: 'i' } },
//                 { fullName: { $regex: search, $options: 'i' } },
//                 { email: { $regex: search, $options: 'i' } },
//                 { employeeCode: { $regex: search, $options: 'i' } },
//                 { department: { $regex: search, $options: 'i' } },
//                 { designation: { $regex: search, $options: 'i' } }
//             ];
//         } else {
//             // Individual field filters (only if no search)
//             if (firstName) filterQuery.firstName = { $regex: firstName, $options: 'i' };
//             if (lastName) filterQuery.lastName = { $regex: lastName, $options: 'i' };
//         }

//         // Additional filters
//         if (managerName) filterQuery.managerName = { $regex: managerName, $options: 'i' };
//         if (companyName) filterQuery.companyName = { $regex: companyName, $options: 'i' };
//         if (department) filterQuery.department = { $regex: department, $options: 'i' };
//         if (designation) filterQuery.designation = { $regex: designation, $options: 'i' };
//         if (employeeCode) filterQuery.employeeCode = { $regex: employeeCode, $options: 'i' };
//         if (gender) filterQuery.gender = { $regex: gender, $options: 'i' };
//         if (email) filterQuery.email = { $regex: email, $options: 'i' };
//         if (employmentStartDate) filterQuery.employmentStartDate = employmentStartDate;

//         // Determine user type and set company filter (parallel queries)
//         const [employee, company, employeeTable] = await Promise.all([
//             Employee.findById(userId).select('companyId').lean(),
//             Company.findById(userId).lean(),
//             EmployeeTable.find().lean()
//         ]);

//         // Set company filter based on user type
//         if (employee) {
//             filterQuery.companyId = employee.companyId;
//         } else if (company) {
//             filterQuery.companyId = userId;
//         } else {
//             return res.status(404).json({
//                 status: 404,
//                 success: false,
//                 error: 'User not found'
//             });
//         }

//         // Execute query based on pagination
//         let employeeData;
//         let totalCount;

//         if (isPaginated) {
//             // Paginated query
//             const skip = (pageNum - 1) * limitNum;
            
//             [employeeData, totalCount] = await Promise.all([
//                 Employee.find(filterQuery)
//                     .sort({ _id: -1 })
//                     .limit(limitNum)
//                     .skip(skip)
//                     .select('-password -__v')
//                     .lean()
//                     .exec(),
//                 Employee.countDocuments(filterQuery)
//             ]);
//         } else {
//             // Non-paginated query (return all)
//             employeeData = await Employee.find(filterQuery)
//                 .sort({ _id: -1 })
//                 .select('-password -__v')
//                 .lean()
//                 .exec();
            
//             totalCount = employeeData.length;
//         }

//         // Build response
//         const response = {
//             status: 200,
//             success: true,
//             employeeTable,
//             data: employeeData,
//             totalRecords: totalCount,
//             filters: {
//                 search,
//                 firstName,
//                 lastName,
//                 managerName,
//                 companyName,
//                 department,
//                 designation,
//                 employeeCode,
//                 gender,
//                 email,
//                 employmentStartDate
//             }
//         };

//         // Add pagination info if paginated
//         if (isPaginated) {
//             const totalPages = Math.ceil(totalCount / limitNum);
//             response.pagination = {
//                 total: totalCount,
//                 totalPages: totalPages,
//                 currentPage: pageNum,
//                 limit: limitNum,
//                 hasNextPage: pageNum < totalPages,
//                 hasPrevPage: pageNum > 1
//             };
//         }

//         // Add message if no results
//         if (employeeData.length === 0) {
//             response.message = 'No employees found matching the criteria';
//         }

//         return res.status(200).json(response);

//     } catch (error) {
//         console.error('Error fetching employees:', error);

//         // Handle specific errors
//         if (error.name === 'CastError' && error.kind === 'ObjectId') {
//             return res.status(400).json({
//                 status: 400,
//                 success: false,
//                 error: 'Invalid ID format'
//             });
//         }

//         return res.status(500).json({
//             status: 500,
//             success: false,
//             error: 'Failed to fetch employees',
//             message: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// export default fetchEmployees;

import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import EmployeeTable from '../../model/EmployeeTable';
import Company from '../../model/Company';

dotenv.config();

/** True if string looks like a MongoDB ObjectId (24 hex chars) */
const isObjectId = (str) => typeof str === 'string' && /^[a-fA-F0-9]{24}$/.test(str);

/**
 * Fetch employees with comprehensive filtering and pagination
 * Filter Options: Department ID, Designation ID, Employment status, Employment type,
 * Company, Location, Manager ID, Hire date range, Termination date range, Gender, Nationality
 * Frontend may send department=ObjectId and designation=ObjectId; we treat those as IDs.
 */
const fetchEmployees = async (req, res) => {
    try {
        const {
            page,
            limit,
            // Name filters
            firstName,
            lastName,
            search,
            // Job filters - ID-based (RECOMMENDED)
            departmentId, // Department schema reference
            designationId, // Designation schema reference
            managerId, // Manager reference
            // Job filters - Name-based (Backward compatibility)
            department, // Deprecated - use departmentId
            designation, // Deprecated - use designationId
            managerName, // Deprecated - use managerId
            employeeCode,
            // Employment filters
            employmentStatus, // Active, Inactive, Suspended
            employmentType, // Full-time, Part-time, Contract, Intern
            // Location filters
            location,
            city,
            country,
            // Personal filters
            gender,
            nationality,
            maritalStatus,
            // Date filters
            hireStartDate, // Employment start date range
            hireEndDate,
            terminationStartDate, // Termination date range
            terminationEndDate,
            // Company filter
            companyName,
            // Sorting
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const userId = req.payload.id;

        // Parse pagination
        const pageNum = page && page !== 'undefined' ? Math.max(1, parseInt(page)) : 1;
        const limitNum = limit && limit !== 'undefined' ? Math.min(100, Math.max(1, parseInt(limit))) : 10;
        const isPaginated = page !== undefined && limit !== undefined;
        const skip = (pageNum - 1) * limitNum;

        // Determine user type and set company filter
        const [employee, company, employeeTable] = await Promise.all([
            Employee.findById(userId).select('companyId').lean(),
            Company.findById(userId).lean(),
            EmployeeTable.find().lean()
        ]);

        if (!employee && !company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'User not found'
            });
        }

        // Build filter query - normalize companyId to string for consistent matching
        const companyIdFilter = employee ? String(employee.companyId) : String(userId);
        const filterQuery = {
            companyId: companyIdFilter
        };

        // Search across multiple fields
        if (search && search !== 'undefined' && search !== '') {
            filterQuery.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { employeeCode: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } }
            ];
        } else {
            // Individual field filters
            if (firstName) filterQuery.firstName = { $regex: firstName, $options: 'i' };
            if (lastName) filterQuery.lastName = { $regex: lastName, $options: 'i' };
        }

        // Job filters - frontend often sends department=ObjectId and designation=ObjectId
        if (departmentId || (department && isObjectId(department))) {
            filterQuery.departmentId = String(departmentId || department);
        } else if (department) {
            filterQuery.department = { $regex: department, $options: 'i' };
        }

        if (designationId || (designation && isObjectId(designation))) {
            filterQuery.designationId = String(designationId || designation);
        } else if (designation) {
            filterQuery.designation = { $regex: designation, $options: 'i' };
        }

        if (managerId) {
            // ✅ RECOMMENDED: Filter by manager ID
            filterQuery.managerId = managerId;
        } else if (managerName) {
            // ⚠️ FALLBACK: Filter by manager name (for backward compatibility)
            filterQuery.managerName = { $regex: managerName, $options: 'i' };
        }

        if (employeeCode) filterQuery.employeeCode = { $regex: employeeCode, $options: 'i' };

        // Employment filters
        if (employmentStatus) filterQuery.employmentStatus = employmentStatus;
        if (employmentType) filterQuery.employmentType = employmentType;

        // Location filters
        if (location) filterQuery.location = { $regex: location, $options: 'i' };
        if (city) filterQuery.city = { $regex: city, $options: 'i' };
        if (country) filterQuery.country = { $regex: country, $options: 'i' };

        // Personal filters
        if (gender) filterQuery.gender = gender;
        if (nationality) filterQuery.nationality = { $regex: nationality, $options: 'i' };
        if (maritalStatus) filterQuery.maritalStatus = maritalStatus;

        // Company filter
        if (companyName) filterQuery.companyName = { $regex: companyName, $options: 'i' };

        // Date range filters - Hire date
        if (hireStartDate || hireEndDate) {
            filterQuery.employmentStartDate = {};
            if (hireStartDate) {
                filterQuery.employmentStartDate.$gte = new Date(hireStartDate);
            }
            if (hireEndDate) {
                filterQuery.employmentStartDate.$lte = new Date(hireEndDate);
            }
        }

        // Date range filters - Termination date
        if (terminationStartDate || terminationEndDate) {
            filterQuery.terminationDate = {};
            if (terminationStartDate) {
                filterQuery.terminationDate.$gte = new Date(terminationStartDate);
            }
            if (terminationEndDate) {
                filterQuery.terminationDate.$lte = new Date(terminationEndDate);
            }
        }

        // Build sort options
        const sortDirection = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
        const sortOptions = { [sortBy]: sortDirection };

        // Execute query
        let employeeData, totalCount;

        if (isPaginated) {
            [employeeData, totalCount] = await Promise.all([
                Employee.find(filterQuery)
                    .sort(sortOptions)
                    .limit(limitNum)
                    .skip(skip)
                    .select('-password -__v')
                    .populate('departmentId', 'departmentName')
                    .populate('designationId', 'designationName')
                    .populate('managerId', 'firstName lastName fullName')
                    .lean()
                    .exec(),
                Employee.countDocuments(filterQuery)
            ]);
        } else {
            employeeData = await Employee.find(filterQuery)
                .sort(sortOptions)
                .select('-password -__v')
                .populate('departmentId', 'departmentName')
                .populate('designationId', 'designationName')
                .populate('managerId', 'firstName lastName fullName')
                .lean()
                .exec();
            totalCount = employeeData.length;
        }

        // Build response
        const response = {
            status: 200,
            success: true,
            employeeTable,
            data: employeeData,
            totalRecords: totalCount,
            filters: {
                search,
                firstName,
                lastName,
                departmentId,
                department,
                designationId,
                designation,
                employeeCode,
                managerId,
                managerName,
                employmentStatus,
                employmentType,
                location,
                city,
                country,
                gender,
                nationality,
                maritalStatus,
                hireStartDate,
                hireEndDate,
                terminationStartDate,
                terminationEndDate,
                companyName
            }
        };

        if (isPaginated) {
            const totalPages = Math.ceil(totalCount / limitNum);
            response.pagination = {
                total: totalCount,
                totalPages,
                currentPage: pageNum,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            };
        }

        if (employeeData.length === 0) {
            response.message = 'No employees found matching the criteria';
        }

        return res.status(200).json(response);

    } catch (error) {
        console.error('Error fetching employees:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Failed to fetch employees',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default fetchEmployees;