'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _map = require('../models/map');

var _map2 = _interopRequireDefault(_map);

var _monster = require('../models/monster');

var _monster2 = _interopRequireDefault(_monster);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get('/getMap/:mapName', function (req, res) {
    // FIND THE USER BY USERNAME
    _map2.default.findOne({ mapName: req.params.mapName }, function (err, map) {
        if (err) throw err;
        // RETURN SUCCESS

        _monster2.default.findOne({ mapName: req.params.mapName, type: 'boss' }, function (err, mon) {
            if (err) throw err;

            var monster = eval(mon);
            if (monster == null) {
                return res.json({
                    mapInfo: map,
                    bossLocal: "null"
                });
            } else {
                return res.json({
                    mapInfo: map,
                    bossLocal: monster.area
                });
            }
        });
    });
});

router.get('/nextMap/:mapName', function (req, res) {
    // FIND THE USER BY USERNAME
    _map2.default.findOne({ mapName: req.params.mapName }, function (err, map) {
        if (err) throw err;
        var thisMap = eval(map);
        _map2.default.findOne({ mapName: thisMap.next }, function (err, nextMap) {
            if (err) throw err;
            // RETURN SUCCESS
            _monster2.default.findOne({ mapName: req.params.mapName, type: 'boss' }, function (err, mon) {
                if (err) throw err;
                var monster = eval(mon);
                if (monster == null) {
                    return res.json({
                        mapInfo: nextMap,
                        bossLocal: "null"
                    });
                } else {
                    return res.json({
                        mapInfo: nextMap,
                        bossLocal: monster.area
                    });
                }
            });
        });
    });
});

router.get('/prevMap/:mapName', function (req, res) {
    // FIND THE USER BY USERNAME
    _map2.default.findOne({ mapName: req.params.mapName }, function (err, map) {
        if (err) throw err;
        var thisMap = eval(map);
        _map2.default.findOne({ mapName: thisMap.prev }, function (err, prevMap) {
            if (err) throw err;
            // RETURN SUCCESS
            _monster2.default.findOne({ mapName: req.params.mapName, type: 'boss' }, function (err, mon) {
                if (err) throw err;
                var monster = eval(mon);
                if (monster == null) {
                    return res.json({
                        mapInfo: prevMap,
                        bossLocal: "null"
                    });
                } else {
                    return res.json({
                        mapInfo: prevMap,
                        bossLocal: monster.area
                    });
                }
            });
        });
    });
});

exports.default = router;