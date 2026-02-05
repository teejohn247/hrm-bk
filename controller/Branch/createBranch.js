import dotenv from 'dotenv';
import Branch from '../../model/Branch';
import Company from '../../model/Company';

dotenv.config();

const createBranch = async (req, res) => {
    try {
        const { 
            branchName, 
            branchCode, 
            branchAddress, 
            contactInfo,
            branchManager,
            departments,
            isHeadOffice 
        } = req.body;

        // Validate required fields
        if (!branchName || branchName === "") {
            return res.status(400).json({
                status: 400,
                error: "Branch name is required"
            });
        }

        if (!branchCode || branchCode === "") {
            return res.status(400).json({
                status: 400,
                error: "Branch code is required"
            });
        }

        // Get company details
        const company = await Company.findOne({ _id: req.payload.id });
        
        if (!company) {
            return res.status(400).json({
                status: 400,
                error: "Company not found"
            });
        }

        // Check if branch code already exists
        const existingBranch = await Branch.findOne({ 
            branchCode: branchCode,
            companyId: company._id
        });

        if (existingBranch) {
            return res.status(400).json({
                status: 400,
                error: "Branch code already exists"
            });
        }

        // Create branch
        const branch = new Branch({
            branchName,
            branchCode,
            branchAddress: branchAddress || {},
            contactInfo: contactInfo || {},
            companyId: company._id,
            companyName: company.companyName,
            branchManager: branchManager || {},
            employees: [],
            departments: departments || [],
            isActive: true,
            isHeadOffice: isHeadOffice || false,
            createdBy: req.payload.id
        });

        await branch.save();

        res.status(200).json({
            status: 200,
            success: true,
            data: branch,
            message: "Branch created successfully"
        });

    } catch (error) {
        console.error('Error creating branch:', error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error
        });
    }
};

export default createBranch;
