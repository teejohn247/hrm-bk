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
            subscriptionCycle,
            companyId,
            userRange
        } = req.body;

        // Validate required fields and company
        let company = await Company.findOne({ _id: companyId });
        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                errorMessage: 'Company not found'
            });
        }

        // Check for active or pending subscriptions
        const latestSubscription = await Subscription.findOne({
            companyId,
            status: { $in: ['active', 'pending'] }
        }).sort({ endDate: -1 });  // Get the subscription with the latest end date

        // Fetch subscription plan
        const subscriptionPlan = await SubscriptionPlan.findById(subscriptionPlanId);
        if (!subscriptionPlan) {
            return res.status(404).json({
                status: 404,
                success: false,
                errorMessage: 'Subscription plan not found'
            });
        }

        // Check Free Trial eligibility
        if (subscriptionPlan.subscriptionName === 'Free-Trial') {
            // Get all free trial subscriptions for this company
            const freeTrialSubscriptions = await Subscription.find({
                companyId,
                subscriptionPlan: 'Free-Trial'
            });

            // Check if any free trial is 2 months or older
            const twoMonthsAgo = new Date();
            twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

            const hasExpiredFreeTrial = freeTrialSubscriptions.some(sub => {
                return new Date(sub.startDate) <= twoMonthsAgo;
            });


            if (hasExpiredFreeTrial || company.freeTrialExpired) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    errorMessage: 'Free trial period has expired. Please choose a different subscription plan.'
                });
            }
        }

        // Calculate subscription dates
        const startDate = latestSubscription 
            ? new Date(latestSubscription.endDate) // Start after latest subscription ends
            : new Date();
        const endDate = new Date(startDate);
        
        switch (subscriptionCycle) {
            case 'biweekly':
                endDate.setDate(endDate.getDate() + 14);
                break;
            case 'monthly':
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            case 'annually':
                endDate.setFullYear(endDate.getFullYear() + 1);
                break;
        }

        // Fetch all modules from the database
        const allModules = await Module.find(); // Assuming Module is the correct model to fetch all modules

        // console.log(JSON.stringify(allModules.modules, null, 2)); // Log all nested objects in a readable format

        // Flatten all modules from all elements in allModules
        const modulesArray = allModules.flatMap(allModule => allModule.modules);

        const updatedModules = subscriptionPlan.modules.map(subscriptionModule => {
            // Find the matching module from the flattened modulesArray
            const matchingModule = modulesArray.find(module => module?.moduleId?.toString() === subscriptionModule.moduleId.toString());
            
            // Log the matching module for debugging
            // console.log(JSON.stringify(matchingModule, null, 2)); // Log all nested objects in a readable format

            return matchingModule || subscriptionModule; // Use logical OR to return matchingModule or subscriptionModule
        });

        // console.log(JSON.stringify({updatedModules}, null, 2)); // Log all nested objects in a readable format

      

        // Create new subscription with appropriate status
        const newSubscription = await Subscription.create({
            subscriptionPlan: subscriptionPlan.subscriptionName,
            unitPrice: subscriptionPlan.unitPrice,
            subscriptionCycle,
            modules: updatedModules, // Use the updated modules
            companyId,
            companyName: company.name,
            email: company.email,
            startDate,
            endDate,
            userRange,
            status: latestSubscription ? 'pending' : 'active'
        });


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