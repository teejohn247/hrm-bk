import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../model/Course.js';
import Category from '../model/Category.js';

dotenv.config();

const migrateCourseCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Connected');
    
    // Get all unique categories from courses
    const uniqueCategories = await Course.distinct('category');
    
    // Create categories
    const categoryMap = {};
    
    for (const categoryName of uniqueCategories) {
      const category = await Category.create({
        name: categoryName,
        description: `${categoryName} courses`,
        isActive: true
      });
      
      categoryMap[categoryName] = category._id;
    }
    
    // Update all courses with new categoryId
    const courses = await Course.find({});
    
    for (const course of courses) {
      course.categoryId = categoryMap[course.category];
      await course.save();
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateCourseCategories(); 