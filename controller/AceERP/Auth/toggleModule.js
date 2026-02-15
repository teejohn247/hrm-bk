// import Role from '../../../model/Roles';
// import Company from '../../../model/Company';
// import Employee from '../../../model/Employees';
// import mongoose from 'mongoose';

// const toggleModule = async (req, res) => {
//     try {
//         const { companyId, modules } = req.body;
//         console.log('Request received for companyId:', companyId);

//         // Fetch current company data first for comparison
//         const currentCompany = await Company.findById(companyId);
//         if (!currentCompany) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Company not found'
//             });
//         }

//         // Process each module (hr, om, settings)
//         const moduleKeys = Object.keys(modules);
        
//         for (const moduleKey of moduleKeys) {
//             const moduleData = modules[moduleKey];
//             if (!moduleData) {
//                 console.log(`No data for module: ${moduleKey}`);
//                 continue;
//             }
//             console.log(`Processing module: ${moduleKey}`);

//             // Collect all updates for batch processing
//             const updates = [];

//             for (const roleData of moduleData) {
//                 const { roleId, rolePermissions } = roleData;
//                 console.log(`Processing roleId: ${roleId}`);
                
//                 for (const permission of rolePermissions) {
//                     const { featureId, ...permissionUpdates } = permission;
//                     console.log(`Processing featureId: ${featureId}`, permissionUpdates);
//                     // Find current company feature permissions
//                     const currentModule = currentCompany.companyFeatures.modules
//                         .find(m => m.key === moduleKey);
//                     const currentFeature = currentModule?.moduleFeatures
//                         .find(f => f.featureId === featureId);

//                     // Find current role permissions - Fixed nested path
//                     const currentRole = currentCompany.systemRoles
//                         .find(r => r._id.toString() === roleId);
                    
                    
//                     const currentRoleModules = currentRole?.rolePermissions || [];
//                     const currentRoleModule = currentRoleModules
//                         .find(m => m.key === moduleKey);
                    
//                     // console.log('Role module structure:', JSON.stringify(currentRoleModule, null, 2));
                    
//                     const currentRoleFeatures = currentRoleModule?.moduleFeatures || [];
//                     // console.log('Role features array:', JSON.stringify(currentRoleFeatures, null, 2));
                    
//                     const currentRoleFeature = currentRoleFeatures
//                         .find(f => f.featureId === String(featureId));
                    

//                     for (const [key, value] of Object.entries(permissionUpdates)) {
//                         // Compare with current company feature permissions
//                         const currentCompanyPermValue = currentFeature?.featurePermissions
//                             ?.find(p => p.key === key)?.value;

                        
//                         // Compare with current role permissions - Fixed path
//                         const currentRolePermValue = currentRoleFeature?.featurePermissions
//                             ?.find(p => p.key === key)?.value;


//                         // Add debug logging
//                         console.log(`Comparing values for ${key}:`, {
//                             newValue: value,
//                             companyValue: currentCompanyPermValue,
//                             roleValue: currentRolePermValue,
//                             roleId,
//                             moduleKey,
//                             featureId
//                         });

//                         console.log(String(currentCompanyPermValue) !== String(value))
//                         console.log(String(currentRolePermValue) !== String(value))

//                         // Strict comparison might fail due to type differences
//                         if (String(currentCompanyPermValue) !== String(value)) {
//                             console.log(`Updating company permission for ${key}`);
//                             await Company.updateOne(
//                                 { 
//                                     _id: companyId,
//                                     'companyFeatures.modules.key': moduleKey,
//                                     'companyFeatures.modules.moduleFeatures.featureId': featureId,
//                                     'companyFeatures.modules.moduleFeatures.featurePermissions.key': key
//                                 },
//                                 {
//                                     $set: {
//                                         'companyFeatures.modules.$[module].moduleFeatures.$[feature].featurePermissions.$[permission].value': value
//                                     }
//                                 },
//                                 {
//                                     arrayFilters: [
//                                         { 'module.key': moduleKey },
//                                         { 'feature.featureId': featureId },
//                                         { 'permission.key': key }
//                                     ]
//                                 }
//                             )}
//                         //     updates.push({
//                         //         updateOne: {
//                         //             filter: { 
//                         //                 _id: companyId,
//                         //                 'companyFeatures.modules.key': moduleKey,
//                         //                 'companyFeatures.modules.moduleFeatures.featureId': featureId,
//                         //                 'companyFeatures.modules.moduleFeatures.featurePermissions.key': key
//                         //             },
//                         //             update: {
//                         //                 $set: {
//                         //                     'companyFeatures.modules.$[module].moduleFeatures.$[feature].featurePermissions.$[permission].value': value
//                         //                 }
//                         //             },
//                         //             arrayFilters: [
//                         //                 { 'module.key': moduleKey },
//                         //                 { 'feature.featureId': featureId },
//                         //                 { 'permission.key': key }
//                         //             ]
//                         //         }
//                         //     });
//                         // }

//                         if (String(currentRolePermValue) !== String(value)) {
//                             console.log(`Updating role permission for ${key}`);
//                             await Company.updateOne(
//                                 {
//                                     _id: companyId,
//                                     'systemRoles._id': roleId,
//                                     'systemRoles.rolePermissions.key': moduleKey,
//                                     'systemRoles.rolePermissions.moduleFeatures.featureId': featureId,
//                                     'systemRoles.rolePermissions.moduleFeatures.featurePermissions.key': key
//                                 },
//                                 {
//                                     $set: {
//                                         'systemRoles.$[role].rolePermissions.$[module].moduleFeatures.$[feature].featurePermissions.$[permission].value': value
//                                     }
//                                 },
//                                 {
//                                     arrayFilters: [
//                                         { 'role._id': roleId },
//                                         { 'module.key': moduleKey },
//                                         { 'feature.featureId': featureId },
//                                         { 'permission.key': key }
//                                     ]
//                                 }
//                             );
//                             // updates.push({
//                             //     updateOne: {
//                             //         filter: {
//                             //             _id: companyId,
//                             //             'systemRoles._id': roleId,
//                             //             'systemRoles.rolePermissions.key': moduleKey,
//                             //             'systemRoles.rolePermissions.moduleFeatures.featureId': featureId,
//                             //             'systemRoles.rolePermissions.moduleFeatures.featurePermissions.key': key
//                             //         },
//                             //         update: {
//                             //             $set: {
//                             //                 'systemRoles.$[role].rolePermissions.$[module].moduleFeatures.$[feature].featurePermissions.$[permission].value': value
//                             //             }
//                             //         },
//                             //         arrayFilters: [
//                             //             { 'role._id': roleId },
//                             //             { 'module.key': moduleKey },
//                             //             { 'feature.featureId': featureId },
//                             //             { 'permission.key': key
//                             //             }
//                             //         ]
//                             //     }
//                             // });
//                         }
//                     }
//                 }
//             }

//             // Perform batch update if there are any updates
//             // if (updates.length > 0) {
//             //     await Company.bulkWrite(updates);
//             // }
//         }

//         const updatedCompany = await Company.findById(companyId);
//         console.log('Company updated successfully');

//         return res.status(200).json({
//             success: true,
//             message: 'Modules and permissions updated successfully',
//             data: updatedCompany
//         });

//     } catch (error) {
//         console.error('Error in toggleModule:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Failed to update modules and permissions',
//             error: error.message
//         });
//     }
// };

// export default toggleModule; 


import Role from '../../../model/Roles';
import Company from '../../../model/Company';
import Employee from '../../../model/Employees';
import mongoose from 'mongoose';

const toggleModule = async (req, res) => {
    try {
        const { companyId, modules } = req.body;

        // Validate input
        if (!companyId || !modules) {
            return res.status(400).json({
                success: false,
                message: 'companyId and modules are required'
            });
        }

        // Fetch company once
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Build bulk write operations
        const bulkOps = [];
        const moduleKeys = Object.keys(modules);

        for (const moduleKey of moduleKeys) {
            const moduleData = modules[moduleKey];
            if (!moduleData || !Array.isArray(moduleData)) {
                continue;
            }

            for (const roleData of moduleData) {
                const { roleId, rolePermissions } = roleData;
                if (!roleId || !rolePermissions) {
                    continue;
                }

                for (const permission of rolePermissions) {
                    const { featureId, ...permissionUpdates } = permission;
                    if (!featureId) {
                        continue;
                    }

                    // Get current values for comparison
                    const currentValues = getCurrentPermissionValues(
                        company,
                        moduleKey,
                        featureId,
                        roleId
                    );

                    // Build updates for each permission key
                    for (const [key, value] of Object.entries(permissionUpdates)) {
                        // Update company feature permissions if changed
                        if (currentValues.company[key] !== value) {
                            bulkOps.push({
                                updateOne: {
                                    filter: {
                                        _id: companyId,
                                        'companyFeatures.modules.key': moduleKey,
                                        'companyFeatures.modules.moduleFeatures.featureId': featureId,
                                        'companyFeatures.modules.moduleFeatures.featurePermissions.key': key
                                    },
                                    update: {
                                        $set: {
                                            'companyFeatures.modules.$[module].moduleFeatures.$[feature].featurePermissions.$[permission].value': value
                                        }
                                    },
                                    arrayFilters: [
                                        { 'module.key': moduleKey },
                                        { 'feature.featureId': featureId },
                                        { 'permission.key': key }
                                    ]
                                }
                            });
                        }

                        // Update role permissions if changed
                        if (currentValues.role[key] !== value) {
                            bulkOps.push({
                                updateOne: {
                                    filter: {
                                        _id: companyId,
                                        'systemRoles._id': roleId,
                                        'systemRoles.rolePermissions.key': moduleKey,
                                        'systemRoles.rolePermissions.moduleFeatures.featureId': featureId,
                                        'systemRoles.rolePermissions.moduleFeatures.featurePermissions.key': key
                                    },
                                    update: {
                                        $set: {
                                            'systemRoles.$[role].rolePermissions.$[module].moduleFeatures.$[feature].featurePermissions.$[permission].value': value
                                        }
                                    },
                                    arrayFilters: [
                                        { 'role._id': new mongoose.Types.ObjectId(roleId) },
                                        { 'module.key': moduleKey },
                                        { 'feature.featureId': featureId },
                                        { 'permission.key': key }
                                    ]
                                }
                            });
                        }
                    }
                }
            }
        }

        // Execute all updates in a single batch operation
        if (bulkOps.length > 0) {
            await Company.bulkWrite(bulkOps, { ordered: false });
        }

        // Fetch updated company
        const updatedCompany = await Company.findById(companyId);

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

/**
 * Helper function to get current permission values for comparison
 * @param {Object} company - Company document
 * @param {string} moduleKey - Module key (e.g., 'hr', 'om')
 * @param {number} featureId - Feature ID
 * @param {string} roleId - Role ID
 * @returns {Object} Object with company and role permission values
 */
function getCurrentPermissionValues(company, moduleKey, featureId, roleId) {
    const result = {
        company: {},
        role: {}
    };

    // Get company feature permissions
    const companyModule = company.companyFeatures?.modules?.find(m => m.key === moduleKey);
    const companyFeature = companyModule?.moduleFeatures?.find(f => f.featureId === featureId);
    
    if (companyFeature?.featurePermissions) {
        companyFeature.featurePermissions.forEach(perm => {
            result.company[perm.key] = perm.value;
        });
    }

    // Get role permissions
    const role = company.systemRoles?.find(r => r._id.toString() === roleId);
    const roleModule = role?.rolePermissions?.find(m => m.key === moduleKey);
    const roleFeature = roleModule?.moduleFeatures?.find(f => f.featureId === String(featureId));
    
    if (roleFeature?.featurePermissions) {
        roleFeature.featurePermissions.forEach(perm => {
            result.role[perm.key] = perm.value;
        });
    }

    return result;
}

export default toggleModule;