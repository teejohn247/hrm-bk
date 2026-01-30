import dotenv from 'dotenv';
import AppraisalPeriod from '../../model/AppraisalPeriod.js';
import AppraisalData from '../../model/AppraisalData.js';
import Company from '../../model/Company.js';

dotenv.config();

/**
 * Update an existing appraisal period
 * @route PUT /api/appraisal/period/:id
 * @access Private
 */
const updateAppraisalPeriod = async (req, res) => {
    try {
        const periodId = req.params.id;
        
        if (!periodId) {
            return res.status(400).json({
                status: 400,
                error: 'Appraisal period ID is required'
            });
        }

        // Find the company
        const company = await Company.findOne({ _id: req.payload.id });
        if (!company) {
            return res.status(400).json({
                status: 400,
                error: 'Company not found'
            });
        }

        // Find the existing appraisal period
        const existingPeriod = await AppraisalPeriod.findOne({ 
            _id: periodId,
            companyId: company._id
        });

        if (!existingPeriod) {
            return res.status(404).json({
                status: 404,
                error: 'Appraisal period not found'
            });
        }

        // Extract fields from request body
        const { 
            appraisalPeriodName, 
            description, 
            startDate, 
            endDate, 
            activeDate, 
            inactiveDate,
            status,
            progress,
            active
        } = req.body;

        // Check if name already exists for another period
        if (appraisalPeriodName && appraisalPeriodName !== existingPeriod.appraisalPeriodName) {
            const periodWithSameName = await AppraisalPeriod.findOne({ 
                companyId: company._id,  
                appraisalPeriodName: appraisalPeriodName,
                _id: { $ne: periodId } // Exclude current period
            });

            if (periodWithSameName) {
                return res.status(400).json({
                    status: 400,
                    error: 'An appraisal period with this name already exists'
                });
            }
        }

        // Build update object with only the fields that are provided
        const updateData = {};
        
        if (appraisalPeriodName) updateData.appraisalPeriodName = appraisalPeriodName;
        if (description) updateData.description = description;
        if (startDate) updateData.startDate = startDate;
        if (endDate) updateData.endDate = endDate;
        if (activeDate) updateData.activeDate = activeDate;
        if (inactiveDate) updateData.inactiveDate = inactiveDate;
        if (status) updateData.status = status;
        if (progress !== undefined) updateData.progress = progress;
        if (active !== undefined) updateData.active = active;

        console.log('Updating appraisal period with data:', updateData);

        // Update the appraisal period
        const updatedPeriod = await AppraisalPeriod.findOneAndUpdate(
            { _id: periodId },
            { $set: updateData },
            { new: true } // Return the updated document
        );

        if (!updatedPeriod) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Failed to update appraisal period'
            });
        }

        // If status or progress has changed, update all employee appraisal data under this period
        if (status || progress !== undefined) {
            const appraisalDataUpdateFields = {};
            
            if (status) appraisalDataUpdateFields.appraisalPeriodStatus = status;
            if (progress !== undefined) appraisalDataUpdateFields.appraisalPeriodProgress = progress;

            // Only proceed with the update if there are fields to update
            if (Object.keys(appraisalDataUpdateFields).length > 0) {
                try {
                    // Update all appraisalData documents for employees under this period
                    const updateResult = await AppraisalData.updateMany(
                        { 
                            appraisalPeriodId: periodId,
                            companyId: company._id 
                        },
                        { $set: appraisalDataUpdateFields }
                    );

                    console.log(`Updated ${updateResult.modifiedCount} employee appraisal records with new status/progress`);
                } catch (updateError) {
                    console.error('Error updating employee appraisal data:', updateError);
                    // We don't want to fail the whole request if just the employee data sync fails
                    // so we'll just log the error and continue
                }
            }
        }

        return res.status(200).json({
            status: 200,
            success: true,
            data: updatedPeriod
        });

    } catch (error) {
        console.error('Error updating appraisal period:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Server error'
        });
    }
};

export default updateAppraisalPeriod; 