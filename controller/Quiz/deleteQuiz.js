import Quiz from '../../model/Quiz';
import Course from '../../model/Course';

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Update associated course to remove quizId
    await Course.findOneAndUpdate(
      { quizId: id },
      { $unset: { quizId: 1 } }
    );
    
    // Delete the quiz
    await Quiz.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default deleteQuiz; 