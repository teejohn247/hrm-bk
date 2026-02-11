
// import dotenv from 'dotenv';
// import Role from '../../model/Role';
// import Company from '../../model/Company';
// import Leave from '../../model/Expense';
// import FinalRating from '../../model/FinalRating';
// import Period from '../../model/AppraisalPeriod'
// import PayrollPeriod from '../../model/PayrollPeriod';




// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);



// const deletePayrollPeriod = async (req, res) => {

//     try {
       
          
//         if (!req.params.id) {
//             res.status(400).json({
//                 status: 400,
//                 error: 'Id is required'
//             })
//             return;
//         }


//         let leave = await PayrollPeriod.findOne({ _id: req.params.id });


//         if (!leave) {
//             res.status(400).json({
//                 status: 400,
//                 error: 'Payroll period not found'
//             })
//             return;
//         }


//         PayrollPeriod.remove({ _id: req.params.id},
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
//                         data: "Deleted Successfully"
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
// export default deletePayrollPeriod;


import dotenv from 'dotenv';
import PayrollPeriod from '../../model/PayrollPeriod';
import PeriodPayData from '../../model/PeriodPayData';
import Company from '../../model/Company';
import Employee from '../../model/Employees';

dotenv.config();

/**
 * Delete a payroll period and all associated employee pay data
 * Can only delete periods that are not approved or disbursed
 * @route DELETE /api/payroll/period/:id
 */
const deletePayrollPeriod = async (req, res) => {
    try {
        const periodId = req.params.id;
        const userId = req.payload.id;

        // Validate period ID
        if (!periodId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Payroll period ID is required'
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

            // Check authorization - only admins can delete payroll periods
            isAuthorized = 
                employee.isSuperAdmin === true ||
                employee.role === 'Admin' ||
                employee.roleName === 'Admin' ||
                employee.companyRole === 'Admin' ||
                employee.permissions?.payrollManagement?.delete_payroll_period === true;

            if (!isAuthorized) {
                return res.status(403).json({
                    status: 403,
                    success: false,
                    error: 'You do not have permission to delete payroll periods. Only admins can perform this action.'
                });
            }
        } else {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'User not found'
            });
        }

        // Find the payroll period
        const payrollPeriod = await PayrollPeriod.findOne({
            _id: periodId,
            companyId: userCompany._id.toString()
        });

        if (!payrollPeriod) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Payroll period not found or does not belong to your company'
            });
        }

        // Check if period is approved or disbursed
        if (payrollPeriod.periodStatusApproved) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Cannot delete an approved payroll period. Please revoke approval first.',
                periodStatus: {
                    approved: payrollPeriod.periodStatusApproved,
                    disbursed: payrollPeriod.periodPayrollDisbursed,
                    status: payrollPeriod.status
                }
            });
        }

        if (payrollPeriod.periodPayrollDisbursed) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Cannot delete a disbursed payroll period.',
                periodStatus: {
                    approved: payrollPeriod.periodStatusApproved,
                    disbursed: payrollPeriod.periodPayrollDisbursed,
                    status: payrollPeriod.status
                }
            });
        }

        // Count associated employee pay data
        const associatedPayDataCount = await PeriodPayData.countDocuments({
            payrollPeriodId: periodId,
            companyId: userCompany._id.toString()
        });

        // Delete payroll period and all associated employee pay data
        const [deletedPeriod, deletedPayDataResult] = await Promise.all([
            PayrollPeriod.findByIdAndDelete(periodId),
            PeriodPayData.deleteMany({
                payrollPeriodId: periodId,
                companyId: userCompany._id.toString()
            })
        ]);

        if (!deletedPeriod) {
            return res.status(500).json({
                status: 500,
                success: false,
                error: 'Failed to delete payroll period'
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Payroll period deleted successfully',
            data: {
                deletedPeriod: {
                    id: deletedPeriod._id,
                    name: deletedPeriod.payrollPeriodName,
                    reference: deletedPeriod.reference,
                    startDate: deletedPeriod.startDate,
                    endDate: deletedPeriod.endDate,
                    totalEarnings: deletedPeriod.totalEarnings,
                    netEarnings: deletedPeriod.netEarnings
                },
                deletedEmployeeRecords: {
                    count: deletedPayDataResult.deletedCount,
                    expected: associatedPayDataCount
                },
                deletedBy: company ? company.companyName : employee?.fullName,
                deletedAt: new Date()
            }
        });

    } catch (error) {
        console.error('[DeletePayrollPeriod] Error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid ID format'
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while deleting the payroll period'
        });
    }
};

export default deletePayrollPeriod;