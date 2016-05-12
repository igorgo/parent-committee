/**
 * Created by igorgo on 19.04.2016.
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('expenses/expenses', { pageName: 'Затраты', pageScript: '/javascripts/expenses.js' });
});


// http://plugins.upbootstrap.com/bootstrap-ajax-typeahead/
module.exports = router;