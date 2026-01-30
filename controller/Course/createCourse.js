import Course from '../../model/Course';
import Category from '../../model/Category';
import Employee from '../../model/Employees';

const createCourse = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      categoryId, 
      level, 
      duration, 
      courseManager,
      courseDeadline,
      image,
      rating,
      comments,
      videoUrl,
      tags,
      featured,
      quizId
    } = req.body;

    console.log(req.body);
    
    // Validate required fields
    if (!title || !description || !categoryId || !level || !duration || !courseManager || !image || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if employee (course manager) exists
    const employee = await Employee.findById(courseManager);
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'Employee (course manager) not found'
      });
    }
    
    // Create course
    const course = new Course({
      title,
      description,
      categoryId,
      category: category.name,
      level,
      duration,
      courseManager,
      courseDeadline,
      courseManagerName: employee.fullName,
      thumbnail: image,
      videoUrl,
      comments,
      tags: tags || [],
      featured: featured || false,
      rating: rating || 0,
      enrollments: 0,
      quizId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await course.save();
    
    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default createCourse; 