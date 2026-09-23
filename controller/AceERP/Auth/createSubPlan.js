import SubscriptionPlan from '../../../model/SubscriptionPlan';
import Modules from '../../../model/Modules';

/**
 * Create a new subscription plan.
 * Accepts moduleIds (array of module IDs) instead of full module objects.
 * Fetches module definitions from Modules collection to build the plan.
 */
const createSubPlan = async (req, res) => {
    try {
        const {
            subscriptionName,
            unitPrice,
            description,
            moduleIds
        } = req.body;

        // Validate required fields
        if (!subscriptionName || !moduleIds) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Please provide subscriptionName and moduleIds'
            });
        }

        if (!Array.isArray(moduleIds)) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'moduleIds must be an array'
            });
        }

        // Fetch modules from Modules collection
        const moduleDoc = await Modules.findOne();
        if (!moduleDoc || !moduleDoc.modules?.length) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'No modules configuration found'
            });
        }

        // Build modules array from moduleIds - match by moduleId
        const modules = [];
        for (const id of moduleIds) {
            const idNum = Number(id);
            const module = moduleDoc.modules.find(
                m => m.moduleId === idNum || m.moduleId?.toString() === String(id)
            );
            if (!module) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: `Module with id ${id} not found`
                });
            }
            modules.push({
                moduleId: module.moduleId,
                key: module.key,
                moduleName: module.moduleName,
                value: module.value,
                active: false,
                moduleFeatures: (module.moduleFeatures || []).map(f => ({
                    featureId: f.featureId,
                    featureKey: f.featureKey,
                    featureName: f.featureName,
                    featurePermissions: (f.featurePermissions || []).map(p => ({
                        key: p.key,
                        name: p.name,
                        permissionType: p.permissionType
                    }))
                }))
            });
        }

        const subscriptionPlan = await SubscriptionPlan.create({
            subscriptionName,
            unitPrice: unitPrice ?? 0,
            description,
            modules
        });

        return res.status(200).json({
            status: 200,
            success: true,
            data: subscriptionPlan
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message
        });
    }
};

export default createSubPlan;
