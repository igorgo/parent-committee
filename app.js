Date.prototype.ddmmyyyy = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    return (dd[1] ? dd : "0" + dd[0]) + "." + (mm[1] ? mm : "0" + mm[0]) + "." + yyyy;
};

Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    return yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]);
};
// TODO: Expenses page
// TODO: Main page
// TODO: Print reporting, see http://pdfkit.org/
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var routes = require('./routes/index');
var pupils = require('./routes/pupils-routers');
var donates = require('./routes/donates-routes');
var expenses = require('./routes/expenses-routes');
var open = require('open');

var sqliteDbConnection = require("./schemas/sqlite-db");
var updater = require("./schemas/db-updater");
app.locals.sqliteDbConnection = sqliteDbConnection;
// массив кэшей
app.locals.dataCache = {};
updater(sqliteDbConnection)
    .then(function () {
        require("./common").cachePupilsShortList(app);
        open('http://localhost:3000/', function (err) {
            if (err) throw process.exit(1);
        });
    })
    .catch(function (err) {
        console.error(err);
        process.exit(1);
    });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// remove on production
app.set('env', 'development');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

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
    app.use(function (err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
