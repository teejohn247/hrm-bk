import Company from '../../../model/Company';
import Role from '../../../model/Role';
import Modules from '../../../model/Modules.js';

// Helper function for default permissions
async function getDefaultPermissions(roleName) {
    const moduleDoc = await Modules.findOne();
    if (!moduleDoc) return [];

    const rolePermissions = [];
    
    // Process all modules for default roles
    for (const moduleData of moduleDoc.modules) {
        for (const feature of moduleData.moduleFeatures) {
            if (feature.featurePermissions && feature.featurePermissions.length > 0) {
                for (const permission of feature.featurePermissions) {
                    rolePermissions.push({
                        moduleId: moduleData._id,
                        featureId: feature._id,
                        permissionKey: permission.key,
                        permissionValue: roleName === 'Super Admin' // Only Super Admin gets all permissions by default
                    });
                }
            }
        }
    }
    
    return rolePermissions;
}

const companyId = async (req, res) => {
    try {
        const { companyId } = req.params;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                errorMessage: 'Company not found'
            });
        }

        // First create default roles if they don't exist
        const defaultRoles = ['Super Admin', 'Manager', 'Staff', 'External'];

        // Check if company.systemRoles is an empty array
        if (!company.systemRoles || company.systemRoles.length === 0) {
            // Create default roles for the company
            for (const defaultRole of defaultRoles) {
                const defaultRolePermissions = await getDefaultPermissions(defaultRole);
                const newDefaultRole = new Role({
                    roleName: defaultRole,
                    description: `Default ${defaultRole} role`,
                    rolePermissions: defaultRolePermissions,
                    companyId: company._id,
                    companyName: company.companyName
                });
                
                const savedDefaultRole = await newDefaultRole.save();
                
                // Add the new default role to the company's systemRoles
                await Company.findByIdAndUpdate(
                    company._id,
                    {
                        $push: {
                            systemRoles: {
                                _id: savedDefaultRole._id,
                                roleName: savedDefaultRole.roleName,
                                description: savedDefaultRole.description,
                                rolePermissions: savedDefaultRole.rolePermissions
                            }
                        }
                    }
                );
            }
        }

        return res.status(200).json({
            status: 200,
            success: true,
            data: company
        });

    } catch (error) {
        console.error('Get company error:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message
        });
    }
};

export default companyId;
