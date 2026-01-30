import Module from '../../../model/Modules.js';
import Company from '../../../model/Company.js';
import Role from '../../../model/Roles.js';


const fetchAdminRoles = async (req, res) => {
    try {
        const modules = await Module.find({});
        const roles = await Role.find({}).select({
            roleName: 1,
            companyId: 1,
            companyName: 1,
            description: 1,
            rolePermissions: 1,
            createdAt: 1,
            updatedAt: 1
        });

        const updatedRoles = await Promise.all(roles.map(async (role) => {
            let hasUpdates = false;
            let newRolePermissions = [...(role.rolePermissions || [])].map(permission => ({
                moduleId: permission.moduleId,
                featureId: permission.featureId || null,
                permissionKey: permission.permissionKey,
                permissionType: permission.permissionType,
                permissionValue: permission.permissionValue,
                _id: permission._id
            }));

            // Compare and update permissions for each module
            modules.forEach((module) => {
                const modulePermissions = module.permissions || {};
                
                Object.keys(modulePermissions).forEach((permission) => {
                    const existingPermission = newRolePermissions.find(
                        p => p.moduleId === module._id.toString() && 
                             p.permissionKey === permission
                    );

                    if (!existingPermission) {
                        console.log(`Adding new permission: ${permission} to module: ${module.name}`);
                        newRolePermissions.push({
                            moduleId: module._id.toString(),
                            featureId: modulePermissions[permission].featureId || null,
                            permissionKey: permission,
                            permissionType: modulePermissions[permission].permissionType,
                            permissionValue: false
                        });
                        hasUpdates = true;
                    }
                });

                // Remove obsolete permissions
                newRolePermissions = newRolePermissions.filter(permission => {
                    if (permission.moduleId === module._id.toString()) {
                        return modulePermissions.hasOwnProperty(permission.permissionKey);
                    }
                    return true;
                });
            });

            // Update role if changes were detected
            if (hasUpdates) {
                return await Role.findByIdAndUpdate(
                    role._id,
                    { rolePermissions: newRolePermissions },
                    { 
                        new: true,
                        select: {
                            roleName: 1,
                            companyId: 1,
                            companyName: 1,
                            description: 1,
                            rolePermissions: 1,
                            createdAt: 1,
                            updatedAt: 1
                        }
                    }
                );
            }
            return role;
        }));

        return res.status(200).json({
            success: true,
            data: updatedRoles
        });

    } catch (error) {
        console.error('Error in fetchRoles:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch roles',
            error: error.message
        });
    }
};

module.exports = fetchAdminRoles;
