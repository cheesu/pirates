'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var Monster = new Schema({
    name: String,
    lv: Number(),
    hp: Number(),
    maxHP: Number(),
    mp: Number(),
    ap: Number(),
    dp: Number(),
    speed: Number(),
    exist: { type: Boolean, default: true },
    type: String,
    mapName: String,
    area: String,
    appearMsg: String,
    attackMsg: String,
    dieMsg: String,
    exp: Number()

});

exports.default = _mongoose2.default.model('monster', Monster);