import utils from './config/utils.js';

// Test the encodeToken function
console.log("===== Testing Token Generation =====");

// Setup test values
const userId = "66d5762c691d03aab09bbbbb"; // Sample user ID
const isSuperAdmin = false;
const email = "test.user@example.com";
const companyId = "66a11b26eb482386493a0c0a"; // Sample company ID

try {
    // Test encodeToken with basic parameters
    console.log("Attempt 1: Basic token (id, isSuperAdmin, email)");
    const basicToken = utils.encodeToken(userId, isSuperAdmin, email);
    console.log("Basic token:", basicToken);
    
    // Decode the token to see what fields it contains
    const decoded = JSON.parse(Buffer.from(basicToken.split('.')[1], 'base64').toString());
    console.log("Decoded basic token:", decoded);
    
    // Check if companyId exists or is missing in the token
    console.log("companyId in token:", decoded.companyId ? "Yes" : "No");
    
    // Test encodeToken with companyId parameter (if supported)
    console.log("\nAttempt 2: Token with companyId");
    try {
        const tokenWithCompany = utils.encodeToken(userId, isSuperAdmin, email, companyId);
        console.log("Token with companyId:", tokenWithCompany);
        
        // Decode this token too
        const decodedWithCompany = JSON.parse(Buffer.from(tokenWithCompany.split('.')[1], 'base64').toString());
        console.log("Decoded token with companyId:", decodedWithCompany);
        console.log("companyId in enhanced token:", decodedWithCompany.companyId ? "Yes" : "No");
    } catch (err) {
        console.error("Error generating token with companyId parameter:", err.message);
        console.log("encodeToken likely doesn't accept companyId as a parameter");
    }
    
    // Show the function signature by converting it to a string
    console.log("\nFunction signature:");
    console.log(utils.encodeToken.toString());
    
} catch (error) {
    console.error("Error testing token generation:", error);
}

console.log("===== Test Complete ====="); 