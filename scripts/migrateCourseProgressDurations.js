import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const convertTimeToMinutes = (duration) => {
  if (typeof duration === 'number') {
    return duration;
  }
  
  if (!duration || duration === '00:00:00') {
    return 0;
  }
  
  // If it's already in decimal format (e.g., "20.41")
  if (/^\d+(\.\d+)?$/.test(duration)) {
    return parseFloat(duration);
  }
  
  // If it's in HH:MM:SS format
  const timeParts = duration.split(':').map(Number);
  if (timeParts.length === 3) {
    const [hours, minutes, seconds] = timeParts;
    return hours * 60 + minutes + (seconds / 60);
  }
  
  // If we can't parse it, return 0
  return 0;
};

const migrateDurations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const db = mongoose.connection;
    const courseProgressCollection = db.collection('courseprogresses');
    
    // Get all course progress records
    const cursor = courseProgressCollection.find({});
    let count = 0;
    let updated = 0;
    
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      count++;
      
      const originalDuration = doc.duration;
      const newDuration = convertTimeToMinutes(originalDuration);
      
      if (originalDuration !== newDuration) {
        await courseProgressCollection.updateOne(
          { _id: doc._id },
          { $set: { duration: newDuration } }
        );
        updated++;
        console.log(`Updated duration for progress ${doc._id}: ${originalDuration} -> ${newDuration} minutes`);
      }
    }
    
    console.log(`Migration completed. Processed ${count} records, updated ${updated} records.`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

migrateDurations(); 