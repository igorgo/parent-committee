var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('main/main', { pageName: 'Главная', pageScript: '/javascripts/main.js'});
});

router.post('/logoff', function (req, res) {
    res.status(200).end();
    req.app.locals.sqliteDbConnection.close(function () {
        process.exit(0);
    });
});

router.get("/remnondate/:ondate",function (req, res,next) {
    require("../schemas/cash-helper").getRemnantOnDate(
        {
            db: req.app.locals.sqliteDbConnection,
            $ondate: req.params.ondate,
            remnant: undefined
        }
    ).then(function(params) {
            res.status(200).json(params.remnant);
    })
        .catch(next);
});

router.get("/debtondate/:ondate",function (req, res,next) {
    require("../schemas/donate-helper").getTotalDebtOnDate(
        {
            db: req.app.locals.sqliteDbConnection,
            $ondate: req.params.ondate,
            totalDebt: undefined
        }
    ).then(function(params) {
            res.status(200).json(params.totalDebt);
    })
        .catch(next);
});
module.exports = router;
