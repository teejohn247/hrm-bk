import Subscription from '../../../model/Subscriptions';

const fetchSubscriptionByCompany = async (req, res) => {
    try {
        const { companyId } = req.params;

        const subscriptions = await Subscription.find({ companyId })

        if (!subscriptions || subscriptions.length === 0) {
            return res.status(200).json({
                success: false,
                status: 200,
                data: []
            });
        }

        res.status(200).json({
            status: 200,
            data: subscriptions
        });

    } catch (error) {
        console.error('Error in fetchSubscriptionByCompany:', error);
        res.status(500).json({
            status: 500,
            message: 'Error fetching company subscriptions',
            error: error.message
        });
    }
};

export default fetchSubscriptionByCompany; 