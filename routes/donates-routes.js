/**
 * Created by igorgo on 19.04.2016.
 */
var express = require('express');
var router = express.Router();

/* Обработчик GET страницы пожертвований. */
router.get('/', function (req, res) {
    res.render('donates', {pageName: 'Взносы', pageScript: '/javascripts/donates.js'});
});

/* REST GET запрос списка должников с суммами */
router.get('/debtors', function (req, res, next) {
    var donateHelper = require("../schemas/donate-helper");
    donateHelper.getDebtorsList({
            db: req.app.locals.sqliteDbConnection
        })
        .then(function (obj) {
            var debts = obj.debtorsList;
            debts.sort(function (s1, s2) {
                var diff = s2.debtSumm - s1.debtSumm;
                if (diff === 0) {
                    return (s1.shortName).toString().localeCompare((s2.shortName).toString());
                } else {
                    return diff;
                }
            });
            res.json(debts);
        })
        .catch(next);
});

/**
 * REST POST запрос на добавление взноса
 * @param .summ  - сумма взноса
 * @param .date  - дата взноса
 * @param .pupil - ученик, сделавший взнос
 */
router.post("/makedonate", function (req, res, next) {
    var donateAmmount = req.body.summ;
    var donateDate = new Date(req.body.date).yyyymmdd();
    var donatePupil = req.body.pupil;
    var db = req.app.locals.sqliteDbConnection;
    var donateHelper = require("../schemas/donate-helper");
    var cashHelper = require("../schemas/cash-helper");
    donateHelper.addDonate({
            db: db,
            donatePupil: donatePupil,
            donateDate: donateDate,
            donateAmount: donateAmmount
        })
        .then(cashHelper.addFromDonate)
        .then(function (obj) {
            res.json(
                {
                    "status": 'success',
                    "newDonateId": obj.donateId,
                    "newCashOperId": obj.cashId
                });
        })
        .catch(next);
});

/** REST GET запрос списка операций по должнику
 *  @param :pupil - ученик-должник
 */
router.get('/pupilopers/:pupil', function (req, res, next) {
    var donateHelper = require("../schemas/donate-helper");
    donateHelper.getDebtorOperations({
        db: req.app.locals.sqliteDbConnection,
        pupilId: req.params.pupil
    })
        .then(function(obj){res.status(200).json(obj.opersList)})
        .catch(next);
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