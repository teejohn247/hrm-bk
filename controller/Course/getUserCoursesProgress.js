import Course from '../../model/Course';
import CourseProgress from '../../model/CourseProgress';
import Employee from '../../model/Employees'; // Import your user model
import Quiz from '../../model/Quiz';

const getUserCoursesProgress = async (req, res) => {
  try {
    const userId = req.params.userId || req.payload.id; // Allow admin to check other users
    
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
    
    // Find all progress records for this user
    const progressRecords = await CourseProgress.find({ userId });
    
    // Get ALL courses from the database, regardless of user progress
    const allCourses = await Course.find({})
      .populate('categoryId', 'name')
      .populate('courseManager', 'firstName lastName fullName profilePic')
      .populate('quizId');
    
    // Build response data
    const coursesData = allCourses.map(course => {
      // Find the progress record for this course if it exists
      const progressRecord = progressRecords.find(
        p => p.courseId.toString() === course._id.toString()
      );
      
      // Quiz information if available
      let quizData = null;
      if (course.quizId) {
        const quiz = course.quizId;
        const userSubmission = quiz.submissions && quiz.submissions.find(
          sub => sub.userId.toString() === userId.toString()
        );
        
        quizData = {
          _id: quiz._id,
          title: quiz.title,
          timeLimit: quiz.timeLimit,
          passScore: quiz.passScore,
          totalQuestions: quiz.questions ? quiz.questions.length : 0,
          userSubmission: userSubmission ? {
            score: userSubmission.score,
            passed: userSubmission.passed,
            submittedAt: userSubmission.submittedAt
          } : null
        };
      }
      
      // Check completion status
      const hasStarted = !!progressRecord;
      const hasCompletedContent = progressRecord && progressRecord.progress === 100;
      const hasPassedQuiz = quizData && quizData.userSubmission && quizData.userSubmission.passed;
      const isFullyCompleted = hasCompletedContent && (!course.quizId || hasPassedQuiz);
      
      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        category: {
          _id: course.categoryId._id,
          name: course.categoryId.name
        },
        level: course.level,
        duration: course.duration,
        instructorName: course.courseManagerName,
        instructor: course.courseManager ? {
          _id: course.courseManager._id,
          name: course.courseManager.fullName || `${course.courseManager.firstName} ${course.courseManager.lastName}`,
          profilePic: course.courseManager.profilePic
        } : null,
        thumbnail: course.thumbnail,
        videoUrl: course.videoUrl,
        tags: course.tags,
        rating: course.rating,
        comments: course.comments,
        enrollments: course.enrollments,
        featured: course.featured,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        progress: progressRecord ? {
          percentage: progressRecord.progress,
          minutesSpent: progressRecord.duration,
          startedAt: progressRecord.startedAt,
          lastAccessedAt: progressRecord.lastAccessedAt,
          completedAt: progressRecord.completedAt
        } : {
          percentage: 0,
          minutesSpent: 0,
          startedAt: null,
          lastAccessedAt: null,
          completedAt: null
        },
        quiz: quizData,
        status: {
          hasStarted,
          hasCompletedContent,
          hasPassedQuiz,
          isFullyCompleted
        }
      };
    });
    
    // Calculate summary statistics
    const coursesStarted = progressRecords.length;
    const coursesCompleted = coursesData.filter(c => c.status.isFullyCompleted).length;
    const totalProgress = progressRecords.reduce((sum, p) => sum + p.progress, 0);
    const averageProgress = coursesStarted > 0 ? Math.round(totalProgress / coursesStarted) : 0;
    const totalMinutesSpent = progressRecords.reduce((sum, p) => sum + (p.duration || 0), 0);
    
    // Quiz statistics
    const quizzesTaken = coursesData.filter(c => c.quiz && c.quiz.userSubmission).length;
    const quizzesPassed = coursesData.filter(c => c.quiz && c.quiz.userSubmission && c.quiz.userSubmission.passed).length;
    
    res.status(200).json({
      success: true,
      data: {
        user: userDetails,
        stats: {
          totalCourses: allCourses.length,
          coursesStarted,
          coursesCompleted,
          averageProgress,
          totalMinutesSpent,
          quizzesTaken,
          quizzesPassed
        },
        courses: coursesData
      }
    });
    
  } catch (error) {
    console.error('Error getting user courses progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default getUserCoursesProgress; 