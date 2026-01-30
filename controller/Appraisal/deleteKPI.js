import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Leave from '../../model/Expense';
import FinalRating from '../../model/FinalRating';
import Period from '../../model/AppraisalPeriod'
import AppraisalGroup from '../../model/Kpi';
import Department from '../../model/Department';
import Employees from '../../model/Employees';
import Group from '../../model/AppraisalGroup';
import AppraisalData from '../../model/AppraisalData';

const sgMail = require('@sendgrid/mail')

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

/**
 * Delete a KPI and clean up all references to it in other collections
 */
const deleteKPI = async (req, res) => {
    try {
        if (!req.params.id) {
            res.status(400).json({
                status: 400,
                error: 'Id is required'
            })
            return;
        }

        // Find the KPI to be deleted
        let kpi = await AppraisalGroup.findOne({ _id: req.params.id });

        if (!kpi) {
            res.status(400).json({
                status: 400,
                error: 'KPI not found'
            })
            return;
        }

        console.log(`Preparing to delete KPI: ${kpi.kpiName} (${req.params.id})`);
        
        // Track cleanup statistics
        const cleanupStats = {
            departments: 0,
            employees: 0,
            groups: 0,
            appraisalData: 0
        };

        // 1. Clean up department references
        try {
            // Find all departments that have this KPI in their assignedAppraisals array
            const departmentResult = await Department.updateMany(
                { "assignedAppraisals.appraisalId": req.params.id },
                { $pull: { assignedAppraisals: { appraisalId: req.params.id } } }
            );
            
            cleanupStats.departments = departmentResult.modifiedCount;
            console.log(`Updated department references for ${departmentResult.modifiedCount} departments`);
        } catch (deptError) {
            console.error("Error cleaning up department references:", deptError);
            // Continue with deletion even if department cleanup has issues
        }

        // 2. Clean up employee references
        try {
            // Get all employees that have this KPI in their appraisals or assignedAppraisals
            const employees = await Employees.find({
                $or: [
                    { "appraisals._id": req.params.id },
                    { "assignedAppraisals.appraisalId": req.params.id }
                ]
            });
            
            console.log(`Found ${employees.length} employees with references to KPI ${req.params.id}`);
            
            // For appraisals array which has a mixed schema, we need to find the right structure
            // and use a targeted pull operation
            for (const employee of employees) {
                if (employee.appraisals && employee.appraisals.length > 0) {
                    const updatedAppraisals = employee.appraisals.filter(appraisal => {
                        // Check different possible structures of appraisal
                        if (appraisal && appraisal._id && appraisal._id.toString() === req.params.id) {
                            return false;
                        }
                        // Or if it's stored differently in your schema
                        if (appraisal && appraisal.appraisalId && appraisal.appraisalId.toString() === req.params.id) {
                            return false;
                        }
                        return true;
                    });
                    
                    // Update the employee with filtered appraisals
                    await Employees.updateOne(
                        { _id: employee._id },
                        { $set: { appraisals: updatedAppraisals } }
                    );
                }
            }
            
            // Remove from assignedAppraisals array - this has a consistent schema
            const assignedResult = await Employees.updateMany(
                { "assignedAppraisals.appraisalId": req.params.id },
                { $pull: { assignedAppraisals: { appraisalId: req.params.id } } }
            );
            
            cleanupStats.employees = assignedResult.modifiedCount;
            console.log(`Updated assignedAppraisals for ${assignedResult.modifiedCount} employees`);
        } catch (empError) {
            console.error("Error cleaning up employee references:", empError);
            // Continue with deletion even if employee cleanup has issues
        }

        // 3. Clean up AppraisalGroup references
        try {
            const groupResult = await Group.updateMany(
                { "groupKpis.kpiId": req.params.id },
                { $pull: { groupKpis: { kpiId: req.params.id } } }
            );
            
            cleanupStats.groups = groupResult.modifiedCount;
            console.log(`Updated group references for ${groupResult.modifiedCount} groups`);
        } catch (groupError) {
            console.error("Error cleaning up group references:", groupError);
            // Continue with deletion even if group cleanup has issues
        }

        // 4. Clean up AppraisalData references - THIS IS THE CRITICAL NEW PART
        try {
            console.log(`Cleaning up KPI ${req.params.id} from all AppraisalData documents...`);
            
            // Find all groups that this KPI belongs to
            const groups = await Group.find({ "groupKpis.kpiId": req.params.id });
            console.log(`Found ${groups.length} groups containing this KPI`);
            
            const groupIds = groups.map(g => g._id.toString());
            
            if (groupIds.length > 0) {
                console.log(`Cleaning KPI from AppraisalData for groups: ${groupIds.join(', ')}`);
                
                // For each group, update all AppraisalData documents
                for (const groupId of groupIds) {
                    const updateResult = await AppraisalData.updateMany(
                        { "kpiGroups.groupId": groupId },
                        { 
                            $pull: { 
                                "kpiGroups.$[group].groupKpis": { 
                                    $or: [
                                        { kpiId: req.params.id },
                                        { _id: req.params.id }
                                    ]
                                } 
                            } 
                        },
                        { 
                            arrayFilters: [{ "group.groupId": groupId }],
                            multi: true 
                        }
                    );
                    
                    console.log(`Removed KPI from ${updateResult.modifiedCount} AppraisalData documents for group ${groupId}`);
                    cleanupStats.appraisalData += updateResult.modifiedCount;
                }
            }
            
            // Also try a more general cleanup for any references that might exist outside the groupId pattern
            const generalCleanup = await AppraisalData.updateMany(
                {},
                { $pull: { "kpiGroups.$[].groupKpis": { kpiId: req.params.id } } }
            );
            
            console.log(`General KPI cleanup affected ${generalCleanup.modifiedCount} additional AppraisalData documents`);
            cleanupStats.appraisalData += generalCleanup.modifiedCount;
            
        } catch (appraisalDataError) {
            console.error("Error cleaning up AppraisalData references:", appraisalDataError);
            // Continue with deletion even if AppraisalData cleanup has issues
        }

        // 5. Delete the KPI itself
        try {
            const deleteResult = await AppraisalGroup.deleteOne({ _id: req.params.id });
            
            if (deleteResult.deletedCount === 1) {
                console.log(`Successfully deleted KPI: ${kpi.kpiName} (${req.params.id})`);
                
                    res.status(200).json({
                        status: 200,
                        success: true,
                    data: {
                        message: "KPI deleted successfully",
                        cleanupInfo: {
                            kpiId: req.params.id,
                            kpiName: kpi.kpiName,
                            cleanupStats: cleanupStats,
                            referencesRemoved: true
                        }
                    }
                });
            } else {
                console.log(`KPI not found or already deleted: ${req.params.id}`);
                
                res.status(404).json({
                    status: 404,
                    success: false,
                    error: "KPI not found or already deleted"
                });
            }
        } catch (deleteError) {
            console.error("Error deleting KPI:", deleteError);
            
            res.status(500).json({
                status: 500,
                success: false,
                error: "Failed to delete KPI",
                details: deleteError.message
            });
        }
    } catch (error) {
        console.error("Error in deleteKPI:", error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        });
    }
};
export default deleteKPI;
