/**
 * Created by igorgo on 01.05.2016.
 */

const CURRENT_DB_VERSION = 4;
var dbVerOnStart;
const CREATE_TABLE_PUPILS =
    "CREATE TABLE IF NOT EXISTS [pupils](" +
    "    [name_first] TEXT," +
    "    [name_middle] TEXT," +
    "    [name_last] TEXT," +
    "    [birthday] TEXT," +  // as ISO8601 strings ("YYYY-MM-DD HH:MM:SS.SSS").
    "    [gender] TEXT," +
    "    [email] TEXT," +
    "    [address_live] TEXT," +
    "    [address_reg] TEXT," +
    "    [phone_home] TEXT," +
    "    [phone_cell] TEXT," +
    "    [studied_from] TEXT," +
    "    [studied_till] TEXT," +
    "    [mother_name_first] TEXT," +
    "    [mother_name_middle] TEXT," +
    "    [mother_name_last] TEXT," +
    "    [mother_birthday] TEXT," + //select strftime('%m', dateField) as Month ...
    "    [mother_email] TEXT," +
    "    [mother_phone] TEXT," +
    "    [mother_work_place] TEXT," +
    "    [mother_work_post] TEXT," +
    "    [mother_work_phone] TEXT," +
    "    [father_name_first] TEXT," +
    "    [father_name_middle] TEXT," +
    "    [father_name_last] TEXT," +
    "    [father_birthday] TEXT," +
    "    [father_email] TEXT," +
    "    [father_phone] TEXT," +
    "    [father_work_place] TEXT," +
    "    [father_work_post] TEXT," +
    "    [father_work_phone] TEXT," +
    "    CONSTRAINT [c_pupils_uk] UNIQUE([name_last], [name_first], [birthday], [name_middle]))";
const CREATE_TABLE_DONATES =
    "CREATE TABLE IF NOT EXISTS [donates](" +
    "    [pupil] INTEGER," +
    "    [summ] REAL," +
    "    [date] TEXT," +
    "    FOREIGN KEY([pupil]) REFERENCES pupils([rowid]))";
const CREATE_TABLE_CASH =
    "CREATE TABLE IF NOT EXISTS [cash](" +
    "    [oper_date] TEXT," +
    "    [oper_type] TEXT," +  // 'I - приход (из донатов), O - расход, должен быть отрицательным (из расходов)
    "    [oper_id] INTEGER," + // rowid в соответсвующей операции таблице
    "    [oper_sum] REAL)";
const CREATE_TABLE_EXP_TYPES =
    "CREATE TABLE IF NOT EXISTS [exptypes](" +
    "    [name] TEXT," +
    "    CONSTRAINT [c_exptypes_uk] UNIQUE([name]))";
const CREATE_TABLE_EXPENSES =
    "CREATE TABLE IF NOT EXISTS [expenses](" +
    "    [exp_type] INTEGER," +
    "    [exp_date] TEXT," +
    "    [exp_quant] REAL," +
    "    [exp_amount] REAL," +
    "    [exp_descr] TEXT," +
    "    FOREIGN KEY([exp_type]) REFERENCES exptypes([rowid]))";

/**
 * Проверка на существование схемы,
 * определяется по наличию таблицы dbver
 * @param db
 * @returns {Promise}
 */
function checkSchemaExists(db) {
    return new Promise(function (resolve, reject) {
        var sql =
            "SELECT COUNT (*) [cnt]" +
            "FROM   [sqlite_master]" +
            "WHERE  [type] = 'table'" +
            "       AND [name] = 'dbver'";
        db.get(
            sql,
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
    var sqlC =
            "CREATE TABLE IF NOT EXISTS [dbver](" +
            "    [ver] INTEGER)",
        sqlI =
            "INSERT INTO [dbver]" +
            "    ([ver]) " +
            "    VALUES (0) ";
    return new Promise(function (resolve, reject) {
        db.run(sqlC,
            function (err) {
                if (err) reject(err);
                else
                    console.log("The database has been created.");
                db.run(sqlI,
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
    var sql =
        "SELECT [ver] " +
        "FROM   [dbver] ";
    return new Promise(function (resolve, reject) {
        checkSchemaExists(db)
            .then(
                function (exists) {
                    if (exists) {
                        db.get(sql,
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
    var sql =
        "UPDATE " +
        "    [dbver] " +
        "SET " +
        "    [ver] = $ver ";
    return new Promise(function (resolve, reject) {
        obj.db.run(sql, {$ver: obj.ver}, function (err) {
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
 * Обновление до версии 4
 * @param params
 * @returns {Promise}
 */
function updateTo4(params) {
    const UPDATE_VERSION = 4;

    function expTypesTab(params) {
        return new Promise(function (resolve, reject) {
            params.db.run(
                CREATE_TABLE_EXP_TYPES,
                function (err) {
                    if (err) reject(err);
                    else resolve(params);
                }
            );
        });
    }

    function expensesTab(params) {
        return new Promise(function (resolve, reject) {
            params.db.run(
                CREATE_TABLE_EXPENSES,
                function (err) {
                    if (err) reject(err);
                    else resolve(params);
                }
            );
        });
    }

    return new Promise(function (resolve, reject) {
        if (params.ver < UPDATE_VERSION) {
            expTypesTab(params)
                .then(expensesTab)
                .then(function (params) {
                    updateDbVersion({db: params.db, ver: UPDATE_VERSION})
                        .then(resolve)
                        .catch(reject);
                })
                .catch(reject);
        } else {
            resolve(params);
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
                .then(updateTo4)
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