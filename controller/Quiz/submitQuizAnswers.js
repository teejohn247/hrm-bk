import Quiz from '../../model/Quiz';
import Employee from '../../model/Employees'; // Assuming you use this model for users

const submitQuizAnswers = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const userId = req.payload.id; // Assuming you have authentication middleware that adds user to req

    console.log({quizId, answers});
    
    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide quizId and answers array'
      });
    }
    
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
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
    
    // Calculate score
    let correctAnswers = 0;
    const results = [];
    const submissionAnswers = [];
    
    // Log quiz questions to debug
    console.log('Quiz questions:', quiz.questions);
    console.log('Submitted answers:', answers);
    
    answers.forEach(answer => {
      // Add debug logging
      console.log('Processing answer for question ID:', answer.questionId);
      
      // Make sure we're comparing strings with strings
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId.toString());
      
      console.log('Found question:', question);
      
      if (question) {
        // Handle both single selection and multiple selection answers
        const userSelection = Array.isArray(answer.selectedOption) 
          ? answer.selectedOption 
          : [answer.selectedOption];
        
        console.log('User selection:', userSelection);
        console.log('Correct option from DB:', question.correctOption);
        
        // Check if arrays have same length and same elements (order doesn't matter)
        const isCorrect = Array.isArray(question.correctOption) && 
          userSelection.length === question.correctOption.length &&
          userSelection.every(opt => question.correctOption.includes(opt)) &&
          question.correctOption.every(opt => userSelection.includes(opt));
        
        console.log('Is answer correct:', isCorrect);
        
        if (isCorrect) {
          correctAnswers++;
        }
        
        results.push({
          questionId: answer.questionId,
          isCorrect,
          correctOption: question.correctOption,
          explanation: question.explanation
        });
        
        console.log('Current results array:', results);

        // Store this answer for the submission
        submissionAnswers.push({
          questionId: answer.questionId,
          selectedOption: userSelection,
          isCorrect
        });
      } else {
        console.log('Warning: Question not found for ID:', answer.questionId);
        // Add a fallback to handle missing questions
        results.push({
          questionId: answer.questionId,
          isCorrect: false,
          correctOption: [],
          explanation: "Question not found"
        });
      }
    });
    
    console.log('Final results array:', results);
    console.log('Correct answers count:', correctAnswers);
    
    const totalQuestions = quiz.questions.length;
    const score = (correctAnswers / totalQuestions) * 100;
    console.log({score});
    const passed = score >= quiz.passScore;
    console.log({passed});

    // Create new submission
    const submission = {
      userId: userId,
      userName: user.fullName || `${user.firstName} ${user.lastName}`,
      score,
      passed,
      answers: submissionAnswers,
      submittedAt: new Date()
    };

    // Add submission to quiz
    quiz.submissions.push(submission);
    await quiz.save();
    
    res.status(200).json({
      success: true,
      data: {
        score,
        correctAnswers,
        totalQuestions,
        passed,
        // results,
        passScore: quiz.passScore
      }
    });
  } catch (error) {
    console.error('Error submitting quiz answers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default submitQuizAnswers; 