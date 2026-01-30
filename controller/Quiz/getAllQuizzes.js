import Quiz from '../../model/Quiz';
import Course from '../../model/Course';

const getAllQuizzes = async (req, res) => {
  try {
    // Extract query parameters
    const { 
      page = 1, 
      limit: requestedLimit = 10, 
      courseId, 
      search,
      sort = 'createdAt',
      order = 'desc',
      skipPagination = 'false' // Add new parameter to optionally skip pagination
    } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by courseId if provided
    if (courseId) {
      query.courseId = courseId;
    }
    
    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Determine if pagination should be applied
    const shouldSkipPagination = skipPagination === 'true' || requestedLimit === '0' || requestedLimit === '-1';
    
    // Pagination setup
    let quizzes;
    let total;
    
    // Sort options
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    if (shouldSkipPagination) {
      // If skipPagination is true or limit is 0/-1, fetch all quizzes without pagination
      quizzes = await Quiz.find(query).sort(sortOptions);
      total = quizzes.length;
    } else {
      // Apply normal pagination
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(requestedLimit);
      const skip = (pageNumber - 1) * limitNumber;
      
      // Execute query with pagination
      quizzes = await Quiz.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber);
      
      // Get total count for pagination
      total = await Quiz.countDocuments(query);
    }
    
    // Get course information for each quiz
    const quizWithCourseInfo = await Promise.all(quizzes.map(async (quiz) => {
      const quizObj = quiz.toObject();
      
      // Optionally get course details
      if (quiz.courseId) {
        try {
          const course = await Course.findById(quiz.courseId, 'title');
          quizObj.courseName = course ? course.title : 'Unknown Course';
        } catch (error) {
          quizObj.courseName = 'Unknown Course';
        }
      } else {
        quizObj.courseName = 'No Course Assigned';
      }
      
      // Add stats
      const submissions = quiz.submissions || [];
      quizObj.stats = {
        totalQuestions: quiz.questions.length,
        totalSubmissions: submissions.length,
        passScore: quiz.passingScore || quiz.passScore
      };
      
      // Don't send all questions and submissions to reduce response size
      delete quizObj.questions;
      delete quizObj.submissions;
      
      return quizObj;
    }));
    
    // Construct response
    const response = {
      success: true,
      count: quizWithCourseInfo.length,
      total
    };
    
    // Add pagination info only if pagination was applied
    if (!shouldSkipPagination) {
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(requestedLimit);
      response.pagination = {
        totalPages: Math.ceil(total / limitNumber),
        currentPage: pageNumber,
        pageSize: limitNumber,
        hasMore: pageNumber < Math.ceil(total / limitNumber)
      };
    }
    
    // Add data to response
    response.data = quizWithCourseInfo;
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('Error fetching all quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default getAllQuizzes; 