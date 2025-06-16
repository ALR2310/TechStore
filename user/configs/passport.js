const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

// Passport đăng nhập bằng Google
passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/loginGoogle/callback',
        scope: ['email', 'profile']
    }, (accessToken, refreshToken, profile, done) => {
        done(null, profile);
    })
);

// Passport đăng nhập bằng Facebook
passport.use(
    new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: '/auth/loginFacebook/callback',
        profileFields: ['id', 'displayName', 'email', 'gender', 'birthday']
    }, (accessToken, refreshToken, profile, done) => {
        done(null, profile);
    })
);

passport.serializeUser((user, done) => { done(null, user); });
passport.deserializeUser((user, done) => { done(null, user); });

module.exports = passport;