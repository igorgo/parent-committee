/**
 * Created by igorgo on 19.04.2016.
 */
var express = require('express');
var router = express.Router();

router.get('/', renderPage);
router.get('/pupilinfo/:rn', getPupilInfo);
router.get('/shortlist', getPupilsShortList);
router.get('/select2list', getSelect2PupilsList);
router.post('/updpupil', updatePupil);
router.post('/addpupil', addPupil);

/**
 * GET /pupils/ рендеринг страницы "Ученики".
 */
function renderPage (ignore, res) {
    res.render('pupils', {pageName: 'Ученики', pageScript: '/javascripts/pupils.js'});
}

/**
 * REST GET /pupils/pupilinfo/:rn - возвращает полную информацию по ученику rn
 */
function getPupilInfo (req, res, next) {
    require("../schemas/pupil-helper").getPupilById({
            db: req.app.locals.sqliteDbConnection,
            pupilId: req.params.rn,
            pupilInfo: {} //returns
        })
        .then(function (params) {
            res.status(200).json(params.pupilInfo);
        })
        .catch(next);
}

/**
 * REST GET /pupils/shortlist/ - возвращает краткий список учеников на текущую дату
 * - результаты берутся из кеша
 */
function getPupilsShortList(req, res) {
    res.status(200).json(req.app.locals.dataCache.pupilsShortList);
}

/**
 * REST GET /pupils/select2list/ - возвращает список учеников для комбо select2
 * - результаты берутся из кеша
 * - возвращается массив пар значений id (rowid) и text (фамилия + имя)
 */
function getSelect2PupilsList (req, res) {
    var list = [];
    var pupils = req.app.locals.dataCache.pupilsShortList;
    if (pupils.length > 0) {
        pupils.forEach(function (pupil) {
            list.push({
                id: pupil.rn,
                text: pupil.shortName
            });
        });
    }
    res.status(200).json(list);
}

/**
 * REST POST /updpupil/ Исправление ученика
 * @param req
 * @param req.app - Express app
 * @param req.body.pipilData - объект с инфой ученика
 * @param res
 * @param next
 */
function updatePupil (req, res, next) {
    require("../schemas/pupil-helper").updatePupil({
            db: req.app.locals.sqliteDbConnection,
            pupilData: JSON.parse(req.body.pipilData)
        })
        .then(function (params) {
            require("../common").cachePupilsShortList(req.app);
            res.status(200).json({pupilId: params.pupilData.$rn});
        })
        .catch(next);
}

/**
 * REST POST /addpupil/ Добавление ученика
 * @param req
 * @param req.app - Express app
 * @param req.body.pipilData - объект с инфой ученика
 * @param res
 * @param next
 */
function addPupil(req, res, next) {
    require("../schemas/pupil-helper").insertPupil({
            db: req.app.locals.sqliteDbConnection,
            pupilData: JSON.parse(req.body.pipilData),
            pupilId: null // returns
        })
        .then(function (params) {
            require("../common").cachePupilsShortList(req.app);
            res.status(200).json({pupilId: params.pupilId});
        })
        .catch(next);
}

module.exports = router;
