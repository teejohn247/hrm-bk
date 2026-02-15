const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  subscriptionName: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  description: { type: String },
  modules: [{
    moduleId: {
        type: Number,
        required: true
    },
    key: {
        type: String,
        required: true
    },
    moduleName: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    active: {type: Boolean, default: false},
    moduleFeatures: [{
        featureId: {
            type: Number,
            required: true
        },
        featureKey: {
            type: String,
            required: true
        },
        featureName: {
            type: String,
            required: true
        },
        featurePermissions: [{
            key: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            permissionType: {
                type: String,
                required: true
            }
        }]
    }]
}],
}, {
  timestamps: true
});

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

module.exports = SubscriptionPlan;
