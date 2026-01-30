import Course from '../../model/Course';
import Quiz from '../../model/Quiz';

const fixCourseQuizRelationships = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const result = {
      courseId: course._id,
      originalQuizId: course.quizId,
      fixed: false,
      changes: {}
    };
    
    // Check if course has a quiz ID
    if (course.quizId) {
      // Try to find that quiz
      const quiz = await Quiz.findById(course.quizId);
      
      if (!quiz) {
        console.log(`Course ${courseId} has quizId ${course.quizId}, but quiz not found`);
        result.changes.quizNotFound = true;
        
        // Look for any quiz with this courseId
        const alternativeQuiz = await Quiz.findOne({ courseId: course._id });
        
        if (alternativeQuiz) {
          console.log(`Found alternative quiz ${alternativeQuiz._id} for course ${courseId}`);
          course.quizId = alternativeQuiz._id;
          await course.save();
          
          result.fixed = true;
          result.changes.updatedQuizId = alternativeQuiz._id;
        } else {
          console.log(`No alternative quiz found for course ${courseId}`);
          result.changes.noAlternativeFound = true;
        }
      } else {
        // Quiz exists, check if courseId is correct
        if (quiz.courseId && quiz.courseId.toString() !== courseId.toString()) {
          console.log(`Quiz ${quiz._id} has incorrect courseId: ${quiz.courseId} vs expected: ${courseId}`);
          
          quiz.courseId = courseId;
          await quiz.save();
          
          result.fixed = true;
          result.changes.updatedCourseIdInQuiz = true;
        } else {
          console.log(`Course-Quiz relationship is intact for ${courseId} - ${course.quizId}`);
          result.relationshipIntact = true;
        }
      }
    } else {
      console.log(`Course ${courseId} has no quizId`);
      result.changes.noCourseQuizId = true;
      
      // Look for any quiz with this courseId
      const alternativeQuiz = await Quiz.findOne({ courseId: course._id });
      
      if (alternativeQuiz) {
        console.log(`Found quiz ${alternativeQuiz._id} for course ${courseId}`);
        course.quizId = alternativeQuiz._id;
        await course.save();
        
        result.fixed = true;
        result.changes.addedQuizId = alternativeQuiz._id;
      } else {
        console.log(`No quiz found for course ${courseId}`);
        result.changes.noQuizFound = true;
      }
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fixing course-quiz relationship:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default fixCourseQuizRelationships; 