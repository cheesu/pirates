'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _skill = require('../models/skill');

var _skill2 = _interopRequireDefault(_skill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

/*
 SEARCH USER: GET /api/account/search/:username
 */
router.post('/getSkill/', function (req, res) {
    // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX

    if (req.body.job2 == undefined) {
        _skill2.default.find({ job: req.body.job, lv: { "$lt": 40 } }, { _id: false, name: true, lv: true, mp: true, txt: true }).limit(10).sort({ lv: -1 }).exec(function (err, skills) {
            if (err) throw err;
            res.json(skills);
        });
    } else {
        _skill2.default.find({ job: req.body.job, lv: { "$gte": 40 } }).limit(10).sort({ lv: -1 }).exec(function (err, skills) {
            if (err) throw err;
            res.json(skills);
        });
    }
});

// EMPTY SEARCH REQUEST: GET /api/account/search
router.get('/skill', function (req, res) {
    res.json([]);
});

exports.default = router;