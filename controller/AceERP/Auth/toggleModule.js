import Role from '../../../model/Roles';
import Company from '../../../model/Company';
import Employee from '../../../model/Employees';
import mongoose from 'mongoose';

const toggleModule = async (req, res) => {
    try {
        const { companyId, modules } = req.body;
        console.log('Request received for companyId:', companyId);

        // Fetch current company data first for comparison
        const currentCompany = await Company.findById(companyId);
        if (!currentCompany) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Process each module (hr, om, settings)
        const moduleKeys = Object.keys(modules);
        
        for (const moduleKey of moduleKeys) {
            const moduleData = modules[moduleKey];
            if (!moduleData) {
                console.log(`No data for module: ${moduleKey}`);
                continue;
            }
            console.log(`Processing module: ${moduleKey}`);

            // Collect all updates for batch processing
            const updates = [];

            for (const roleData of moduleData) {
                const { roleId, rolePermissions } = roleData;
                console.log(`Processing roleId: ${roleId}`);
                
                for (const permission of rolePermissions) {
                    const { featureId, ...permissionUpdates } = permission;
                    console.log(`Processing featureId: ${featureId}`, permissionUpdates);
                    // Find current company feature permissions
                    const currentModule = currentCompany.companyFeatures.modules
                        .find(m => m.key === moduleKey);
                    const currentFeature = currentModule?.moduleFeatures
                        .find(f => f.featureId === featureId);

                    // Find current role permissions - Fixed nested path
                    const currentRole = currentCompany.systemRoles
                        .find(r => r._id.toString() === roleId);
                    
                    
                    const currentRoleModules = currentRole?.rolePermissions || [];
                    const currentRoleModule = currentRoleModules
                        .find(m => m.key === moduleKey);
                    
                    // console.log('Role module structure:', JSON.stringify(currentRoleModule, null, 2));
                    
                    const currentRoleFeatures = currentRoleModule?.moduleFeatures || [];
                    // console.log('Role features array:', JSON.stringify(currentRoleFeatures, null, 2));
                    
                    const currentRoleFeature = currentRoleFeatures
                        .find(f => f.featureId === String(featureId));
                    

                    for (const [key, value] of Object.entries(permissionUpdates)) {
                        // Compare with current company feature permissions
                        const currentCompanyPermValue = currentFeature?.featurePermissions
                            ?.find(p => p.key === key)?.value;

                        
                        // Compare with current role permissions - Fixed path
                        const currentRolePermValue = currentRoleFeature?.featurePermissions
                            ?.find(p => p.key === key)?.value;


                        // Add debug logging
                        console.log(`Comparing values for ${key}:`, {
                            newValue: value,
                            companyValue: currentCompanyPermValue,
                            roleValue: currentRolePermValue,
                            roleId,
                            moduleKey,
                            featureId
                        });

                        console.log(String(currentCompanyPermValue) !== String(value))
                        console.log(String(currentRolePermValue) !== String(value))

                        // Strict comparison might fail due to type differences
                        if (String(currentCompanyPermValue) !== String(value)) {
                            console.log(`Updating company permission for ${key}`);
                            await Company.updateOne(
                                { 
                                    _id: companyId,
                                    'companyFeatures.modules.key': moduleKey,
                                    'companyFeatures.modules.moduleFeatures.featureId': featureId,
                                    'companyFeatures.modules.moduleFeatures.featurePermissions.key': key
                                },
                                {
                                    $set: {
                                        'companyFeatures.modules.$[module].moduleFeatures.$[feature].featurePermissions.$[permission].value': value
                                    }
                                },
                                {
                                    arrayFilters: [
                                        { 'module.key': moduleKey },
                                        { 'feature.featureId': featureId },
                                        { 'permission.key': key }
                                    ]
                                }
                            )}
                        //     updates.push({
                        //         updateOne: {
                        //             filter: { 
                        //                 _id: companyId,
                        //                 'companyFeatures.modules.key': moduleKey,
                        //                 'companyFeatures.modules.moduleFeatures.featureId': featureId,
                        //                 'companyFeatures.modules.moduleFeatures.featurePermissions.key': key
                        //             },
                        //             update: {
                        //                 $set: {
                        //                     'companyFeatures.modules.$[module].moduleFeatures.$[feature].featurePermissions.$[permission].value': value
                        //                 }
                        //             },
                        //             arrayFilters: [
                        //                 { 'module.key': moduleKey },
                        //                 { 'feature.featureId': featureId },
                        //                 { 'permission.key': key }
                        //             ]
                        //         }
                        //     });
                        // }

                        if (String(currentRolePermValue) !== String(value)) {
                            console.log(`Updating role permission for ${key}`);
                            await Company.updateOne(
                                {
                                    _id: companyId,
                                    'systemRoles._id': roleId,
                                    'systemRoles.rolePermissions.key': moduleKey,
                                    'systemRoles.rolePermissions.moduleFeatures.featureId': featureId,
                                    'systemRoles.rolePermissions.moduleFeatures.featurePermissions.key': key
                                },
                                {
                                    $set: {
                                        'systemRoles.$[role].rolePermissions.$[module].moduleFeatures.$[feature].featurePermissions.$[permission].value': value
                                    }
                                },
                                {
                                    arrayFilters: [
                                        { 'role._id': roleId },
                                        { 'module.key': moduleKey },
                                        { 'feature.featureId': featureId },
                                        { 'permission.key': key }
                                    ]
                                }
                            );
                            // updates.push({
                            //     updateOne: {
                            //         filter: {
                            //             _id: companyId,
                            //             'systemRoles._id': roleId,
                            //             'systemRoles.rolePermissions.key': moduleKey,
                            //             'systemRoles.rolePermissions.moduleFeatures.featureId': featureId,
                            //             'systemRoles.rolePermissions.moduleFeatures.featurePermissions.key': key
                            //         },
                            //         update: {
                            //             $set: {
                            //                 'systemRoles.$[role].rolePermissions.$[module].moduleFeatures.$[feature].featurePermissions.$[permission].value': value
                            //             }
                            //         },
                            //         arrayFilters: [
                            //             { 'role._id': roleId },
                            //             { 'module.key': moduleKey },
                            //             { 'feature.featureId': featureId },
                            //             { 'permission.key': key
                            //             }
                            //         ]
                            //     }
                            // });
                        }
                    }
                }
            }

            // Perform batch update if there are any updates
            // if (updates.length > 0) {
            //     await Company.bulkWrite(updates);
            // }
        }

        const updatedCompany = await Company.findById(companyId);
        console.log('Company updated successfully');

        return res.status(200).json({
            success: true,
            message: 'Modules and permissions updated successfully',
            data: updatedCompany
        });

    } catch (error) {
        console.error('Error in toggleModule:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update modules and permissions',
            error: error.message
        });
    }
};

export default toggleModule; 