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
var initServer = false;
var regenMonster = setInterval(loadMonsterList, 1000 * 60 * 3);
var bossGen = 0;
var monsters;
var localMonsterList = [];
var fightInterval = new Object();

loadMonsterList();

function loadMonsterList() {
  _monster2.default.find().exec(function (err, monster) {
    if (err) throw err;
    monsters = eval(monster);
    console.log("몬스터 로드, 지역 배치 시작");
    var genMonster = [];
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
        monObj.exp = monsters[monCount].exp;
        monObj.area = monsters[monCount].mapName + "-" + monLocalArr[localCount];
        if (!initServer) {
          localMonsterList.push(monObj);
        } else {
          if (!localMonsterList[monCount].exist && localMonsterList[monCount].type == "normal") {
            localMonsterList[monCount] = monObj;
          } else if (!localMonsterList[monCount].exist && localMonsterList[monCount].type == "boss" && bossGen == 4) {
            localMonsterList[monCount] = monObj;
          }
          bossGen++;
        }
      }
    }
  });
}

var checkMonster = function checkMonster(ch) {
  console.log(ch);
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

    if (monNum == null) {
      return false;
    }

    var dmg = userInfo.int + userInfo.str + (userInfo.int + userInfo.str) * 0.3 - localMonsterList[monNum].dp;
    dmg = Math.round(dmg);

    var result = userInfo.username + "님께서 " + info.target + "에게 " + dmg + "의 공격을 하였습니다.";
    localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;
    var monHPMsg = localMonsterList[monNum].name + "의 남은 체력 : " + localMonsterList[monNum].hp;
    io.emit(info.ch, result);
    io.emit(info.ch, monHPMsg);

    if (!info.fighting) {
      // 몬스터가 유저를 공격하는 인터벌
      fightInterval[userInfo.username + "fighting"] = true; // 몬스터 처치후 발동되는 인터벌 막기위한 변수
      fightInterval[userInfo.username + "HP"] = userInfo.hp;
      fightInterval[userInfo.username] = setInterval(function () {
        var reDmg = localMonsterList[monNum].ap;
        var userHP = fightInterval[userInfo.username + "HP"] - reDmg;
        fightInterval[userInfo.username + "HP"] -= reDmg;

        // 몬스터 처치후 발동되는 인터벌 막기위한 판단
        if (!fightInterval[userInfo.username + "fighting"]) {
          console.log(userInfo.username + "퐈이팅 중단");
          return false;
        }

        _account2.default.update({ username: userInfo.username }, { $set: { hp: userHP } }, function (err, output) {
          if (err) console.log(err);
          io.emit(info.ch, localMonsterList[monNum].attackMsg + " " + userInfo.username + "님이" + reDmg + "의 피해를 입었습니다 현재 체력 :" + userHP);
          io.emit(userInfo.username + "전투", "[HP]" + userHP);
        });

        if (userHP < 0) {
          fightInterval[userInfo.username + "fighting"] = false;
          clearInterval(fightInterval[userInfo.username]);
          _account2.default.update({ username: userInfo.username }, { $set: { hp: userInfo.max_hp } }, function (err, output) {
            if (err) console.log(err);
            io.emit(userInfo.username, "[시스템] 운영자 cheesu님께서 당신의 죽음을 불쌍히 여겨 체력이 회복 되었습니다.");
          });
        }
      }, localMonsterList[monNum].speed * 10);
    }

    // 몬스터 처치
    if (localMonsterList[monNum].hp <= 0) {
      fightInterval[userInfo.username + "fighting"] = false; // 몬스터 처치후 발동되는 인터벌 막기위한 변수
      clearInterval(fightInterval[userInfo.username]);
      localMonsterList[monNum].exist = false;
      io.emit(info.ch, localMonsterList[monNum].dieMsg);
      expLevelup(userInfo, io, monNum, info); // 렙업인지 경치만 획득인지 계산한다
    }
  });
};

//경험치 획득 &
function expLevelup(userInfo, io, monNum, info) {
  // 경험치 계산
  var totalExp = userInfo.exp + localMonsterList[monNum].exp;

  // 경험치 업데이트
  _account2.default.update({ username: info.userName }, { $set: { exp: totalExp } }, function (err, output) {
    if (err) console.log(err);
    io.emit(userInfo.username, "[시스템] " + localMonsterList[monNum].name + "을 쓰러뜨려 경험치 " + localMonsterList[monNum].exp + "를 획득 하였습니다.");
    io.emit(userInfo.username + "전투", "endFight");
  });

  // 레벨업 판단
  if (logB(userInfo.lv, 20) * 1000 * userInfo.lv * userInfo.lv / 6 < totalExp) {
    var lvUp = userInfo.lv + 1;
    var strUP = userInfo.str + 2;
    var dexUP = userInfo.dex + 2;
    var intUP = userInfo.int + 2;
    var max_mpUP = userInfo.max_mp;
    var max_hpUP = userInfo.max_hp;
    var jobBouns = 2;
    if (userInfo.job == "검사") {
      strUP = strUP + jobBouns;
      intUP = intUP - 1;
      max_mpUP += userInfo.lv * 10 * 0.2;
      max_hpUP += userInfo.lv * 10 * 0.6;
    } else if (userInfo.job == "마법사") {
      intUP = intUP + jobBouns;
      dexUP = dexUP - 1;
      max_mpUP += userInfo.lv * 10 * 0.6;
      max_hpUP += userInfo.lv * 10 * 0.2;
    } else if (userInfo.job == "암살자") {
      dexUP = dexUP + jobBouns;
      strUP = strUP - 1;
      max_mpUP += 15;
      max_mpUP += userInfo.lv * 10 * 0.3;
      max_hpUP += userInfo.lv * 10 * 0.5;
    }

    _account2.default.update({ username: userInfo.username }, { $set: { lv: lvUp, str: strUP, int: intUP, dex: dexUP, max_hp: max_hpUP, max_mp: max_mpUP, mp: max_mpUP, hp: max_hpUP } }, function (err, output) {
      if (err) console.log(err);
      io.emit(info.ch, userInfo.username + "님께서 레벨업 하셨습니다");
    });
  }
}

// 경험치 레벨 계산
function logB(x, base) {
  return Math.log(x) / Math.log(base);
}

exports.fight = fight;
exports.localMonsterList = localMonsterList;
exports.checkMonster = checkMonster;