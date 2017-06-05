'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkMonster = exports.localMonsterList = exports.fight = undefined;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _account = require('../models/account');

var _account2 = _interopRequireDefault(_account);

var _monster = require('../models/monster');

var _monster2 = _interopRequireDefault(_monster);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

// 몬스터 리젠
var regenMonster = setInterval(loadMonsterList, 1000 * 60 * 5);

var monsters;
var localMonsterList = [];
loadMonsterList();

function loadMonsterList() {
  _monster2.default.find({ type: "normal" }).exec(function (err, monster) {
    if (err) throw err;
    monsters = eval(monster);
    console.log("몬스터 로드, 지역 배치 시작");
    for (var monCount = 0; monCount < monsters.length; monCount++) {
      console.log(monsters[monCount].name + "배치 시작");
      var monLocalArr = monsters[monCount].area.split(",");
      for (var localCount = 0; localCount < monLocalArr.length; localCount++) {
        var monObj = new Object();
        monObj.name = monsters[monCount].name;
        monObj.lv = monsters[monCount].lv;
        monObj.hp = monsters[monCount].hp;
        monObj.mp = monsters[monCount].mp;
        monObj.ap = monsters[monCount].ap;
        monObj.dp = monsters[monCount].dp;
        monObj.speed = monsters[monCount].speed;
        monObj.exist = monsters[monCount].exist;
        monObj.type = monsters[monCount].type;
        monObj.appearMsg = monsters[monCount].appearMsg;
        monObj.attackMsg = monsters[monCount].attackMsg;
        monObj.dieMsg = monsters[monCount].dieMsg;
        monObj.area = monLocalArr[localCount];

        localMonsterList.push(monObj);
      }
    }
  });
}

var checkMonster = function checkMonster(ch) {
  var monster = null;
  for (var count = 0; count < localMonsterList.length; count++) {
    if (localMonsterList[count].area == ch && localMonsterList[count].exist == true) {
      monster = localMonsterList[count];
    }
  }
  return monster;
};

var checkFightMonster = function checkFightMonster(ch) {
  var monNum = null;
  for (var count = 0; count < localMonsterList.length; count++) {
    if (localMonsterList[count].area == ch && localMonsterList[count].exist == true) {
      monNum = count;
    }
  }
  return monNum;
};

var fight = function fight(io, info) {
  _account2.default.find({ username: info.userName }).exec(function (err, account) {
    if (err) throw err;
    var userInfo = account;
    userInfo = eval(userInfo[0]);
    var monNum = checkFightMonster(info.ch);

    var dmg = (userInfo.int + userInfo.str) * userInfo.lv - localMonsterList[monNum].dp;
    var result = userInfo.username + "님께서 " + info.target + "에게 " + dmg + "의 공격을 하였습니다.";
    localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;

    var monHPMsg = localMonsterList[monNum].name + "의 남은 체력 : " + localMonsterList[monNum].hp;
    io.emit(info.ch, result);
    io.emit(info.ch, monHPMsg);

    if (localMonsterList[monNum].hp <= 0) {
      localMonsterList[monNum].exist = false;
      io.emit(info.ch, localMonsterList[monNum].dieMsg);
    }
  });
};

exports.fight = fight;
exports.localMonsterList = localMonsterList;
exports.checkMonster = checkMonster;