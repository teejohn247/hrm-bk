import Quiz from '../../model/Quiz';

const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Check if client wants answers included
    const includeAnswers = req.query.includeAnswers === 'true';
    
    // Convert to plain JavaScript object and format as needed
    const quizObject = quiz.toObject();
    
    // Remove correct answers if not requested
    if (!includeAnswers) {
      quizObject.questions = quizObject.questions.map(q => ({
        _id: q._id,
        text: q.text,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation  
      }));
    }
    
    res.status(200).json({
      success: true,
      data: quizObject
    });
  } catch (error) {
    console.error('Error getting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default getQuizById; 