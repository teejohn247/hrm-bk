import Modules from '../../../model/Modules';
import Company from '../../../model/Company';
import { erpModules } from '../../../constants/modules';
import mongoose from 'mongoose';

const addPermission = async (req, res) => {
    try {
        const { moduleId, featureId, permissionKey, permissionName, permissionType } = req.body;

        let moduleDoc = await Modules.findOne();
        if (!moduleDoc) {
            moduleDoc = await new Modules({
                modules: erpModules
            });
            await moduleDoc.save();
        }

        // Find using _id from request
        const moduleToUpdate = moduleDoc.modules.find(m => m._id.toString() === moduleId);
        if (!moduleToUpdate) {
            return res.status(400).json({
                status: 400,
                error: 'Module not found'
            });
        }

        // Find feature using _id from request
        const featureToUpdate = moduleToUpdate.moduleFeatures.find(f => f._id.toString() === featureId);
        if (!featureToUpdate) {
            return res.status(400).json({
                status: 400,
                error: 'Feature not found'
            });
        }

        // Initialize featurePermissions array if it doesn't exist
        if (!featureToUpdate.featurePermissions) {
            featureToUpdate.featurePermissions = [];
        }

        // Add or update permission in the module
        const existingPermissionIndex = featureToUpdate.featurePermissions.findIndex(p => p.key === permissionKey);
        if (existingPermissionIndex === -1) {
            // Add new permission
            featureToUpdate.featurePermissions.push({
                key: permissionKey,
                permissionType: permissionType,
                name: permissionName
            });
        } else {
            // Update existing permission
            featureToUpdate.featurePermissions[existingPermissionIndex].name = permissionName;
        }

        await moduleDoc.save();

        // Update companies
        const companies = await Company.find({});
        const updatePromises = companies.map(async (company) => {
            if (!company.companyFeatures) {
                company.companyFeatures = {
                    modules: moduleDoc.modules.map(module => ({
                        moduleId: module.moduleId,
                        key: module.key,
                        moduleName: module.moduleName,
                        value: module.value,
                        moduleFeatures: module.moduleFeatures.map(feature => ({
                            featureId: feature.featureId,
                            featureKey: feature.featureKey,
                            featureName: feature.featureName,
                            featurePermissions: feature.featurePermissions ? feature.featurePermissions.map(permission => ({
                                key: permission.key,
                                permissionType: permission.permissionType,
                                name: permission.name,
                                value: false
                            })) : []
                        }))
                    }))
                };
            } else {
                // Sync all modules with template
                company.companyFeatures.modules = moduleDoc.modules.map(moduleTemplate => {
                    // Find existing module using numeric moduleId
                    const existingModule = company.companyFeatures.modules.find(
                        m => m.moduleId === moduleTemplate.moduleId
                    );

                    const moduleFeatures = moduleTemplate.moduleFeatures.map(featureTemplate => {
                        // Find existing feature using numeric featureId
                        const existingFeature = existingModule?.moduleFeatures?.find(
                            f => f.featureId === featureTemplate.featureId
                        );

                        const featurePermissions = featureTemplate.featurePermissions ? 
                            featureTemplate.featurePermissions.map(permTemplate => {
                                const existingPermission = existingFeature?.featurePermissions?.find(
                                    p => p.key === permTemplate.key
                                );

                                return {
                                    key: permTemplate.key,
                                    permissionType: permTemplate.permissionType,
                                    name: permTemplate.name,
                                    value: existingPermission ? existingPermission.value : false
                                };
                            }) : [];

                        return {
                            featureId: featureTemplate.featureId,
                            featureKey: featureTemplate.featureKey,
                            featureName: featureTemplate.featureName,
                            featurePermissions: featurePermissions,
                            _id: new mongoose.Types.ObjectId()
                        };
                    });

                    return {
                        moduleId: moduleTemplate.moduleId,
                        key: moduleTemplate.key,
                        moduleName: moduleTemplate.moduleName,
                        value: existingModule ? existingModule.value : moduleTemplate.value,
                        moduleFeatures: moduleFeatures
                    };
                });
            }

            // Add systemRoles update logic
            if (company.systemRoles && Array.isArray(company.systemRoles)) {
                company.systemRoles.forEach(role => {
                    // Find the module in rolePermissions
                    const moduleInRole = role.rolePermissions.find(m => m.key === moduleToUpdate.key);

                    if (moduleInRole && moduleInRole.moduleFeatures) {
                        // Find the feature in moduleFeatures
                        const featureInModule = moduleInRole.moduleFeatures.find(f => f.featureId === featureToUpdate.featureId.toString());
                        console.log({featureInModule}, featureToUpdate.featureId);
                      
                        if (featureInModule) {
                            // Append new permissions that don't exist yet
                            featureToUpdate.featurePermissions.forEach(newPermission => {
                                console.log({newPermission});
                                if (!featureInModule.featurePermissions.some(p => p.key === newPermission.key)) {
                                    featureInModule.featurePermissions.push({
                                        key: newPermission.key,
                                        name: newPermission.name,
                                        permissionType: newPermission.permissionType,
                                        value: false,
                                        _id: new mongoose.Types.ObjectId()
                                    });
                                }
                            });
                        }
                    }
                });
            }

            return company.save();
        });

        await Promise.all(updatePromises);

        res.status(200).json({
            status: 200,
            data: moduleDoc
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(400).json({
            status: 400,
            error: error.message
        });
    }
};

export default addPermission;