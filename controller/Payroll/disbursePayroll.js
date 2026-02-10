import dotenv from 'dotenv';
import PayrollPeriod from '../../model/PayrollPeriod';
import PeriodPayData from '../../model/PeriodPayData';
import Company from '../../model/Company';
import Employee from '../../model/Employees';

dotenv.config();

/**
 * Disburse a payroll period
 * Marks payroll as disbursed (paid out to employees)
 * @route PUT /api/payroll/period/:id/disburse
 */
const disbursePayrollPeriod = async (req, res) => {
    try {
        const periodId = req.params.id;
        const userId = req.payload.id;
        const { disbursementDate, disbursementNotes } = req.body;

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

            // Check authorization - disbursement typically requires higher permissions
            isAuthorized = 
                employee.isSuperAdmin === true ||
                employee.role === 'Admin' ||
                employee.roleName === 'Admin' ||
                employee.companyRole === 'Admin' ||
                employee.permissions?.payrollManagement?.disburse_payroll === true;

            if (!isAuthorized) {
                return res.status(403).json({
                    status: 403,
                    success: false,
                    error: 'You do not have permission to disburse payroll. Only admins or users with disbursement permissions can perform this action.'
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

        // Check if payroll has been approved
        if (!payrollPeriod.periodStatusApproved) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Payroll period must be approved before it can be disbursed',
                data: payrollPeriod
            });
        }

        // Check if already disbursed
        if (payrollPeriod.periodPayrollDisbursed) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'This payroll period has already been disbursed',
                data: payrollPeriod
            });
        }

        // Update all period pay data to "Disbursed" status
        await PeriodPayData.updateMany(
            {
                payrollPeriodId: periodId,
                companyId: userCompany._id.toString()
            },
            {
                $set: {
                    status: 'Disbursed',
                    disbursedAt: disbursementDate ? new Date(disbursementDate) : new Date(),
                    disbursedBy: userId
                }
            }
        );

        // Update the payroll period
        const updatedPayrollPeriod = await PayrollPeriod.findByIdAndUpdate(
            periodId,
            {
                $set: {
                    periodPayrollDisbursed: true,
                    status: 'Disbursed',
                    disbursedAt: disbursementDate ? new Date(disbursementDate) : new Date(),
                    disbursedBy: userId,
                    disbursementNotes: disbursementNotes || ''
                }
            },
            { new: true, runValidators: true }
        ).lean();

        // Fetch updated period pay data
        const updatedPeriodPayData = await PeriodPayData.find({
            payrollPeriodId: periodId,
            companyId: userCompany._id.toString()
        }).lean();

        return res.status(200).json({
            status: 200,
            success: true,
            message: `Payroll period "${payrollPeriod.payrollPeriodName}" disbursed successfully`,
            data: {
                ...updatedPayrollPeriod,
                payrollPeriodData: updatedPeriodPayData,
                summary: {
                    totalEmployees: updatedPeriodPayData.length,
                    totalEarnings: updatedPayrollPeriod.totalEarnings,
                    totalDeductions: updatedPayrollPeriod.deductions,
                    totalNetEarnings: updatedPayrollPeriod.netEarnings,
                    disbursedBy: company ? company.companyName : employee?.fullName,
                    disbursedAt: updatedPayrollPeriod.disbursedAt
                }
            }
        });

    } catch (error) {
        console.error('[DisbursePayrollPeriod] Error:', error);

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
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while disbursing payroll period'
        });
    }
};

export default disbursePayrollPeriod;