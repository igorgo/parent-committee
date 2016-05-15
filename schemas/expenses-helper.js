/**
 * Created by igorgo on 14.05.2016.
 */
const INSERT_EXPENSE =
    "INSERT INTO [expenses] " +
    "    ([exp_type], " +
    "    [exp_date], " +
    "    [exp_quant], " +
    "    [exp_amount], " +
    "    [exp_descr]) " +
    "    VALUES ($exp_type, $exp_date, $exp_quant, $exp_amount, $exp_descr) ";
const SELECT_EXPENSES =
    "SELECT [e].[rowid], " +
    "       [e].[exp_date], " +
    "       [e].[exp_type], " +
    "       [t].[name] AS [exp_type_name], " +
    "       [e].[exp_descr], " +
    "       [e].[exp_quant], " +
    "       [e].[exp_amount] " +
    "FROM   [expenses] [e], " +
    "       [exptypes] [t] " +
    "WHERE  [e].[exp_type] = [t].[rowid] " +
    "ORDER  BY [e].[exp_date] desc, " +
    "          [e].[rowid] ";
const DELETE_EXPENSE =
    "DELETE FROM " +
    "    [expenses] " +
    "WHERE " +
    "    [rowid] = $expenseId ";
const UPDATE_RECORD =
    "UPDATE " +
    "    [expenses] " +
    "SET " +
    "    [exp_type] = $exp_type, " +
    "    [exp_quant] = $exp_quant, " +
    "    [exp_descr] = $exp_descr, " +
    "    [exp_date] = $exp_date, " +
    "    [exp_amount] = $exp_amount " +
    "WHERE " +
    "    [rowid] = $expenseId ";

var expensesHelper = {};

/**
 * Добавление расхода
 * @param params
 * @param params.db
 * @param params.exp_type
 * @param params.exp_date
 * @param params.exp_quant
 * @param params.exp_amount
 * @param params.exp_descr
 * @param params.expenseId - out
 * @returns {Promise}
 */
expensesHelper.insert = function (params) {
    return new Promise(function (resolve, reject) {
        params.db.run(
            INSERT_EXPENSE,
            {
                $exp_type: params.exp_type,
                $exp_date: params.exp_date,
                $exp_quant: params.exp_quant,
                $exp_amount: params.exp_amount,
                $exp_descr: params.exp_descr
            },
            function (err) {
                if (err) reject(err);
                else {
                    //noinspection JSUnresolvedVariable
                    params.expenseId = this.lastID;
                    resolve(params);
                }
            }
        );
    });
};

/**
 * Удаление расхода
 * @param params
 * @param params.db
 * @param params.expenseId
 * @returns {Promise}
 */
expensesHelper.deleteExpense = function (params) {
    return new Promise(function (resolve, reject) {
        params.db.run(
            DELETE_EXPENSE,
            {$expenseId: params.expenseId},
            function (err) {
                if (err) reject(err);
                else resolve(params)
            });
    });
};

/**
 * Запрос списка расходов
 * @param params
 * @param params.db
 * @returns {Promise}
 */
expensesHelper.getAll = function (params) {
    return new Promise(function (resolve, reject) {
        params.db.all(
            SELECT_EXPENSES,
            {},
            function (err, records) {
                if (err) reject(err);
                else {
                    params.list = records;
                    resolve(params);
                }
            }
        );
    });
};

/**
 * Исправление записи расхода
 * @param params
 * @param params.db
 * @param params.expenseId
 * @param params.exp_type
 * @param params.exp_date
 * @param params.exp_quant
 * @param params.exp_amount
 * @param params.exp_descr
 * @returns {Promise}
 */
expensesHelper.updateExpense = function (params) {
    return new Promise(function (resolve, reject) {
        params.db.run(
            UPDATE_RECORD,
            {
                $expenseId : params.expenseId,
                $exp_type : params.exp_type,
                $exp_quant : params.exp_quant,
                $exp_descr : params.exp_descr,
                $exp_date : params.exp_date,
                $exp_amount : params.exp_amount
            },function (err) {
                if (err) reject(err);
                else resolve(params)
            });
    });
};

module.exports = expensesHelper;