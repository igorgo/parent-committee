/**
 * Created by igorgo on 04.05.2016.
 */
var donateHelper = {};

/*const CREATE_TABLE_DONATES =
    "CREATE TABLE IF NOT EXISTS donates (" +
    "   pupil INTEGER," +
    "   summ REAL," +
    "   date TEXT," +
    "   FOREIGN KEY(pupil) REFERENCES pupils(rowid)" +
    ")";*/

const INSERT_DONATE =
    "INSERT INTO donates " +
    "(  pupil, summ, date ) " +
    "VALUES " +
    "( $pupil, $summ, $date )";
const SELECT_DEBTS_ON_DATE =
    "SELECT " +
    "  d.pupil as rn, " +
    "  p.name_last || ' ' || p.name_first as shortName, " +
    "  sum(d.summ) as debtSumm " +
    "FROM " +
    "  donates d," +
    "  pupils p " +
    "WHERE " +
    " d.pupil = p.rowid " +
    " AND d.date <= $onDate " +
    "GROUP BY d.pupil, p.name_last, p.name_first ";
const SELECT_DONATES_BY_PUPIL =
    "SELECT " +
    "  d.rowid as id, " +
    "  d.pupil as pipil_id, " +
    "  d.date as oper_date, " +
    "  d.summ as oper_summ " +
    "FROM " +
    "  donates d," +
    "  pupils p " +
    "WHERE " +
    " d.pupil = p.rowid " +
    " AND d.pupil = $pupil " +
    " AND d.date <= $onDate" +
    " ORDER BY d.date DESC";
/*const SELECT_DONATE_BY_ID =
    " SELECT * " +
    " FROM " +
    "  donates " +
    " WHERE " +
    "  rowid = $operid ";*/
const DELETE_DONATE =
    " DELETE " +
    " FROM " +
    "   donates " +
    " WHERE " +
    "   rowid = $operid ";

/**
 * Добавление записи взноса
 *  - сумма добавляется с отрицательным знаком
 * @param params
 * @param params.db           - in  БД
 * @param params.donatePupil  - in  дата взноса
 * @param params.donateDate   - in  дата взноса
 * @param params.donateAmount - in  сумма взноса
 * @param params.donateId     - out id новой записи в таблице DONATES
 * @returns {Promise} ({db,donateId})
 */
donateHelper.addDonate = function (params) {
    return new Promise(function (resolve, reject) {
        params.db.run(INSERT_DONATE, {
                $pupil: params.donatePupil,
                $summ: params.donateAmount*-1,
                $date: params.donateDate
            }, function (err) {
                if (err) reject(err);
                else {
                    //noinspection JSUnresolvedVariable
                    params.donateId = this.lastID;
                    resolve(params);
                }
            }
        );
    });
};

/**
 * Возвращает список дожников с суммами на дату
 *  - если дата не указана, то и спользуется текущая
 * @param params
 * @returns {Promise}
 *
 * - in params
 * @param params.db          - in  БД
 * @param params.onDate      - in  на какую дату запрашивать
 *
 * - out params
 * @param params.debtorsList - out массив результатов
 *
 * - поля результата:
 *   - debtorsList.rn        - ID ученика
 *   - debtorsList.shortName - Имя, фамилия ученика
 *   - debtorsList.debtSumm  - Сумма долга
 */
donateHelper.getDebtorsList = function (params) {
    return new Promise(function (resolve, reject) {
        params.db.all(SELECT_DEBTS_ON_DATE,
            {
                $onDate: (params.onDate) ? params.onDate : (new Date()).yyyymmdd()
            },
            function (err, records) {
                if (err) reject(err);
                else {
                    params.debtorsList = records;
                    resolve(params);
                }
        });
    });
};

/**
 * Возвращает список операций по должнику на дату
 *   - если дата не указана, то и спользуется текущая
 *   - сумма всегда возвращается положительной
 * @param params
 * @returns {Promise}
 *
 * - in params of obj:
 * @param params.db      - БД
 * @param params.pupilId - ID ученика должника
 * @param params.onDate  - на какую дату запрашивать
 *
 * - out params of obj:
 * @param params.opersList - массив результатов
 *
 * - поля результата:
 *   - opersList.id        - ID операции
 *   - opersList.oper_summ - сумма операции
 *   - opersList.oper_type - тип операции (Взнос/Начисление)
 *   - opersList.oper_date - дата операции
 */
donateHelper.getDebtorOperations = function (params) {
    return new Promise(function (resolve, reject) {
        params.db.all(SELECT_DONATES_BY_PUPIL,{
            $pupil: params.pupilId,
            $onDate: (params.onDate) ? params.onDate : (new Date()).yyyymmdd()
        },function (err, records){
            if (err) reject(err);
            else {
                var opers = records;
                if (opers.length > 0) {
                    opers.forEach(function (oper) {
                        if (oper.oper_summ < 0) {
                            oper.oper_type = "Взнос";
                            oper.oper_summ = -oper.oper_summ;
                        } else {
                            oper.oper_type = "Начисление";
                        }
                    });
                }
                params.opersList = opers;
                resolve(params);
            }
        });
    });
};

/**
 * Добавление записи начисления долга
 *
 * @param params
 * @param params.db           - in  БД
 * @param params.donatePupil  - in  дата взноса
 * @param params.donateDate   - in  дата взноса
 * @param params.donateAmount - in  сумма взноса
 * @param params.donateId     - out id новой записи в таблице DONATES
 * @returns {Promise} ({db,donateId})
 */
donateHelper.addDebt = function (params) {
    return new Promise(function (resolve, reject) {
        params.db.run(INSERT_DONATE, {
                $pupil: params.donatePupil,
                $summ: params.donateAmount,
                $date: params.donateDate
            }, function (err) {
                if (err) reject(err);
                else {
                    //noinspection JSUnresolvedVariable
                    params.donateId = this.lastID;
                    resolve(params);
                }
            }
        );
    });
};


/**
 * Удаление записи взносов
 * @param params
 * @param params.db
 * @param params.operId - id удаляемой операции
 * @returns {Promise}
 */
donateHelper.delOper = function (params) {
    return new Promise(function (resolve, reject) {
        params.db.run(
            DELETE_DONATE,
            {
                $operid: params.operId
            }, function (err) {
                if (err) reject(err);
                else resolve(params)
            }
        );
    });
};

module.exports = donateHelper;