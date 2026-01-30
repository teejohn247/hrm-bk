import Subscription from '../model/Subscriptions';
import Company from '../model/Company';

export const updateSubscriptionStatuses = async () => {
    try {
        const now = new Date();
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

        // Find all companies with free trial subscriptions
        const companies = await Company.find({
            freeTrialExpired: false
        });

        for (const company of companies) {
            // Get all free trial subscriptions for this company
            const freeTrialSubscriptions = await Subscription.find({
                companyId: company._id,
                subscriptionPlan: 'Free-Trial'
            }).sort({ startDate: -1 }); // Sort by start date descending

            if (freeTrialSubscriptions.length > 0) {
                // Check if ALL free trial subscriptions are 2 months or older
                const allTrialsExpired = freeTrialSubscriptions.every(sub => 
                    new Date(sub.startDate) <= twoMonthsAgo
                );

                if (allTrialsExpired) {
                    await Company.findByIdAndUpdate(company._id, {
                        freeTrialExpired: true
                    });
                }
            }
        }

        // Update expired active subscriptions
        const expiredSubscriptions = await Subscription.find({
            status: 'active',
            endDate: { $lte: now }
        });

        for (const subscription of expiredSubscriptions) {
            // Update expired subscription
            await Subscription.findByIdAndUpdate(subscription._id, {
                status: 'expired'
            });

            // Find pending subscription for this company
            const pendingSubscription = await Subscription.findOne({
                companyId: subscription.companyId,
                status: 'pending',
                startDate: { $lte: now }
            });

            if (pendingSubscription) {
                // Activate pending subscription
                await Subscription.findByIdAndUpdate(pendingSubscription._id, {
                    status: 'active'
                });

                // Update company features
                await Company.findByIdAndUpdate(pendingSubscription.companyId, {
                    'companyFeatures.modules': pendingSubscription.modules,
                    'companyFeatures.subscriptionStatus': {
                        isActive: true,
                        plan: pendingSubscription.subscriptionPlan,
                        currentCycle: pendingSubscription.subscriptionCycle,
                        startDate: pendingSubscription.startDate,
                        endDate: pendingSubscription.endDate
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error updating subscription statuses:', error);
    }
}; 