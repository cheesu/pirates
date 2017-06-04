'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.monsters = exports.fight = undefined;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _account = require('../models/account');

var _account2 = _interopRequireDefault(_account);

var _monster = require('../models/monster');

var _monster2 = _interopRequireDefault(_monster);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

var monsters;
_monster2.default.find({ type: "normal" }).exec(function (err, monster) {
    if (err) throw err;
    exports.monsters = monsters = eval(monster);
});

var count = 10;

var fight = function fight(io, info) {
    _account2.default.find({ username: info.userName }).exec(function (err, account) {
        if (err) throw err;
        var userInfo = account;
        userInfo = eval(userInfo[0]);
        count = count - 1;

        var result = userInfo.username + "님께서 " + info.target + "에게 " + userInfo.str + "의 공격을 하였습니다.";
        if (count == 0) {
            return "몬스터가 쓰러졌습니다.";
        }

        io.emit(info.ch, result);
    });
};

exports.fight = fight;
exports.monsters = monsters;