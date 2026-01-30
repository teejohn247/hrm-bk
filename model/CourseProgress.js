import mongoose from 'mongoose';

const CourseProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // Or your user model
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  // Overall progress percentage
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function(v) {
        // Allow decimals for more precise tracking (e.g., 20.5 minutes)
        return v >= 0;
      },
      message: props => `${props.value} is not a valid duration. Duration must be a positive number representing minutes.`
    }
  },
  completedAt: Date
});

// Create a unique compound index to ensure one progress record per user per course
CourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const CourseProgress = mongoose.model('CourseProgress', CourseProgressSchema);
export default CourseProgress; 