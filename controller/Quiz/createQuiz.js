import Quiz from '../../model/Quiz';
import Course from '../../model/Course';

const createQuiz = async (req, res) => {
  try {
    const { 
      courseId, 
      title, 
      description, 
      timeLimit, 
      passScore,
      questions,
      overrideExisting = false // New parameter to control override behavior
    } = req.body;
    
    // Validate required fields
    if (!courseId || !title || !timeLimit || !passScore || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Validate each question has the required fields and correctOption is an array
    for (const question of questions) {
      if (!question.text || !question.options || !Array.isArray(question.options) || 
          !question.correctOption || !Array.isArray(question.correctOption) || 
          !question.explanation) {
        return res.status(400).json({
          success: false,
          message: 'Each question must have text, options array, correctOption array, and explanation'
        });
      }
      
      // Ensure all correctOption indices are valid
      for (const correctIndex of question.correctOption) {
        if (correctIndex < 0 || correctIndex >= question.options.length) {
          return res.status(400).json({
            success: false,
            message: 'Question contains invalid correctOption index'
          });
        }
      }
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if course already has a quiz
    if (course.quizId && !overrideExisting) {
      // Find the existing quiz to include in the response
      const existingQuiz = await Quiz.findById(course.quizId);
      
      return res.status(400).json({
        success: false,
        message: 'Course already has a quiz. Set overrideExisting=true to replace it.',
        data: {
          existingQuizId: course.quizId,
          existingQuizTitle: existingQuiz ? existingQuiz.title : 'Unknown Quiz'
        }
      });
    }
    
    // If overriding an existing quiz, delete the old one
    if (course.quizId && overrideExisting) {
      try {
        await Quiz.findByIdAndDelete(course.quizId);
        console.log(`Deleted existing quiz ${course.quizId} for course ${courseId}`);
      } catch (deleteError) {
        console.error('Error deleting existing quiz:', deleteError);
        // Continue anyway, as we want to create the new quiz regardless
      }
    }
    
    // Create quiz
    const quiz = new Quiz({
      courseId: courseId.toString(), // Ensure courseId is stored as a string
      title,
      description,
      timeLimit,
      passScore,
      questions,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await quiz.save();
    console.log(`Created new quiz with ID ${quiz._id} for course ${courseId}`);
    
    // Update course with new quiz ID
    course.quizId = quiz._id;
    await course.save();
    console.log(`Updated course ${courseId} with new quizId ${quiz._id}`);
    
    // Verify the quiz exists in the database
    const savedQuiz = await Quiz.findById(quiz._id);
    if (!savedQuiz) {
      console.error(`WARNING: Could not verify quiz ${quiz._id} exists after creation`);
    }

    console.log({quiz})
    
    res.status(201).json({
      success: true,
      message: overrideExisting ? 'Existing quiz was replaced' : 'New quiz created',
      data: {
        quizId: quiz._id,
        courseId: course._id,
        courseTitle: course.title,
        quizTitle: quiz.title,
        questionCount: questions.length,
        quiz: quiz // Include the complete quiz in the response
      }
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default createQuiz; 