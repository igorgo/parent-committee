/**
 * Created by igorgo on 04.05.2016.
 */

/**
 * Сравнение строк с учетом диапазонов Юникода
 * (для правильной сортировки укрю языка)
 *
 * @param s1
 * @param s2
 * @returns {number}
 */
function localeCompare(s1, s2) {
    return s1.toString().localeCompare(s2.toString());
}
/**
 * Получение и сортировка с учетом локали краткого списка учеников
 * @param params
 * @returns {Promise}
 */
function getSortedPupilShortList (params) {
    var helper = require("./schemas/pupil-helper");
    return new Promise(function (resolve, reject) {
        helper.getShortList(params)
            .then(function (params) {
                var rowNo = 0;
                if (params.shortList.length > 0) {
                    params.shortList.sort(function (v1, v2) {
                        return localeCompare(v1.shortName, v2.shortName);
                    });
                    params.shortList.forEach(function (item) {
                        item.rowno = ++rowNo;
                    });
                }
                resolve(params);
            })
            .catch(reject);
    });
}

/**
 * добавление/обновление кэша короткого списка учеников
 * @param app
 */
function cachePupilsShortList (app) {
    getSortedPupilShortList({db:app.locals.sqliteDbConnection})
        .then(function (parameters) {
            app.locals.dataCache.pupilsShortList = parameters.shortList;
        });
}

exports.localeCompare = localeCompare;
exports.getSortedPupilShortList = getSortedPupilShortList;
exports.cachePupilsShortList = cachePupilsShortList;

