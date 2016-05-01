/**
 * Created by igorgo on 27.04.2016.
 */
function getPupilsShortListOnDate(dbConnection, date, callback) {

    function sortByLastFirstName(s1, s2) {
        //return s1.shortName.toString().localeCompare(s2.shortName.toString());
        return (s1.name_last + s1.name_first ).toString().localeCompare((s2.name_last + s2.name_first).toString());
    }

    function fillPupilsArray(err, pupils) {
        var pupilsArray = [];
        var rowNo = 0;
        if (pupils.length > 0) {
            var d, ds;
            pupils.sort(sortByLastFirstName);
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