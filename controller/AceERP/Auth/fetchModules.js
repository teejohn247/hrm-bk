import Modules from '../../../model/Modules';

/**
 * Ensure permissionType is present in featurePermissions (default 'view' if missing)
 */
function ensurePermissionType(modules) {
    return (modules || []).map(m => ({
        ...m.toObject ? m.toObject() : m,
        moduleFeatures: (m.moduleFeatures || []).map(f => ({
            ...(f.toObject ? f.toObject() : f),
            featurePermissions: (f.featurePermissions || []).map(p => {
                const perm = p.toObject ? p.toObject() : p;
                return {
                    ...perm,
                    permissionType: perm.permissionType || 'view'
                };
            })
        }))
    }));
}

const fetchModules = async (req, res) => {
    try {
        const moduleDoc = await Modules.findOne();
        if (!moduleDoc) {
            return res.status(404).json({
                status: 404,
                message: 'No modules configuration found'
            });
        }

        const modules = ensurePermissionType(moduleDoc.modules);

        res.status(200).json({
            status: 200,
            data: modules
        });

    } catch (error) {
        console.error('Error in fetchModules:', error);
        res.status(500).json({
            status: 500,
            message: 'Error fetching modules',
            error: error.message
        });
    }
};

export default fetchModules;
