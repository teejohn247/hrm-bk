import Quiz from '../../model/Quiz';
import Course from '../../model/Course';

const getQuizStatsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Find all quizzes associated with this course
    const quizzes = await Quiz.find({ courseId });

    console.log(quizzes);
    
    if (!quizzes || quizzes.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No quizzes found for this course',
        data: {
          courseId,
          quizCount: 0,
          quizStats: []
        }
      });
    }
    
    // Try to get course name if possible
    let courseName = "";
    try {
      const course = await Course.findById(courseId);
      if (course) {
        courseName = course.title;
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      // Continue anyway, the course name is not critical
    }
    
    // Calculate statistics for each quiz
    const quizStats = quizzes.map(quiz => {
      const submissions = quiz.submissions || [];
      const validSubmissions = submissions.filter(sub => 
        Array.isArray(sub.answers) && sub.answers.length > 0
      );
      const totalSubmissions = submissions.length;
      const validSubmissionsCount = validSubmissions.length;
      
      // Calculate average score from valid submissions
      const averageScore = validSubmissionsCount > 0 
        ? validSubmissions.reduce((sum, sub) => sum + sub.score, 0) / validSubmissionsCount 
        : 0;
      
      // Calculate pass rate
      const passingScore = quiz.passingScore || quiz.passScore || 70;
      const passedCount = submissions.filter(sub => sub.passed).length;
      const passRate = totalSubmissions > 0 
        ? (passedCount / totalSubmissions) * 100 
        : 0;
        
      // Get top performers (top 5)
      const topPerformers = [...validSubmissions]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(sub => ({
          userId: sub.userId,
          userName: sub.userName,
          score: sub.score,
          passed: sub.passed, // Include passed status
          submittedAt: sub.submittedAt
        }));
        
      // Get recent submissions (latest 5)
      const recentSubmissions = [...submissions]
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 1000)
        .map(sub => ({
          userId: sub.userId,
          userName: sub.userName,
          score: sub.score,
          passed: sub.passed,
          submittedAt: sub.submittedAt,
          answersCount: sub.answers ? sub.answers.length : 0
        }));
      
      return {
        quizId: quiz._id,
        title: quiz.title,
        totalQuestions: quiz.questions.length,
        totalSubmissions,
        validSubmissions: validSubmissionsCount,
        averageScore: parseFloat(averageScore.toFixed(2)),
        passRate: parseFloat(passRate.toFixed(2)),
        passScore:passingScore,
        topPerformers,
        grades:recentSubmissions,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        courseId,
        courseName,
        quizCount: quizzes.length,
        quizStats
      }
    });
    
  } catch (error) {
    console.error('Error getting quiz stats by course ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default getQuizStatsByCourseId; 