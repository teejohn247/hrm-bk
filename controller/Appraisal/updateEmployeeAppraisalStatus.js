import dotenv from 'dotenv';
import AppraisalData from '../../model/AppraisalData.js';
import Company from '../../model/Company.js';
import Employee from '../../model/Employees.js';
import Department from '../../model/Department.js';
import Group from '../../model/AppraisalGroup.js';
import Kpi from '../../model/Kpi.js';

dotenv.config();

/**
 * Update the appraisalPeriodStatus and progress for a specific employee's AppraisalData
 * And ensure KPIs attached to departments are correctly assigned to all employees in those departments
 * @route PUT /api/appraisal/employee-status/:appraisalDataId
 * @access Private
 */
const updateEmployeeAppraisalStatus = async (req, res) => {
    try {
        const { appraisalDataId } = req.params;
        
        if (!appraisalDataId) {
            return res.status(400).json({
                status: 400,
                error: 'Appraisal data ID is required'
            });
        }

        // Extract fields from request body
        const { 
            appraisalPeriodStatus,
            appraisalPeriodProgress,
            departmentId,
            kpiId
        } = req.body;

        // Find the company or manager making the request
        const company = await Company.findById(req.payload.id);
        const employee = company ? null : await Employee.findOne({ _id: req.payload.id });
        
        // Check authorization - only allow company/superAdmin or manager
        if (!company && (!employee || !employee.isManager)) {
            return res.status(403).json({
                status: 403,
                error: 'Not authorized to update appraisal status'
            });
        }

        // Logic to handle attaching KPI to department employees
        if (departmentId && kpiId) {
            try {
                // Verify the department exists
                const department = await Department.findById(departmentId);
                if (!department) {
                    return res.status(404).json({
                        status: 404,
                        error: 'Department not found'
                    });
                }

                // Verify the KPI exists
                const kpi = await Kpi.findById(kpiId);
                if (!kpi) {
                    return res.status(404).json({
                        status: 404,
                        error: 'KPI not found'
                    });
                }

                // Find the group this KPI belongs to
                const group = await Group.findOne({ "groupKpis.kpiId": kpiId });
                if (!group) {
                    return res.status(404).json({
                        status: 404,
                        error: 'KPI is not associated with any appraisal group'
                    });
                }

                // Prepare the KPI data to add to employees
                const kpiData = {
                    kpiId: kpi._id,
                    kpiName: kpi.kpiName,
                    kpiDescription: kpi.description,
                    weight: kpi.weight || 0,
                    threshold: kpi.threshold || 0,
                    target: kpi.target || 0,
                    max: kpi.max || 0,
                    remarks: {
                        employeeRating: "",
                        managerRating: "",
                        employeeComment: "",
                        managerComment: ""
                    }
                };

                // Find all employees in the department
                const companyId = company ? company._id : employee.companyId;
                const departmentEmployees = await AppraisalData.find({ 
                    department: department.departmentName,
                    companyId: companyId
                });

                console.log(`Found ${departmentEmployees.length} employees in department ${department.departmentName}`);

                // Update each employee's AppraisalData
                let updatedCount = 0;
                for (const empData of departmentEmployees) {
                    // Check if the KPI group exists in the employee's kpiGroups array
                    const kpiGroupIndex = empData.kpiGroups.findIndex(kg => 
                        kg.groupId.toString() === group._id.toString()
                    );

                    if (kpiGroupIndex === -1) {
                        // Add the group with the KPI if it doesn't exist
                        await AppraisalData.updateOne(
                            { _id: empData._id },
                            { 
                                $push: { 
                                    kpiGroups: {
                                        groupId: group._id,
                                        groupName: group.groupName,
                                        description: group.description,
                                        groupKpis: [kpiData]
                                    }
                                }
                            }
                        );
                    } else {
                        // Check if the KPI already exists in the group
                        const kpiExists = empData.kpiGroups[kpiGroupIndex].groupKpis.some(
                            k => k.kpiId.toString() === kpiId.toString()
                        );

                        if (!kpiExists) {
                            // Add the KPI to the existing group
                            await AppraisalData.updateOne(
                                { _id: empData._id },
                                { 
                                    $push: { 
                                        [`kpiGroups.${kpiGroupIndex}.groupKpis`]: kpiData
                                    }
                                }
                            );
                        }
                    }
                    updatedCount++;
                }

                console.log(`Successfully updated ${updatedCount} employee records with KPI ${kpi.kpiName}`);

                // If a specific appraisalDataId was provided, also update status/progress
                if (appraisalPeriodStatus !== undefined || appraisalPeriodProgress !== undefined) {
                    const updateData = {};
                    if (appraisalPeriodStatus !== undefined) updateData.appraisalPeriodStatus = appraisalPeriodStatus;
                    if (appraisalPeriodProgress !== undefined) updateData.appraisalPeriodProgress = appraisalPeriodProgress;

                    await AppraisalData.findByIdAndUpdate(
                        appraisalDataId,
                        { $set: updateData }
                    );
                }

                return res.status(200).json({
                    status: 200,
                    success: true,
                    message: `Successfully attached KPI to ${updatedCount} employees in department ${department.departmentName}`,
                    updatedEmployees: updatedCount
                });
            } catch (error) {
                console.error('Error attaching KPI to department employees:', error);
                return res.status(500).json({
                    status: 500,
                    success: false,
                    error: error.message || 'Error attaching KPI to department employees'
                });
            }
        } 
        // Handle regular status/progress update for a single employee
        else if (appraisalPeriodStatus !== undefined || appraisalPeriodProgress !== undefined) {
            // Find the existing appraisal data record
            const existingAppraisalData = await AppraisalData.findById(appraisalDataId);

            if (!existingAppraisalData) {
                return res.status(404).json({
                    status: 404,
                    error: 'Appraisal data not found'
                });
            }

            // For managers, ensure they can only update employees in their department
            if (!company && employee.isManager && 
                employee.department !== existingAppraisalData.department) {
                return res.status(403).json({
                    status: 403,
                    error: 'Not authorized to update this employee\'s appraisal status'
                });
            }

            // Build update object with only the fields that are provided
            const updateData = {};
            
            if (appraisalPeriodStatus !== undefined) updateData.appraisalPeriodStatus = appraisalPeriodStatus;
            if (appraisalPeriodProgress !== undefined) updateData.appraisalPeriodProgress = appraisalPeriodProgress;

            console.log('Updating employee appraisal status with data:', updateData);

            // Update the appraisal data
            const updatedAppraisalData = await AppraisalData.findByIdAndUpdate(
                appraisalDataId,
                { $set: updateData },
                { new: true } // Return the updated document
            );

            if (!updatedAppraisalData) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'Failed to update employee appraisal status'
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                data: updatedAppraisalData
            });
        } else {
            return res.status(400).json({
                status: 400,
                error: 'Either status/progress information or department/KPI information must be provided'
            });
        }
    } catch (error) {
        console.error('Error updating employee appraisal status:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Server error'
        });
    }
};

export default updateEmployeeAppraisalStatus; 