import Course from '../../model/Course';
import Quiz from '../../model/Quiz';

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findById(id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // If course has a quiz, delete it too
    if (course.quizId) {
      await Quiz.findByIdAndDelete(course.quizId);
    }
    
    // Delete the course
    await Course.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default deleteCourse; 