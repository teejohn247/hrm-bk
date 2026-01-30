import Company from '../../../model/Company';
import { validationResult } from 'express-validator';

const updateCompanyByCompany = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 400,
                errors: errors.array()
            });
        }

        const {
            companyName,
            // email,
            companyAddress,
            companyLogo,
            // generalSettings,
            // activeStatus,
            // status,
            // parollPeriodFrequency,
            industry,
            // systemRoles,
            singleSignOn,
            subDomain,
            // companyFeatures
        } = req.body;

        // Find company by ID
        let company = await Company.findById(req.params.id);
        
        if (!company) {
            return res.status(404).json({
                status: 404,
                error: 'Company not found'
            });
        }

        // Build company object with all possible fields from your schema
        const companyFields = {};
        if(singleSignOn){
            companyFields.singleSignOn = singleSignOn;
        }
        if (companyName) companyFields.companyName = companyName;
        // if (email) companyFields.email = email;
        if (companyAddress) companyFields.companyAddress = companyAddress;
        if (companyLogo) companyFields.companyLogo = companyLogo;
        // if (generalSettings) companyFields.generalSettings = generalSettings;
        // if (typeof activeStatus !== 'undefined') companyFields.activeStatus = activeStatus;
        // if (typeof status !== 'undefined') companyFields.status = status;
        // if (parollPeriodFrequency) companyFields.parollPeriodFrequency = parollPeriodFrequency;
        if (industry) companyFields.industry = industry;
        if (subDomain) companyFields.subDomain = subDomain;

        // if (systemRoles) {
        //     companyFields.systemRoles = {
        //         employeeManagement: systemRoles.employeeManagement || company.systemRoles.employeeManagement,
        //         accounting: systemRoles.accounting || company.systemRoles.accounting,
        //         projects: systemRoles.projects || company.systemRoles.projects,
        //         crm: systemRoles.crm || company.systemRoles.crm,
        //         supplyChain: systemRoles.supplyChain || company.systemRoles.supplyChain
        //     };
        // }
        // if (companyFeatures) {
        //     companyFields.companyFeatures = {
        //         subscriptionStatus: companyFeatures.subscriptionStatus || company.companyFeatures.subscriptionStatus,
        //         paymentInfo: companyFeatures.paymentInfo || company.companyFeatures.paymentInfo,
        //         modules: companyFeatures.modules || company.companyFeatures.modules
        //     };
        // }

        // Update company
        company = await Company.findByIdAndUpdate(
            req.params.id,
            { $set: companyFields },
            { new: true }
        );

        res.status(200).json({
            status: 200,
            success: true,
            message: "Company updated successfully",
            data: company
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            status: 500,
            error: 'Server Error'
        });
    }
};

export default updateCompanyByCompany;