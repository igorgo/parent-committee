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
const SHORT_LIST_ONDATE =
    "SELECT " +
    "  rowid as rn," +
    "  name_last || ' ' ||name_first as shortName, " +
    "  birthday " +
    "FROM " +
    "  pupils " +
    "WHERE " +
    "  (studied_from <= $date) " +
    "  AND ( (studied_till >= $date) OR (studied_till is null))";

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
            SHORT_LIST_ONDATE,
            {
                $date : (params.onDate) ? (params.onDate) : new Date().yyyymmdd()
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

module.exports = pupilHelper;
