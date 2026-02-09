import dotenv from 'dotenv';
import AppraisalPeriod from '../../model/AppraisalPeriod';
import Company from '../../model/Company';
import Employee from '../../model/Employees';

dotenv.config();

/**
 * Delete an appraisal period
 * @route DELETE /api/appraisal/period/:id
 */
const deletePeriod = async (req, res) => {
    try {
        const periodId = req.params.id;
        const userId = req.payload.id;

        // Validate period ID
        if (!periodId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Period ID is required'
            });
        }

        // Check if period exists
        const period = await AppraisalPeriod.findOne({ _id: periodId });

        if (!period) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Appraisal period not found'
            });
        }

        // Check authorization
        const company = await Company.findOne({ _id: userId });
        const isCompanyAdmin = !!company;

        let isAuthorized = false;

        if (isCompanyAdmin) {
            // Company admin is authorized if period belongs to their company
            isAuthorized = period.companyId === company._id.toString();
        } else {
            // Check if employee has permission
            const employee = await Employee.findOne({ _id: userId });

            if (!employee) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'User not found'
                });
            }

            // Check if period belongs to employee's company
            if (period.companyId !== employee.companyId) {
                return res.status(403).json({
                    status: 403,
                    success: false,
                    error: 'Period does not belong to your company'
                });
            }

            // Check employee permissions
            isAuthorized = 
                employee.isSuperAdmin === true || 
                employee.role === 'Admin' || 
                employee.roleName === 'Admin' ||
                employee.permissions?.appraisalManagement?.deleteAppraisalPeriod === true;
        }

        if (!isAuthorized) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'You do not have permission to delete appraisal periods'
            });
        }

        // Delete the period using deleteOne instead of remove (deprecated)
        await AppraisalPeriod.deleteOne({ _id: periodId });

        console.log(`Appraisal period "${period.appraisalPeriodName}" deleted by user ${userId}`);

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Appraisal period deleted successfully',
            data: {
                deletedPeriodId: periodId,
                periodName: period.appraisalPeriodName
            }
        });

    } catch (error) {
        console.error('Error deleting appraisal period:', {
            error: error.message,
            stack: error.stack,
            periodId: req.params?.id,
            userId: req.payload?.id
        });

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid period ID format',
                details: error.message
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while deleting the period'
        });
    }
};

export default deletePeriod;