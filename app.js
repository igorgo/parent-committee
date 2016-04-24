Date.prototype.ddmmyyyy = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();
    return  (dd[1]?dd:"0"+dd[0]) + "." + (mm[1]?mm:"0"+mm[0]) + "." + yyyy; // padding
};


var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// Database
//mongodb://user:password@host:port/dbname?authSource=dbWithUserCredentials
var dbUrl = 'mongodb://go:go@127.0.0.1:27017/parent-committee';
var mongoose = require('mongoose');
var dbConnection = mongoose.createConnection(dbUrl);
dbConnection.on('error', console.error.bind(console, 'dbConnection error:'));
dbConnection.on('error', console.error.bind(console, 'dbConnection error:'));
dbConnection.once('open', function () {
    console.info('connected to database')
});

var routes = require('./routes/index');
var pupils = require('./routes/pupils-routers');
var donates = require('./routes/donates');
var expenses = require('./routes/expenses');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    req.dbConnection = dbConnection;
    next();
});

app.use('/', routes);
app.use('/pupils', pupils);
app.use('/donates', donates);
app.use('/expenses', expenses);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
