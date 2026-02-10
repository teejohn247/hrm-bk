import dotenv from 'dotenv';
import PayrollPeriod from '../../model/PayrollPeriod';
import PeriodPayData from '../../model/PeriodPayData';
import Company from '../../model/Company';
import Employee from '../../model/Employees';

dotenv.config();

/**
 * Approve a payroll period
 * Calculates totals from all employee pay data and marks period as approved
 * @route PUT /api/payroll/period/:id/approve
 */
const approvePayrollPeriod = async (req, res) => {
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

            // Check authorization
            isAuthorized = 
                employee.isSuperAdmin === true ||
                employee.role === 'Admin' ||
                employee.roleName === 'Admin' ||
                employee.companyRole === 'Admin' ||
                employee.permissions?.payrollManagement?.approve_payroll === true;

            if (!isAuthorized) {
                return res.status(403).json({
                    status: 403,
                    success: false,
                    error: 'You do not have permission to approve payroll periods'
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

        // Check if already approved
        if (payrollPeriod.periodStatusApproved) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'This payroll period has already been approved',
                data: payrollPeriod
            });
        }

        // Fetch all period pay data for this payroll period
        const periodPayData = await PeriodPayData.find({
            payrollPeriodId: periodId,
            companyId: userCompany._id.toString()
        }).lean();

        if (!periodPayData || periodPayData.length === 0) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'No employee pay data found for this payroll period'
            });
        }

        // Calculate totals from all employee pay data
        let totalEarnings = 0;
        let totalDeductions = 0;
        let totalNetEarnings = 0;

        periodPayData.forEach(payData => {
            totalEarnings += Number(payData.totalEarnings) || 0;
            totalDeductions += Number(payData.deductions) || 0;
            totalNetEarnings += Number(payData.netEarnings) || 0;
        });

        // Update all period pay data to "Approved" status
        await PeriodPayData.updateMany(
            {
                payrollPeriodId: periodId,
                companyId: userCompany._id.toString()
            },
            {
                $set: {
                    status: 'Approved',
                    approvedAt: new Date(),
                    approvedBy: userId
                }
            }
        );

        // Update the payroll period
        const updatedPayrollPeriod = await PayrollPeriod.findByIdAndUpdate(
            periodId,
            {
                $set: {
                    periodStatusApproved: true,
                    status: 'Approved',
                    totalEarnings: totalEarnings,
                    deductions: totalDeductions,
                    netEarnings: totalNetEarnings,
                    approvedAt: new Date(),
                    approvedBy: userId
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
            message: `Payroll period "${payrollPeriod.payrollPeriodName}" approved successfully`,
            data: {
                ...updatedPayrollPeriod,
                payrollPeriodData: updatedPeriodPayData,
                summary: {
                    totalEmployees: periodPayData.length,
                    totalEarnings: totalEarnings,
                    totalDeductions: totalDeductions,
                    totalNetEarnings: totalNetEarnings,
                    approvedBy: company ? company.companyName : employee?.fullName,
                    approvedAt: new Date()
                }
            }
        });

    } catch (error) {
        console.error('[ApprovePayrollPeriod] Error:', error);

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
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while approving payroll period'
        });
    }
};

export default approvePayrollPeriod;