'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _fcm = require('../models/fcm');

var _fcm2 = _interopRequireDefault(_fcm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

/*
 SEARCH USER: GET /api/account/search/:username
 */
router.post('/getFcmData/', function (req, res, next) {
    // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
    console.log("test FCM");
    //console.log(req.body.data);
    var fcmData = req.body.data;

    // CHECK USER EXISTANCE
    _fcm2.default.findOne({ endpoint: fcmData.endpoint }, function (err, exists) {
        if (err) throw err;
        if (exists) {
            return res.status(409).json({
                error: "USERNAME EXISTS",
                code: 3
            });
        }

        // CREATE ACCOUNT
        var fcm = new _fcm2.default({
            endpoint: req.body.data.endpoint,
            keys: req.body.data.keys
        });

        // SAVE IN THE DATABASE
        fcm.save(function (err) {
            if (err) throw err;
            return res.json({ success: true });
        });
    });
});

exports.default = router;