import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
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
                name: {
                    type: String,
                    required: true
                },
                permissionType: {
                    type: String,
                    required: true
                },
            }]
        }]
    }]
});

module.exports = mongoose.model('Modules', moduleSchema);