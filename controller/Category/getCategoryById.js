import Category from '../../model/Category';
import Course from '../../model/Course';

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeCourses } = req.query;
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    let courses = [];
    if (includeCourses === 'true') {
      courses = await Course.find({ categoryId: id })
        .select('title description level duration instructor rating enrollments');
    }
    
    res.status(200).json({
      success: true,
      data: {
        category,
        courses: includeCourses === 'true' ? courses : undefined
      }
    });
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default getCategoryById; 