require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const passport = require('./configs/passport');
const app = express();
const path = require("path");
const host = process.env.HOST;
const port = process.env.PORT;


//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

// Passport Init
app.use(passport.initialize());
app.use(passport.session());

// View Engine
app.engine('hbs', engine({
  extname: ".hbs",
  partialsDir: [
    path.join(__dirname, 'views/partials'), {
      dir: path.join(__dirname, 'views/user/partials'),
      namespace: 'user'
    }
  ],
  helpers: require('./configs/helpersHBS')
}));
app.set('view engine', 'hbs');

// Folder Views
app.set('views', path.join(__dirname, "views"));

// Folder Public Static
app.use(express.static(path.join(__dirname, 'assets')));

// Routes Init
app.use('/', require('./handlers/router'));

// Start Server
app.listen(port, () => {
  console.log(`Server chạy trên http://${host}:${port}`);
});