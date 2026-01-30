import Course from '../../model/Course';
import Quiz from '../../model/Quiz';

const getAllCourses = async (req, res) => {
  try {
    const { featured, category, level, sort, includeQuizzes = 'false' } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by featured
    if (featured === 'true') {
      query.featured = true;
    }
    
    // Filter by category
    if (category) {
      query.categoryId = category;
    }
    
    // Filter by level
    if (level) {
      query.level = level;
    }
    
    // Create sort options
    let sortOptions = {};
    
    if (sort) {
      switch (sort) {
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        case 'popular':
          sortOptions = { enrollments: -1 };
          break;
        case 'rating':
          sortOptions = { rating: -1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }
    } else {
      // Default sort by newest
      sortOptions = { createdAt: -1 };
    }
    
    // Execute query with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build the base query
    const courseQuery = Course.find(query)
      .populate('courseManager', 'firstName lastName fullName email profilePic')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // If includeQuizzes is true, populate the quiz field
    if (includeQuizzes === 'true') {
      courseQuery.populate('quizId');
    }
    
    // Execute the query
    const courses = await courseQuery;
    
    // Get total count for pagination
    const total = await Course.countDocuments(query);
    
    // Format the response data
    const formattedCourses = courses.map(course => {
      const courseObj = course.toObject();
      
      // If includeQuizzes is true and quizId is populated
      if (includeQuizzes === 'true' && course.quizId && typeof course.quizId === 'object') {
        // Add the quiz data to a separate field
        courseObj.quiz = course.quizId;
        // Revert quizId to just the ID for consistency
        courseObj.quizId = courseObj.quiz._id;
      }
      
      return courseObj;
    });
    
    res.status(200).json({
      success: true,
      data: {
        courses: formattedCourses,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting courses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default getAllCourses; 