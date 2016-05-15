/**
 * Created by igorgo on 19.04.2016.
 */
var express = require('express');
var Promise = require('promise/lib/es6-extensions.js');

function getExpTypesList(req, res, next) {
    require("../schemas/exptypes-helper").getList({
            db: req.app.locals.sqliteDbConnection,
            list: [] // out
        })
        .then(function (params) {
            res.status(200).json(params.list);
        })
        .catch(next);
}


var router = express.Router();
/**
 * GET /expenses/ - запрос страницы расходов
 * @param req
 * @param res
 */

router.get('/', function (req, res) {
    res.render('expenses/expenses', {pageName: 'Расходы', pageScript: '/javascripts/expenses.js'});
});
/**
 * GET /expenses/types - REST список категорий расходов
 * @param req
 * @param res
 * @param next
 */
router.get("/types", function (req, res, next) {
    require("../schemas/exptypes-helper").getList({
            db: req.app.locals.sqliteDbConnection,
            list: [] // out
        })
        .then(function (params) {
            res.status(200).json(params.list);
        })
        .catch(next);
});

/**
 * GET /expenses/rowtemplate - шаблон строки формы добавления расходов
 */
router.get("/rowtemplate", function (req, res) {
    res.render('expenses/expense-row');
});

/**
 * GET /expenses/list - REST список расходов
 */
router.get("/list",function(req,res,next){
    console.log(req.query);
    require("../schemas/expenses-helper").getAll({
        db: req.app.locals.sqliteDbConnection,
        list: [] // out
    }).then(function(params) {
        res.status(200).json(params.list);
    }).catch(next);
});

/**
 * POST /expenses/types - REST Добавление категории расходов
 */
router.post("/types", function (req, res, next) {
    var expTypeHelper = require("../schemas/exptypes-helper");

    expTypeHelper.insert({
            db: req.app.locals.sqliteDbConnection,
            name: req.body.name,
            newId: undefined,
            list: []
        })
        .then(expTypeHelper.getList)
        .then(function (params) {
            res.status(200).json(
                {
                    "newRecId": params.newId,
                    "list": params.list
                });
        })
        .catch(next);
});

/**
 * POST /expenses/ - REST Добавление расходов
 **/
router.post("/", function (req, res, next) {

    var promises = [];

    var items = JSON.parse(req.body.items);

    items.forEach(function (val) {
        promises.push(
            require("../schemas/expenses-helper").insert({
                db: req.app.locals.sqliteDbConnection,
                exp_amount: val.exp_amount,
                exp_date: val.exp_date,
                exp_descr: val.exp_descr,
                exp_quant: val.exp_quant,
                exp_type: val.exp_type,
                expenseId: undefined,
                cashId: undefined
            }).then(require("../schemas/cash-helper").addFromExpenses)
        );
    });

    Promise.all(promises)
        .then(function (params) {
            var result =[];

            params.forEach(function (val) {
                result.push({
                    "expenseId": val.expenseId,
                    "cashId": val.cashId
                });
            });
            res.status(200).json(result);
        })
        .catch(next);
});

//noinspection JSUnresolvedFunction
/**
 * DELETE /expenses/{id} - REST Удаление расхода
 **/
router.delete("/:expenseId", function (req, res, next) {
    require("../schemas/expenses-helper").deleteExpense(
        {
            db: req.app.locals.sqliteDbConnection,
            expenseId: req.params.expenseId
        })
        .then(require("../schemas/cash-helper").delFromExpenses)
        .then(function () {
            res.status(200).end();
        })
        .catch(next);
});

//noinspection JSUnresolvedFunction
/**
 * PUT /expenses/{id} -REST Исправление расхода
 **/
router.put("/:expenseId", function (req,res, next){
    require("../schemas/expenses-helper").updateExpense({
        db: req.app.locals.sqliteDbConnection,
        exp_amount : req.body.exp_amount,
        exp_date: req.body.exp_date,
        exp_descr:req.body.exp_descr,
        exp_quant: req.body.exp_quant,
        exp_type: req.body.exp_type,
        expenseId: req.params.expenseId
    }).then(require("../schemas/cash-helper").updFromExpenses)
    .then(function () {
        res.status(200).end();
    })
        .catch(next);
});
module.exports = router;