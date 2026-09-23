import Modules from '../../../model/Modules';

const fetchModuleById = async (req, res) => {
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
        const module = moduleDoc.modules.find(m =>
            isObjectId
                ? m._id?.toString() === id
                : m.moduleId === Number(id) || m.key === id
        );

        if (!module) {
            return res.status(404).json({
                status: 404,
                error: 'Module not found'
            });
        }

        return res.status(200).json({
            status: 200,
            data: module
        });
    } catch (error) {
        console.error('Error in fetchModuleById:', error);
        return res.status(500).json({
            status: 500,
            error: error.message || 'Internal server error'
        });
    }
};

export default fetchModuleById;
