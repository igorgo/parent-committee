/**
 * Created by igorgo on 19.04.2016.
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('pupils', {pageName: 'Ученики', pageScript: '/javascripts/pupils.js'});
});

router.get('/pupilinfo/:rn', function (req, res) {
    req.app.locals.sqliteDbConnection.get(
        "SELECT rowid, * FROM pupils WHERE rowid = $rn", {$rn: req.params.rn}, function (err, pupil) {
            if (err)
                res.send(err);
            res.json(pupil);
        }
    );
});

router.get('/shortlist', function (req, res) {
    res.status(200).json(req.app.locals.dataCache.pupilsShortList);
});

router.get('/select2list', function (req, res) {
    var list = [];
    var pupils = req.app.locals.dataCache.pupilsShortList;
    if (pupils.length > 0) {
        pupils.forEach(function (pupil) {
            list.push({
                id:pupil.rn,
                text:pupil.shortName
            });
        });
    }
    res.status(200).json(list);
});

router.post('/updpupil', function (req, res) {
    var curPupil = JSON.parse(req.body.json_string);
    req.app.locals.sqliteDbConnection.run(
        "UPDATE pupils SET " +
        "   name_first = $name_first," +
        "   name_middle = $name_middle," +
        "   name_last = $name_last," +
        "   birthday = $birthday," +
        "   gender = $gender," +
        "   email = $email," +
        "   address_live = $address_live," +
        "   address_reg = $address_reg," +
        "   phone_home = $phone_home," +
        "   phone_cell = $phone_cell," +
        "   studied_from = $studied_from," +
        "   studied_till = $studied_till," +
        "   mother_name_first = $mother_name_first," +
        "   mother_name_middle = $mother_name_middle," +
        "   mother_name_last = $mother_name_last," +
        "   mother_birthday = $mother_birthday," +
        "   mother_email = $mother_email," +
        "   mother_phone = $mother_phone," +
        "   mother_work_place = $mother_work_place," +
        "   mother_work_post = $mother_work_post," +
        "   mother_work_phone = $mother_work_phone," +
        "   father_name_first = $father_name_first," +
        "   father_name_middle = $father_name_middle," +
        "   father_name_last = $father_name_last," +
        "   father_birthday = $father_birthday," +
        "   father_email = $father_email," +
        "   father_phone = $father_phone," +
        "   father_work_place = $father_work_place," +
        "   father_work_post = $father_work_post," +
        "   father_work_phone =$father_work_phone" +
        " WHERE rowid = $rn",
        curPupil,
        function (err) {
            if (err) {
                next(err);
            } else {
                require("./common").cachePupilsShortList(req.app);
            }
            res.json(
                {
                    "status": err === null ? 'success' : 'error',
                    "error": err,
                    "rn": curPupil.$rn
                }
            );
        }
    );

});

router.post('/addpupil', function (req, res) {
    var pupil = JSON.parse(req.body.json_string);
    req.app.locals.sqliteDbConnection.run(
        "INSERT INTO pupils (" +
        "   name_first," +
        "   name_middle," +
        "   name_last," +
        "   birthday," +
        "   gender," +
        "   email," +
        "   address_live," +
        "   address_reg," +
        "   phone_home," +
        "   phone_cell," +
        "   studied_from," +
        "   studied_till," +
        "   mother_name_first," +
        "   mother_name_middle," +
        "   mother_name_last," +
        "   mother_birthday," +
        "   mother_email," +
        "   mother_phone," +
        "   mother_work_place," +
        "   mother_work_post," +
        "   mother_work_phone," +
        "   father_name_first," +
        "   father_name_middle," +
        "   father_name_last," +
        "   father_birthday," +
        "   father_email," +
        "   father_phone," +
        "   father_work_place," +
        "   father_work_post," +
        "   father_work_phone" +
        ") VALUES ( " +
        "   $name_first," +
        "   $name_middle," +
        "   $name_last," +
        "   $birthday," +
        "   $gender," +
        "   $email," +
        "   $address_live," +
        "   $address_reg," +
        "   $phone_home," +
        "   $phone_cell," +
        "   $studied_from," +
        "   $studied_till," +
        "   $mother_name_first," +
        "   $mother_name_middle," +
        "   $mother_name_last," +
        "   $mother_birthday," +
        "   $mother_email," +
        "   $mother_phone," +
        "   $mother_work_place," +
        "   $mother_work_post," +
        "   $mother_work_phone," +
        "   $father_name_first," +
        "   $father_name_middle," +
        "   $father_name_last," +
        "   $father_birthday," +
        "   $father_email," +
        "   $father_phone," +
        "   $father_work_place," +
        "   $father_work_post," +
        "   $father_work_phone" +
        ")",
        pupil,
        function (err) {
            if (err) {
                next(err);
            } else {
                require("./common").cachePupilsShortList(req.app);
            }
            res.json(
                {
                    "status": err === null ? 'success' : 'error',
                    "error": err,
                    "rn": this.lastID
                }
            );
        }
    )
    ;
});


module.exports = router;
