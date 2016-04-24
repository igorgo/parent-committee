/**
 * Created by igorgo on 19.04.2016.
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('donates', { pageName: 'Пожертвования' });
});

module.exports = router;