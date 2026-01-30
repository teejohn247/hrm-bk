import Quiz from '../../model/Quiz';
import Course from '../../model/Course';

const getQuizzesByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Optionally verify the course exists (can be removed if you want a faster query)
    const courseExists = await Course.exists({ _id: courseId });
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Find all quizzes with the given courseId
    const quizzes = await Quiz.find({ courseId });
    
    // Return appropriate response if no quizzes found
    if (quizzes.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No quizzes found for this course',
        data: []
      });
    }
    
    // Format quizzes for response - normalize field names and add stats
    const formattedQuizzes = quizzes.map(quiz => {
      // Get submissions data
      const submissions = quiz.submissions || [];
      const validSubmissions = submissions.filter(sub => 
        Array.isArray(sub.answers) && sub.answers.length > 0
      );
      const totalSubmissions = validSubmissions.length;
      
      // Calculate average score
      const averageScore = totalSubmissions > 0 
        ? validSubmissions.reduce((sum, sub) => sum + sub.score, 0) / totalSubmissions 
        : 0;
      
      // Calculate pass rate - use quiz.passScore or quiz.passingScore
      const passingScore = quiz.passingScore || quiz.passScore || 70;
      const passedCount = validSubmissions.filter(sub => sub.passed).length;
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
          passed: sub.passed,
          submittedAt: sub.submittedAt
        }));
      
      return {
        id: quiz._id,
        courseId: quiz.courseId,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        passingScore: passingScore,
        totalQuestions: quiz.questions.length,
        totalSubmissions: submissions.length,
        validSubmissions: validSubmissions.length,
        averageScore: parseFloat(averageScore.toFixed(2)),
        passRate: parseFloat(passRate.toFixed(2)),
        topPerformers,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt
      };
    });
    
    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: formattedQuizzes
    });
    
  } catch (error) {
    console.error('Error fetching quizzes by course ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default getQuizzesByCourseId; 