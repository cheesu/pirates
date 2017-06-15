'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var Item = new Schema({
  id: String,
  name: String,
  kind: String,
  min: Number(),
  max: Number(),
  price: Number(),
  job: String,
  type: String,
  msg: String
});

exports.default = _mongoose2.default.model('item', Item);