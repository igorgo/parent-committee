/**
 * Created by igorgo on 19.04.2016.
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('donates', {pageName: 'Пожертвования', pageScript: '/javascripts/donates.js'});
});

router.get('/debtors', function (req, res, next) {
    var sql = "SELECT " +
        "  p.name_last || ' ' || p.name_first as shortName, " +
        "  sum(d.summ) as debtSumm " +
        "FROM " +
        "  donates d," +
        "  pupils p " +
        "WHERE " +
        " d.pupil = p.rowid " +
        "GROUP BY p.name_last, p.name_first ";
    console.log(sql);
    req.app.locals.sqliteDbConnection.all(
        sql,
        function (err, debts) {
            if (err) {
                next(err);
            } else {
                debts.sort(function (s1, s2) {
                 var diff = s1.debtSumm - s2.debtSumm;
                 if (diff === 0) {
                 return (s1.shortName).toString().localeCompare((s2.shortName).toString());
                 } else {
                 return diff;
                 }
                 });
                res.json(debts);
            }
        }
    );
})
;

router.post('/makedebt', function (req, res, next) {
    var debtSumm = req.body.summ;
    var debtDate = new Date(req.body.date);

    var getPupilsShortListOnDate = require('../schemas/pupilsShortListOnDate');

    function makeDebtAll(pupils) {
        if (pupils.length === 0) {
            res.json(
                {
                    "status": "error",
                    "error": "На указанную дату, не нашлось учеников."
                }
            );
            return false;
        }
        var db = req.app.locals.sqliteDbConnection;
        db.serialize(function () {
            pupils.forEach(function (pupil) {
                var insError;
                db.run(
                    "INSERT INTO donates " +
                    "(  pupil, summ, date ) " +
                    "VALUES " +
                    "( $pupil, $summ, $date )",
                    {
                        $pupil: pupil.rn,
                        $summ: debtSumm,
                        $date: debtDate
                    }, function (err) {
                        if (insError) next(err);
                    }
                );
            });
        });
        res.json(
            {
                "status": 'success'
            }
        );
        return false;
    }

    getPupilsShortListOnDate(req.app.locals.sqliteDbConnection, debtDate, makeDebtAll);

});

module.exports = router;