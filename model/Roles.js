import mongoose from "mongoose";

// import PermissionsSchema from './Permissions'

const RolesSchema = new mongoose.Schema(
  {
    companyId: {type: String},
    roleName: { type: String, required: true },
    description: {
      type: String,
      default: ''
  },
  rolePermissions: [{
    moduleId: {type: String},
    featureId: {type: String},
    permissionType: {type: String},
    permissionKey: {type: String},
    permissionValue: {type: Boolean}
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Roles", RolesSchema);
