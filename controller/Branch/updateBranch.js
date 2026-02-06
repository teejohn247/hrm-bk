import dotenv from 'dotenv';
import Branch from '../../model/Branch';
import Employee from '../../model/Employees';

dotenv.config();

const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            branchName, 
            branchCode, 
            branchAddress, 
            contactInfo,
            branchManagerId,
            branchAdminId,
            employees,
            departments,
            isActive,
            isHeadOffice 
        } = req.body;

        const companyId = req.payload.id;

        // Validate branch ID
        if (!id) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: "Branch ID is required"
            });
        }

        // Find the branch
        const branch = await Branch.findOne({ _id: id });

        if (!branch) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: "Branch not found"
            });
        }

        // Verify branch belongs to the company
        if (branch.companyId.toString() !== companyId.toString()) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: "You don't have permission to update this branch"
            });
        }

        // Check if branch code is being changed and if it already exists
        // if (branchCode && branchCode.trim() !== branch.branchCode) {
        //     const existingBranch = await Branch.findOne({ 
        //         branchCode: branchCode.trim(),
        //         companyId: branch.companyId,
        //         _id: { $ne: id }
        //     });

        //     if (existingBranch) {
        //         return res.status(400).json({
        //             status: 400,
        //             success: false,
        //             error: "Branch code already exists"
        //         });
        //     }
        // }

        // Validate and update branch manager if provided
        if (branchManagerId !== undefined) {
            if (branchManagerId === null || branchManagerId === '') {
                // Remove branch manager
                branch.branchManager = {};
            } else {
                const managerEmployee = await Employee.findOne({ _id: branchManagerId });
                
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

                branch.branchManager = {
                    managerId: managerEmployee._id.toString(),
                    managerName: managerEmployee.fullName || `${managerEmployee.firstName} ${managerEmployee.lastName}`
                };
            }
        }

        // Validate and update branch admin if provided
        if (branchAdminId !== undefined) {
            if (branchAdminId === null || branchAdminId === '') {
                // Remove branch admin
                branch.branchAdmin = {};
            } else {
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

                branch.branchAdmin = {
                    adminId: adminEmployee._id.toString(),
                    adminName: adminEmployee.fullName || `${adminEmployee.firstName} ${adminEmployee.lastName}`
                };
            }
        }

        // Update other fields if provided
        if (branchName && branchName.trim()) branch.branchName = branchName.trim();
        if (branchCode && branchCode.trim()) branch.branchCode = branchCode.trim();
        if (branchAddress) branch.branchAddress = branchAddress;
        if (contactInfo) branch.contactInfo = contactInfo;
        if (employees) branch.employees = employees;
        if (departments) branch.departments = departments;
        if (isActive !== undefined) branch.isActive = isActive;
        if (isHeadOffice !== undefined) branch.isHeadOffice = isHeadOffice;

        const updatedBranch = await branch.save();

        console.log(`Branch "${branch.branchName}" updated successfully`);

        return res.status(200).json({
            status: 200,
            success: true,
            data: updatedBranch,
            message: "Branch updated successfully"
        });

    } catch (error) {
        console.error('Error updating branch:', {
            error: error.message,
            stack: error.stack,
            branchId: req.params?.id,
            companyId: req.payload?.id
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
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while updating the branch'
        });
    }
};

export default updateBranch;