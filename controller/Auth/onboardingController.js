import dotenv from 'dotenv';
import Company from '../../model/Company';
import Industry from '../../model/Industry';
import AuditTrail from '../../model/AuditTrail';
import Employee from '../../model/Employees';
import utils from '../../config/utils';
import { sendEmail } from '../../config/email';
import { emailTemp } from '../../emailTemplate';
import { setPasswordUrl } from '../../config/frontendUrl';
import { hrModuleFeatures } from '../../constants/hrModuleWithPermissions';
import { recruitmentModuleFeatures } from '../../constants/recruitmentModuleFeatures';
import { lmsModuleFeatures } from '../../constants/lmsModuleFeatures';
import { ordersModuleFeatures } from '../../constants/ordersModuleFeatures';

dotenv.config();

const DEFAULT_INDUSTRIES = [
    'Technology & Software',
    'Finance & Banking',
    'Manufacturing & Production',
    'Healthcare & Pharmaceuticals',
    'Education & Training',
    'Retail & E-commerce',
    'Construction & Real Estate',
    'Logistics & Supply Chain',
    'Consulting & Professional Services',
    'Hospitality & Tourism',
    'Energy & Utilities',
    'Agriculture & Agribusiness',
    'Media & Entertainment',
    'Telecommunications',
    'Other',
];

const COMPANY_SIZES = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '500+',
];

// Accounting feature definitions
const accountingModuleFeatures = [
    {
        featureId: 1,
        featureKey: 'generalLedger',
        featureName: 'General Ledger',
        featurePermissions: [
            { key: 'view_ledger', name: 'View Ledger', permissionType: 'view', value: false },
            { key: 'create_entry', name: 'Create Journal Entry', permissionType: 'create', value: false },
        ],
    },
    {
        featureId: 2,
        featureKey: 'invoices',
        featureName: 'Invoicing & Billing',
        featurePermissions: [
            { key: 'view_invoices', name: 'View Invoices', permissionType: 'view', value: false },
            { key: 'create_invoice', name: 'Create Invoices', permissionType: 'create', value: false },
            { key: 'send_invoice', name: 'Send Invoices', permissionType: 'edit', value: false },
        ],
    },
    {
        featureId: 3,
        featureKey: 'expenses',
        featureName: 'Expense Management',
        featurePermissions: [
            { key: 'view_expenses', name: 'View Expenses', permissionType: 'view', value: false },
            { key: 'approve_expenses', name: 'Approve Expenses', permissionType: 'edit', value: false },
        ],
    },
    {
        featureId: 4,
        featureKey: 'financialReports',
        featureName: 'Financial Reports',
        featurePermissions: [
            { key: 'view_reports', name: 'View Reports', permissionType: 'view', value: false },
            { key: 'export_reports', name: 'Export Reports', permissionType: 'download', value: false },
        ],
    },
];

// Available modules metadata
const CATALOG_MODULES = [
    {
        key: 'hr',
        moduleId: 1,
        moduleName: 'Human Resources Module',
        value: 'HRM Module',
        description: 'Manage employees, payroll, appraisals, leave requests, and attendance.',
        icon: 'users',
        isDefault: true,
        features: hrModuleFeatures || [],
    },
    {
        key: 'accounting',
        moduleId: 6,
        moduleName: 'Accounting Module',
        value: 'Accounting Module',
        description: 'Financial ledger, invoicing, expense tracking, accounts, and financial reports.',
        icon: 'wallet',
        isDefault: true,
        features: accountingModuleFeatures,
    },
    {
        key: 'supplyChain',
        aliases: ['om', 'supply_chain'],
        moduleId: 2,
        moduleName: 'Supply Chain Module',
        value: 'Supply Chain Module',
        description: 'Order fulfillment, stock inventory, purchase orders, and supplier directory.',
        icon: 'box',
        isDefault: true,
        features: ordersModuleFeatures || [],
    },
    {
        key: 'recruitment',
        moduleId: 3,
        moduleName: 'Recruitment Module',
        value: 'Recruitment Module',
        description: 'Job requisitions, applicant tracking system, interview stages, and offers.',
        icon: 'briefcase',
        isDefault: false,
        features: recruitmentModuleFeatures || [],
    },
    {
        key: 'lms',
        moduleId: 4,
        moduleName: 'Learning Management System (LMS)',
        value: 'LMS Module',
        description: 'Staff training courses, lessons, quizzes, and skill progress tracking.',
        icon: 'academic-cap',
        isDefault: false,
        features: lmsModuleFeatures || [],
    },
];

/**
 * Helper to build company module objects with boolean permissions
 */
function buildCompanyModules(selectedKeys) {
    const normalizedKeys = (selectedKeys || []).map(k => {
        const str = (typeof k === 'object' && k !== null ? k.key || k.moduleKey || k.moduleId : k).toString().toLowerCase();
        if (str === 'om' || str === 'orders' || str === 'order') return 'supplyChain';
        if (str === 'humanresources' || str === 'hrm') return 'hr';
        return str;
    });

    return CATALOG_MODULES.map(catalogMod => {
        const isSelected = normalizedKeys.some(k => 
            k === catalogMod.key.toLowerCase() || 
            k === catalogMod.moduleName.toLowerCase() ||
            k === String(catalogMod.moduleId) ||
            (catalogMod.aliases && catalogMod.aliases.includes(k))
        );

        const mappedFeatures = (catalogMod.features || []).map(feat => {
            const rawPerms = feat.featurePermissions || [];
            const permissions = rawPerms.map(p => ({
                key: p.key,
                name: p.name || p.key,
                permissionType: p.permissionType || 'view',
                value: false, // Default role permissions set to true for Super Admin
            }));

            return {
                featureId: feat.featureId,
                featureKey: feat.featureKey,
                featureName: feat.featureName,
                featurePermissions: permissions,
            };
        });

        return {
            moduleId: catalogMod.moduleId,
            key: catalogMod.key,
            moduleName: catalogMod.moduleName,
            value: catalogMod.value,
            active: isSelected,
            moduleFeatures: mappedFeatures,
        };
    });
}

/**
 * Build default system roles with permissions based on selected modules
 */
function buildDefaultSystemRoles(companyId, companyName, companyModules) {
    const activeModules = companyModules.filter(m => m.active);

    // Super Admin: full access to everything active
    const superAdminRole = {
        roleName: 'Super Admin',
        companyId: String(companyId),
        companyName,
        description: 'Full workspace access with all administrative privileges',
        rolePermissions: activeModules.map(mod => ({
            moduleId: String(mod.moduleId),
            key: mod.key,
            moduleName: mod.moduleName,
            value: mod.value,
            active: true,
            moduleFeatures: (mod.moduleFeatures || []).map(feat => ({
                featureId: String(feat.featureId),
                featureKey: feat.featureKey,
                featureName: feat.featureName,
                featurePermissions: (feat.featurePermissions || []).map(p => ({
                    key: p.key,
                    name: p.name,
                    permissionType: p.permissionType,
                    value: true,
                })),
            })),
        })),
    };

    // Manager / Admin: management level access
    const adminRole = {
        roleName: 'Manager',
        companyId: String(companyId),
        companyName,
        description: 'Department manager with approval and operation rights',
        rolePermissions: activeModules.map(mod => ({
            moduleId: String(mod.moduleId),
            key: mod.key,
            moduleName: mod.moduleName,
            value: mod.value,
            active: true,
            moduleFeatures: (mod.moduleFeatures || []).map(feat => ({
                featureId: String(feat.featureId),
                featureKey: feat.featureKey,
                featureName: feat.featureName,
                featurePermissions: (feat.featurePermissions || []).map(p => ({
                    key: p.key,
                    name: p.name,
                    permissionType: p.permissionType,
                    value: p.permissionType !== 'delete',
                })),
            })),
        })),
    };

    // Staff / Employee: read and standard submission rights
    const staffRole = {
        roleName: 'Staff',
        companyId: String(companyId),
        companyName,
        description: 'Standard employee workspace access',
        rolePermissions: activeModules.map(mod => ({
            moduleId: String(mod.moduleId),
            key: mod.key,
            moduleName: mod.moduleName,
            value: mod.value,
            active: true,
            moduleFeatures: (mod.moduleFeatures || []).map(feat => ({
                featureId: String(feat.featureId),
                featureKey: feat.featureKey,
                featureName: feat.featureName,
                featurePermissions: (feat.featurePermissions || []).map(p => ({
                    key: p.key,
                    name: p.name,
                    permissionType: p.permissionType,
                    value: p.permissionType === 'view' || p.key.includes('view') || p.key.includes('apply'),
                })),
            })),
        })),
    };

    return [superAdminRole, adminRole, staffRole];
}

/**
 * GET /api/v1/onboarding/industries or /api/v1/pull-industry
 * Returns list of industries for the dropdown (Page 4)
 */
export const getIndustries = async (req, res) => {
    try {
        let industries = await Industry.find().sort({ industryName: 1 });

        if (!industries || industries.length === 0) {
            // Seed default industries
            const seedPromises = DEFAULT_INDUSTRIES.map(name => 
                Industry.findOneAndUpdate(
                    { industryName: name },
                    { industryName: name },
                    { upsert: true, new: true }
                )
            );
            industries = await Promise.all(seedPromises);
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Industries fetched successfully',
            data: industries,
        });
    } catch (error) {
        console.error('Error fetching industries:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Error fetching industries',
        });
    }
};

/**
 * GET /api/v1/onboarding/company-sizes
 * Returns standard company size options for dropdown (Page 4)
 */
export const getCompanySizes = async (req, res) => {
    return res.status(200).json({
        status: 200,
        success: true,
        data: COMPANY_SIZES,
    });
};

/**
 * POST /api/v1/onboarding/workspace or PATCH /api/v1/onboarding/workspace
 * Step 4: Save Company Workspace info (Page 4)
 * Body: { companyName, industry, companySize, companyAddress, generalSettings }
 */
export const saveWorkspace = async (req, res) => {
    try {
        const { companyName, industry, companySize, companyAddress, generalSettings } = req.body;

        const email = req.payload?.email;
        const companyId = req.payload?.id;

        if (!email && !companyId) {
            return res.status(401).json({
                status: 401,
                success: false,
                error: 'Authentication required. Please provide a valid Authorization Bearer token.',
            });
        }

        let company = await Company.findOne({
            $or: [
                { _id: companyId },
                { email: email },
            ],
        });

        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company account not found',
            });
        }

        if (companyName && companyName.trim()) {
            company.companyName = companyName.trim();
        }

        if (industry) {
            company.industry = industry.trim();
        }

        if (companySize) {
            company.companySize = companySize.trim();
        }

        if (companyAddress) {
            company.companyAddress = companyAddress.trim();
        }

        if (generalSettings) {
            company.generalSettings = generalSettings;
        }

        company.onboardingStep = 2; // Advance to module selection
        company.activeStatus = true;
        company.status = true;

        await company.save();

        // Audit Trail
        try {
            await new AuditTrail({
                userId: company._id,
                userType: 'company',
                action: 'Saved Workspace Profile',
                details: `Workspace details updated: ${company.companyName}, Industry: ${company.industry}, Size: ${company.companySize}`,
                timestamp: new Date(),
            }).save();
        } catch (auditErr) {
            console.warn('Audit error:', auditErr.message);
        }

        const companyData = company.toObject();
        delete companyData.password;

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Workspace profile saved successfully',
            data: companyData,
        });
    } catch (error) {
        console.error('Error saving workspace info:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Error saving workspace info',
        });
    }
};

/**
 * GET /api/v1/onboarding/modules
 * Step 5: Get available modules for selection (Page 5)
 */
export const getAvailableModules = async (req, res) => {
    try {
        const modulesList = CATALOG_MODULES.map(m => ({
            key: m.key,
            moduleId: m.moduleId,
            name: m.moduleName,
            moduleName: m.moduleName,
            value: m.value,
            description: m.description,
            icon: m.icon,
            isDefault: m.isDefault,
        }));

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Available modules fetched successfully',
            data: modulesList,
        });
    } catch (error) {
        console.error('Error fetching available modules:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Error fetching modules',
        });
    }
};

/**
 * POST /api/v1/onboarding/modules or /api/v1/onboarding/select-modules
 * Step 5: Choose modules and finalize onboarding (Page 5)
 * Body: { modules: ['hr', 'accounting', 'supplyChain'] }
 */
export const selectModules = async (req, res) => {
    try {
        const { modules } = req.body;
        let moduleKeys = [];
        if (Array.isArray(modules)) {
            moduleKeys = modules;
        } else if (modules && typeof modules === 'object') {
            moduleKeys = Object.keys(modules).filter(k => modules[k]?.active !== false && modules[k] !== false);
        }

        if (moduleKeys.length === 0) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Please select at least one module for your workspace',
            });
        }

        const email = req.payload?.email;
        const companyId = req.payload?.id;

        if (!email && !companyId) {
            return res.status(401).json({
                status: 401,
                success: false,
                error: 'Authentication required. Please provide a valid Authorization Bearer token.',
            });
        }

        let company = await Company.findOne({
            $or: [
                { _id: companyId },
                { email: email },
            ],
        });

        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company account not found',
            });
        }

        // Build company features modules
        const companyModules = buildCompanyModules(moduleKeys);

        if (!company.companyFeatures) {
            company.companyFeatures = {
                subscriptionStatus: {
                    isActive: true,
                    plan: 'Standard Trial',
                    currentCycle: 'Monthly',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 day trial
                },
                paymentInfo: {
                    paymentMethod: '',
                    cardLastFour: '',
                    expirationDate: '',
                    billingAddress: '',
                },
                modules: companyModules,
            };
        } else {
            company.companyFeatures.modules = companyModules;
            if (!company.companyFeatures.subscriptionStatus) {
                company.companyFeatures.subscriptionStatus = {
                    isActive: true,
                    plan: 'Standard Trial',
                    currentCycle: 'Monthly',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                };
            }
        }

        // Setup default system roles for company with module permissions
        const systemRoles = buildDefaultSystemRoles(company._id, company.companyName || 'My Company', companyModules);
        company.systemRoles = systemRoles;

        // Mark onboarding complete
        company.onboardingCompleted = true;
        company.onboardingStep = 2;
        company.firstTimeLogin = false;
        company.activeStatus = true;
        company.status = true;

        await company.save();

        // Audit Trail
        try {
            await new AuditTrail({
                userId: company._id,
                userType: 'company',
                action: 'Selected Workspace Modules',
                details: `Modules activated: ${moduleKeys.join(', ')}`,
                timestamp: new Date(),
            }).save();
        } catch (auditErr) {
            console.warn('Audit error:', auditErr.message);
        }

        const companyData = company.toObject();
        delete companyData.password;

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Modules configured successfully. Welcome to Makers ERP!',
            data: companyData,
        });
    } catch (error) {
        console.error('Error selecting modules:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Error saving module selections',
        });
    }
};

/**
 * GET /api/v1/onboarding/status
 * Check current onboarding status and progress
 */
export const getOnboardingStatus = async (req, res) => {
    try {
        const email = req.payload?.email;
        const companyId = req.payload?.id;

        if (!email && !companyId) {
            return res.status(401).json({
                status: 401,
                success: false,
                error: 'Authentication required',
            });
        }

        const company = await Company.findOne({
            $or: [
                { _id: companyId },
                { email: email },
            ],
        });

        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company not found',
            });
        }

        const activeModules = (company.companyFeatures?.modules || [])
            .filter(m => m.active)
            .map(m => ({
                moduleId: m.moduleId,
                key: m.key,
                moduleName: m.moduleName,
            }));

        return res.status(200).json({
            status: 200,
            success: true,
            data: {
                companyName: company.companyName,
                email: company.email,
                accountType: company.accountType || 'Company',
                industry: company.industry || '',
                companySize: company.companySize || '',
                onboardingStep: company.onboardingStep || 1,
                onboardingCompleted: company.onboardingCompleted || false,
                firstTimeLogin: company.firstTimeLogin,
                activeModules,
            },
        });
    } catch (error) {
        console.error('Error fetching onboarding status:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Error fetching onboarding status',
        });
    }
};

/**
 * POST /api/v1/onboarding/invite-employees or /api/v1/onboarding/invite
 * Step 6: Invite employees to workspace (Image 1)
 * Body: { emails: ["employee@company.com", ...] }
 */
export const inviteEmployees = async (req, res) => {
    try {
        const companyId = req.payload?.id;
        const authEmail = req.payload?.email;

        const company = await Company.findOne({
            $or: [{ _id: companyId }, { email: authEmail }],
        });

        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company account not found',
            });
        }

        let rawEmails = req.body.emails || req.body.employees || req.body.email || [];
        if (!Array.isArray(rawEmails)) {
            rawEmails = [rawEmails];
        }

        const validEmails = rawEmails
            .map(e => (typeof e === 'object' && e !== null ? e.email || e.value : e))
            .filter(e => typeof e === 'string' && e.includes('@'))
            .map(e => e.toLowerCase().trim());

        if (validEmails.length === 0) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Please provide at least one valid employee email address',
            });
        }

        const invitedEmails = [];
        const skippedEmails = [];

        for (const empEmail of validEmails) {
            const existingEmployee = await Employee.findOne({
                companyId: company._id,
                email: empEmail,
            });

            if (existingEmployee) {
                skippedEmails.push({ email: empEmail, reason: 'Already registered or invited' });
                continue;
            }

            const namePart = empEmail.split('@')[0].replace(/[._-]/g, ' ');
            const nameTokens = namePart.split(' ').filter(Boolean);
            const firstName = nameTokens[0] ? nameTokens[0].charAt(0).toUpperCase() + nameTokens[0].slice(1) : 'Invited';
            const lastName = nameTokens[1] ? nameTokens[1].charAt(0).toUpperCase() + nameTokens[1].slice(1) : 'Member';
            const currentYear = new Date().getFullYear();
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            const employeeCode = `EMP-${currentYear}-${randomCode}`;

            const newEmployee = new Employee({
                email: empEmail,
                companyId: String(company._id),
                companyName: company.companyName,
                firstName,
                lastName,
                fullName: `${firstName} ${lastName}`,
                department: 'General',
                employmentType: 'Full-time',
                employeeCode,
                status: 'Pending',
                activeStatus: false,
                firstTimeLogin: true,
                role: 'Staff',
            });

            await newEmployee.save();

            const token = utils.encodeToken(newEmployee._id, false, newEmployee.email, company._id);

            const emailHtml = `
                <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
                    <p style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Hi,</p>
                    <p style="font-size: 15px; color: #475569; margin-bottom: 24px;">
                        You have been invited to join <strong>${company.companyName}</strong> on the <strong>Makers ERP Platform</strong>.
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${setPasswordUrl(token)}" style="display: inline-block; background: #0ea5e9; color: #ffffff; text-decoration: none; font-weight: 600; padding: 14px 28px; border-radius: 8px; font-size: 15px;">
                            Set Your Password
                        </a>
                    </div>
                    <p style="font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                        If you cannot click the button, copy and paste this link into your browser:<br>
                        <span style="color: #0284c7;">${setPasswordUrl(token)}</span>
                    </p>
                </div>
            `;

            const templatedHtml = emailTemp(emailHtml, 'Employee Invitation');

            try {
                await sendEmail(req, res, empEmail, [{ email: empEmail }], `Invitation to join ${company.companyName} on Makers ERP`, templatedHtml);
                console.log(`[INVITE] Invitation email dispatched to ${empEmail}`);
            } catch (mailErr) {
                console.warn(`[INVITE] Email send failed for ${empEmail}:`, mailErr.message);
            }

            invitedEmails.push(empEmail);
        }

        // Advance onboarding state
        company.onboardingCompleted = true;
        company.onboardingStep = 3;
        await company.save();

        try {
            await new AuditTrail({
                userId: company._id,
                userType: 'company',
                action: 'Invited Employees',
                details: `Sent invitations to: ${invitedEmails.join(', ')}`,
                timestamp: new Date(),
            }).save();
        } catch (auditErr) {
            console.warn('Audit trail failed:', auditErr.message);
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: `Successfully invited ${invitedEmails.length} employee${invitedEmails.length === 1 ? '' : 's'}`,
            data: {
                totalInvited: invitedEmails.length,
                invitedCount: invitedEmails.length,
                invitedEmails,
                skippedEmails,
            },
        });
    } catch (error) {
        console.error('Error inviting employees:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Error processing employee invitations',
        });
    }
};

/**
 * POST /api/v1/onboarding/skip-invite or /api/v1/onboarding/skip
 * Skip employee invitation and finalize onboarding
 */
export const skipInvite = async (req, res) => {
    try {
        const companyId = req.payload?.id;
        const authEmail = req.payload?.email;

        const company = await Company.findOne({
            $or: [{ _id: companyId }, { email: authEmail }],
        });

        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company account not found',
            });
        }

        company.onboardingCompleted = true;
        company.onboardingStep = 3;
        await company.save();

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Employee invitation skipped. Workspace setup is complete!',
        });
    } catch (error) {
        console.error('Error skipping employee invite:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Error skipping invite',
        });
    }
};

export default {
    getIndustries,
    getCompanySizes,
    saveWorkspace,
    getAvailableModules,
    selectModules,
    getOnboardingStatus,
    inviteEmployees,
    skipInvite,
};

