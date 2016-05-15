/**
 * Created by igorgo on 13.05.2016.
 */
const SELECT_EXPTYPES =
    "SELECT [rowid], " +
    "       [name] " +
    "FROM   [exptypes] " +
    "ORDER  BY [name]";

const INSERT_EXPTYPES =
    "INSERT INTO [exptypes] " +
    "    ([name]) " +
    "    VALUES ($name) ";

var expTypeHelper = {};

/**
 * Возвращает список всех категорий расходов отсортированный по наименованию
 * @param params
 * @param params.db
 * @param params.list -- out
 * @returns {Promise}
 */
expTypeHelper.getList = function (params) {
    return new Promise(function (resolve, reject) {
        params.db.all(
            SELECT_EXPTYPES,
            {},
            function (err, records) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    params.list = records;
                    resolve(params);
                }
            }
        )
    });
};

/**
 * Добавление
 * @param params
 * @param params.db
 * @param params.name - in
 * @param params.newId - out
 * @returns {Promise}
 */
expTypeHelper.insert = function (params) {
    return new Promise(function (resolve, reject) {
        params.db.run (
            INSERT_EXPTYPES,
            {
                $name: params.name
            },
            function (err) {
                if (err) reject(err);
                else {
                    //noinspection JSUnresolvedVariable
                    params.newId = this.lastID;
                    resolve(params);
                }
            }
        )
    });
};

module.exports = expTypeHelper;