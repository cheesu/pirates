'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bcryptjs = require('bcryptjs');

var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var Account = new Schema({
    username: String,
    password: String,
    job: String,
    lv: Number(),
    exp: Number(),
    max_hp: Number(),
    max_mp: Number(),
    hp: Number(),
    mp: Number(),
    str: Number(),
    int: Number(),
    dex: Number(),
    gold: Number(),
    item: Array(),
    mount: Object(),
    created: { type: Date, default: Date.now }
});

// bcryptjs 를 이용한 보안.
// generates hash
Account.methods.generateHash = function (password) {
    return _bcryptjs2.default.hashSync(password, 8);
};
// compares the password
Account.methods.validateHash = function (password) {
    return _bcryptjs2.default.compareSync(password, this.password);
};

exports.default = _mongoose2.default.model('account', Account);