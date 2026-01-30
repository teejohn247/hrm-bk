import Modules from '../../../model/Modules';

const fetchModules = async (req, res) => {
    try {
        const moduleDoc = await Modules.findOne();
        if (!moduleDoc) {
            return res.status(404).json({
                status: 404,
                message: 'No modules configuration found'
            });
        }

        res.status(200).json({
            status: 200,
            data: moduleDoc.modules
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
