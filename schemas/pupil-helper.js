/**
 * Created by igorgo on 04.05.2016.
 */
var pupilHelper = {};

/**
 * @typedef {Object} PupilShortListItem
 * @property rn        - rowid ученика
 * @property shortName - Фамилия Имя ученика
 * @property birthday  - дата рождения (yyyy-mm-dd)
 */

const SELECT_PUPIL_BY_ID =
    "SELECT rowid, * FROM pupils WHERE rowid = $rn";

const SELECT_SHORT_LIST_ONDATE =
    "SELECT " +
    "  rowid as rn," +
    "  name_last || ' ' ||name_first as shortName, " +
    "  birthday " +
    "FROM " +
    "  pupils " +
    "WHERE " +
    "  (studied_from <= $date) " +
    "  AND ( (studied_till >= $date) OR (studied_till is null))";

const UPDATE_PUPIL =
    "UPDATE pupils SET " +
    "   name_first = $name_first," +
    "   name_middle = $name_middle," +
    "   name_last = $name_last," +
    "   birthday = $birthday," +
    "   gender = $gender," +
    "   email = $email," +
    "   address_live = $address_live," +
    "   address_reg = $address_reg," +
    "   phone_home = $phone_home," +
    "   phone_cell = $phone_cell," +
    "   studied_from = $studied_from," +
    "   studied_till = $studied_till," +
    "   mother_name_first = $mother_name_first," +
    "   mother_name_middle = $mother_name_middle," +
    "   mother_name_last = $mother_name_last," +
    "   mother_birthday = $mother_birthday," +
    "   mother_email = $mother_email," +
    "   mother_phone = $mother_phone," +
    "   mother_work_place = $mother_work_place," +
    "   mother_work_post = $mother_work_post," +
    "   mother_work_phone = $mother_work_phone," +
    "   father_name_first = $father_name_first," +
    "   father_name_middle = $father_name_middle," +
    "   father_name_last = $father_name_last," +
    "   father_birthday = $father_birthday," +
    "   father_email = $father_email," +
    "   father_phone = $father_phone," +
    "   father_work_place = $father_work_place," +
    "   father_work_post = $father_work_post," +
    "   father_work_phone =$father_work_phone" +
    " WHERE rowid = $rn";

const INSERT_PUPIL =
    "INSERT INTO pupils (" +
    "   name_first," +
    "   name_middle," +
    "   name_last," +
    "   birthday," +
    "   gender," +
    "   email," +
    "   address_live," +
    "   address_reg," +
    "   phone_home," +
    "   phone_cell," +
    "   studied_from," +
    "   studied_till," +
    "   mother_name_first," +
    "   mother_name_middle," +
    "   mother_name_last," +
    "   mother_birthday," +
    "   mother_email," +
    "   mother_phone," +
    "   mother_work_place," +
    "   mother_work_post," +
    "   mother_work_phone," +
    "   father_name_first," +
    "   father_name_middle," +
    "   father_name_last," +
    "   father_birthday," +
    "   father_email," +
    "   father_phone," +
    "   father_work_place," +
    "   father_work_post," +
    "   father_work_phone" +
    ") VALUES ( " +
    "   $name_first," +
    "   $name_middle," +
    "   $name_last," +
    "   $birthday," +
    "   $gender," +
    "   $email," +
    "   $address_live," +
    "   $address_reg," +
    "   $phone_home," +
    "   $phone_cell," +
    "   $studied_from," +
    "   $studied_till," +
    "   $mother_name_first," +
    "   $mother_name_middle," +
    "   $mother_name_last," +
    "   $mother_birthday," +
    "   $mother_email," +
    "   $mother_phone," +
    "   $mother_work_place," +
    "   $mother_work_post," +
    "   $mother_work_phone," +
    "   $father_name_first," +
    "   $father_name_middle," +
    "   $father_name_last," +
    "   $father_birthday," +
    "   $father_email," +
    "   $father_phone," +
    "   $father_work_place," +
    "   $father_work_post," +
    "   $father_work_phone" +
    ")";

/**
 * Получения короткого списка учеников на дату
 * если дата не задана то используется текущая
 *
 * @param params
 * @param params.db       - in БД
 * @param [params.onDate=now] - in на дату
 *
 * @param [params.shortList] - out список учеников
 *
 * @param params.shortList.rn        - rowid ученика
 * @param params.shortList.shortName - Фамилия Имя ученика
 * @param params.shortList.birthday  - дата рождения (yyyy-mm-dd)
 *
 * @returns {Promise<PupilShortListItem>}
 *
 */
pupilHelper.getShortList = function (params) {
    return new Promise(function (resolve, reject) {
        params.db.all(
            SELECT_SHORT_LIST_ONDATE,
            {
                $date: (params.onDate) ? (params.onDate) : new Date().yyyymmdd()
            },
            function (err, records) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    params.shortList = records;
                    resolve(params);
                }
            }
        )
    });
};

/**
 * Возвращает полную информацию об ученике по его id
 * @param params
 * @param params.db - БД
 * @param params.pupilId - id ученика
 * @param params.pupilInfo - все свойства ученика
 * @returns {Promise}
 */
pupilHelper.getPupilById = function (params) {
    return new Promise(function (resolve, reject) {
        params.db.get(SELECT_PUPIL_BY_ID, {$rn: params.pupilId}, function (err, row) {
            if (err) reject(err);
            else {
                params.pupilInfo = row;
                resolve(params);
            }
        });
    });
};

/**
 * Исправление записи ученика
 * @param params
 * @param params.db        - БД
 * @param params.pupilData - новая информация по ученику
 * @returns {Promise}
 */
pupilHelper.updatePupil = function (params) {
    return new Promise(function (resolve, reject) {
        params.db.run(UPDATE_PUPIL, params.pupilData, function (err) {
            if (err) reject(err);
            else resolve(params);
        });
    });
};

/**
 * Добавление записи ученика
 * @param params
 * @param params.db          - БД
 * @param params.pupilData   - новая информация по ученику
 * @param params.pupilId     - out rowid добавленного ученика
 * @returns {Promise}
 */
pupilHelper.insertPupil = function (params) {
    return new Promise(function (resolve, reject) {
        params.db.run(INSERT_PUPIL, params.pupilData, function (err) {
            if (err) reject(err);
            else {
                //noinspection JSUnresolvedVariable
                params.pupilId = this.lastID;
                resolve(params)
            }
        });
    });
};

module.exports = pupilHelper;
