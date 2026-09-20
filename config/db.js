import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const primaryUrl = process.env.MONGO_URL;
const fallbackUrl = process.env.MONGO_URL_FALLBACK;

function parseDbName(connectionUrl) {
    const afterHosts = connectionUrl.match(/:27017\/([^/?]+)/);
    if afterHosts?.[1]) return afterHosts[1];
    const srvPath = connectionUrl.match(/\.net\/([^/?]+)/);
    if (srvPath?.[1]) return srvPath[1];
    return '';
}

function logMongoTarget(connectionUrl) {
    const srv = connectionUrl.startsWith('mongodb+srv://');
    const hostMatch = connectionUrl.match(/@([^/?]+)/);
    const host = hostMatch ? hostMatch[1] : '(could not parse host)';
    const dbName = parseDbName(connectionUrl);
    console.log('[mongo] Target:', {
        type: srv ? 'srv' : 'standard',
        host,
        dbName: dbName || '(missing — add /MakersOrbitHRM before ?)',
    });
}

function getConnectOptions(connectionUrl) {
    const isAtlas = connectionUrl.includes('mongodb.net');
    const isSrv = connectionUrl.startsWith('mongodb+srv://');
    const options = {
        serverSelectionTimeoutMS: 10000,
        autoSelectFamily: false,
    };
    // IPv4 helps Render; SRV resolves hostnames then connects.
    if (!isSrv) {
        options.family = 4;
    }
    // Standard Atlas URIs need explicit TLS; SRV enables TLS by default.
    if (isAtlas && !isSrv) {
        options.tls = true;
    }
    return options;
}

function logTopologyErrors(err) {
    if (err.reason?.setName) {
        console.error('[mongo] Replica set name from driver:', err.reason.setName);
    }
    if (err.reason?.servers) {
        for (const [addr, desc] of err.reason.servers) {
            const detail = desc.error ? desc.error.message || desc.error : 'no TCP/TLS handshake (timeout or blocked)';
            console.error(`[mongo]   ${addr} → ${detail}`);
        }
    }
}

async function tryConnect(connectionUrl) {
    logMongoTarget(connectionUrl);
    const options = getConnectOptions(connectionUrl);
    console.log('[mongo] Connecting...');
    await mongoose.connect(connectionUrl, options);
}

const connectDB = async () => {
    if (!primaryUrl) {
        console.error('MONGO_URL is not set');
        process.exit(1);
    }

    const urls = [primaryUrl, fallbackUrl].filter(Boolean);

    for (let i = 0; i < urls.length; i += 1) {
        const connectionUrl = urls[i];
        if (i > 0) {
            console.warn('[mongo] Retrying with MONGO_URL_FALLBACK...');
            await mongoose.disconnect().catch(() => {});
        }
        try {
            await tryConnect(connectionUrl);
            console.log('MongoDb connected...');
            const db = mongoose.connection;
            db.on('error', () => console.log('error connecting to database'));
            db.once('open', () => console.log('Connected to database'));
            return;
        } catch (err) {
            console.error('[mongo] Connection failed:', err.message);
            logTopologyErrors(err);
            if (i === urls.length - 1) {
                console.error(
                    '[mongo] All servers "Unknown" usually means Render cannot reach Atlas on port 27017 '
                    + '(TLS/network), not IP whitelist. Prefer mongodb+srv://...@makershrm.o7rgfct.mongodb.net/MakersOrbitHRM '
                    + 'copied from Atlas → Connect → Drivers.'
                );
                process.exit(1);
            }
        }
    }
};

export default connectDB;
