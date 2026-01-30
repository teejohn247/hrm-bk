import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  courseManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  courseManagerName: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  comments: {
    type: String,
  },
  enrollments: {
    type: Number,
    default: 0
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add a pre-save hook to validate category exists
CourseSchema.pre('save', async function(next) {
  if (this.isModified('categoryId')) {
    const category = await mongoose.model('Category').findById(this.categoryId);
    if (!category) {
      next(new Error('Invalid category ID'));
    }
  }

  // Fetch employee name if courseManager ID is modified
  if (this.isModified('courseManager')) {
    try {
      const employee = await mongoose.model('Employee').findById(this.courseManager);
      if (!employee) {
        return next(new Error('Invalid course manager ID'));
      }
      // Set the courseManagerName from the employee's full name
      this.courseManagerName = employee.fullName || `${employee.firstName} ${employee.lastName}`;
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

const Course = mongoose.model('Course', CourseSchema);
export default Course; 