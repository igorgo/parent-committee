/**
 * Created by igorgo on 19.04.2016.
 */
var express = require('express');
var router = express.Router();
var pupilsSchema = require('../schemas/pupils-schema');
var countersSchema = require('../schemas/counters-schema');

Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();
    return yyyy +'-'+ (mm[1]?mm:"0"+mm[0]) +'-'+ (dd[1]?dd:"0"+dd[0]); // padding
};




/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('pupils', {pageName: 'Ученики', pageScript: '/javascripts/pupils.js'});
});

router.get('/pupilinfo/:rn', function (req, res) {
    var Pupil = req.dbConnection.model('Pupil', pupilsSchema, 'pupils');
    Pupil.find({'rn': req.params.rn}, function(err, pupil){
        if (err)
            res.send(err);
        res.json(pupil);
    });
});

router.get('/shortlist', function (req, res) {
    var Pupil = req.dbConnection.model('Pupil', pupilsSchema, 'pupils');
    Pupil.find({}, 'rn name birthday', {sort: {rn: 1}}).lean().exec( function (err, docs) {
        if (err) next(err);
        var t = docs;
         docs.forEach(function (doc, i, arr) {
/*
             console.info(typeof doc);
             var v = doc;
            //console.info(doc.name);
*/

             var d = new Date(doc.birthday);
             doc.birthday_s = d.ddmmyyyy();

             doc.shortname = [doc.name.last, doc.name.first].filter(function (val) {
                return val;
            }).join(' ');
/*
             v.eee = "dddd";
            arr[i] =  v;
            console.info(v);
*/
        });

        //console.info(t);
        res.status(200).json(docs);
    });

    /*    var userModel = req.dbConnection.model('userlist', userListSchema, 'userlist');
     userModel.find({}, null, {}, function (err, docs) {
     if (err) next(err);
     if (!docs) console.info('пусто');
     res.status(200).json(docs);
     });*/

});

router.post('/addpupil', function (req, res) {

    var Counter = req.dbConnection.model('Counter', countersSchema, 'counters');
    var Pupil = req.dbConnection.model('Pupil', pupilsSchema, 'pupils');
    var pupil = new Pupil(JSON.parse(req.body.json_string));
    //var pupil = new Pupil(req.body);

    Counter.increment('pupils', function (err, result) {
        if (err) {
            console.error('Ошибка сохранения счетчик учеников: ' + err);
            return;
        }
        var nrn = result.seq;
        pupil.rn = nrn;
        pupil.save(function (err) {
            if (err) next(err);
            res.json(
                {
                    "status": err === null ? 'success' : 'error',
                    "error": err,
                    "rn": nrn
                }
            );
        });
    });
});


module.exports = router;
