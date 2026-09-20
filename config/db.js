import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.MONGO_URL;

function logMongoTarget(connectionUrl) {
    const srv = connectionUrl.startsWith('mongodb+srv://');
    const hostMatch = connectionUrl.match(/@([^/?]+)/);
    const host = hostMatch ? hostMatch[1] : '(could not parse host)';
    const dbMatch = connectionUrl.match(/\.net\/([^?]*)/);
    const dbName = dbMatch && dbMatch[1] ? dbMatch[1] : '(default)';
    console.log('[mongo] Target:', { type: srv ? 'srv' : 'standard', host, dbName });
}

const connectDB = async () => {
    if (!url) {
        console.error('MONGO_URL is not set');
        process.exit(1);
    }

    logMongoTarget(url);

    const options = {
        serverSelectionTimeoutMS: 10000,
        family: 4,
        autoSelectFamily: false,
    };

    try {
        console.log('[mongo] Connecting to Atlas...');
        await mongoose.connect(url, options);
        console.log('MongoDb connected...');
        const db = mongoose.connection;

        db.on('error', () => console.log('error connecting to database'));
        db.once('open', () => console.log('Connected to database'));
    } catch (err) {
        console.error('[mongo] Connection failed:', err.message);
        if (err.reason) {
            console.error('[mongo] Reason:', err.reason);
        }
        if (err.code) {
            console.error('[mongo] Code:', err.code);
        }
        console.error(
            '[mongo] Note: Atlas often shows the "IP whitelist" message even when the real issue is '
            + 'wrong host/user/password in MONGO_URL, or SRV/DNS on the host. '
            + 'Confirm Render MONGO_URL matches Atlas → Connect → Drivers (same cluster as Network Access). '
            + 'URL-encode special characters in the password. Try the "Standard connection string" if SRV keeps failing.'
        );
        process.exit(1);
    }
};

export default connectDB;
