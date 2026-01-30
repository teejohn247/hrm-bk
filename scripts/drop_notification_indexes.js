/**
 * Script to drop indexes from the Notifications collection
 * 
 * Run this script with: node drop_notification_indexes.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB connection string
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/greenpeg';

console.log('Connecting to MongoDB...');
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB Connected');
  
  try {
    // Get the Notifications collection
    const Notifications = mongoose.connection.collection('notifications');
    
    // Get all indexes
    const indexes = await Notifications.indexes();
    console.log('Current indexes:');
    console.log(indexes);
    
    // Drop each index except the _id index
    for (const index of indexes) {
      // Skip the _id index
      if (index.name === '_id_') {
        continue;
      }
      
      console.log(`Dropping index: ${index.name}`);
      await Notifications.dropIndex(index.name);
      console.log(`Index ${index.name} dropped successfully`);
    }
    
    console.log('All indexes dropped except _id');
    
    // Verify indexes were dropped
    const remainingIndexes = await Notifications.indexes();
    console.log('Remaining indexes:');
    console.log(remainingIndexes);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
    
    console.log('\nIndexes dropped successfully. You should now be able to create notifications without duplicate key errors.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}); 