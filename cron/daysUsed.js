
import dotenv from 'dotenv';

import LeaveRecords from '../model/LeaveRecords';
import Employees from '../model/Employees';

const sgMail = require('@sendgrid/mail')
const { differenceInDays, addDays, isSaturday, isSunday, isSameDay } = require('date-fns');

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const daysUsed = async (req, res) => {

    try {
        const today = new Date();

        const leaveRecords = await LeaveRecords.find({
            status: 'Approved',
            $and: [
              { leaveStartDate: { $lte: today } }, // leaveStartDate is less than or equal to today
              { leaveEndDate: { $gte: today } }    // leaveEndDate is greater than or equal to today
            ]
          });

          const employeeResponse = await Employees.find()

employeeResponse.leaveAssignment.map(async (leave) => {
  if (leave.leaveApproved) {
    const startDate = new Date(leave.leaveStartDate);
    const endDate = new Date(leave.leaveEndDate);

    if (startDate <= today && endDate >= today) {
      // Increment daysUsed by 1
      leave.daysUsed += 1;

      // Assuming you're using Mongoose, save the changes to the database
      try {
        await EmployeeModel.findByIdAndUpdate(
          employeeResponse._id,
          { $set: { leaveAssignment: employeeResponse.leaveAssignment } },
          { new: true }
        );
        console.log(`Updated daysUsed for leave ${leave._id}`);
      } catch (error) {
        console.error(`Error updating daysUsed for leave ${leave._id}: ${error}`);
      }
    }
  }
});
        
          leaveRecords.map(async record => {i
            // Check if daysUsed was already updated for today
            if (!record.lastUpdated || !isSameDay(today, record.lastUpdated)) {
              record.daysUsed++; // Increment daysUsed by 1
              record.lastUpdated = today; // Update lastUpdated to today's date
        
              // Save the updated record to the database
              await record.save();

            console.log(record.daysUsed++, today)

            }
          });
          
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })

        return;

    }
}
export default daysUsed;



