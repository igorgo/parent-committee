/**
 * Created by igorgo on 01.05.2016.
 */
/**
 * Created by igorgo on 29.04.2016.
 */
var Promise = require('promise');
const CURRENT_DB_VERSION = 3;
var dbVerOnStart;

function checkSchemaExists(db) {
    return new Promise(function (fulfill, reject) {
        db.get(
            "SELECT count(*) cnt FROM sqlite_master WHERE type='table' AND name='dbver'",
            function (err, row) {
                if (err) reject(err);
                else fulfill(row.cnt == 1);
            }
        );
    });
}

function createDbVerTable(db) {
    console.log("A database doesn't exist. Creating new database...");
    return new Promise(function (fulfill, reject) {
        db.run(
            "CREATE TABLE IF NOT EXISTS dbver (ver INTEGER)",
            function (err) {
                if (err) reject(err);
                else
                    console.log("The database has been created.");
                db.run(
                    "INSERT INTO dbver (ver) VALUES (0)",
                    function (err) {
                        if (err) reject(err);
                        else {
                            console.log("Current version of the database has set to 0");
                            dbVerOnStart = 0;
                            fulfill({db: db, ver: 0});
                        }
                    }
                );
            }
        );
    });
}

function getDbVersion(db) {
    return new Promise(function (fulfill, reject) {
        checkSchemaExists(db)
            .then(
                function (exists) {
                    if (exists) {
                        db.get(
                            "SELECT ver from dbver",
                            function (err, row) {
                                if (err) reject(err);
                                else {
                                    dbVerOnStart = row.ver;
                                    console.log("Current database version is " + row.ver);
                                    fulfill({db: db, ver: row.ver});
                                }
                            }
                        );
                    } else
                        createDbVerTable(db)
                            .then(fulfill);
                });
    });
}

function updateDbVersion(args) {
    return new Promise(function (fulfill, reject) {
        args.db.run("UPDATE dbver set ver = $ver", {$ver: args.ver}, function (err) {
            if (err) reject(err);
            else fulfill(args);
        });
    });
}

function updateTo1(args) {
    const UPDATE_VERSION = 1;
    return new Promise(function (fulfill, reject) {
            if (args.ver < UPDATE_VERSION) {
                console.log("DB is updating to version " + UPDATE_VERSION);
                args.db.run(
                    "CREATE TABLE IF NOT EXISTS pupils (" +
                    "   name_first TEXT," +
                    "   name_middle TEXT," +
                    "   name_last TEXT," +
                    "   birthday TEXT," +  // as ISO8601 strings ("YYYY-MM-DD HH:MM:SS.SSS").
                    "   gender TEXT," +
                    "   email TEXT," +
                    "   address_live TEXT," +
                    "   address_reg TEXT," +
                    "   phone_home TEXT," +
                    "   phone_cell TEXT," +
                    "   studied_from TEXT," +
                    "   studied_till TEXT," +
                    "   mother_name_first TEXT," +
                    "   mother_name_middle TEXT," +
                    "   mother_name_last TEXT," +
                    "   mother_birthday TEXT," +  //select strftime('%m', dateField) as Month ...
                    "   mother_email TEXT," +
                    "   mother_phone TEXT," +
                    "   mother_work_place TEXT," +
                    "   mother_work_post TEXT," +
                    "   mother_work_phone TEXT," +
                    "   father_name_first TEXT," +
                    "   father_name_middle TEXT," +
                    "   father_name_last TEXT," +
                    "   father_birthday TEXT," +
                    "   father_email TEXT," +
                    "   father_phone TEXT," +
                    "   father_work_place TEXT," +
                    "   father_work_post TEXT," +
                    "   father_work_phone TEXT" +
                    ")",
                    function (err) {
                        if (err) reject(err);
                        else {
                            updateDbVersion({db: args.db, ver: UPDATE_VERSION})
                                .then(fulfill);
                        }
                    });
            } else {
                fulfill(args);
            }
        }
    );
}

function updateTo2(args) {
    const UPDATE_VERSION = 2;
    return new Promise(function (fulfill, reject) {
        if (args.ver < UPDATE_VERSION) {
            console.log("DB is updating to version " + UPDATE_VERSION);
            args.db.run(
                "CREATE TABLE IF NOT EXISTS donates (" +
                "   pupil INTEGER," +
                "   summ REAL," +
                "   date TEXT," +
                "   FOREIGN KEY(pupil) REFERENCES pupils(rowid)" +
                ")",
                function (err) {
                    if (err) reject(err);
                    else {
                        updateDbVersion({db: args.db, ver: UPDATE_VERSION})
                            .then(fulfill);
                    }
                });
        } else {
            fulfill(args);
        }
    });
}

function updateTo3(args) {
    const UPDATE_VERSION = 3;
    function cashTab(args) {
        return new Promise(function (onSuccess, onError) {
            args.db.run(
                "CREATE TABLE IF NOT EXISTS cash ( " +
                "oper_date TEXT, " +
                "oper_type TEXT, " + // 'I - приход (из донатов), O - расход, должен быть отрицательным (из расходов)
                "oper_id INTEGER, " + // rowid в соответсвующей операции таблице
                "oper_sum REAL )",
                function (err) {
                    if (err) reject(err);
                    else onSuccess(args);
                }
            );
        });
    }
    return new Promise(function (fulfill, reject) {
        if (args.ver < UPDATE_VERSION) {
            console.log("DB is updating to version " + UPDATE_VERSION);
            cashTab(args)
                .then(function(args){
                    updateDbVersion({db: args.db, ver: UPDATE_VERSION})
                    .then(fulfill)
                    .catch(reject);
                })
                .catch(reject);
        } else {
            fulfill(args);
        }
    });
}

function updateDb(db) {
    return new Promise(function (fulfill, reject) {
            getDbVersion(db)
                .then(updateTo1)
                .then(updateTo2)
                .then(updateTo3)
                .then(function (args) {
                    if (CURRENT_DB_VERSION == dbVerOnStart) {
                        console.log("There is no need to update DB");
                    } else {
                        console.log("DB was updated to version " + args.ver);
                    }
                    fulfill();
                })
                .catch(reject);
        }
    );
}

module.exports = updateDb;