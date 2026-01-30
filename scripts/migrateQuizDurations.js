const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Quiz = require('../model/Quiz');

dotenv.config();

const normalizeTimeToMinutes = (timeLimit) => {
  if (typeof timeLimit === 'number') {
    // If already a number, ensure it's a whole number
    return Math.round(timeLimit);
  }
  
  if (typeof timeLimit === 'string') {
    // Remove any non-numeric characters except decimal points
    const numericValue = timeLimit.replace(/[^0-9.]/g, '');
    return Math.round(parseFloat(numericValue));
  }
  
  // Default to 20 minutes if invalid value
  return 20;
};

const migrateDurations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get all quizzes
    const quizzes = await Quiz.find({});
    console.log(`Found ${quizzes.length} quizzes to process`);

    // Update each quiz
    for (const quiz of quizzes) {
      const originalTimeLimit = quiz.timeLimit;
      const normalizedTimeLimit = normalizeTimeToMinutes(originalTimeLimit);
      
      if (originalTimeLimit !== normalizedTimeLimit) {
        console.log(`Updating quiz "${quiz.title}": ${originalTimeLimit} -> ${normalizedTimeLimit} minutes`);
        
        quiz.timeLimit = normalizedTimeLimit;
        await quiz.save();
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
migrateDurations(); 