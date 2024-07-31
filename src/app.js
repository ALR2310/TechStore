const express = require('express');
const { engine } = require('express-handlebars')
const cookieParser = require('cookie-parser');
const app = express();
require('dotenv').config();
const path = require("path");
const host = process.env.HOST;
const port = process.env.PORT;


//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// View Engine
app.engine('hbs', engine({extname: ".hbs"}));
app.set('view engine', 'hbs');

// Folder Views
app.set('views', path.join(__dirname, "views"));

// Folder Public Static
app.use(express.static(path.join(__dirname, 'assets')));

// Routes
app.use('/', require('./routers/homeRouter'));

// Start Server
app.listen(port, () => {
  console.log(`Server chạy trên http://${host}:${port}`);
});