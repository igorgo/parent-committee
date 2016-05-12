var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('main', { pageName: 'Главная'});
});

router.post('/logoff', function (req, res) {
    res.status(200).end();
    process.exit(0);
});

module.exports = router;
