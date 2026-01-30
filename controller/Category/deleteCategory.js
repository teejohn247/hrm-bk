import Category from '../../model/Category';
import Course from '../../model/Course';

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has associated courses
    const coursesCount = await Course.countDocuments({ categoryId: id });
    
    if (coursesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${coursesCount} associated courses. Please reassign or delete the courses first.`
      });
    }
    
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default deleteCategory; 