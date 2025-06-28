import 'dotenv/config';
import express from 'express';
import { engine } from 'express-handlebars';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import cors from 'cors';
import passport from '~/configs/passport';
import helpers from '~/configs/helpersHBS';
import path from 'path';
import router from '~/routers/_index';

const app = express();
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT_SERVER ?? 4850;

//Middleware
app.use(
  cors({
    origin: 'http://localhost:4950',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? '',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

// Passport Init
app.use(passport.initialize());
app.use(passport.session());

// View Engine
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    partialsDir: [
      path.join(__dirname, 'views/partials') as any,
      {
        dir: path.join(__dirname, 'views/user/partials'),
        namespace: 'user',
      },
    ],
    helpers,
  }),
);
app.set('view engine', 'hbs');

// Folder Views
app.set('views', path.join(__dirname, 'views'));

// Folder Public Static
app.use(express.static(path.join(__dirname, 'assets')));

// Register Routes
app.use('/', router);

// Start Server
app.listen(port, () => {
  console.log(`Server chạy trên http://${host}:${port}`);
});
