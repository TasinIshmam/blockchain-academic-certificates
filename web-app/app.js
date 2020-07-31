
//initialize env variables, database and loaders.
const config = require('./loaders/config');

//load database
const mongoose = require('./database/mongoose');

//load fabric environemtn
require('./loaders/fabric-loader');


//third party libraries
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

//local imports
let limiter = require('./middleware/rate-limiter-middleware');
const logger = require('./services/logger');
const sessionMiddleware = require('./loaders/express-session-loader');

//Router imports
let indexRouter = require('./routes/index');
let apiRouter = require('./routes/api');
let authRouter = require('./routes/auth');

//express
let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//middleware

app.use(cors());
app.use(limiter.rateLimiterMiddlewareInMemory);
app.use(morgan('tiny', { stream: logger.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

app.use(sessionMiddleware);

//routers
app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/auth', authRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
