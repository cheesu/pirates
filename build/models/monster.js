'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ref;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Schema = _mongoose2.default.Schema;

var Monster = new Schema((_ref = {
    name: String,
    lv: Number()
}, _defineProperty(_ref, 'lv', Number()), _defineProperty(_ref, 'hp', Number()), _defineProperty(_ref, 'mp', Number()), _defineProperty(_ref, 'ap', Number()), _defineProperty(_ref, 'dp', Number()), _defineProperty(_ref, 'speed', Number()), _defineProperty(_ref, 'exist', String), _defineProperty(_ref, 'type', String), _ref));

exports.default = _mongoose2.default.model('monster', Monster);