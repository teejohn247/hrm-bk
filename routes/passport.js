// const passport =require("passport")
// const GoogleStrategy = require('passport-google-oauth2').Strategy;

// passport.serializeUser(function(user, done) {
//     done(null, user);
// });

// passport.deserializeUser(function(user, done) {
//         done(null, user);
// });

// passport.use(new GoogleStrategy({
//         clientID:"649314217770-67f4r5l8h10phctbvciqep52jcnsu05g.apps.googleusercontent.com",
//         clientSecret:"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",
//         callbackURL:"http://localhost:8080/api/v1/auth/google/callback",
//         passReqToCallback: true
//     },
//     function(request, accessToken, refreshToken, profile, done) {
//         console.log('Google Profile:', profile, accessToken, refreshToken);
//             return done(null, profile);
//     }
// ));