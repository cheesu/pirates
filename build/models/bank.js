'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var Bank = new Schema({
    name: String,
    bank: String,
    item: String,
    userid: String
});

exports.default = _mongoose2.default.model('bank', Bank);