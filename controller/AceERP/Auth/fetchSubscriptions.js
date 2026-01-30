import Subscription from '../../../model/Subscriptions';

const fetchSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find()
          

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
        console.error('Error in fetchSubscriptions:', error);
        res.status(500).json({
            success: false,
            status: 500,
            message: 'Error fetching subscriptions',
            error: error.message
        });
    }
};

export default fetchSubscriptions; 