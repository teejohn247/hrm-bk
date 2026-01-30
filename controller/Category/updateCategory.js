import Category from '../../model/Category';
import Course from '../../model/Course';

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // If name is being updated, update the slug
    if (updateData.name) {
      updateData.slug = updateData.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
    }
    
    updateData.updatedAt = new Date();
    
    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default updateCategory; 