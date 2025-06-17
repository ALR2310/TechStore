import express from 'express';
import passport from 'passport';
import { authController } from '../controllers/authController';

const router = express.Router();

router.get('/', authController.loginPage);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/loginGoogle', passport.authenticate('google'));
router.get(
  '/loginGoogle/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  authController.loginGoogleCallback,
);
router.get('/loginFacebook', passport.authenticate('facebook'));
router.get(
  '/loginFacebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  authController.loginFacebookCallback,
);
router.get('/logout', authController.logout);

export default router;
