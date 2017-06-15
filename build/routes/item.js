'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _item = require('../models/item');

var _item2 = _interopRequireDefault(_item);

var _account = require('../models/account');

var _account2 = _interopRequireDefault(_account);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

/*
 SEARCH USER: GET /api/account/search/:username
 */
router.get('/getStoreItems/', function (req, res) {
    // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
    _item2.default.find({ type: "normal" }).sort({ id: 1 }).exec(function (err, items) {
        if (err) throw err;
        res.json(items);
    });
});

// 아이템 가져오기
router.get('/getUserItem', function (req, res) {
    if (typeof req.session.loginInfo === "undefined") {
        return res.status(401).json({
            error: 1
        });
    }

    console.log("겟 아이템");
    console.log(req.session.loginInfo.username);
    _account2.default.find({ username: req.session.loginInfo.username }).exec(function (err, account) {
        if (err) throw err;
        var userInfo = eval(account[0]);

        // 아이템 출력
        _item2.default.find({ id: { $in: userInfo.item } }).exec(function (err, items) {
            if (err) throw err;
            console.log(items);
            res.json({ itemList: items, gold: userInfo.gold });
        });
    });

    //res.json({ info: req.session.loginInfo });
});

// EMPTY SEARCH REQUEST: GET /api/account/search
router.get('/item', function (req, res) {
    res.json([]);
});

exports.default = router;