import Course from '../../model/Course';
import Employee from '../../model/Employees';
import Quiz from '../../model/Quiz';
import Category from '../../model/Category';

const updateCourse = async (req, res) => {
  try {
    let { id } = req.params;
    let updateData = { ...req.body }; // Create a copy to avoid modifying the original
    const { includeQuiz = 'true' } = req.query;
    
    // Clean up the ID parameter - remove any quotes or extra characters
    if (id) {
      // Remove quotes and trim whitespace
      id = id.replace(/"/g, '').replace(/'/g, '').trim();
      console.log('Cleaned course ID:', id);
    }
    
    // Log received data for debugging
    console.log('Original update data:', updateData);
    
    // Check if we received data in a special format (keys and values joined by colon without spaces)
    // This can happen with certain FormData submissions
    if (Object.keys(updateData).length === 0) {
      // Try to parse the raw request body if it's a string
      const bodyString = req.body.toString();
      console.log('Raw body string:', bodyString);
      
      if (bodyString) {
        // Split by newlines to get each key:value pair
        const lines = bodyString.split('\n');
        updateData = {};
        
        lines.forEach(line => {
          if (line.includes(':')) {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':'); // Rejoin in case the value itself contains colons
            if (key && value) {
              updateData[key.trim()] = value.trim();
            }
          }
        });
        
        console.log('Parsed data from body string:', updateData);
      }
    }
    
    // If we still don't have data, check if the data was passed as a single string
    if (Object.keys(updateData).length === 0 && typeof req.body === 'string') {
      try {
        // Try to parse as JSON first
        updateData = JSON.parse(req.body);
      } catch (e) {
        // If not JSON, try custom parsing
        const lines = req.body.split('\n');
        updateData = {};
        
        lines.forEach(line => {
          if (line.includes(':')) {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':');
            if (key && value) {
              updateData[key.trim()] = value.trim();
            }
          }
        });
      }
      
      console.log('Parsed data from string body:', updateData);
    }
    
    // Process the data regardless of how it was received
    console.log('Processing update data:', updateData);
    
    // Clean and validate all form data
    // Process common string fields and trim them
    const stringFields = ['title', 'description', 'level', 'videoUrl', 'thumbnail'];
    stringFields.forEach(field => {
      if (updateData[field]) {
        updateData[field] = updateData[field].trim();
      }
    });
    
    // Convert numeric fields
    if (updateData.duration) {
      updateData.duration = Number(updateData.duration);
    }
    
    // Handle thumbnail directly
    if (updateData.thumbnail) {
      // No need to modify - just use as is
    } else if (req.body.image) {
      // If thumbnail is not in updateData but image is in req.body (from middleware)
      updateData.thumbnail = req.body.image;
    }
    
    // Trim the categoryId to remove any leading/trailing spaces that might cause ObjectId errors
    if (updateData.categoryId) {
      updateData.categoryId = updateData.categoryId.trim().replace(/"/g, '').replace(/'/g, '');
      console.log('Trimmed categoryId:', updateData.categoryId);
      
      try {
        const category = await Category.findById(updateData.categoryId);
        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Category not found'
          });
        }
        updateData.category = category.name;
      } catch (error) {
        console.error('Error fetching category:', error);
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID',
          error: error.message
        });
      }
    }
    
    // Trim courseManager ID to prevent potential ObjectId errors
    if (updateData.courseManager) {
      updateData.courseManager = updateData.courseManager.trim().replace(/"/g, '').replace(/'/g, '');
      console.log('Trimmed courseManager:', updateData.courseManager);
      
      const employee = await Employee.findById(updateData.courseManager);
      if (!employee) {
        return res.status(400).json({
          success: false,
          message: 'Employee (course manager) not found'
        });
      }
      // Set courseManagerName manually since findByIdAndUpdate bypasses pre-save hooks
      updateData.courseManagerName = employee.fullName || `${employee.firstName} ${employee.lastName}`;
    }
    
    // Handle courseDeadline (could be null or a valid date)
    if (updateData.courseDeadline === 'null' || updateData.courseDeadline === '') {
      updateData.courseDeadline = null;
    }
    
    // Ensure updatedAt is set
    updateData.updatedAt = new Date();
    
    console.log('Final update data:', updateData);
    
    // Update the course - check if the ID is valid before the query
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format',
        providedId: id
      });
    }
    
    // Update the course
    let course = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // If quiz data is requested, populate the necessary fields
    if (includeQuiz === 'true') {
      // Populate the course manager
      course = await Course.findById(id)
        .populate('courseManager', 'firstName lastName fullName email profilePic')
        .populate('quizId');
      
      // Check if the quizId exists but wasn't populated (missing quiz)
      if (course.quizId && typeof course.quizId !== 'object') {
        // Try to find the quiz directly
        const quizData = await Quiz.findById(course.quizId);
        
        if (!quizData) {
          console.warn(`Quiz with ID ${course.quizId} not found for course ${course._id}`);
          
          // Try to find any quiz with this courseId
          const anyQuizForCourse = await Quiz.findOne({ courseId: course._id.toString() });
          if (anyQuizForCourse) {
            console.log(`Found a quiz with courseId ${course._id}: ${anyQuizForCourse._id}`);
            
            // Update the course with the correct quizId
            course.quizId = anyQuizForCourse._id;
            await course.save();
            
            // Re-fetch the course to get populated data
            course = await Course.findById(id)
              .populate('courseManager', 'firstName lastName fullName email profilePic')
              .populate('quizId');
          }
        }
      }
    } else {
      // Just populate the course manager if quiz is not needed
      course = await Course.findById(id)
        .populate('courseManager', 'firstName lastName fullName email profilePic');
    }
    
    // Format the response data
    const responseData = {
      course: course.toObject()
    };
    
    // If quizId is populated, add it to the response
    if (includeQuiz === 'true' && course.quizId && typeof course.quizId === 'object') {
      responseData.quiz = course.quizId;
      // Revert quizId to just the ID for consistency
      responseData.course.quizId = responseData.quiz._id;
    } else {
      responseData.quiz = null;
    }
    
    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export default updateCourse; 