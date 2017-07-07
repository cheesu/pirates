'use strict';

Object.defineProperty(exports, "__esModule", {
      value: true
});
exports.alarmNotice = undefined;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _fcm = require('../models/fcm');

var _fcm2 = _interopRequireDefault(_fcm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var webpush = require('web-push');

var alarmNotice = function alarmNotice(msg) {

      // CHECK USER EXISTANCE
      _fcm2.default.find({}, function (err, fcmData) {
            if (err) throw err;

            var fcm = eval(fcmData);

            // VAPID keys should only be generated only once.
            var vapidKeys = webpush.generateVAPIDKeys();

            webpush.setGCMAPIKey('AAAAuFzJjU8:APA91bEFB_-WSx-6_fOwPSyeeqZ4TsdqvBV3csh3cgQxiDQc9b_fRQUGfKmVrLxhrRRDR6szH2zWzwhbVCxoZOPXI4PIjDXXG_UKgPufQyZuGknU7H8k9kh3pXQTzcbArWCLZM3yxAsD');
            webpush.setVapidDetails('mailto:dlscltn@gmail.com', 'BKB5jIJjV1aka8y22xp_2xOVywvrppnJljdO3Hpgb49lX5yINO9YA1-WOC7IKIow93Q13LizgTrMdUcrZ7d-vUI', 'D-VfMe77r7eDKV43A8eUgO11w-Wga00-0rBBhIbuvAE');
            for (var count = 0; count < fcm.length; count++) {

                  var pushSubscription = {
                        endpoint: fcm[count].endpoint,
                        keys: {
                              auth: fcm[count].keys.auth,
                              p256dh: fcm[count].keys.p256dh
                        }
                  };
                  webpush.sendNotification(pushSubscription, msg);
            }

            // This is the same output of calling JSON.stringify on a PushSubscription

      });
};

exports.alarmNotice = alarmNotice;