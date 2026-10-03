import Subscription from '../../../model/Subscriptions';
import Company from '../../../model/Company';
import dotenv from 'dotenv';
import Module from '../../../model/Modules';
import mongoose from 'mongoose';
import SubscriptionPlan from '../../../model/SubscriptionPlan';
import Role from '../../../model/Roles';

dotenv.config();

// Helper function for default permissions
async function getDefaultPermissions(roleName) {
    const moduleDoc = await Modules.findOne();
    if (!moduleDoc) return [];

    const rolePermissions = [];
    
    // Process all modules for default roles
    for (const moduleData of moduleDoc.modules) {
        for (const feature of moduleData.moduleFeatures) {
            if (feature.featurePermissions && feature.featurePermissions.length > 0) {
                for (const permission of feature.featurePermissions) {
                    rolePermissions.push({
                        moduleId: moduleData._id,
                        featureId: feature._id,
                        permissionKey: permission.key,
                        permissionValue: roleName === 'Super Admin' // Only Super Admin gets all permissions by default
                    });
                }
            }
        }
    }
    
    return rolePermissions;
}

// Helper function to process module permissions for custom roles
async function processModulePermissions(modules) {
    const rolePermissions = [];
    const moduleDoc = await Modules.findOne();
    
    if (!moduleDoc) {
        throw new Error('No modules configuration found');
    }

    for (const moduleId of modules) {
        const moduleData = moduleDoc.modules.find(
            module => module._id.toString() === moduleId
        );
        
        if (!moduleData) {
            throw new Error(`Invalid module ID: ${moduleId}`);
        }

        for (const feature of moduleData.moduleFeatures) {
            if (feature.featurePermissions && feature.featurePermissions.length > 0) {
                for (const permission of feature.featurePermissions) {
                    rolePermissions.push({
                        moduleId: moduleId,
                        featureId: feature._id,
                        permissionType: permission.permissionType,
                        permissionKey: permission.key,
                        permissionValue: false
                    });
                }
            }
        }
    }

    return rolePermissions;
}

const subscribe = async (req, res) => {
    try {
        const { 
            subscriptionPlanId,
            planKey,
            planName,
            subscriptionCycle = 'monthly',
            userRange = '1-10'
        } = req.body;

        const targetCompanyId = req.body.companyId || req.payload?.id || req.decode?.id;

        // Validate company
        let company = await Company.findOne({
            $or: [{ _id: targetCompanyId }, { email: req.payload?.email }]
        });

        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                errorMessage: 'Company not found'
            });
        }

        // Check for currently active subscription (such as active Free Trial)
        const activeSubscription = await Subscription.findOne({
            companyId: String(company._id),
            status: 'active',
            endDate: { $gt: new Date() }
        }).sort({ endDate: -1 });

        // Find or resolve subscription plan
        let subscriptionPlan = null;
        const requestedIdentifier = subscriptionPlanId || planKey || planName;

        if (requestedIdentifier && mongoose.Types.ObjectId.isValid(requestedIdentifier)) {
            subscriptionPlan = await SubscriptionPlan.findById(requestedIdentifier);
        }

        if (!subscriptionPlan && requestedIdentifier) {
            const cleanKey = String(requestedIdentifier).toLowerCase().replace(/[^a-z0-9]/g, '');
            subscriptionPlan = await SubscriptionPlan.findOne({
                $or: [
                    { subscriptionName: new RegExp(cleanKey, 'i') },
                    { key: cleanKey },
                    { subscriptionName: new RegExp(String(requestedIdentifier), 'i') }
                ]
            });
        }

        // Fallback default catalog if not in database
        if (!subscriptionPlan) {
            const cleanKey = String(requestedIdentifier || 'pro').toLowerCase();
            let planPrice = 59;
            let planTitle = 'Pro';
            if (cleanKey.includes('free') || cleanKey.includes('trial')) {
                planPrice = 0; planTitle = 'Free Trial';
            } else if (cleanKey.includes('standard')) {
                planPrice = 29; planTitle = 'Standard';
            } else if (cleanKey.includes('premium')) {
                planPrice = 99; planTitle = 'Premium';
            }
            subscriptionPlan = {
                subscriptionName: planTitle,
                unitPrice: planPrice,
                modules: [],
            };
        }

        // When they subscribe for another plan, let their free trial expire before that one starts counting:
        const hasActiveTrialOrPlan = activeSubscription && new Date(activeSubscription.endDate) > new Date();
        const startDate = hasActiveTrialOrPlan
            ? new Date(activeSubscription.endDate) // Start after active trial/plan finishes
            : new Date();
        const endDate = new Date(startDate);
        
        const cycle = String(subscriptionCycle || 'monthly').toLowerCase();
        switch (cycle) {
            case 'biweekly':
            case '14 days':
            case '14-days':
                endDate.setDate(endDate.getDate() + 14);
                break;
            case 'annually':
            case 'yearly':
                endDate.setFullYear(endDate.getFullYear() + 1);
                break;
            case 'monthly':
            default:
                endDate.setMonth(endDate.getMonth() + 1);
                break;
        }

        // Create new subscription with queued status if active trial exists
        const newSubscription = await Subscription.create({
            subscriptionPlan: subscriptionPlan.subscriptionName,
            unitPrice: subscriptionPlan.unitPrice || 0,
            price: subscriptionPlan.unitPrice || 0,
            subscriptionCycle: cycle === 'yearly' || cycle === 'annually' ? 'annually' : 'monthly',
            modules: subscriptionPlan.modules || [],
            companyId: String(company._id),
            companyName: company.companyName || company.name || 'Company',
            email: company.email,
            startDate,
            endDate,
            userRange,
            status: hasActiveTrialOrPlan ? 'pending' : 'active'
        });

        if (!hasActiveTrialOrPlan) {
            if (!company.companyFeatures) company.companyFeatures = {};
            company.companyFeatures.subscriptionStatus = {
                isActive: true,
                plan: subscriptionPlan.subscriptionName,
                currentCycle: cycle,
                startDate,
                endDate,
            };
            await company.save();
        }


        const test =await updatedModules.map(module => ({
            featurePermissions: module.moduleFeatures.flatMap(feature => 
                feature.featurePermissions.map(permission => ({
                    moduleKey: module.key, // Assuming module has a key property
                    featureId: feature._id,
                    permissionKey: permission.key,
                    permissionValue: false // Default value
                }))
            )
        }))

        console.log({test})



        // Update company features and free trial status if needed
        // if (!latestSubscription) {
            const updateData = {
                'companyFeatures.modules': updatedModules,
                'companyFeatures.subscriptionStatus': {
                    isActive: true,
                    plan: subscriptionPlan.subscriptionName,
                    currentCycle: subscriptionCycle,
                    startDate,
                    endDate
                }
            };

            // If this is a free trial subscription, we'll update the status after 2 months
            if (subscriptionPlan.subscriptionName === 'Free-Trial') {
                const twoMonthsFromNow = new Date();
                twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
                
                console.log(twoMonthsFromNow);
                
                updateData.freeTrialExpirationDate = twoMonthsFromNow;
            }

            await Company.findByIdAndUpdate(companyId, updateData);

                await Company.updateMany(
                        { _id: companyId },
                        {
                            $set: {
                                'systemRoles': [] // Clear all roles
                            }
                        }
                    );

            // Create default roles for the company
            const defaultRoles = ['Super Admin', 'Manager', 'Staff', 'External'];

            console.log(updatedModules)
            
            // Fetch all existing roles for the company
            const existingRoles = await Role.find({ companyId });

            // Combine default roles with existing roles
            const allRoles = [...defaultRoles, ...existingRoles.map(role => role.roleName)];

            for (const roleName of allRoles) {
                // Check if the role already exists for the company
                const existingRole = existingRoles.find(role => role.roleName === roleName);

                // Extract permissions from subscriptionPlan.modules
                const rolePermissions = [];
                for (const module of updatedModules) {
                    console.log({module});
                    // Add the module to rolePermissions for each role
                    rolePermissions.push(module);
                }

                console.log({rolePermissions})

                console.log(JSON.stringify(existingRole, null, 2));
                let newDefaultRole;

                if (existingRole) {
                    // Update existing role with new permissions
                    existingRole.rolePermissions = rolePermissions;
                    await existingRole.save();

                    console.log(`Updated role: ${existingRole.roleName}`, existingRole.rolePermissions);
                } else {
                    // Create new default role
                     newDefaultRole = new Role({
                        roleName: roleName,
                        description: `Default ${roleName} role`,
                        rolePermissions: rolePermissions, // Use the extracted permissions
                        companyId
                    });

                    let savedDefaultRole = await newDefaultRole.save();

                    console.log(`Created new role: ${savedDefaultRole.roleName}`, savedDefaultRole.rolePermissions);
                }

                // Update the company with the role
                await Company.findByIdAndUpdate(
                    companyId,
                    {
                        $addToSet: {
                            systemRoles: {
                                _id: existingRole ? existingRole._id : newDefaultRole?._id,
                                roleName: roleName,
                                description: existingRole ? existingRole.description : `Default ${roleName} role`,
                                rolePermissions: rolePermissions
                            }
                        }
                    }
                );
            }
        // }

        return res.status(201).json({
            status: 201,
            success: true,
            data: newSubscription
        });
    } catch (error) {
        console.error('Subscription error:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message
        });
    }
};

export default subscribe;