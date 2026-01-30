import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctOption: [{
    type: Number,
    required: true
  }],
  explanation: {
    type: String,
    required: true
  }
});

// New schema for quiz submissions
const QuizSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // Or 'User' depending on your system
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  answers: [{
    questionId: String,
    selectedOption: [Number],
    isCorrect: Boolean
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const QuizSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  timeLimit: {
    type: Number,
    required: true,
    min: [1, 'Time limit must be at least 1 minute'],
    validate: {
      validator: Number.isInteger,
      message: 'Time limit must be a whole number of minutes'
    }
  },
  passScore: {
    type: Number,
    required: true
  },
  questions: [QuestionSchema],
  submissions: [QuizSubmissionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'quizzes' // Explicitly set the collection name
});

const Quiz = mongoose.model('Quiz', QuizSchema);
export default Quiz; 