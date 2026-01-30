import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import Holiday from '../../model/Holidays';
import Leave from '../../model/LeaveRecords';
import Meeting from '../../model/Meetings';
import Company from '../../model/Company';

dotenv.config();

const fetchCalendarData = async (companyId, userId, isSuperAdmin) => {
  try {

    
    // Base query for holidays
    const holidaysQuery = { companyId };
    
    // Base queries that differ based on user type
    const meetingsQuery = isSuperAdmin ? { companyId } : { employeeId: userId };
    const leaveRecordsQuery = isSuperAdmin ? { companyId } : { userId };
    const birthdaysQuery = { companyId };

    // Parallel execution of queries for better performance
    const [meetings, holidays, leaveRecords, employee] = await Promise.all([
      Meeting.find(meetingsQuery).lean(),
      Holiday.find(holidaysQuery).lean(),
      Leave.find(leaveRecordsQuery).lean(),
      Employee.findById(userId, 'firstName lastName dateOfBirth profilePic companyId').lean()
    ]);

    // Format birthdays data
    let birthdays;
    if (isSuperAdmin) {
      birthdays = await Employee.aggregate([
        { $match: birthdaysQuery },
        {
          $project: {
            employeeName: { $concat: ['$firstName', ' ', '$lastName'] },
            employeeBirthday: '$dateOfBirth',
            profilePic: '$profilePic'
          }
        }
      ]);
    } else {
      birthdays = [{
        employeeBirthday: employee.dateOfBirth,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        profilePic: employee.profilePic
      }];
    }

    return {
      meetings,
      holidays,
      leaveRecords,
      birthdays
    };
  } catch (error) {
    throw error;
  }
};

const calendar = async (req, res) => {
  try {
    const userId = req.payload.id;
    
    // Get user and company info in parallel
    const [employee, company] = await Promise.all([
      Employee.findById(userId).lean(),
      Company.findById(userId).lean()
    ]);

    if (!employee && !company) {
      return res.status(404).json({
        status: 404,
        success: false,
        error: 'User not found'
      });
    }

    const companyId = company?.isSuperAdmin ? userId : employee?.companyId;
    const calendarData = await fetchCalendarData(companyId, userId, company?.isSuperAdmin);

    return res.status(200).json({
      status: 200,
      success: true,
      data: calendarData
    });

  } catch (error) {
    console.error('Calendar Error:', error);
    return res.status(500).json({
      status: 500,
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

export default calendar;



