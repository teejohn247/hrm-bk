const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  companyName: { type: String },
  email: { type: String, required: true },
  companyId: { type: String, required: true },
  subscriptionPlan: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: function() {
      // Get max users from userRange
      const maxUsers = this.userRange ? parseInt(this.userRange.split('-').pop().replace('+', '')) : 0;
      
      // Get cycle multiplier
      let cycleMultiplier = 1;
      switch (this.subscriptionCycle) {
        case 'biweekly': cycleMultiplier = 0.5; break;  // Half of monthly price
        case 'monthly': cycleMultiplier = 1; break;     // Base monthly price
        case 'annually': cycleMultiplier = 12; break;   // 12 times monthly price
      }
      
      return this.unitPrice * maxUsers * cycleMultiplier;
    }
  },
  subscriptionCycle: {
    type: String,
    enum: ['biweekly', 'monthly', 'annually'],
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'expired'],
    default: 'pending',
  },
  userRange: {
    type: String,
    required: true,
  },
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
            permissionType: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            }
        }]
    }]
}],
}, {
  timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
