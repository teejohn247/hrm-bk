import SubscriptionPlan from '../../../model/SubscriptionPlan';
import Company from '../../../model/Company';


// @desc    Create a new subscription plan
// @route   POST /api/v1/subscription-plans
// @access  Private/Admin
const createSubPlan = async (req, res) => {
    try {
        const {
            subscriptionName,
            unitPrice,
            description,
            modules
          } = req.body;

          console.log(req.body)


        
          // Validate required fields
          if (!subscriptionName || !modules) {
            res.status(400).json({
                status: 400,
                success: false,
                error: 'Please provide all required fields'
            });
            return;
          }
        
          // Validate modules structure
          if (!Array.isArray(modules)) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Modules must be an array'
            });
          }
          // Create subscription plan
          const subscriptionPlan = await SubscriptionPlan.create({
            subscriptionName,
            unitPrice,
            description,
            modules
          });
        
        res.status(200).json({
            status: 200,
            success: true,
            data: subscriptionPlan
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message
        });
    }

};

export default createSubPlan;