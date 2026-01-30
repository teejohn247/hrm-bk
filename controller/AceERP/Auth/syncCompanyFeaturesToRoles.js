import Role from '../../../model/Roles';
import Company from '../../../model/Company';
import Employee from '../../../model/Employees';
import mongoose from 'mongoose';

const syncCompanyFeaturesToRoles = async (req, res) => {
    try {
        const { companyId } = req.body;
        console.log('Request received for company sync:', companyId);

        // Find the company and get their features
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Get the company features modules
        const companyModules = company.companyFeatures.modules;

        // Update all roles in systemRoles by clearing them
        const updateResult = await Company.updateMany(
            { _id: companyId },
            {
                $set: {
                    'systemRoles': [] // Clear all roles
                }
            }
        );

        console.log('Roles cleared successfully');

        return res.status(200).json({
            success: true,
            message: 'All roles cleared successfully',
            data: updateResult
        });

    } catch (error) {
        console.error('Error in syncCompanyFeaturesToRoles:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to clear roles',
            error: error.message
        });
    }
};

export default syncCompanyFeaturesToRoles;


// const syncCompanyFeaturesToRoles = async (req, res) => {
//     try {
//         const { companyId } = req.body;
//         console.log('Request received for company sync:', companyId);

//         // Find the company and get their features
//         const company = await Company.findById(companyId);
//         if (!company) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Company not found'
//             });
//         }

//         // Get the company features modules
//         const companyModules = company.companyFeatures.modules;

//         // Update each role individually to preserve role structure
//         const updateResult = await Company.findOneAndUpdate(
//             { _id: companyId },
//             {
//                 $set: {
//                     'systemRoles.$[].rolePermissions': companyModules
//                 }
//             },
//             {
//                 arrayFilters: [{ 'elem.rolePermissions': { $exists: true } }],
//                 new: true
//             }
//         );

//         if (!updateResult) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'No roles were updated'
//             });
//         }

//         // Verify the update
//         const updatedRoles = updateResult.systemRoles.map(role => ({
//             roleName: role.roleName,
//             permissionsCount: role.rolePermissions.length
//         }));

//         return res.status(200).json({
//             success: true,
//             message: 'Company features synced to all roles successfully',
//             updatedRoles,
//             affectedRoles: updateResult.systemRoles.length
//         });

//     } catch (error) {
//         console.error('Error in syncCompanyFeaturesToRoles:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Failed to sync company features to roles',
//             error: error.message
//         });
//     }
// };

// export default syncCompanyFeaturesToRoles;