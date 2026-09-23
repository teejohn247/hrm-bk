import Modules from '../../../model/Modules';
import Company from '../../../model/Company';

/**
 * Build module structure for company (with value: false for permissions)
 */
function buildModuleForCompany(module) {
    return {
        moduleId: module.moduleId,
        key: module.key,
        moduleName: module.moduleName,
        value: module.value,
        moduleFeatures: (module.moduleFeatures || []).map(feature => ({
            featureId: feature.featureId,
            featureKey: feature.featureKey,
            featureName: feature.featureName,
            featurePermissions: (feature.featurePermissions || []).map(perm => ({
                key: perm.key,
                permissionType: perm.permissionType,
                name: perm.name,
                value: false
            }))
        }))
    };
}

const createModule = async (req, res) => {
    try {
        const { key, moduleName, value, moduleFeatures } = req.body;

        if (!key || !moduleName || !value) {
            return res.status(400).json({
                status: 400,
                error: 'Missing required fields: key, moduleName, value'
            });
        }

        let moduleDoc = await Modules.findOne();
        if (!moduleDoc) {
            moduleDoc = new Modules({ modules: [] });
            await moduleDoc.save();
        }

        const existingModule = moduleDoc.modules.find(m => m.key === key);
        if (existingModule) {
            return res.status(400).json({
                status: 400,
                error: `Module with key "${key}" already exists`
            });
        }

        const nextModuleId = moduleDoc.modules.length > 0
            ? Math.max(...moduleDoc.modules.map(m => m.moduleId)) + 1
            : 1;

        const newModule = {
            moduleId: nextModuleId,
            key: key.trim().toLowerCase(),
            moduleName,
            value,
            moduleFeatures: (moduleFeatures || []).map((f, idx) => ({
                featureId: f.featureId ?? idx + 1,
                featureKey: f.featureKey || `feature_${idx + 1}`,
                featureName: f.featureName || f.featureKey || `Feature ${idx + 1}`,
                featurePermissions: (f.featurePermissions || []).map(p => ({
                    key: p.key,
                    name: p.name || p.key,
                    permissionType: p.permissionType || 'read'
                }))
            }))
        };

        moduleDoc.modules.push(newModule);
        await moduleDoc.save();

        const companyModule = buildModuleForCompany(newModule);

        const roleModule = {
            moduleId: String(newModule.moduleId),
            key: newModule.key,
            moduleName: newModule.moduleName,
            value: newModule.value,
            moduleFeatures: (newModule.moduleFeatures || []).map(feature => ({
                featureId: String(feature.featureId),
                featureKey: feature.featureKey,
                featureName: feature.featureName,
                featurePermissions: (feature.featurePermissions || []).map(perm => ({
                    key: perm.key,
                    name: perm.name,
                    permissionType: perm.permissionType,
                    value: false
                }))
            }))
        };

        const companies = await Company.find({});
        for (const company of companies) {
            if (!company.companyFeatures) {
                company.companyFeatures = { modules: [] };
            }
            if (!company.companyFeatures.modules) {
                company.companyFeatures.modules = [];
            }
            company.companyFeatures.modules.push(companyModule);

            if (company.systemRoles?.length) {
                company.systemRoles.forEach(role => {
                    if (!role.rolePermissions) role.rolePermissions = [];
                    role.rolePermissions.push(JSON.parse(JSON.stringify(roleModule)));
                });
            }
            await company.save();
        }

        return res.status(201).json({
            status: 201,
            message: 'Module created successfully',
            data: newModule
        });

    } catch (error) {
        console.error('Error in createModule:', error);
        return res.status(500).json({
            status: 500,
            error: error.message || 'Internal server error'
        });
    }
};

export default createModule;
