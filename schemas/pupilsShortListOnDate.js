/**
 * Created by igorgo on 27.04.2016.
 */
function getPupilsShortListOnDate(dbConnection, date, callback) {

    var sorter = require("../common").localeCompare;

    /**
     * Сравнение 2-х учеников для сортировки
     * @param pipil1
     * @param pipil1.name_last
     * @param pipil1.name_first
     * @param pupil2
     * @param pupil2.name_last
     * @param pupil2.name_first
     * @returns {number}
     */
    function sortByLastFirstName(pipil1, pupil2) {
        return sorter (
            pipil1.name_last + pipil1.name_first,
            pupil2.name_last + pupil2.name_first
        );
    }



    function fillPupilsArray(err, pupils) {
        var pupilsArray = [];
        var rowNo = 0;
        if (pupils.length > 0) {
            var d, ds;

            pupils.sort( sortByLastFirstName );
            pupils.forEach(function (pupil) {
                if (pupil.birthday) {
                d = new Date(pupil.birthday);
                    ds = d.ddmmyyyy();
                } else {
                    d = null;
                    ds= null;
                }
                rowNo++;
                pupilsArray.push({
                    rn: pupil.rowid,
                    firstName: pupil.name_first,
                    lastName: pupil.name_last,
                    shortName: [pupil.name_last, pupil.name_first]
                        .filter(function (val) {
                            return val;
                        })
                        .join(' '),
                    birthday: d,
                    birthdayString: ds,
                    rowno: rowNo
                });
            });
            //pupilsArray.sort(sortByLastFirstName);
        }
        callback(pupilsArray);
    }
    console.log("Caching the short list of the pupils");
    dbConnection.all(
        "SELECT " +
        "  rowid, " +
        "  name_last, " +
        "  name_first, " +
        "  birthday " +
        "FROM " +
        "  pupils " +
        "WHERE " +
        "  (studied_from <= $date) " +
        "  AND ( (studied_till >= $date) OR (studied_till is null))"
        ,{$date:date.yyyymmdd()},
        fillPupilsArray
    );
}

module.exports = getPupilsShortListOnDate;