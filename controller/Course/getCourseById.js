import Course from '../../model/Course';
import Quiz from '../../model/Quiz';

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const includeQuiz = req.query.includeQuiz !== 'false'; // Default to including quiz
    
    // Find the course and populate both courseManager and quiz fields directly
    const courseQuery = Course.findById(id)
      .populate('courseManager', 'firstName lastName fullName email profilePic');
    
    // If includeQuiz is true, also populate the quiz field
    if (includeQuiz) {
      courseQuery.populate('quizId');
    }
    
    const course = await courseQuery;
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // If quizId is populated but has no value, try to find by courseId
    if (includeQuiz && course.quizId === null) {
      try {
        // Try to find any quiz with this courseId
        const anyQuizForCourse = await Quiz.findOne({ courseId: course._id.toString() });
        if (anyQuizForCourse) {
          console.log(`Found a quiz with courseId ${course._id}: ${anyQuizForCourse._id}`);
          
          // Update the course with the correct quizId
          course.quizId = anyQuizForCourse._id;
          await course.save();
          
          // Re-fetch the course with populated quiz
          return res.status(200).json({
            success: true,
            data: {
              course,
              quiz: anyQuizForCourse
            }
          });
        }
      } catch (quizError) {
        console.error(`Error fixing quiz relationship:`, quizError);
      }
    }
    
    // Create the response object with the course 
    const responseData = {
      course: course.toObject()
    };
    
    // Add the quiz data if it exists
    if (includeQuiz) {
      // If quizId is populated, it will contain the full quiz object
      if (course.quizId && typeof course.quizId === 'object') {
        responseData.quiz = course.quizId;
        // Remove the quizId from the course object to avoid duplication
        responseData.course.quizId = responseData.quiz._id;
      } else {
        responseData.quiz = null;
      }
    }
    
    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error getting course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default getCourseById; 