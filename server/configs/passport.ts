import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackURL: '/auth/loginGoogle/callback',
      scope: ['email', 'profile'],
    },
    (_accessToken, _refreshToken, profile, done) => {
      done(null, profile);
    },
  ),
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID ?? '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
      callbackURL: '/auth/loginFacebook/callback',
      profileFields: ['id', 'displayName', 'email', 'gender', 'birthday'],
    },
    (_accessToken, _refreshToken, profile, done) => {
      done(null, profile);
    },
  ),
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user as any));

export default passport;
