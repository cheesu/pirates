'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var Skill = new Schema({
    name: String,
    job: String,
    lv: Number(),
    mp: Number(),
    casting: String,
    hit: Number(),
    attackMsg: String,
    dmg: Number(),
    coolTime: Number(),
    txt: String,
    sp: Object()
});

exports.default = _mongoose2.default.model('skill', Skill);