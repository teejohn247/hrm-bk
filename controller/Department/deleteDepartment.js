
// import dotenv from 'dotenv';
// import Employee from '../../model/Employees';
// import Department from '../../model/Department';

// import Roles from '../../model/Roles';


// import utils from '../../config/utils';

// import { emailTemp } from '../../emailTemplate';


// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);



// const deleteDepartment = async (req, res) => {

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
//                             data: "Department Deleted successfully!"
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
// export default deleteDepartment;

import dotenv from 'dotenv';
import Department from '../../model/Department';
import Employee from '../../model/Employees';

dotenv.config();

/**
 * Delete a department
 * Checks for employees in department before deletion
 */
const deleteDepartment = async (req, res) => {
    try {
        const departmentId = req.params.id;

        // Validate department ID
        if (!departmentId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Department ID is required'
            });
        }

        // Check if department exists
        const department = await Department.findById(departmentId).lean();

        if (!department) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Department not found'
            });
        }

        // Check if there are employees in this department
        const employeesInDepartment = await Employee.countDocuments({
            departmentId: departmentId
        });

        if (employeesInDepartment > 0) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: `Cannot delete department. ${employeesInDepartment} employee(s) are assigned to this department.`,
                employeeCount: employeesInDepartment,
                suggestion: 'Please reassign or remove employees before deleting the department'
            });
        }

        // Delete the department
        await Department.findByIdAndDelete(departmentId);

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Department deleted successfully',
            data: {
                deletedDepartmentId: departmentId,
                departmentName: department.departmentName
            }
        });

    } catch (error) {
        console.error('Error deleting department:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Failed to delete department',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default deleteDepartment;

