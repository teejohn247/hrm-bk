import LeaveRecords from '../../model/LeaveRecords';
import Employee from '../../model/Employees';
import { sendEmail } from '../../config/email';
import { emailTemp } from '../../emailTemplate';

/**
 * Update assigned days for an employee's leave type
 * @route PUT /api/employee/updateLeaveType
 * @access Private
 */
const updateEmployeeLeaveType = async (req, res) => {
  const { employeeId, leaveTypeId, assignedNoOfDays } = req.body;

  // Validate input
  if (!employeeId || !leaveTypeId || assignedNoOfDays === undefined) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide employeeId, leaveTypeId, and assignedNoOfDays' 
    });
  }

  const employee = await Employee.findById(employeeId);

  if(!employee){
    return res.status(400).json({
      success: false,
      message: 'Employee not found'
    });
  }
  try {
    // Find the leave record for this employee and leave type
    const leaveRecord = await LeaveRecords.findOne({
      userId: employeeId,       
      leaveTypeId: leaveTypeId
    });

    if (leaveRecord) {
      // Replace the existing assignedNoOfDays with the new value
      leaveRecord.assignedNoOfDays = assignedNoOfDays;
      
      // Recalculate daysLeft based on the new assignedNoOfDays
      leaveRecord.daysLeft = assignedNoOfDays - leaveRecord.daysUsed;
      leaveRecord.lastUpdated = new Date().toISOString();
      
      await leaveRecord.save();

      // Update the employee's leaveAssignment
      await Employee.findOneAndUpdate(
        { _id: employeeId, 'leaveAssignment.leaveTypeId': leaveTypeId },
        {
          $set: { 
            'leaveAssignment.$.noOfLeaveDays': assignedNoOfDays,
            'leaveAssignment.$.daysLeft': leaveRecord.daysLeft 
          }
        }
      );

      // Send email notification
      const emailContent = `<div>
        <p style="padding: 32px 0; text-align: left !important; font-weight: 700; font-size: 20px;font-family: 'DM Sans';">Hi ${employee.firstName || employee.fullName},</p>
        <p style="font-size: 16px; text-align: left !important; font-weight: 300;">
          Your leave allocation for ${leaveRecord.leaveTypeName} has been updated.
          <br><br>
          You now have ${leaveRecord.daysLeft} days available to use.
          <br><br>
        </p>
      </div>`;
      
      const emailBody = emailTemp(emailContent, 'Leave Allocation Updated');
      await sendEmail(req, res, employee.email, [{ email: employee.email }], 'Leave Allocation Updated', emailBody);

      res.status(200).json({
        success: true,
        message: 'Leave allocation updated successfully',
        data: leaveRecord
      });
    } else {
      // No existing record found
      return res.status(404).json({
        success: false,
        message: 'No leave record found for this employee and leave type'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default updateEmployeeLeaveType;

