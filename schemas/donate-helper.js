/**
 * Created by igorgo on 04.05.2016.
 */
var donateHelper = {};

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


/**
 * Добавление записи взноса
 *  - сумма добавляется с отрицательным знаком
 * @param obj
 * @param obj.db           - in  БД
 * @param obj.donatePupil  - in  дата взноса
 * @param obj.donateDate   - in  дата взноса
 * @param obj.donateAmount - in  сумма взноса
 * @param obj.donateId     - out id новой записи в таблице DONATES
 * @returns {Promise} ({db,donateId})
 */
donateHelper.addDonate = function (obj) {
    return new Promise(function (resolve, reject) {
        obj.db.run(INSERT_DONATE, {
                $pupil: obj.donatePupil,
                $summ: obj.donateAmount*-1,
                $date: obj.donateDate
            }, function (err) {
                if (err) reject(err);
                else {
                    //noinspection JSUnresolvedVariable
                    obj.donateId = this.lastID;
                    resolve(obj);
                }
            }
        );
    });
};

/**
 * Возвращает список дожников с суммами на дату
 *  - если дата не указана, то и спользуется текущая
 * @param obj
 * @returns {Promise}
 *
 * - in params of obj:
 * @param obj.db          - in  БД
 * @param obj.onDate      - in  на какую дату запрашивать
 *
 * - out params of obj:
 * @param obj.debtorsList - out массив результатов
 *
 * - поля результата:
 *   - obj.debtorsList.rn - ID ученика
 *   - obj.debtorsList.shortName - Имя, фамилия ученика
 *   - obj.debtorsList.debtSumm  - Сумма долга
 */
donateHelper.getDebtorsList = function (obj) {
    return new Promise(function (resolve, reject) {
        obj.db.all(SELECT_DEBTS_ON_DATE,
            {
                $onDate: (obj.onDate) ? obj.onDate : (new Date()).yyyymmdd()
            },
            function (err, records) {
                if (err) reject(err);
                else {
                    obj.debtorsList = records;
                    resolve(obj);
                }
        });
    });
};

/**
 * Возвращает список операций по должнику на дату
 *   - если дата не указана, то и спользуется текущая
 *   - сумма всегда возвращается положительной
 * @param obj
 * @returns {Promise}
 *
 * - in params of obj:
 * @param obj.db      - БД
 * @param obj.pupilId - ID ученика должника
 * @param obj.onDate  - на какую дату запрашивать
 *
 * - out params of obj:
 * @param obj.opersList - массив результатов
 *
 * - поля результата:
 *   - obj.opersList.id        - ID операции
 *   - obj.opersList.oper_summ - сумма операции
 *   - obj.opersList.oper_type - тип операции (Взнос/Начисление)
 *   - obj.opersList.oper_date - дата операции
 */
donateHelper.getDebtorOperations = function (obj) {
    return new Promise(function (resolve, reject) {
        obj.db.all(SELECT_DONATES_BY_PUPIL,{
            $pupil: obj.pupilId,
            $onDate: (obj.onDate) ? obj.onDate : (new Date()).yyyymmdd()
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
                obj.opersList = opers;
                resolve(obj);
            }
        });
    });
};

module.exports = donateHelper;