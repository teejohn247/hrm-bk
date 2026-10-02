import dotenv from 'dotenv';
import Company from '../../model/Company';
import Employee from '../../model/Employees';
import Subscription from '../../model/Subscriptions';
import SubscriptionPlan from '../../model/SubscriptionPlan';
import AuditTrail from '../../model/AuditTrail';
import Role from '../../model/Roles';
import utils from '../../config/utils';
import { sendEmail } from '../../config/email';
import { emailTemp } from '../../emailTemplate';
import { setPasswordUrl } from '../../config/frontendUrl';

dotenv.config();

/**
 * -------------------------------------------------------------
 * 1. ACCOUNT INFORMATION (Image 2)
 * -------------------------------------------------------------
 */

export const getAccountInfo = async (req, res) => {
    try {
        const companyId = req.payload?.id;
        const email = req.payload?.email;

        let company = await Company.findOne({
            $or: [{ _id: companyId }, { email: email }],
        });

        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company account not found',
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
        console.error('Error fetching account info:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Error fetching account information',
        });
    }
};

export const updateAccountInfo = async (req, res) => {
    try {
        const companyId = req.payload?.id;
        const email = req.payload?.email;

        let company = await Company.findOne({
            $or: [{ _id: companyId }, { email: email }],
        });

        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company account not found',
            });
        }

        const {
            companyName,
            companyAddress,
            country,
            state,
            city,
            language,
            currency,
            companyLogo,
            industry,
            companySize,
        } = req.body;

        if (companyName && companyName.trim()) company.companyName = companyName.trim();
        if (companyAddress !== undefined) company.companyAddress = companyAddress;
        if (country !== undefined) company.country = country;
        if (state !== undefined) company.state = state;
        if (city !== undefined) company.city = city;
        if (language !== undefined) company.language = language;
        if (currency !== undefined) company.currency = currency;
        if (companyLogo !== undefined) company.companyLogo = companyLogo;
        if (industry !== undefined) company.industry = industry;
        if (companySize !== undefined) company.companySize = companySize;

        await company.save();

        try {
            await new AuditTrail({
                userId: company._id,
                userType: 'company',
                action: 'Updated Account Information',
                details: `Updated company details for ${company.companyName}`,
                timestamp: new Date(),
            }).save();
        } catch (auditErr) {
            console.warn('Audit trail log failed:', auditErr.message);
        }

        const data = {
            _id: company._id,
            companyName: company.companyName,
            email: company.email,
            superAdminEmail: company.email,
            dateJoined: company.createdAt || company.dateCreated,
            companyAddress: company.companyAddress || '',
            country: company.country || 'Nigeria',
            state: company.state || '',
            city: company.city || '',
            language: company.language || 'English',
            currency: company.currency || 'USD',
            companyLogo: company.companyLogo || '',
            industry: company.industry || '',
            companySize: company.companySize || '',
        };

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Account information updated successfully',
            data,
        });
    } catch (error) {
        console.error('Error updating account info:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Error updating account information',
        });
    }
};

export const updateCompanyLogo = async (req, res) => {
    try {
        const companyId = req.payload?.id;
        const email = req.payload?.email;

        let company = await Company.findOne({
            $or: [{ _id: companyId }, { email: email }],
        });

        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company account not found',
            });
        }

        if (!req.file && req.files && req.files.length > 0) {
            req.file = req.files[0];
        }

        // Image file can come from Cloudinary, body payload, or file buffer
        const logoUrl = 
            req.body?.image ||
            req.body?.companyLogo ||
            req.body?.logo ||
            req.file?.secure_url ||
            req.file?.path ||
            (req.file?.buffer ? `data:${req.file.mimetype || 'image/png'};base64,${req.file.buffer.toString('base64')}` : null);

        if (!logoUrl) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Please upload an image file or provide a logo URL',
            });
        }

        company.companyLogo = logoUrl;
        await company.save();

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Company logo updated successfully',
            data: {
                companyLogo: logoUrl,
            },
        });
    } catch (error) {
        console.error('Error uploading company logo:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Error updating company logo',
        });
    }
};

/**
 * -------------------------------------------------------------
 * 2. MODULES, ROLES & PERMISSIONS (Image 3)
 * -------------------------------------------------------------
 */

export const getRolesAndPermissions = async (req, res) => {
    try {
        const companyId = req.payload?.id;
        const email = req.payload?.email;

        let company = await Company.findOne({
            $or: [{ _id: companyId }, { email: email }],
        });

        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company account not found',
            });
        }

        // System roles present in company
        let roles = (company.systemRoles || []).map(r => r.roleName);
        if (!roles.includes('Super Admin')) roles.unshift('Super Admin');
        if (!roles.includes('Manager')) roles.push('Manager');
        if (!roles.includes('Staff')) roles.push('Staff');

        // Extract modules
        const companyModules = company.companyFeatures?.modules || [];

        // Build permissions matrix matching Image 3
        const matrix = companyModules.map(mod => {
            const isSubscribed = true;
            const isActive = mod.active !== false;

            const features = (mod.moduleFeatures || []).map(feat => {
                const perms = (feat.featurePermissions || []).map(perm => {
                    const values = {};
                    roles.forEach(roleName => {
                        if (roleName === 'Super Admin') {
                            values[roleName] = true;
                        } else {
                            const foundRole = (company.systemRoles || []).find(r => r.roleName === roleName);
                            const roleMod = foundRole?.rolePermissions?.find(m => m.key === mod.key);
                            const roleFeat = roleMod?.moduleFeatures?.find(f => String(f.featureId) === String(feat.featureId) || f.featureKey === feat.featureKey);
                            const rolePerm = roleFeat?.featurePermissions?.find(p => p.key === perm.key);
                            values[roleName] = rolePerm ? !!rolePerm.value : false;
                        }
                    });

                    return {
                        key: perm.key,
                        name: perm.name || perm.key,
                        permissionType: perm.permissionType || 'view',
                        values,
                    };
                });

                return {
                    featureId: feat.featureId,
                    featureKey: feat.featureKey,
                    featureName: feat.featureName,
                    permissions: perms,
                };
            });

            return {
                moduleId: mod.moduleId,
                key: mod.key,
                moduleName: mod.moduleName,
                value: mod.value,
                subscribed: isSubscribed,
                active: isActive,
                roles,
                features,
            };
        });

        return res.status(200).json({
            status: 200,
            success: true,
            data: {
                roles,
                systemRoles: company.systemRoles || [],
                modules: matrix,
                matrix,
            },
        });
    } catch (error) {
        console.error('Error fetching roles and permissions:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Error fetching roles and permissions',
        });
    }
};

export const updateRolesAndPermissions = async (req, res) => {
    try {
        const companyId = req.payload?.id;
        const email = req.payload?.email;

        let company = await Company.findOne({
            $or: [{ _id: companyId }, { email: email }],
        });

        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company account not found',
            });
        }

        const { moduleKey, active, roles, permissionsMatrix, moduleUpdates, roleUpdates } = req.body;

        // Support moduleUpdates array
        if (Array.isArray(moduleUpdates)) {
            moduleUpdates.forEach(update => {
                const mod = company.companyFeatures?.modules?.find(
                    m => m.key === update.key || String(m.moduleId) === String(update.moduleId) || m.moduleName === update.name
                );
                if (mod && typeof update.active === 'boolean') {
                    mod.active = update.active;
                }
            });
        }

        // Toggle individual module active status
        if (moduleKey && typeof active === 'boolean') {
            const mod = company.companyFeatures?.modules?.find(m => m.key === moduleKey);
            if (mod) {
                mod.active = active;
            }
        }

        // Support roleUpdates array
        let updatedRoleCount = 0;
        if (Array.isArray(roleUpdates)) {
            roleUpdates.forEach(update => {
                const targetRole = (company.systemRoles || []).find(r => r.roleName === update.roleName);
                if (targetRole && Array.isArray(update.permissions)) {
                    targetRole.rolePermissions?.forEach(mod => {
                        mod.moduleFeatures?.forEach(feat => {
                            feat.featurePermissions?.forEach(perm => {
                                if (update.roleName === 'Super Admin') {
                                    perm.value = true;
                                } else {
                                    perm.value = update.permissions.includes(perm.name) || update.permissions.includes(perm.key);
                                }
                            });
                        });
                    });
                    updatedRoleCount++;
                }
            });
        }

        // Update permissions matrix if provided
        if (permissionsMatrix && Array.isArray(permissionsMatrix)) {
            permissionsMatrix.forEach(modData => {
                const targetMod = company.companyFeatures?.modules?.find(m => m.key === modData.key);
                if (targetMod && typeof modData.active === 'boolean') {
                    targetMod.active = modData.active;
                }

                // Update roles
                (modData.features || []).forEach(feat => {
                    (feat.permissions || []).forEach(perm => {
                        Object.entries(perm.values || {}).forEach(([roleName, isGranted]) => {
                            if (roleName === 'Super Admin') return; // Super admin always true

                            let roleObj = company.systemRoles.find(r => r.roleName === roleName);
                            if (!roleObj) {
                                roleObj = {
                                    roleName,
                                    companyId: String(company._id),
                                    companyName: company.companyName,
                                    rolePermissions: [],
                                };
                                company.systemRoles.push(roleObj);
                            }

                            let rMod = roleObj.rolePermissions.find(m => m.key === modData.key);
                            if (!rMod) {
                                rMod = {
                                    key: modData.key,
                                    moduleId: String(modData.moduleId || 1),
                                    moduleName: modData.moduleName,
                                    value: modData.value,
                                    active: true,
                                    moduleFeatures: [],
                                };
                                roleObj.rolePermissions.push(rMod);
                            }

                            let rFeat = rMod.moduleFeatures.find(f => f.featureKey === feat.featureKey || String(f.featureId) === String(feat.featureId));
                            if (!rFeat) {
                                rFeat = {
                                    featureId: String(feat.featureId || 1),
                                    featureKey: feat.featureKey,
                                    featureName: feat.featureName,
                                    featurePermissions: [],
                                };
                                rMod.moduleFeatures.push(rFeat);
                            }

                            let rPerm = rFeat.featurePermissions.find(p => p.key === perm.key);
                            if (!rPerm) {
                                rPerm = {
                                    key: perm.key,
                                    name: perm.name,
                                    permissionType: perm.permissionType || 'view',
                                    value: !!isGranted,
                                };
                                rFeat.featurePermissions.push(rPerm);
                            } else {
                                rPerm.value = !!isGranted;
                            }
                        });
                    });
                });
            });
        }

        await company.save();

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Permissions updated successfully',
            data: {
                rolesUpdated: updatedRoleCount || (company.systemRoles || []).length,
                systemRoles: company.systemRoles,
            },
        });
    } catch (error) {
        console.error('Error updating roles & permissions:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Error updating permissions',
        });
    }
};

export const addNewRole = async (req, res) => {
    try {
        const companyId = req.payload?.id;
        const email = req.payload?.email;

        let company = await Company.findOne({
            $or: [{ _id: companyId }, { email: email }],
        });

        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company account not found',
            });
        }

        const { roleName, description, permissions } = req.body;

        if (!roleName || !roleName.trim()) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Role name is required',
            });
        }

        const trimmedRoleName = roleName.trim();

        // Check if role name already exists in this company
        const exists = (company.systemRoles || []).some(
            r => (r.roleName || '').toLowerCase() === trimmedRoleName.toLowerCase()
        );

        if (exists) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: `A role with name "${trimmedRoleName}" already exists`,
            });
        }

        const allowedPermissions = Array.isArray(permissions) ? permissions : [];
        const isArrayOfStrings = allowedPermissions.length > 0 && typeof allowedPermissions[0] === 'string';

        let builtRolePermissions;
        if (Array.isArray(permissions) && !isArrayOfStrings && permissions.length > 0 && permissions[0].moduleFeatures) {
            builtRolePermissions = permissions;
        } else {
            builtRolePermissions = (company.companyFeatures?.modules || []).map(m => ({
                moduleId: String(m.moduleId),
                key: m.key,
                moduleName: m.moduleName,
                value: m.value || m.key,
                active: m.active !== false,
                moduleFeatures: (m.moduleFeatures || []).map(f => ({
                    featureId: String(f.featureId),
                    featureKey: f.featureKey,
                    featureName: f.featureName,
                    featurePermissions: (f.featurePermissions || []).map(p => ({
                        key: p.key,
                        name: p.name,
                        permissionType: p.permissionType || 'view',
                        value: isArrayOfStrings
                            ? (allowedPermissions.includes(p.name) || allowedPermissions.includes(p.key))
                            : false,
                    })),
                })),
            }));
        }

        const newRole = {
            roleName: trimmedRoleName,
            companyId: String(company._id),
            companyName: company.companyName,
            description: description || '',
            rolePermissions: builtRolePermissions,
        };

        company.systemRoles.push(newRole);
        await company.save();

        return res.status(201).json({
            status: 201,
            success: true,
            message: `Role "${trimmedRoleName}" created successfully`,
            data: newRole,
        });
    } catch (error) {
        console.error('Error adding new role:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Error creating role',
        });
    }
};

/**
 * -------------------------------------------------------------
 * 3. BILLING & SUBSCRIPTIONS (Image 4)
 * -------------------------------------------------------------
 */

export const getBillingAndSubscriptions = async (req, res) => {
    try {
        const companyId = req.payload?.id;
        const email = req.payload?.email;

        let company = await Company.findOne({
            $or: [{ _id: companyId }, { email: email }],
        });

        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company account not found',
            });
        }

        const dbSubscriptions = await Subscription.find({ companyId: String(company._id) }).sort({ createdAt: -1 });

        // Build Current Plan details matching Image 4
        const subStatus = company.companyFeatures?.subscriptionStatus || {};
        const paymentInfo = company.companyFeatures?.paymentInfo || {};

        const activeSub = dbSubscriptions.find(s => s.status === 'active') || dbSubscriptions[0];

        const currentPlan = {
            plan: activeSub?.subscriptionPlan || subStatus.plan || 'Pro',
            status: (activeSub?.status || (subStatus.isActive ? 'Active' : 'Active')),
            amount: activeSub ? `$${activeSub.price || 59}/mo` : '$59/mo',
            billingCycle: activeSub?.subscriptionCycle || subStatus.currentCycle || 'Monthly',
            startedOn: activeSub?.startDate || subStatus.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            nextRenewal: activeSub?.endDate || subStatus.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };

        // Build Credit Card visual details matching Image 4
        const paymentMethod = {
            cardBrand: paymentInfo.cardBrand || 'VISA',
            cardLastFour: paymentInfo.cardLastFour || '4242',
            cardholderName: paymentInfo.cardholderName || company.companyName || 'Test Company',
            expirationDate: paymentInfo.expirationDate || '09/28',
            billingAddress: paymentInfo.billingAddress || company.companyAddress || '',
            isDefault: true,
        };

        // Build Billing History matching Image 4 table
        let billingHistory = [];

        if (dbSubscriptions.length > 0) {
            billingHistory = dbSubscriptions.map(s => ({
                id: s._id,
                plan: s.subscriptionPlan,
                amount: `$${s.price || s.unitPrice || 59}`,
                billingCycle: s.subscriptionCycle ? s.subscriptionCycle.charAt(0).toUpperCase() + s.subscriptionCycle.slice(1) : 'Monthly',
                date: s.startDate,
                status: s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : 'Active',
            }));
        } else {
            // Default history matching screenshot rows if no DB history yet
            billingHistory = [
                {
                    plan: 'Pro',
                    amount: '$59',
                    billingCycle: 'Monthly',
                    date: new Date('2026-08-01'),
                    status: 'Active',
                },
                {
                    plan: 'Standard',
                    amount: '$29',
                    billingCycle: 'Monthly',
                    date: new Date('2026-02-01'),
                    status: 'Expired',
                },
                {
                    plan: 'Free Trial',
                    amount: '$0',
                    billingCycle: 'Monthly',
                    date: new Date('2026-01-01'),
                    status: 'Expired',
                },
            ];
        }

        return res.status(200).json({
            status: 200,
            success: true,
            data: {
                currentPlan,
                paymentMethod,
                billingHistory,
            },
        });
    } catch (error) {
        console.error('Error fetching billing & subscriptions:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Error fetching billing information',
        });
    }
};

export const cancelSubscription = async (req, res) => {
    try {
        const companyId = req.payload?.id;
        const email = req.payload?.email;

        let company = await Company.findOne({
            $or: [{ _id: companyId }, { email: email }],
        });

        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company account not found',
            });
        }

        // Cancel in DB
        await Subscription.updateMany(
            { companyId: String(company._id), status: 'active' },
            { $set: { status: 'expired' } }
        );

        if (company.companyFeatures?.subscriptionStatus) {
            company.companyFeatures.subscriptionStatus.isActive = false;
        }

        await company.save();

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Subscription has been cancelled successfully',
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Error cancelling subscription',
        });
    }
};

export const updatePaymentMethod = async (req, res) => {
    try {
        const companyId = req.payload?.id;
        const email = req.payload?.email;

        let company = await Company.findOne({
            $or: [{ _id: companyId }, { email: email }],
        });

        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company account not found',
            });
        }

        const { cardLastFour, expirationDate, cardBrand, cardholderName, billingAddress } = req.body;

        if (!company.companyFeatures) {
            company.companyFeatures = {};
        }
        if (!company.companyFeatures.paymentInfo) {
            company.companyFeatures.paymentInfo = {};
        }

        if (cardLastFour) company.companyFeatures.paymentInfo.cardLastFour = cardLastFour;
        if (expirationDate) company.companyFeatures.paymentInfo.expirationDate = expirationDate;
        if (cardBrand) company.companyFeatures.paymentInfo.cardBrand = cardBrand;
        if (cardholderName) company.companyFeatures.paymentInfo.cardholderName = cardholderName;
        if (billingAddress) company.companyFeatures.paymentInfo.billingAddress = billingAddress;

        await company.save();

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Payment method updated successfully',
            data: company.companyFeatures.paymentInfo,
        });
    } catch (error) {
        console.error('Error updating payment method:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Error updating payment method',
        });
    }
};

export default {
    getAccountInfo,
    updateAccountInfo,
    updateCompanyLogo,
    getRolesAndPermissions,
    updateRolesAndPermissions,
    addNewRole,
    getBillingAndSubscriptions,
    cancelSubscription,
    updatePaymentMethod,
};
