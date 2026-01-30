import Course from '../../model/Course';
import CourseProgress from '../../model/CourseProgress';
import Employee from '../../model/Employees';
import Quiz from '../../model/Quiz';

/**
 * Get all courses for a user with comprehensive stats
 * @route GET /api/v1/user/courses
 * @access Private
 */
const getUserCoursesWithStats = async (req, res) => {
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
    
    // Get all courses 
    let courses;
    if (progressRecords.length > 0) {
      // Get courses the user has started
      const courseIds = progressRecords.map(p => p.courseId);
      courses = await Course.find({ _id: { $in: courseIds } })
        .populate('categoryId', 'name')
        .populate('courseManager', 'firstName lastName fullName profilePic')
        .populate('quizId', 'title passScore');
    } else {
      // No courses started yet, return empty data
      return res.status(200).json({
        success: true,
        data: {
          user: userDetails,
          stats: {
            coursesStarted: 0,
            coursesCompleted: 0,
            averageProgress: 0,
            totalMinutesSpent: 0,
            quizzesPassed: 0,
            quizzesFailed: 0
          },
          courses: []
        }
      });
    }

    // Check if the user has quiz submissions
    const courseIdsWithQuiz = courses
      .filter(course => course.quizId)
      .map(course => course.quizId._id);
    
    let quizSubmissions = [];
    if (courseIdsWithQuiz.length > 0) {
      // Find quiz submissions for this user
      const quizzes = await Quiz.find({ _id: { $in: courseIdsWithQuiz } });
      quizSubmissions = quizzes.flatMap(quiz => {
        return (quiz.submissions || [])
          .filter(submission => submission.userId.toString() === userId.toString())
          .map(submission => ({
            quizId: quiz._id,
            score: submission.score,
            passed: submission.passed,
            submittedAt: submission.submittedAt
          }));
      });
    }
    
    // Build enhanced course progress data with all statistics
    const coursesWithStats = courses.map(course => {
      // Find the progress record for this course
      const progressRecord = progressRecords.find(
        p => p.courseId.toString() === course._id.toString()
      );
      
      // Check if the user has taken the quiz for this course
      let quizStats = null;
      if (course.quizId) {
        const quizSubmission = quizSubmissions.find(
          s => s.quizId.toString() === course.quizId._id.toString()
        );
        
        if (quizSubmission) {
          quizStats = {
            score: quizSubmission.score,
            passed: quizSubmission.passed,
            submittedAt: quizSubmission.submittedAt,
            passingScore: course.quizId.passScore
          };
        }
      }
      
      // Determine completion status
      const hasCompletedProgress = progressRecord && progressRecord.progress === 100;
      const hasPassedQuiz = quizStats && quizStats.passed;
      const isFullyCompleted = hasCompletedProgress && (!course.quizId || hasPassedQuiz);
      
      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        category: {
          _id: course.categoryId._id,
          name: course.categoryId.name
        },
        level: course.level,
        courseDuration: course.duration,
        instructorName: course.courseManagerName,
        instructor: {
          _id: course.courseManager._id,
          name: course.courseManager.fullName || `${course.courseManager.firstName} ${course.courseManager.lastName}`,
          profilePic: course.courseManager.profilePic
        },
        thumbnail: course.thumbnail,
        tags: course.tags,
        rating: course.rating,
        comments: course.comments,
        featured: course.featured,
        createdAt: course.createdAt,
        progress: {
          percentage: progressRecord ? progressRecord.progress : 0,
          minutesSpent: progressRecord ? progressRecord.duration : 0,
          startedAt: progressRecord ? progressRecord.startedAt : null,
          lastAccessedAt: progressRecord ? progressRecord.lastAccessedAt : null,
          completedAt: progressRecord ? progressRecord.completedAt : null
        },
        quiz: course.quizId ? {
          _id: course.quizId._id,
          title: course.quizId.title,
          passingScore: course.quizId.passScore,
          userSubmission: quizStats
        } : null,
        completionStatus: {
          inProgress: progressRecord && progressRecord.progress > 0 && progressRecord.progress < 100,
          contentCompleted: hasCompletedProgress,
          quizCompleted: hasPassedQuiz,
          fullyCompleted: isFullyCompleted
        }
      };
    });
    
    // Calculate summary statistics
    const coursesStarted = coursesWithStats.length;
    const coursesCompleted = coursesWithStats.filter(c => c.completionStatus.fullyCompleted).length;
    const totalProgress = coursesWithStats.reduce((sum, c) => sum + c.progress.percentage, 0);
    const averageProgress = coursesStarted > 0 ? Math.round(totalProgress / coursesStarted) : 0;
    const totalMinutesSpent = coursesWithStats.reduce((sum, c) => sum + c.progress.minutesSpent, 0);
    
    // Quiz statistics
    const coursesWithQuizzes = coursesWithStats.filter(c => c.quiz && c.quiz.userSubmission);
    const quizzesPassed = coursesWithQuizzes.filter(c => c.quiz.userSubmission.passed).length;
    const quizzesFailed = coursesWithQuizzes.length - quizzesPassed;
    
    res.status(200).json({
      success: true,
      data: {
        user: userDetails,
        stats: {
          coursesStarted,
          coursesCompleted,
          averageProgress,
          totalMinutesSpent,
          quizzesPassed,
          quizzesFailed
        },
        courses: coursesWithStats
      }
    });
    
  } catch (error) {
    console.error('Error getting user courses with stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default getUserCoursesWithStats; 