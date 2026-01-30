import Category from '../../model/Category';
import Course from '../../model/Course';

const getAllCategories = async (req, res) => {
  try {
    const { active } = req.query;
    
    const filter = {};
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }
    
    // Get all categories
    const categories = await Category.find(filter)
      .sort({ name: 1 });
    
    // Get all courses at once to reduce database queries
    const courses = await Course.find({});
    
    // Calculate statistics for each category
    const categoriesWithStats = await Promise.all(categories.map(async (category) => {
      // Convert to plain object
      const categoryObj = category.toObject();
      
      // Find all courses in this category
      const categoryId = category._id.toString();
      const categoryCourses = courses.filter(course => 
        course.categoryId && course.categoryId.toString() === categoryId
      );
      
      // Calculate total number of courses
      categoryObj.totalCourses = categoryCourses.length;
      
      // Calculate total duration (in minutes/seconds depending on your data structure)
      categoryObj.totalDuration = categoryCourses.reduce((total, course) => 
        total + (course.duration || 0), 0
      );
      
      // Add human-readable duration
      const hours = Math.floor(categoryObj.totalDuration / 60);
      const minutes = categoryObj.totalDuration % 60;
      categoryObj.totalDurationText = hours > 0 
        ? `${hours}h ${minutes}m` 
        : `${minutes}m`;
      
      return categoryObj;
    }));
    
    res.status(200).json({
      success: true,
      data: categoriesWithStats
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default getAllCategories; 