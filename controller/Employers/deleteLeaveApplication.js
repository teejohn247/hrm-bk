import dotenv from 'dotenv';
import LeaveRecords from '../../model/LeaveRecords';
import Employee from '../../model/Employees';
import Company from '../../model/Company';
import AuditTrail from '../../model/AuditTrail';

dotenv.config();

const deleteLeaveApplication = async (req, res) => {
    try {
        // Find the leave record to be deleted
        const leave = await LeaveRecords.findOne({ _id: req.params.id });

        if (!leave) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Leave Record not found'
            });
        }

        // Verify the user has permission to delete this record
        // Either it's their own application or they are an admin/manager
        if (leave.userId.toString() !== req.payload.id && 
            req.payload.role !== 'admin' && 
            req.payload.id !== leave.leaveApprover) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'You do not have permission to delete this leave application'
            });
        }

        // Check if the leave is already approved - only pending leaves can be deleted
        if (leave.status === 'Approved') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Cannot delete an approved leave application. Please cancel it instead.'
            });
        }

        try {
            // Fetch the employee to get current leave assignment values
            const employee = await Employee.findOne({ _id: leave.userId });
            
            if (!employee) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'Employee not found'
                });
            }
            
            // Find the specific leave assignment
            const leaveAssignment = employee.leaveAssignment.find(
                la => la._id.toString() === leave.leaveTypeId.toString()
            );
            
            if (!leaveAssignment) {
                console.error(`Leave assignment with ID ${leave.leaveTypeId} not found for employee ${leave.userId}`);
            }
            
            // Calculate the updated days used and days left
            const daysRequested = leave.daysRequested || 0;
            const currentDaysUsed = leaveAssignment ? leaveAssignment.daysUsed || 0 : 0;
            const currentDaysLeft = leaveAssignment ? leaveAssignment.daysLeft || 0 : 0;
            
            // Only adjust daysUsed if this is a pending application being deleted
            // No need to decrement daysUsed since pending applications don't affect this counter
            
            // Delete the leave record using deleteOne instead of remove
            await LeaveRecords.deleteOne({ _id: req.params.id });
            
            // Only update the specific fields related to this leave application
            const update = {
                $set: {
                    "leaveAssignment.$[i].requestMessage": "",
                    "leaveAssignment.$[i].decisionMessage": "",
                    // Clear specific leave dates only if they match this application
                    ...(leave.leaveStartDate && leaveAssignment && 
                        leaveAssignment.leaveStartDate === leave.leaveStartDate && {
                        "leaveAssignment.$[i].leaveStartDate": ""
                    }),
                    ...(leave.leaveEndDate && leaveAssignment && 
                        leaveAssignment.leaveEndDate === leave.leaveEndDate && {
                        "leaveAssignment.$[i].leaveEndDate": ""
                    }),
                    "leaveAssignment.$[i].daysRequested": 0
                }
            };
            
            // Update employee record with the adjusted leave assignment
            await Employee.findOneAndUpdate(
                { _id: leave.userId }, 
                update,
                { 
                    arrayFilters: [
                        {
                            "i._id": leave.leaveTypeId
                        }
                    ]
                }
            );

            // Log the action to audit trail
            const auditTrail = new AuditTrail({
                userId: req.payload.id,
                action: 'Delete',
                description: `Deleted leave application for ${leave.fullName} (${leave.leaveStartDate} - ${leave.leaveEndDate})`,
                module: 'Leave Management'
            });
            await auditTrail.save();

            // Return success response
            return res.status(200).json({
                status: 200,
                success: true,
                data: "Leave Application deleted successfully!"
            });
        } catch (error) {
            console.error('Error while deleting leave application:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                error: error.message || 'An error occurred while deleting the leave application'
            });
        }
    } catch (error) {
        console.error('Error in delete leave application controller:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Internal server error'
        });
    }
};

export default deleteLeaveApplication;
