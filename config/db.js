import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();


const url = process.env.MONGO_URL;

const connectDB = async () => {
    if (!url) {
        console.error('MONGO_URL is not set');
        process.exit(1);
    }

    try {
        console.log('[mongo] Connecting to Atlas...');
        await mongoose.connect(url, {
            serverSelectionTimeoutMS: 15000,
        });
        console.log('MongoDb connected...');
        var db = mongoose.connection;

        db.on("error", () => console.log("error connecting to database"));
        db.once("open", () => console.log("Connected to database"));
    } catch (err) {
        console.error('[mongo] Connection failed:', err.message);
        process.exit(1);
    }
}
export default connectDB;
