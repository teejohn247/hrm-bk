import dotenv from 'dotenv';
import Company from '../../model/Company';
import AuditTrail from '../../model/AuditTrail';
import AppraisalGroup from '../../model/AppraisalGroup';
import bcrypt from 'bcrypt';
import createSubdomainForAmplifyApp from '../../config/sub-domain';
import Module from '../../model/Modules';

const sgMail = require('@sendgrid/mail');

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const createCompany = async (req, res) => {
    try {
        // Input validation
        const { companyName, companyAddress, generalSettings } = req.body;
        
        if (!companyName || typeof companyName !== 'string' || companyName.trim() === '') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Company name is required'
            });
        }
        
        // Check if user exists and has permission
        if (!req.payload || !req.payload.email || !req.payload.id) {
            return res.status(401).json({
                status: 401,
                success: false,
                error: 'Authentication required'
            });
        }
        
        // Find existing company with this email
        const company = await Company.findOne({ email: req.payload.email });
        
        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company account not found'
            });
        }
        
        // Check if company name is already set
        if (company.companyName) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'A company has already been registered on this account'
            });
        }
        
        // Generate subdomain name
        let companyNameAcronym = companyName.trim();
        if (companyNameAcronym.split(' ').length > 1) {
            const companyNameArray = companyNameAcronym.split(' ');
            companyNameAcronym = companyNameArray.map(word => word.charAt(0)).join('');
        }
        
        // Create subdomain
        // let subdomain;

        // try {
        //     subdomain = await createSubdomainForAmplifyApp(companyNameAcronym);
        //     if (!subdomain || !subdomain.prefix) {
        //         throw new Error('Failed to create subdomain');
        //     }
        // } catch (subdomainError) {
        //     console.error('Subdomain creation error:', subdomainError);
        //     return res.status(500).json({
        //         status: 500,
        //         success: false,
        //         error: 'Failed to create subdomain'
        //     });
        // }
        
        // const fullSubdomain = `${subdomain.prefix}.acehr.app`;
        
        // Get modules and transform them
        const modules = await Module.find({ companyId: req.payload.id });
        
        // Transform modules structure and set all permissions to false
        const transformedModules = modules.length > 0 ? 
            JSON.parse(JSON.stringify(modules[0].modules), (key, value) => {
                if (typeof value === 'object' && value !== null) {
                    if ('permissions' in value) {
                        value.permissions = Object.keys(value.permissions).reduce((acc, permKey) => {
                            acc[permKey] = false;
                            return acc;
                        }, {});
                    }
                    return value;
                }
                return value;
            }) : [];
            
        // Update company data using async/await instead of callback
        try {
            const updatedCompany = await Company.findOneAndUpdate(
                { email: req.payload.email },
                { 
                    $set: { 
                        companyName: companyName.trim(),
                        // subDomain: fullSubdomain,
                        companyAddress: companyAddress || '',
                        generalSettings: generalSettings || {},
                        companyFeatures: {
                            modules: transformedModules,
                            subscriptionStatus: {
                                isActive: false,
                                plan: '',
                                currentCycle: '',
                                startDate: null,
                                endDate: null
                            },
                            paymentInfo: {
                                paymentMethod: '',
                                cardLastFour: '',
                                expirationDate: '',
                                billingAddress: ''
                            }
                        },
                        activeStatus: true,
                        status: true
                    }
                },
                { new: true } // Return updated document
            );
            
            if (!updatedCompany) {
                throw new Error('Failed to update company');
            }
            
            // Create default appraisal groups
            let createDefaultGroups = [];
            
            // Check for existing General group
            const generalGroup = await AppraisalGroup.findOne({ 
                companyId: req.payload.id, 
                groupName: 'General'
            });
            
            if (!generalGroup) {
                createDefaultGroups.push(
                    new AppraisalGroup({
                        groupName: 'General',
                        companyId: req.payload.id,
                        companyName: companyName.trim(),
                        description: 'General Group',
                    }).save()
                );
            }
            
            // Check for existing Specific group
            const specificGroup = await AppraisalGroup.findOne({
                companyId: req.payload.id,
                groupName: 'Specific'
            });
            
            if (!specificGroup) {
                createDefaultGroups.push(
                    new AppraisalGroup({
                        groupName: 'Specific',
                        companyId: req.payload.id,
                        companyName: companyName.trim(),
                        description: 'Specific Group',
                    }).save()
                );
            }
            
            // Create default groups in parallel
            if (createDefaultGroups.length > 0) {
                await Promise.all(createDefaultGroups);
            }
            
            // Get all appraisal groups for this company
            const groupKpis = await AppraisalGroup.find({ companyId: req.payload.id });
            
            // Create audit trail
            await new AuditTrail({
                userId: req.payload.id,
                userType: 'company',
                action: 'Created company profile',
                details: `Company profile created: ${companyName.trim()}`,
                timestamp: new Date()
            }).save();
            
            // Return success response
            return res.status(200).json({
                status: 200,
                success: true,
                data: {
                    companyName: companyName.trim(),
                    email: req.payload.email,
                    companyAddress: companyAddress || '',
                    generalSettings: generalSettings || {},
                    activeStatus: true,
                    // subDomain: fullSubdomain,
                    groups: groupKpis,
                    companyFeatures: updatedCompany.companyFeatures,
                    status: true,
                }
            });
            
        } catch (dbError) {
            console.error('Database operation error:', dbError);
            return res.status(500).json({
                status: 500,
                success: false,
                error: 'Failed to update company information'
            });
        }
        
    } catch (error) {
        console.error('Create company error:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An unexpected error occurred'
        });
    }
};

export default createCompany;
