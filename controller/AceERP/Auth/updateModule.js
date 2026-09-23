import Modules from '../../../model/Modules';
import Company from '../../../model/Company';

/**
 * Build module structure for company (with value preserved or false for new perms)
 */
function buildModuleForCompany(module, existingCompanyModule = null) {
    return {
        moduleId: module.moduleId,
        key: module.key,
        moduleName: module.moduleName,
        value: module.value,
        moduleFeatures: (module.moduleFeatures || []).map(feature => {
            const existingFeature = existingCompanyModule?.moduleFeatures?.find(
                f => f.featureId === feature.featureId
            );
            return {
                featureId: feature.featureId,
                featureKey: feature.featureKey,
                featureName: feature.featureName,
                featurePermissions: (feature.featurePermissions || []).map(perm => {
                    const existingPerm = existingFeature?.featurePermissions?.find(
                        p => p.key === perm.key
                    );
                    return {
                        key: perm.key,
                        permissionType: perm.permissionType,
                        name: perm.name,
                        value: existingPerm?.value ?? false
                    };
                })
            };
        })
    };
}

/**
 * Build module structure for role (preserve permission values)
 */
function buildModuleForRole(module, existingRoleModule = null) {
    return {
        moduleId: String(module.moduleId),
        key: module.key,
        moduleName: module.moduleName,
        value: module.value,
        moduleFeatures: (module.moduleFeatures || []).map(feature => {
            const existingFeature = existingRoleModule?.moduleFeatures?.find(
                f => String(f.featureId) === String(feature.featureId)
            );
            return {
                featureId: String(feature.featureId),
                featureKey: feature.featureKey,
                featureName: feature.featureName,
                featurePermissions: (feature.featurePermissions || []).map(perm => {
                    const existingPerm = existingFeature?.featurePermissions?.find(
                        p => p.key === perm.key
                    );
                    return {
                        key: perm.key,
                        name: perm.name,
                        permissionType: perm.permissionType,
                        value: existingPerm?.value ?? false
                    };
                })
            };
        })
    };
}

const updateModule = async (req, res) => {
    try {
        const { id } = req.params;
        const { key, moduleName, value, moduleFeatures } = req.body;

        const moduleDoc = await Modules.findOne();
        if (!moduleDoc) {
            return res.status(404).json({
                status: 404,
                error: 'No modules configuration found'
            });
        }

        const isObjectId = /^[a-fA-F0-9]{24}$/.test(id);
        const moduleIndex = moduleDoc.modules.findIndex(m =>
            isObjectId ? m._id?.toString() === id : m.moduleId === Number(id) || m.key === id
        );

        if (moduleIndex === -1) {
            return res.status(404).json({
                status: 404,
                error: 'Module not found'
            });
        }

        const existingModule = moduleDoc.modules[moduleIndex];

        if (key !== undefined) {
            const keyConflict = moduleDoc.modules.some((m, i) => i !== moduleIndex && m.key === key.trim().toLowerCase());
            if (keyConflict) {
                return res.status(400).json({
                    status: 400,
                    error: `Module with key "${key}" already exists`
                });
            }
            existingModule.key = key.trim().toLowerCase();
        }
        if (moduleName !== undefined) existingModule.moduleName = moduleName;
        if (value !== undefined) existingModule.value = value;

        if (moduleFeatures !== undefined) {
            existingModule.moduleFeatures = moduleFeatures.map((f, idx) => ({
                featureId: f.featureId ?? idx + 1,
                featureKey: f.featureKey || `feature_${idx + 1}`,
                featureName: f.featureName || f.featureKey || `Feature ${idx + 1}`,
                featurePermissions: (f.featurePermissions || []).map(p => ({
                    key: p.key,
                    name: p.name || p.key,
                    permissionType: p.permissionType || 'read'
                }))
            }));
        }

        await moduleDoc.save();

        const companies = await Company.find({});
        for (const company of companies) {
            if (company.companyFeatures?.modules) {
                const companyModuleIndex = company.companyFeatures.modules.findIndex(
                    m => m.moduleId === existingModule.moduleId
                );

                if (companyModuleIndex === -1) {
                    company.companyFeatures.modules.push(
                        buildModuleForCompany(existingModule)
                    );
                } else {
                    const existingCompanyModule = company.companyFeatures.modules[companyModuleIndex];
                    company.companyFeatures.modules[companyModuleIndex] = buildModuleForCompany(
                        existingModule,
                        existingCompanyModule
                    );
                }
            }

            if (company.systemRoles?.length) {
                company.systemRoles.forEach(role => {
                    if (!role.rolePermissions) role.rolePermissions = [];
                    const roleModuleIndex = role.rolePermissions.findIndex(
                        p => p.moduleId === String(existingModule.moduleId) || p.key === existingModule.key
                    );
                    const updatedRoleModule = buildModuleForRole(
                        existingModule,
                        roleModuleIndex >= 0 ? role.rolePermissions[roleModuleIndex] : null
                    );
                    if (roleModuleIndex >= 0) {
                        role.rolePermissions[roleModuleIndex] = updatedRoleModule;
                    } else {
                        role.rolePermissions.push(updatedRoleModule);
                    }
                });
            }
            await company.save();
        }

        return res.status(200).json({
            status: 200,
            message: 'Module updated successfully',
            data: existingModule
        });

    } catch (error) {
        console.error('Error in updateModule:', error);
        return res.status(500).json({
            status: 500,
            error: error.message || 'Internal server error'
        });
    }
};

export default updateModule;
