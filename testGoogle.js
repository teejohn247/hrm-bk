const { google } = require('googleapis');
const readline = require('readline');

// GOOGLE_CLIENT_ID=1086159474664-mca232a1qv3n6uhihk5kle9hehqr2nj0.apps.googleusercontent.com
// GOOGLE_CLIENT_SECRET=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
// GOOGLE_REDIRECT_URI=https://makers-hrm-1086159474664.europe-west1.run.app/app/oauth2callback
// GOOGLE_REFRESH_TOKEN=1//0abcdefghijklmnopqrstuvwxyz...

// PASTE YOUR CREDENTIALS HERE
const CLIENT_ID = '1086159474664-mca232a1qv3n6uhihk5kle9hehqr2nj0.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://makers-hrm-1086159474664.europe-west1.run.app/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
];

// Generate the auth URL
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
        console.log('SUCCESS! Here are your tokens:');
        console.log('========================================\n');
        
        console.log('REFRESH TOKEN (save this in .env):');
        console.log(tokens.refresh_token);
        console.log('\nACCESS TOKEN (this expires):');
        console.log(tokens.access_token);
        
        console.log('\n========================================');
        console.log('Add these to your .env file:');
        console.log('========================================\n');
        
        console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`);
        console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`);
        console.log(`GOOGLE_REDIRECT_URI=${REDIRECT_URI}`);
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
        
        console.log('\n========================================');
        console.log('Setup Complete!');
        console.log('========================================\n');
        
    } catch (error) {
        console.error('Error retrieving tokens:', error);
    }
});