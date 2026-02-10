
// import dotenv from 'dotenv';
// import Role from '../../model/Role';
// import Company from '../../model/Company';
// import Credits from '../../model/PeriodPayData';




// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);


// const updatePeriodData= async (req, res) => {

//     try {
       
//         const { role, bonus, totalEarnings, dynamicFields, deductions, netEarnings, status} = req.body;

//         let company = await Company.findOne({ _id: req.payload.id });

//         let appraisal = await Credits.findOne({ companyId:company._id,  _id: req.params.id });

//         console.log(req.body)

//         console.log({appraisal})

//         if (!company.companyName) {
//             res.status(400).json({
//                 status: 400,
//                 error: 'No company has been created for this account'
//             })
//             return;
//         }


//         if (!appraisal) {
//             res.status(400).json({
//                 status: 400,
//                 error: 'This entry does not exist'
//             })
//             return;
//         }

//         // if (appraisal && String(appraisal._id) !== req.params.id) {
//         //     res.status(400).json({
//         //         status: 400,
//         //         error: 'This credit name already exist'
//         //     })
//         //     return;
//         // }

//         Credits.findOneAndUpdate({ _id: req.params.id}, { 
//             $set: { 
//                 role: role && role, 
//                 bonus: bonus && bonus, 
//                 dynamicFields: dynamicFields && dynamicFields,
//                 netEarnings: netEarnings && netEarnings,
//                 totalEarnings: totalEarnings && totalEarnings,
//                 deductions: deductions && deductions,

//                 // status: status && status
//             }
//        },
//        { upsert: true, new: true },
//             function (
//                 err,
//                 result
//             ) {
//                 if (err) {
//                     res.status(401).json({
//                         status: 401,
//                         success: false,
//                         error: err

//                     })

//                 } else {

                    
//                     res.status(200).json({
//                         status: 200,
//                         success: true,
//                         data: "Update Successful"
//                     })

//                 }
//             })
//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error
//         })
//     }
// }
// export default updatePeriodData;



import dotenv from 'dotenv';
import Company from '../../model/Company';
import Employee from '../../model/Employees';
import PeriodPayData from '../../model/PeriodPayData';

dotenv.config();

/**
 * Update period pay data for an employee
 * @route PUT /api/payroll/period-data/:id
 */
const updatePeriodData = async (req, res) => {
    try {
        const { role, bonus, totalEarnings, dynamicFields, deductions, netEarnings, status } = req.body;
        const periodDataId = req.params.id;
        const userId = req.payload.id;

        // Validate period data ID
        if (!periodDataId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Period data ID is required'
            });
        }

        // Check if user is company or authorized employee
        const [company, employee] = await Promise.all([
            Company.findById(userId).lean(),
            Employee.findById(userId).lean()
        ]);

        let userCompany;
        let isAuthorized = false;

        if (company) {
            userCompany = company;
            isAuthorized = true;
        } else if (employee) {
            userCompany = await Company.findById(employee.companyId).lean();
            
            if (!userCompany) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'Company not found'
                });
            }

            // Check authorization
            isAuthorized = 
                employee.isSuperAdmin === true ||
                employee.role === 'Admin' ||
                employee.roleName === 'Admin' ||
                employee.companyRole === 'Admin' ||
                employee.permissions?.payrollManagement?.edit_payroll === true;

            if (!isAuthorized) {
                return res.status(403).json({
                    status: 403,
                    success: false,
                    error: 'You do not have permission to update payroll data'
                });
            }
        } else {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'User not found'
            });
        }

        // Find the period data entry
        const periodData = await PeriodPayData.findOne({
            _id: periodDataId,
            companyId: userCompany._id.toString()
        });

        if (!periodData) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Period data entry not found or does not belong to your company'
            });
        }

        // Build update object (only update fields that are provided)
        const updateData = {};

        if (role !== undefined) updateData.role = role;
        if (bonus !== undefined) updateData.bonus = Number(bonus) || 0;
        if (totalEarnings !== undefined) updateData.totalEarnings = Number(totalEarnings) || 0;
        if (netEarnings !== undefined) updateData.netEarnings = Number(netEarnings) || 0;
        if (deductions !== undefined) updateData.deductions = Number(deductions) || 0;
        if (status !== undefined) updateData.status = status;
        
        // Handle dynamic fields - merge with existing if provided
        if (dynamicFields !== undefined && typeof dynamicFields === 'object') {
            updateData.dynamicFields = {
                ...periodData.dynamicFields,
                ...dynamicFields
            };
        }

        // Update timestamp
        updateData.updatedAt = new Date();

        // Perform update
        const updatedPeriodData = await PeriodPayData.findByIdAndUpdate(
            periodDataId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedPeriodData) {
            return res.status(500).json({
                status: 500,
                success: false,
                error: 'Failed to update period data'
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Period data updated successfully',
            data: updatedPeriodData
        });

    } catch (error) {
        console.error('[UpdatePeriodData] Error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid ID format'
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Validation error',
                details: error.message
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while updating period data'
        });
    }
};

export default updatePeriodData;