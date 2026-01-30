import Quiz from '../../model/Quiz';
import Course from '../../model/Course';

const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Find the quiz before update to check its courseId
    const existingQuiz = await Quiz.findById(id);
    if (!existingQuiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // If courseId is being changed, update the course relationships
    if (updateData.courseId && updateData.courseId !== existingQuiz.courseId) {
      // Check if new course exists
      const newCourse = await Course.findById(updateData.courseId);
      if (!newCourse) {
        return res.status(400).json({
          success: false,
          message: 'New course not found'
        });
      }
      
      // If old course exists, remove the quiz reference
      if (existingQuiz.courseId) {
        const oldCourse = await Course.findById(existingQuiz.courseId);
        if (oldCourse && oldCourse.quizId && oldCourse.quizId.toString() === id) {
          oldCourse.quizId = undefined;
          await oldCourse.save();
          console.log(`Removed quiz reference from old course ${existingQuiz.courseId}`);
        }
      }
      
      // Update new course with quiz ID
      newCourse.quizId = id;
      await newCourse.save();
      console.log(`Updated new course ${updateData.courseId} with quizId ${id}`);
      
      // Ensure courseId is stored as a string
      updateData.courseId = updateData.courseId.toString();
    }
    
    // Ensure updatedAt is set
    updateData.updatedAt = new Date();
    
    // Update the quiz
    const quiz = await Quiz.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // Double-check course-quiz relationship
    if (quiz.courseId) {
      const course = await Course.findById(quiz.courseId);
      if (course && (!course.quizId || course.quizId.toString() !== id)) {
        course.quizId = id;
        await course.save();
        console.log(`Fixed course-quiz relationship for course ${quiz.courseId}`);
      }
    }
    
    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default updateQuiz; 