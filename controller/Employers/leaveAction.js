import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import Roles from '../../model/Roles';
import AuditTrail from '../../model/AuditTrail';
import Company from '../../model/Company';
import utils from '../../config/utils';
import { emailTemp } from '../../emailTemplate';
import LeaveRecords from '../../model/LeaveRecords';
import { sendEmail } from '../../config/email';
import daysUsed from '../../cron/daysUsed';
import Holidays from '../../model/Holidays';
import Notification from '../../model/Notification';
import Leaves from '../../model/Leaves'
import { parseDate, formatDateDDMMYYYY } from '../../utils/dateUtils';

const { differenceInDays, addDays, isSaturday, isSunday, isSameDay } = require('date-fns');
// const { parse, format } = require('date-fns-tz');
const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);





function countWeekdays(start, end, holidays) {
    let count = 0;
    let currentDate = new Date(start);
  
    while (currentDate <= end) {
      if (!isSaturday(currentDate) && !isSunday(currentDate) && !isHoliday(currentDate, holidays)) {
        count++;
      }
      currentDate = addDays(currentDate, 1);
    }
  
    return count;
  }
  
  function isHoliday(date, holidays) {
    return holidays.some(holiday => isSameDay(date, new Date(holiday.date)));
  }



const leaveAction = async (req, res) => {

    try {
      
        

        const { leaveId, approved, assignedNoOfDays, decisionMessage, employeeId } = req.body;
       
        let company = await Company.findOne({ _id: req.payload.id });
        const leaveType = await LeaveRecords.findOne({ _id: leaveId});
        
        const check = await Employee.findOne({ _id: leaveType.userId});

        console.log(req.body)


        if (!check) {
            res.status(400).json({
                status: 400,
                error: "Employee doesn't exist"
            });
            return;
        }

        if (!leaveType) {
            res.status(400).json({
                status: 400,
                error: "leaveType doesn't exist"
            });
            return;
        }

        const holidays = await Holidays.find({companyId: req.payload.id})

        console.log({holidays})

//         let leaveAssignment;

//    Employee.findOne(
//             { _id: leaveType.userId, 'leaveAssignment.leaveTypeId': leaveType.leaveTypeId },
//             { 'leaveAssignment.$': 1 }, // Projection to include only the matched leaveAssignment
//             (err, employee) => {
//               if (err) {
//                 console.error('Error fetching employee:', err);
//               } else {
//                 leaveAssignment = employee.leaveAssignment
//                 console.log('LeaveAssignment with leaveTypeId:', employee.leaveAssignment);
//               }
//             }
//           );



          let leaveAssignment;

// Updated findEmployee function to use async/await instead of callbacks
const findEmployee = async () => {
  try {
    const employee = await Employee.findOne(
      { _id: leaveType.userId, 'leaveAssignment.leaveTypeId': leaveType.leaveTypeId },
      { 'leaveAssignment.$': 1 }
    );
    return employee;
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw error;
  }
};

try {
  // Call the async function and handle the result
  const employee = await findEmployee();
  leaveAssignment = employee.leaveAssignment;
  console.log('LeaveAssignment with leaveTypeId:', employee.leaveAssignment);
  console.log({ leaveAssignment });

  // Parse dates using the utility function
  const startDate = parseDate(leaveType.leaveStartDate);
  const endDate = parseDate(leaveType.leaveEndDate);

  if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error("Invalid date formats:", { 
      leaveStartDate: leaveType.leaveStartDate, 
      leaveEndDate: leaveType.leaveEndDate,
      parsedStartDate: startDate,
      parsedEndDate: endDate
    });
    
    res.status(400).json({
      status: 400,
      error: "Invalid date format. Please check the leave dates."
    });
    return;
  }

  console.log({startDate})
  console.log({endDate})

  // Format dates for consistent storage
  const formattedStartDate = formatDateDDMMYYYY(startDate);
  const formattedEndDate = formatDateDDMMYYYY(endDate);

  const daysWithoutWeekends = await countWeekdays(startDate, endDate, holidays);

  console.log(leaveAssignment[0].noOfLeaveDays)

  if (daysWithoutWeekends > leaveAssignment[0].noOfLeaveDays) {
      res.status(400).json({
          status: 400,
          error: "Cannot be approved because the number of days assigned has been exceeded"
      });
      return;
  }

  if ((leaveType.daysUsed + daysWithoutWeekends) > leaveAssignment[0].noOfLeaveDays) {
      res.status(400).json({
          status: 400,
          error: "Cannot be approved because the number of days assigned has been exceeded"
      });
      return;
  }

  // Calculate the result for days left after leave is approved/declined
  const currentDaysUsed = leaveAssignment[0].daysUsed || 0;
  const totalLeaveDays = leaveAssignment[0].noOfLeaveDays;
  
  // If approved, add the requested days to daysUsed and subtract from total
  // If declined, leave the values unchanged
  const newDaysUsed = approved ? currentDaysUsed + daysWithoutWeekends : currentDaysUsed;
  const newDaysLeft = totalLeaveDays - newDaysUsed;

  console.log({
      currentDaysUsed,
      totalLeaveDays,
      newDaysUsed,
      newDaysLeft,
      daysWithoutWeekends
  });

  // Update the leave type record
  await leaveType.updateOne({
      status: approved == true ? "Approved" : "Declined",
      daysUsed: newDaysUsed,
      daysLeft: newDaysLeft,
      // Update dates with standardized format if needed
      leaveStartDate: formattedStartDate,
      leaveEndDate: formattedEndDate
  });
  
  try {
    // Update employee record - replace callback with await
    await Employee.findOneAndUpdate(
      { _id: leaveType.userId }, 
      { 
        $set: { 
            "leaveAssignment.$[i].leaveApproved": approved,
            "leaveAssignment.$[i].status": approved == true ? "Approved" : "Declined",
            "leaveAssignment.$[i].leaveStartDate": formattedStartDate,
            "leaveAssignment.$[i].leaveEndDate": formattedEndDate,
            "leaveAssignment.$[i].assignedNoOfDays": leaveType.assignedNoOfDays,
            "leaveAssignment.$[i].decisionMessage": decisionMessage || "",
            "leaveAssignment.$[i].daysUsed": newDaysUsed,
            "leaveAssignment.$[i].daysLeft": newDaysLeft
        }
      },
      { 
        arrayFilters: [
          {
            "i.leaveTypeId": leaveType.leaveTypeId
          }
        ]
      }
    );
    
    // Update leave records - replace callback with await
    await LeaveRecords.findOneAndUpdate(
      { _id: leaveId }, 
      { 
        $set: { 
          decisionMessage: decisionMessage || "",
          daysLeft: newDaysLeft,
          daysUsed: newDaysUsed,
          status: approved ? "Approved" : "Declined",
          approved: approved
        }
      }
    );
    
    // Prepare email notification
    let data = `<div>
      <p style="padding: 32px 0; text-align: left !important; font-weight: 700; font-size: 20px;font-family: 'DM Sans';">
        Hi ${check.firstName},
      </p> 
      <p style="font-size: 16px; text-align: left !important; font-weight: 300;">
         Your leave request has been ${approved == true ? "Approved" : "Declined"} <br>
         <br>
         Manager's decision: ${decisionMessage && decisionMessage}
        <br><br>
      </p>
    <div>`;
    
    let resp = emailTemp(data, 'Leave Application Notification')
    
    const receivers = [
      {
        email: check.email
      }
    ];
    
    // Send email notification
    await sendEmail(req, res, check.email, receivers, 'Leave Application Notification', resp);
    
    // Create notification for employee
    let notification = new Notification({
      created_by: req.payload.id,
      companyName: check.companyName,
      companyId: check.companyId,
      recipientId: check._id.toString(),
      notificationType: `Leave ${approved ? "Approved" : "Declined"}`,
      notificationContent: `Your leave request from ${formattedStartDate} to ${formattedEndDate} has been ${approved ? "approved" : "declined"}. ${decisionMessage ? "Decision: " + decisionMessage : ""}`,
      read: false
    });
    await notification.save();
    
    // Return success response
    res.status(200).json({
      status: 200,
      success: true,
      data: "Update Successful"
    });
    
  } catch (err) {
    console.error('Error updating leave records:', err);
    res.status(401).json({
      status: 401,
      success: false,
      error: err.message || err
    });
  }

} catch (error) {
  console.error('Error processing leave action:', error);
  res.status(500).json({
    status: 500,
    success: false,
    error: error.message || error
  });
}
        
          

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })

        return;

    }
}
export default leaveAction;



