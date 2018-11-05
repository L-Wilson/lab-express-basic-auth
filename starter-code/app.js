require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);



const plainPassword1 = "HelloWorld";
const plainPassword2 = "helloworld";

const salt = bcrypt.genSaltSync(saltRounds);
const hash1 = bcrypt.hashSync(plainPassword1, salt);
const hash2 = bcrypt.hashSync(plainPassword2, salt);

console.log("Hash 1 -", hash1);
console.log("Hash 2 -", hash2);

mongoose
  .connect('mongodb://localhost/basic-auth', { useNewUrlParser: true })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();
app.listen(3005, function () {
  console.log('Server started on port 3005!');
})

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: "basic-auth-secret",
  cookie: { maxAge: 60000 * 60 * 60 },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 600 * 600
  })
}));

// Express View engine setup
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));



// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

// connects routes with views 
// const index = require('./routes/auth');
// app.use('/auth', index);

const router = require('./routes/site-routes');
app.use('/', router);

const authRoutes = require('./routes/auth');
app.use('/', authRoutes);




module.exports = app;
