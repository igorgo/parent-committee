/**
 * Created by igorgo on 01.05.2016.
 */

const CURRENT_DB_VERSION = 3;
var dbVerOnStart;
const CREATE_TABLE_PUPILS =
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
    ")";
const CREATE_TABLE_DONATES =
    "CREATE TABLE IF NOT EXISTS donates (" +
    "   pupil INTEGER," +
    "   summ REAL," +
    "   date TEXT," +
    "   FOREIGN KEY(pupil) REFERENCES pupils(rowid)" +
    ")";
const CREATE_TABLE_CASH =
    "CREATE TABLE IF NOT EXISTS cash ( " +
    "oper_date TEXT, " +
    "oper_type TEXT, " + // 'I - приход (из донатов), O - расход, должен быть отрицательным (из расходов)
    "oper_id INTEGER, " + // rowid в соответсвующей операции таблице
    "oper_sum REAL )";


/**
 * Проверка на существование схемы,
 * определяется по наличию таблицы dbver
 * @param db
 * @returns {Promise}
 */
function checkSchemaExists(db) {
    return new Promise(function (resolve, reject) {
        db.get(
            "SELECT count(*) cnt FROM sqlite_master WHERE type='table' AND name='dbver'",
            /**
             * @param err
             * @param row
             * @param row.cnt
             */
            function (err, row) {
                if (err) reject(err);
                else resolve(row.cnt == 1);
            }
        );
    });
}

/**
 * Создание таблицы dbver, для сохранения текущей версии БД
 * и инициализация текущей версии значением 0
 * @param db
 * @returns {Promise} ({db,ver})
 */
function createDbVerTable(db) {
    console.log("A database doesn't exist. Creating new database...");
    return new Promise(function (resolve, reject) {
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
                            resolve({db: db, ver: 0});
                        }
                    }
                );
            }
        );
    });
}

/**
 * Получение текущей версии БД
 * @param db
 * @returns {Promise} ({db, ver})
 */
function getDbVersion(db) {
    return new Promise(function (resolve, reject) {
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
                                    resolve({db: db, ver: row.ver});
                                }
                            }
                        );
                    } else
                        createDbVerTable(db)
                            .then(resolve);
                });
    });
}

/**
 * Обновление текущей версии БД
 * @param obj
 * @param obj.db
 * @param obj.ver
 * @returns {Promise} ({db, ver})
 */
function updateDbVersion(obj) {
    return new Promise(function (resolve, reject) {
        obj.db.run("UPDATE dbver set ver = $ver", {$ver: obj.ver}, function (err) {
            if (err) reject(err);
            else resolve(obj);
        });
    });
}

/**
 * Обновление до версии 1
 * Добавлена таблица PUPILS
 * @param obj
 * @returns {Promise} ({db, ver})
 */
function updateTo1(obj) {
    const UPDATE_VERSION = 1;
    return new Promise(function (resolve, reject) {
            if (obj.ver < UPDATE_VERSION) {
                console.log("DB is updating to version " + UPDATE_VERSION);
                obj.db.run(CREATE_TABLE_PUPILS,
                    function (err) {
                        if (err) reject(err);
                        else {
                            updateDbVersion({db: obj.db, ver: UPDATE_VERSION})
                                .then(resolve);
                        }
                    });
            } else {
                resolve(obj);
            }
        }
    );
}

/**
 * Обновление до версии 2
 * Добавлена таблица DONATES
 * @param obj
 * @returns {Promise} ({db, ver})
 */
function updateTo2(obj) {
    const UPDATE_VERSION = 2;
    return new Promise(function (resolve, reject) {
        if (obj.ver < UPDATE_VERSION) {
            console.log("DB is updating to version " + UPDATE_VERSION);
            obj.db.run(
                CREATE_TABLE_DONATES,
                function (err) {
                    if (err) reject(err);
                    else {
                        updateDbVersion({db: obj.db, ver: UPDATE_VERSION})
                            .then(resolve);
                    }
                });
        } else {
            resolve(obj);
        }
    });
}

/**
 * Обновление до версии 3
 * Добавлена таблица CASH
 * @param obj
 * @returns {Promise} ({db, ver})
 */
function updateTo3(obj) {
    const UPDATE_VERSION = 3;

    function cashTab(obj) {
        return new Promise(function (onSuccess, onError) {
            obj.db.run(
                CREATE_TABLE_CASH,
                function (err) {
                    if (err) onError(err);
                    else onSuccess(obj);
                }
            );
        });
    }

    return new Promise(function (resolve, reject) {
        if (obj.ver < UPDATE_VERSION) {
            console.log("DB is updating to version " + UPDATE_VERSION);
            cashTab(obj)
                .then(function (obj) {
                    updateDbVersion({db: obj.db, ver: UPDATE_VERSION})
                        .then(resolve)
                        .catch(reject);
                })
                .catch(reject);
        } else {
            resolve(obj);
        }
    });
}

/**
 * Собственно модуль обновления
 * @param db
 * @returns {Promise} ()
 */
function updateDb(db) {
    return new Promise(function (resolve, reject) {
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
                    resolve();
                })
                .catch(reject);
        }
    );
}

module.exports = updateDb;