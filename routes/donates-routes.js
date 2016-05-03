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
        "  d.pupil as rn, " +
        "  p.name_last || ' ' || p.name_first as shortName, " +
        "  sum(d.summ) as debtSumm " +
        "FROM " +
        "  donates d," +
        "  pupils p " +
        "WHERE " +
        " d.pupil = p.rowid " +
        "GROUP BY d.pupil, p.name_last, p.name_first ";
    req.app.locals.sqliteDbConnection.all(
        sql,
        function (err, debts) {
            if (err) {
                next(err);
            } else {
                debts.sort(function (s1, s2) {
                    var diff = s2.debtSumm - s1.debtSumm;
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
});

router.post("/makedonate", function (req, res, next) {
    var donateSumm = req.body.summ;
    var donateDate = new Date(req.body.date).yyyymmdd();
    var donatePupil = req.body.pupil;
    var db = req.app.locals.sqliteDbConnection;
    db.run(
        "INSERT INTO donates " +
        "(  pupil, summ, date ) " +
        "VALUES " +
        "( $pupil, $summ, $date )",
        {
            $pupil: donatePupil,
            $summ: -donateSumm,
            $date: donateDate
        }, function (err) {
            if (err) next(err);
            else {
                db.run(
                    "INSERT INTO cash " +
                    "( oper_date, oper_type, oper_id, oper_sum ) " +
                    "VALUES " +
                    "( $oper_date, 'I', $oper_id, $oper_sum )",
                    {
                        $oper_date: donateDate,
                        $oper_id: this.lastID,
                        $oper_sum: donateSumm
                    },
                    function (err) {
                        if (err) next(err);
                        else res.json(
                            {
                                "status": 'success'
                            }
                        );
                    }
                );

            }

        }
    );
});
router.get('/pupilopers/:pupil', function (req, res) {
    var sql = "SELECT " +
        "  d.rowid as id, " +
        "  d.date as oper_date, " +
        "  d.summ as oper_summ " +
        "FROM " +
        "  donates d," +
        "  pupils p " +
        "WHERE " +
        " d.pupil = p.rowid " +
        " AND d.pupil = $pupil " +
        " ORDER BY d.date DESC";
    var params = {$pupil:req.params.pupil};
    function cb(err,opers) {
        if (err) {
            next(err);
        } else {
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
            res.status(200).json(opers);
        }
    }
    req.app.locals.sqliteDbConnection.all(sql,params,cb);

});

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
                        $date: debtDate.yyyymmdd()
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