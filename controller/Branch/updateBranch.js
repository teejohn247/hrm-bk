import dotenv from 'dotenv';
import Branch from '../../model/Branch';

dotenv.config();

const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            branchName, 
            branchCode, 
            branchAddress, 
            contactInfo,
            branchManager,
            employees,
            departments,
            isActive,
            isHeadOffice 
        } = req.body;

        if (!id) {
            return res.status(400).json({
                status: 400,
                error: "Branch ID is required"
            });
        }

        const branch = await Branch.findOne({ _id: id });

        if (!branch) {
            return res.status(404).json({
                status: 404,
                error: "Branch not found"
            });
        }

        // Check if branch code is being changed and if it already exists
        if (branchCode && branchCode !== branch.branchCode) {
            const existingBranch = await Branch.findOne({ 
                branchCode: branchCode,
                companyId: branch.companyId,
                _id: { $ne: id }
            });

            if (existingBranch) {
                return res.status(400).json({
                    status: 400,
                    error: "Branch code already exists"
                });
            }
        }

        // Update fields if provided
        if (branchName) branch.branchName = branchName;
        if (branchCode) branch.branchCode = branchCode;
        if (branchAddress) branch.branchAddress = branchAddress;
        if (contactInfo) branch.contactInfo = contactInfo;
        if (branchManager) branch.branchManager = branchManager;
        if (employees) branch.employees = employees;
        if (departments) branch.departments = departments;
        if (isActive !== undefined) branch.isActive = isActive;
        if (isHeadOffice !== undefined) branch.isHeadOffice = isHeadOffice;

        await branch.save();

        res.status(200).json({
            status: 200,
            success: true,
            data: branch,
            message: "Branch updated successfully"
        });

    } catch (error) {
        console.error('Error updating branch:', error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error
        });
    }
};

export default updateBranch;
