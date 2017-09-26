var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var env = require('node-env-file');
var jwt    = require('jsonwebtoken');
var app = express();
var expressValidator = require('express-validator');
var customValidator = require('./helpers/custom_validators');
var errorHandler = require('./helpers/error_handler');
var errorCodes = require('./helpers/app.constants').errorCodes;


 //if in development mode, load .env variables
try{
  if (app.get("env") === "development") {
      env(__dirname + '/bin/development.env');
  }
} catch(ex){
  console.error('could not read environment file. '+ ex.message);
}

// connect to database
app.db = mongoose.connect(process.env.MONGOLAB_URI);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('layout','layout');
app.engine('html', require('hogan-express'));
app.locals.delimiters = '<% %>'

app.set('superSecret', process.env.SECRET_KEY);
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressValidator(customValidator));


// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
var apiRoutes = express.Router();
app.use('/api', apiRoutes);

apiRoutes.use(function(req, res, next) {

// check header or url parameters or post parameters for token
var token = req.body.token || req.param('token') || req.headers['x-access-token'] || req.headers['user-access-token'];
// decode token
if (token) {
  // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        if (err.name === "TokenExpiredError") {
            var error = {
                error : errorCodes.DEF_UNAUTHORIZED,
                code : errorCodes.DEF_UNAUTHORIZED,
                message : "Token Expired",
                param : "user-access-token"
            };
            return errorHandler.sendFormattedError(res, error);
        }
          var errors = {
              error : errorCodes.DEF_UNAUTHORIZED,
              code : errorCodes.DEF_UNAUTHORIZED,
              message : "No Token",
              param : "user-access-token"
          };
          return errorHandler.sendFormattedError(res, errors);
      } else {
        // if everything is good, save to request for use in other routes
        req.currentUser = decoded;
        next();
      }
    });

  } else {
    // if there is no token
    // return an error
      var errors = {
          error : errorCodes.DEF_UNAUTHORIZED,
          code : errorCodes.DEF_UNAUTHORIZED,
          message : "No Token provided",
          param : "user-access-token"
      };
      return errorHandler.sendFormattedError(res,errors);
  }
});

/**     Route Handlers  **/
var auth = require('./routes/auth.route');
var users = require('./routes/users.route');
//var catalogues = require('./routes/catalogues.route')


// All these below routes will be validated
app.use('/auth', auth);

//For APIs
apiRoutes.use('/user',users);
//apiRoutes.use('/catalogue',catalogues);

// development error handler
// will print stacktrace
if (app.get('env') === 'development' || app.get('env') === 'local') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});



module.exports = app;
