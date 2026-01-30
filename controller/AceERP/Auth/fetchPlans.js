import SubscriptionPlan from '../../../model/SubscriptionPlan';

const fetchPlans = async (req, res) => {
    try {
        const planDoc = await SubscriptionPlan.find();
        if (!planDoc) {
            return res.status(404).json({
                status: 404,
                message: 'No modules configuration found'
            });
        }

        // Custom sort order
        const sortOrder = {
            'Free-Trial': 1,
            'Ace-Core': 2,
            'Ace-Pro': 3
        };

        // Sort the plans based on subscriptionName
        const sortedPlans = planDoc.sort((a, b) => 
            (sortOrder[a.subscriptionName] || 999) - (sortOrder[b.subscriptionName] || 999)
        );

        res.status(200).json({
            status: 200,
            data: sortedPlans
        });

    } catch (error) {
        console.error('Error in fetchPlans:', error);
        res.status(500).json({
            status: 500,
            message: 'Error fetching plans',
            error: error.message
        });
    }
};

export default fetchPlans;
