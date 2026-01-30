import Quiz from '../../model/Quiz';
import Course from '../../model/Course';

const getCourseQuizResults = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Verify the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Find the quiz associated with this course
    const quiz = await Quiz.findOne({ courseId });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'No quiz found for this course'
      });
    }
    
    // Extract and format the submissions data
    const quizResults = quiz.submissions.map(submission => ({
      submissionId: submission._id,
      userId: submission.userId,
      userName: submission.userName,
      score: submission.score,
      passed: submission.passed,
      submittedAt: submission.submittedAt,
      correctAnswers: submission.answers.filter(a => a.isCorrect).length,
      totalQuestions: quiz.questions.length
    }));
    
    // Sort by submission date (newest first)
    quizResults.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    res.status(200).json({
      success: true,
      data: {
        courseName: course.title,
        quizTitle: quiz.title,
        passScore: quiz.passScore,
        totalSubmissions: quizResults.length,
        results: quizResults
      }
    });
    
  } catch (error) {
    console.error('Error getting course quiz results:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default getCourseQuizResults; 