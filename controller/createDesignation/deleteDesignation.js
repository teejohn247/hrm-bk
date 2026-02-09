
// import dotenv from 'dotenv';
// import Employee from '../../model/Employees';
// import Department from '../../model/Designation';

// import Roles from '../../model/Roles';


// import utils from '../../config/utils';

// import { emailTemp } from '../../emailTemplate';


// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);



// const deleteDesignation = async (req, res) => {

//     try {


//         const department = await Department.find({_id: req.params.id})


//         console.log(department)
//         if(department.length < 1){
//             res.status(404).json({
//                 status:404,
//                 success: false,
//                 error:'No department Found'
//             })
//             return
//         }else{
//             Department.remove({ _id: req.params.id },
//                 function (
//                     err,
//                     result
//                 ) {
    
//                     console.log(result)
    
//                     if (err) {
//                         res.status(401).json({
//                             status: 401,
//                             success: false,
//                             error: err
//                         })
//                     }
//                     else {
//                         res.status(200).json({
//                             status: 200,
//                             success: true,
//                             data: "Designation Deleted successfully!"
//                         })
//                     }
    
//                 })
//         }

//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error
//         })
//     }
// }
// export default deleteDesignation;



import dotenv from 'dotenv';
import Designation from '../../model/Designation';
import Company from '../../model/Company';
import Employee from '../../model/Employees';

dotenv.config();

/**
 * Delete a designation
 * @route DELETE /api/designation/delete/:id
 */
const deleteDesignation = async (req, res) => {
    try {
        const designationId = req.params.id;
        const userId = req.payload.id;

        // Validate designation ID
        if (!designationId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Designation ID is required'
            });
        }

        // Get designation
        const designation = await Designation.findOne({ _id: designationId });

        if (!designation) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Designation not found'
            });
        }

        // Check authorization
        const company = await Company.findOne({ _id: userId });
        const isCompanyAdmin = !!company;

        let isAuthorized = false;

        if (isCompanyAdmin) {
            // Company admin can delete if designation belongs to their company
            isAuthorized = designation.companyId === company._id.toString();
        } else {
            // Check if user is an authorized employee
            const employee = await Employee.findOne({ _id: userId });

            if (!employee) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'User not found'
                });
            }

            // Verify designation belongs to employee's company
            if (designation.companyId !== employee.companyId) {
                return res.status(403).json({
                    status: 403,
                    success: false,
                    error: 'Designation does not belong to your company'
                });
            }

            // Check permissions
            isAuthorized = 
                employee.isSuperAdmin === true || 
                employee.role === 'Admin' || 
                employee.roleName === 'Admin' ||
                employee.permissions?.designationManagement?.delete_designation === true;
        }

        if (!isAuthorized) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'You do not have permission to delete designations'
            });
        }

        // Check if any employees are currently assigned this designation
        const employeesWithDesignation = await Employee.countDocuments({
            designationId: designationId
        });

        if (employeesWithDesignation > 0) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: `Cannot delete designation. ${employeesWithDesignation} employee(s) are currently assigned to this designation`,
                details: 'Please reassign these employees to a different designation first'
            });
        }

        // Delete designation using deleteOne instead of remove (deprecated)
        await Designation.deleteOne({ _id: designationId });

        console.log(`[DeleteDesignation] Designation "${designation.designationName}" deleted`);

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Designation deleted successfully',
            data: {
                deletedDesignationId: designationId,
                designationName: designation.designationName
            }
        });

    } catch (error) {
        console.error('[DeleteDesignation] Error:', {
            error: error.message,
            stack: error.stack,
            designationId: req.params?.id,
            userId: req.payload?.id
        });

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid designation ID format',
                details: error.message
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while deleting designation'
        });
    }
};

export default deleteDesignation;