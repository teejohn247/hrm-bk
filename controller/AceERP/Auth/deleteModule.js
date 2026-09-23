import Modules from '../../../model/Modules';
import Company from '../../../model/Company';

const deleteModule = async (req, res) => {
    try {
        const { id } = req.params;

        const moduleDoc = await Modules.findOne();
        if (!moduleDoc) {
            return res.status(404).json({
                status: 404,
                error: 'No modules configuration found'
            });
        }

        const isObjectId = /^[a-fA-F0-9]{24}$/.test(id);
        const moduleToDelete = moduleDoc.modules.find(m =>
            isObjectId ? m._id?.toString() === id : m.moduleId === Number(id) || m.key === id
        );

        if (!moduleToDelete) {
            return res.status(404).json({
                status: 404,
                error: 'Module not found'
            });
        }

        const moduleId = moduleToDelete.moduleId;

        moduleDoc.modules = moduleDoc.modules.filter(
            m => m.moduleId !== moduleId && m._id?.toString() !== id
        );
        await moduleDoc.save();

        const moduleKey = moduleToDelete.key;
        const companies = await Company.find({});
        for (const company of companies) {
            if (company.companyFeatures?.modules) {
                company.companyFeatures.modules = company.companyFeatures.modules.filter(
                    m => m.moduleId !== moduleId
                );
            }
            if (company.systemRoles?.length) {
                company.systemRoles.forEach(role => {
                    if (role.rolePermissions) {
                        role.rolePermissions = role.rolePermissions.filter(
                            p => p.moduleId !== String(moduleId) && p.key !== moduleKey
                        );
                    }
                });
            }
            await company.save();
        }

        return res.status(200).json({
            status: 200,
            message: 'Module deleted successfully',
            data: { deletedModuleId: moduleId }
        });

    } catch (error) {
        console.error('Error in deleteModule:', error);
        return res.status(500).json({
            status: 500,
            error: error.message || 'Internal server error'
        });
    }
};

export default deleteModule;
