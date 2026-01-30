import Category from '../../model/Category';

const createCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and description'
      });
    }
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    const category = new Category({
      name,
      description,
      isActive: isActive !== undefined ? isActive : true
    });
    
    await category.save();
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default createCategory; 