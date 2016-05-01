/**
 * Created by igorgo on 28.04.2016.
 */
var getPupilsShortListOnDate =require('./schemas/pupilsShortListOnDate');

exports.setShortList = function (app) {
    getPupilsShortListOnDate(app.locals.sqliteDbConnection, new Date(), function (list) {
        app.locals.dataCache.pupilsShortList = list
    });
};

