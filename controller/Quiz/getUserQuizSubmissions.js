import Quiz from '../../model/Quiz';
import Employee from '../../model/Employees'; // Adjust based on your user model

const getUserQuizSubmissions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the user exists
    const user = await Employee.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Find all quizzes with submissions from this user
    const quizzes = await Quiz.find({ 'submissions.userId': userId });
    
    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No quiz submissions found for this user'
      });
    }
    
    // Extract submission data for this user
    const userSubmissions = [];
    
    quizzes.forEach(quiz => {
      const submissions = quiz.submissions.filter(sub => 
        sub.userId.toString() === userId.toString()
      );
      
      submissions.forEach(sub => {
        userSubmissions.push({
          quizId: quiz._id,
          quizTitle: quiz.title,
          courseId: quiz.courseId,
          submissionId: sub._id,
          score: sub.score,
          passed: sub.passed,
          submittedAt: sub.submittedAt,
          totalQuestions: quiz.questions.length,
          correctAnswers: sub.answers.filter(a => a.isCorrect).length
        });
      });
    });
    
    // Sort by submission date (newest first)
    userSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        userName: user.fullName || `${user.firstName} ${user.lastName}`,
        submissionsCount: userSubmissions.length,
        submissions: userSubmissions
      }
    });
    
  } catch (error) {
    console.error('Error getting user quiz submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default getUserQuizSubmissions; 