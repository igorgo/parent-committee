/**
 * Created by igorgo on 19.04.2016.
 */
var express = require('express');
var router = express.Router();

router.get('/', renderPage);
router.get('/debtors', getDebtorsList);
router.get('/pupilopers/:pupil', getPupilOpers);
router.post("/makedonate", addDonate);
router.post('/makedebt', addMassDebt);
//noinspection JSUnresolvedFunction
router.delete('/deldonate/:id', delOper);


/**
 *  Обработчик GET /donates/ страницы взносов.
 */
function renderPage(ignore, res) {
    res.render('donates/donates', {pageName: 'Взносы', pageScript: '/javascripts/donates.js'});
}

/**
 * REST GET /donates/debtors/ запрос списка должников с суммами
 * @param req
 * @param req.app
 * @param res
 * @param next
 */
function getDebtorsList(req, res, next) {
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
}

/**
 * REST GET /donates/pupilopers/:pupil запрос списка операций по должнику
 * @param req
 * @param req.app
 * @param req.params.pupil - id ученика
 * @param res
 * @param next
 */
function getPupilOpers(req, res, next) {
    var donateHelper = require("../schemas/donate-helper");
    donateHelper.getDebtorOperations({
            db: req.app.locals.sqliteDbConnection,
            pupilId: req.params.pupil
        })
        .then(function (params) {
            res.status(200).json(params.opersList)
        })
        .catch(next);
}

/**
 * REST POST /donates/makedonate/ запрос на добавление взноса
 * @param req
 * @param req.app
 * @param req.body.summ
 * @param req.body.date
 * @param req.body.pupil
 * @param res
 * @param next
 */
function addDonate(req, res, next) {
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
            res.status(200).json(
                {
                    "newDonateId": obj.donateId,
                    "newCashOperId": obj.cashId
                });
        })
        .catch(next);
}

/**
 * REST POST /donates/makedebt/ запрос для массового начисления долга
 * @param req
 * @param req.app
 * @param req.body.summ - сумма взноса
 * @param req.body.date - дата взноса
 * @param res
 * @param next
 */
function addMassDebt(req, res, next) {
    var debtSumm = req.body.summ;
    var debtDate = new Date(req.body.date);
    require('../schemas/pupil-helper').getShortList({
        db: req.app.locals.sqliteDbConnection,
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
                    db: db,
                    donateAmount: debtSumm,
                    donateDate: debtDate.yyyymmdd(),
                    donatePupil: pupil.rn
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
}

/**
 * REST DELETE /donates/deldonate/:id запрос для удаления операции взноса/начисления
 * @param req
 * @param req.app
 * @param req.params.id - id операции (взноса/начисления
 * @param res
 * @param next
 */
function delOper(req, res, next) {
    require("../schemas/donate-helper").delOper({
            db: req.app.locals.sqliteDbConnection,
            operId: req.params.id
        })
        .then(require("../schemas/cash-helper").delFromDonate)
        .then(function () {
            res.status(200).end();
        })
        .catch(next);
}
module.exports = router;