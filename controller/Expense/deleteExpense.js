
// import dotenv from 'dotenv';
// import Department from '../../model/Expense';
// import utils from '../../config/utils';

// import { emailTemp } from '../../emailTemplate';


// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);



// const deleteExpense = async (req, res) => {

//     try {

//         const department = await Department.find({_id: req.params.id})

//         console.log(department)
//         if(department.length < 1){
//             res.status(404).json({
//                 status:404,
//                 success: false,
//                 error:'No Expense Type Found'
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
//                             data: "Expense Type Deleted successfully!"
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
// export default deleteExpense;


import dotenv from 'dotenv';
import ExpenseType from '../../model/Expense';
import ExpenseRequests from '../../model/ExpenseRequests';

dotenv.config();

/**
 * Delete an expense type
 * Checks for expense requests using this type before deletion
 */
const deleteExpenseType = async (req, res) => {
    try {
        const expenseTypeId = req.params.id;

        // Validate expense type ID
        if (!expenseTypeId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Expense type ID is required'
            });
        }

        // Check if expense type exists
        const expenseType = await ExpenseType.findById(expenseTypeId).lean();

        if (!expenseType) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Expense type not found'
            });
        }

        // Check if there are expense requests using this type
        const requestsUsingType = await ExpenseRequests.countDocuments({
            expenseTypeId: expenseTypeId
        });

        if (requestsUsingType > 0) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: `Cannot delete expense type. ${requestsUsingType} expense request(s) are using this type.`,
                requestCount: requestsUsingType,
                suggestion: 'Consider deactivating instead of deleting, or reassign expense requests to a different type'
            });
        }

        // Delete the expense type
        await ExpenseType.findByIdAndDelete(expenseTypeId);

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Expense type deleted successfully',
            data: {
                deletedTypeId: expenseTypeId,
                typeName: expenseType.name || expenseType.expenseCardName
            }
        });

    } catch (error) {
        console.error('Error deleting expense type:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Failed to delete expense type',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default deleteExpenseType;
