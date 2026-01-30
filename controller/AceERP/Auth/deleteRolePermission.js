import Company from '../../../model/Company';

const deleteRolePermissions = async (req, res) => {
    try {
        const { companyId } = req.params;
        console.log('Request received to delete role permissions for companyId:', companyId);

        // Update company document to remove rolePermissions from all systemRoles
        const result = await Company.updateOne(
            { _id: companyId },
            { 
                $set: {
                    'systemRoles.$[].rolePermissions': [] // Set rolePermissions to empty array for all roles
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Company not found or no changes were made'
            });
        }

        console.log('Role permissions deleted successfully');
        return res.status(200).json({
            success: true,
            message: 'Role permissions deleted successfully for all roles'
        });

    } catch (error) {
        console.error('Error in deleteRolePermissions:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete role permissions',
            error: error.message
        });
    }
};

export default deleteRolePermissions;