import dotenv from 'dotenv';
import Company from '../../model/Company';

dotenv.config();

const fetchCompany = async (req, res) => {
    try {
        const companyId = req.payload?.id;
        const email = req.payload?.email;

        const company = await Company.findOne({
            $or: [{ _id: companyId }, { email: email }],
        });

        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'This account has not registered a company',
            });
        }

        const data = {
            _id: company._id,
            companyName: company.companyName || '',
            email: company.email,
            superAdminEmail: company.email,
            dateJoined: company.createdAt || company.dateCreated || new Date(),
            companyAddress: company.companyAddress || '',
            country: company.country || 'Nigeria',
            state: company.state || '',
            city: company.city || '',
            language: company.language || 'English',
            currency: company.currency || 'USD',
            companyLogo: company.companyLogo || '',
            industry: company.industry || '',
            companySize: company.companySize || '',
            accountType: company.accountType || 'Company',
            generalSettings: company.generalSettings || {},
            activeStatus: company.activeStatus,
            status: company.status,
            onboardingCompleted: company.onboardingCompleted,
        };

        return res.status(200).json({
            status: 200,
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error in fetchCompany:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error,
        });
    }
};

export default fetchCompany;
