import Course from '../../model/Course';
import CourseProgress from '../../model/CourseProgress';

const updateCourseProgress = async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    const { progress, duration } = req.body;

    // Validate input
    if (progress === undefined || isNaN(progress) || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Valid progress value (0-100) is required'
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Find or create progress record
    let progressRecord = await CourseProgress.findOne({ userId, courseId });
    
    if (!progressRecord) {
      progressRecord = new CourseProgress({
        userId,
        courseId,
        duration,
        progress: 0,
        startedAt: new Date()
      });
    }
    
    // Only update progress if the new value is higher than the current one
    // This prevents accidental regression of progress
    if (progress > progressRecord.progress) {
      progressRecord.progress = progress;
    }
    
    // Update last accessed time
    progressRecord.lastAccessedAt = new Date();
    
    // Mark as completed if progress is 100%
    if (progress === 100 && !progressRecord.completedAt) {
      progressRecord.completedAt = new Date();
    }
    
    await progressRecord.save();
    
    res.status(200).json({
      success: true,
      data: {
        userId,
        courseId,
        courseTitle: course.title,
        progress: progressRecord.progress,
        duration: progressRecord.duration,
        startedAt: progressRecord.startedAt,
        lastAccessedAt: progressRecord.lastAccessedAt,
        completedAt: progressRecord.completedAt,
        isCompleted: progressRecord.progress === 100
      }
    });
    
  } catch (error) {
    console.error('Error updating course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default updateCourseProgress; 