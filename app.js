var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var session=require('express-session')
// var MongoStore=require('connect-mongo')(session)

var settings=require('./settings')

var routes = require('./routes/index');

var app = express();

app.set('port',process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(session({
//   secret:settings.cookieSecret,
//   key:settings.db, //cookie name
//   cookie:{maxAge:1000*60*60*24*30}, //30 days
//   store:new MongoStore({
//     db:settings.db,
//     host:settings.host,
//     port:settings.port
//   })
// }))

routes(app);
app.listen(app.get('port'),function(){
  console.log('Express server listen on port' + app.get('port'))
})


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



