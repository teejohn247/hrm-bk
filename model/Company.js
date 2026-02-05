import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
    companyName: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true  },
    companyAddress: { type: String},
    companyLogo: { type: String, default: ''},
    singleSignOn: { type: String, default: '' },
    generalSettings: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
    },
    firstTimeLogin: { type: Boolean },
    activeStatus: { type: Boolean, default: false },
    status: { type: Boolean, default: false },
    isSuperAdmin: { type: Boolean },
    parollPeriodFrequency: { type: String },
    freeTrialExpired: { type: Boolean, default: false },
    dateCreated: { type: Date, default: Date.now },
    industry: { type: String },
    systemRoles:[
        {
            roleName: { type: String },
            companyId: { type: String},
            companyName: { type: String},
            description: {
              type: String,
              default: ''
          },
          rolePermissions: [{
            moduleId: { type: String },
            key: { type: String },
            moduleName: { type: String },
            value: { type: String },
            active: {type: Boolean, default: false},
            moduleFeatures: [{
                featureId: { type:String},
                featureKey: { type: String },
                featureName: { type: String },
                featurePermissions: [{
                    key: { type: String },
                    name: { type: String },
                    permissionType: {type: String},
                    value: { type: Boolean, default: false }
                }]
            }]
            // moduleId: {type: String},
            // featureId: {type: String},
            // permissionType: {type: String},
            // permissionKey: {type: String},
            // permissionValue: {type: Boolean}
            }]
          },
        
    ],
    subDomain: { 
        type: String,
    },
    companyFeatures: {
            subscriptionStatus: {
                isActive: { type: Boolean, default: false },
                plan: { type: String, default: '' },
                currentCycle: { type: String },
                startDate: { type: Date },
                endDate: { type: Date }
            },
            paymentInfo: {
                paymentMethod: { type: String, default: '' },
                cardLastFour: { type: String, default: '' },
                expirationDate: { type: String, default: '' },
                billingAddress: { type: String, default: '' },
            },
            modules: [{
                moduleId: { type: Number },
                key: { type: String },
                moduleName: { type: String },
                value: { type: String },
                active: {type: Boolean, default: false},
                moduleFeatures: [{
                    featureId: { type: Number },
                    featureKey: { type: String },
                    featureName: { type: String },
                    featurePermissions: [{
                        key: { type: String },
                        name: { type: String },
                        permissionType: {type: String},
                        value: { type: Boolean, default: false }
                    }]
                }]
            }]
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("Company", CompanySchema);
