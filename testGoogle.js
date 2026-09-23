const { google } = require('googleapis');
const readline = require('readline');

require('dotenv').config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI
    || `${(process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '')}/oauth2callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error(
        'Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env. '
        + 'Add them from Google Cloud Console (OAuth 2.0 Client), then run this script again.'
    );
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
];

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
});

console.log('========================================');
console.log('STEP 1: Authorize this app');
console.log('========================================');
console.log('\nVisit this URL in your browser:\n');
console.log(authUrl);
console.log('\n========================================');
console.log('STEP 2: After authorizing, copy the code');
console.log('========================================\n');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('Enter the authorization code here: ', async (code) => {
    rl.close();

    try {
        const { tokens } = await oauth2Client.getToken(code);

        console.log('\n========================================');
        console.log('SUCCESS! Add to your .env file:');
        console.log('========================================\n');
        console.log(`GOOGLE_REDIRECT_URI=${REDIRECT_URI}`);
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log('\n(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET should already be in .env)\n');
    } catch (error) {
        console.error('Error retrieving tokens:', error);
    }
});
