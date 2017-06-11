'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _map = require('../models/map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get('/getMap/:mapName', function (req, res) {
    // FIND THE USER BY USERNAME
    _map2.default.findOne({ mapName: req.params.mapName }, function (err, map) {
        if (err) throw err;
        // RETURN SUCCESS
        return res.json({
            mapInfo: map
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
            return res.json({
                mapInfo: nextMap
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
            return res.json({
                mapInfo: prevMap
            });
        });
    });
});

exports.default = router;