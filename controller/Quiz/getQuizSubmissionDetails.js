import Quiz from '../../model/Quiz';

const getQuizSubmissionDetails = async (req, res) => {
  try {
    const { quizId, submissionId } = req.params;
    
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Find the specific submission
    const submission = quiz.submissions.find(
      s => s._id.toString() === submissionId
    );
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Build detailed response with questions and answers
    const detailedResults = submission.answers.map(answer => {
      // Find the corresponding question
      const question = quiz.questions.find(
        q => q._id.toString() === answer.questionId
      );
      
      return {
        question: question ? question.text : 'Question not found',
        options: question ? question.options : [],
        selectedOptions: answer.selectedOption.map(opt => ({
          index: opt,
          text: question ? question.options[opt] : 'Option not found'
        })),
        correctOptions: question ? question.correctOption.map(opt => ({
          index: opt,
          text: question.options[opt]
        })) : [],
        isCorrect: answer.isCorrect,
        explanation: question ? question.explanation : ''
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        quizTitle: quiz.title,
        userName: submission.userName,
        userId: submission.userId,
        score: submission.score,
        passed: submission.passed,
        submittedAt: submission.submittedAt,
        detailedResults
      }
    });
    
  } catch (error) {
    console.error('Error getting quiz submission details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default getQuizSubmissionDetails; 