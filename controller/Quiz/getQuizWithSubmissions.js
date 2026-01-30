import Quiz from '../../model/Quiz';

const getQuizWithSubmissions = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Format submissions data
    const submissions = quiz.submissions || [];
    
    // Calculate basic statistics
    const validSubmissions = submissions.filter(sub => 
      Array.isArray(sub.answers) && sub.answers.length > 0
    );
    const totalSubmissions = submissions.length;
    const validSubmissionsCount = validSubmissions.length;
    
    const averageScore = validSubmissionsCount > 0 
      ? validSubmissions.reduce((sum, sub) => sum + sub.score, 0) / validSubmissionsCount 
      : 0;
    
    const passingScore = quiz.passingScore || quiz.passScore || 70;
    const passedCount = submissions.filter(sub => sub.passed).length;
    const passRate = totalSubmissions > 0 
      ? (passedCount / totalSubmissions) * 100 
      : 0;
      
    // Format submissions for response
    const formattedSubmissions = submissions.map(sub => ({
      id: sub._id,
      userId: sub.userId,
      userName: sub.userName,
      score: sub.score,
      passed: sub.passed,
      answersCount: sub.answers ? sub.answers.length : 0,
      submittedAt: sub.submittedAt
    }));
    
    // Sort by most recent first
    formattedSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    const response = {
      quizId: quiz._id,
      courseId: quiz.courseId,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      passingScore,
      totalQuestions: quiz.questions.length,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      stats: {
        totalSubmissions,
        averageScore: parseFloat(averageScore.toFixed(2)),
        passRate: parseFloat(passRate.toFixed(2)),
        passedCount
      },
      submissions: formattedSubmissions
    };
    
    res.status(200).json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('Error getting quiz with submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default getQuizWithSubmissions; 