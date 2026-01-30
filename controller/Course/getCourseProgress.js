import Course from '../../model/Course';
import CourseProgress from '../../model/CourseProgress';
import Employee from '../../model/Employees'; // Import your user model

const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req?.payload?.id || req?.params?.userId; // Assuming you have authentication middleware

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get user information
    const user = await Employee.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Extract relevant user details
    const userDetails = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName || `${user.firstName} ${user.lastName}`,
      email: user.email,
      profilePic: user.profilePic,
      department: user.department,
      position: user.position,
      employeeCode: user.employeeCode
    };

    // Find progress record
    const progressRecord = await CourseProgress.findOne({ userId, courseId });
    
    if (!progressRecord) {
      return res.status(200).json({
        success: true,
        data: {
          user: userDetails,
          courseId,
          courseTitle: course.title,
          progress: 0,
          duration: '00:00:00',
          startedAt: null,
          lastAccessedAt: null,
          completedAt: null,
          isCompleted: false,
          message: 'Course not started yet'
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        user: userDetails,
        courseId,
        courseTitle: course.title, 
        progress: progressRecord.progress,
        duration: progressRecord.duration,
        startedAt: progressRecord.startedAt,
        lastAccessedAt: progressRecord.lastAccessedAt,
        completedAt: progressRecord.completedAt,
        isCompleted: progressRecord.progress === 100
      }
    });
    
  } catch (error) {
    console.error('Error getting course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default getCourseProgress; 