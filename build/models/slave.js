'use strict';

Object.defineProperty(exports, "__esModule", {
        value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var Slave = new Schema({
        id: String,
        name: String,
        master: String,
        kind: String,
        tribe: String,
        job: String,
        lv: Number(),
        hp: Number(),
        mp: Number(),
        str: Number(),
        int: Number(),
        dex: Number(),
        exp: Number(),
        max_hp: Number(),
        max_mp: Number(),
        upStr: Number(),
        upInt: Number(),
        upDex: Number(),
        mount: Object(),
        msg: String,
        chat: Array(),
        skill: Array(),
        price: Number()
});

exports.default = _mongoose2.default.model('slave', Slave);