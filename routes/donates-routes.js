/**
 * Created by igorgo on 19.04.2016.
 */
var express = require('express');
var router = express.Router();

/**
 *  Обработчик GET страницы взносов.
 */
router.get('/', function (req, res) {
    res.render('donates', {pageName: 'Взносы', pageScript: '/javascripts/donates.js'});
});

/**
 *  REST GET запрос списка должников с суммами
 * [{
 *    rn        - ID ученика
 *    shortName - Имя, фамилия ученика
 *    debtSumm  - Сумма долга
 * }]
 */
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
 * REST GET запрос списка операций по должнику
 *
 *  @param pupil - ученик-должник
 *
 *  [{
 *      id        - ID операции
 *      oper_summ - сумма операции
 *      oper_type - тип операции (Взнос/Начисление)
 *      oper_date - дата операции
 *  }]
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

/**
 * REST POST запрос на добавление взноса
 *
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

/**
 * REST POST запрос для массового начисления долга
 *
 * @param .summ  - сумма взноса
 * @param .date  - дата взноса
 */
router.post('/makedebt', function (req, res, next) {
    var debtSumm = req.body.summ;
    var debtDate = new Date(req.body.date);
    require('../schemas/pupil-helper').getShortList({
        db:req.app.locals.sqliteDbConnection,
        onDate: debtDate.yyyymmdd()
    }).then(makeDebtAll);
    function makeDebtAll(params) {
        var pupils = params.shortList;
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
                require('../schemas/donate-helper').addDebt({
                    db:db,
                    donateAmount: debtSumm,
                    donateDate: debtDate.yyyymmdd(),
                    donatePupil:  pupil.rn
                }).catch(next);
            });
        });
        res.json(
            {
                "status": 'success'
            }
        );
        return false;
    }
});
//exp
module.exports = router;