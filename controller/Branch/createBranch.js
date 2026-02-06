// import dotenv from 'dotenv';
// import Branch from '../../model/Branch';
// import Company from '../../model/Company';

// dotenv.config();

// const createBranch = async (req, res) => {
//     try {
//         const { 
//             branchName, 
//             branchCode, 
//             branchAddress, 
//             contactInfo,
//             branchManager,
//             branchAdmin,
//             departments,
//             isHeadOffice 
//         } = req.body;

//         // Validate required fields
//         if (!branchName || branchName === "") {
//             return res.status(400).json({
//                 status: 400,
//                 error: "Branch name is required"
//             });
//         }

//         if (!branchCode || branchCode === "") {
//             return res.status(400).json({
//                 status: 400,
//                 error: "Branch code is required"
//             });
//         }

//         // Get company details
//         const company = await Company.findOne({ _id: req.payload.id });
        
//         if (!company) {
//             return res.status(400).json({
//                 status: 400,
//                 error: "Company not found"
//             });
//         }

//         // Check if branch code already exists
//         const existingBranch = await Branch.findOne({ 
//             branchCode: branchCode,
//             companyId: company._id
//         });

//         if (existingBranch) {
//             return res.status(400).json({
//                 status: 400,
//                 error: "Branch code already exists"
//             });
//         }

//         // Create branch
//         const branch = new Branch({
//             branchName,
//             branchCode,
//             branchAddress: branchAddress || {},
//             contactInfo: contactInfo || {},
//             companyId: company._id,
//             companyName: company.companyName,
//             branchManager: branchManager || {},
//             branchAdmin: branchAdmin || {},
//             employees: [],
//             departments: departments || [],
//             isActive: true,
//             isHeadOffice: isHeadOffice || false,
//             createdBy: req.payload.id
//         });

//         await branch.save();

//         res.status(200).json({
//             status: 200,
//             success: true,
//             data: branch,
//             message: "Branch created successfully"
//         });

//     } catch (error) {
//         console.error('Error creating branch:', error);
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error.message || error
//         });
//     }
// };

// export default createBranch;


import dotenv from 'dotenv';
import Branch from '../../model/Branch';
import Company from '../../model/Company';
import Employee from '../../model/Employees';

dotenv.config();

const createBranch = async (req, res) => {
    try {
        const { 
            branchName, 
            branchCode, 
            branchAddress, 
            contactInfo,
            branchManagerId,
            branchAdminId,
            departments,
            isHeadOffice 
        } = req.body;

        const companyId = req.payload.id;

        // Validate required fields
        if (!branchName || branchName.trim() === "") {
            return res.status(400).json({
                status: 400,
                success: false,
                error: "Branch name is required"
            });
        }

        if (!branchCode || branchCode.trim() === "") {
            return res.status(400).json({
                status: 400,
                success: false,
                error: "Branch code is required"
            });
        }

        // Get company details
        const company = await Company.findOne({ _id: companyId });
        
        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: "Company not found"
            });
        }

        // Check if branch code already exists
        const existingBranch = await Branch.findOne({ 
            branchCode: branchCode.trim(),
            companyId: companyId
        });

        if (existingBranch) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: "Branch code already exists"
            });
        }

        // Validate and get branch manager details if provided
        let branchManager = {};
        if (branchManagerId) {
            console.log(branchManagerId);
            const managerEmployee = await Employee.findOne({ _id: branchManagerId });

            console.log(managerEmployee);
            
            if (!managerEmployee) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: "Branch manager employee not found"
                });
            }

            if (managerEmployee.companyId.toString() !== companyId.toString()) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: "Branch manager does not belong to this company"
                });
            }

            branchManager = {
                managerId: managerEmployee._id.toString(),
                managerName: managerEmployee.fullName || `${managerEmployee.firstName} ${managerEmployee.lastName}`
            };
        }

        // Validate and get branch admin details if provided
        let branchAdmin = {};
        if (branchAdminId) {
            const adminEmployee = await Employee.findOne({ _id: branchAdminId });
            
            if (!adminEmployee) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: "Branch admin employee not found"
                });
            }

            if (adminEmployee.companyId.toString() !== companyId.toString()) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: "Branch admin does not belong to this company"
                });
            }

            branchAdmin = {
                adminId: adminEmployee._id.toString(),
                adminName: adminEmployee.fullName || `${adminEmployee.firstName} ${adminEmployee.lastName}`
            };
        }

        // Create branch
        const branch = new Branch({
            branchName: branchName.trim(),
            branchCode: branchCode.trim(),
            branchAddress: branchAddress || {},
            contactInfo: contactInfo || {},
            companyId: companyId.toString(),
            companyName: company.companyName,
            branchManager,
            branchAdmin,
            employees: [],
            departments: departments || [],
            isActive: true,
            isHeadOffice: isHeadOffice || false,
            createdBy: req.payload.id.toString()
        });

        const savedBranch = await branch.save();

        console.log(`Branch "${branchName}" created successfully for company "${company.companyName}"`);

        return res.status(200).json({
            status: 200,
            success: true,
            data: savedBranch,
            message: "Branch created successfully"
        });

    } catch (error) {
        console.error('Error creating branch:', {
            error: error.message,
            stack: error.stack,
            companyId: req.payload?.id,
            branchName: req.body?.branchName
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
                error: 'Duplicate branch code',
                details: 'A branch with this code already exists'
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while creating the branch'
        });
    }
};

export default createBranch;