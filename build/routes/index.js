'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _account = require('./account');

var _account2 = _interopRequireDefault(_account);

var _map = require('./map');

var _map2 = _interopRequireDefault(_map);

var _skill = require('./skill');

var _skill2 = _interopRequireDefault(_skill);

var _item = require('./item');

var _item2 = _interopRequireDefault(_item);

var _fcm = require('./fcm');

var _fcm2 = _interopRequireDefault(_fcm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

/*
* 크롬에선 문제가 없는데 IE에선 캐시 컨트롤을 이상하게 하게 되면서 새 메모를 불러오지 못하는 버그가있습니다.

 해당 코드를 서버의 인덱스 라우터에 추가하여 오류를 해결하세요.
* */
router.use('/*', function (req, res, next) {
    res.setHeader("Expires", "-1");
    res.setHeader("Cache-Control", "must-revalidate, private");
    next();
});

router.use('/account', _account2.default);
router.use('/map', _map2.default);
router.use('/skill', _skill2.default);
router.use('/item', _item2.default);
router.use('/fcm', _fcm2.default);
exports.default = router;