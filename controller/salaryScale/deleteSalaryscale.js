
// import dotenv from 'dotenv';
// import Employee from '../../model/Employees';
// import Department from '../../model/SalaryScale';

// import Roles from '../../model/Roles';


// import utils from '../../config/utils';

// import { emailTemp } from '../../emailTemplate';


// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);



// const deleteSalaryscale = async (req, res) => {

//     try {


//         const department = await Department.find({_id: req.params.id})


//         console.log(department)
//         if(department.length < 1){
//             res.status(404).json({
//                 status:404,
//                 success: false,
//                 error:'No Salary Scale Found'
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
//                             data: "Salary scale deleted successfully!"
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
// export default deleteSalaryscale;
import dotenv from 'dotenv';
import SalaryScale from '../../model/SalaryScale';
import Employee from '../../model/Employees';

dotenv.config();

/**
 * Delete a salary scale
 * Checks for employees assigned to this scale before deletion
 */
const deleteSalaryScale = async (req, res) => {
    try {
        const salaryScaleId = req.params.id;

        // Validate salary scale ID
        if (!salaryScaleId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Salary scale ID is required'
            });
        }

        // Check if salary scale exists
        const salaryScale = await SalaryScale.findById(salaryScaleId).lean();

        if (!salaryScale) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Salary scale not found'
            });
        }

        // Check if there are employees on this salary scale
        const employeesOnScale = await Employee.countDocuments({
            salaryScaleId: salaryScaleId
        });

        if (employeesOnScale > 0) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: `Cannot delete salary scale. ${employeesOnScale} employee(s) are assigned to this scale.`,
                employeeCount: employeesOnScale,
                suggestion: 'Please reassign employees to a different salary scale before deleting'
            });
        }

        // Delete the salary scale
        await SalaryScale.findByIdAndDelete(salaryScaleId);

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Salary scale deleted successfully',
            data: {
                deletedScaleId: salaryScaleId,
                scaleName: salaryScale.name
            }
        });

    } catch (error) {
        console.error('Error deleting salary scale:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Failed to delete salary scale',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default deleteSalaryScale;


