'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.restEnd = exports.rest = exports.useSkill = exports.checkMonster = exports.localMonsterList = exports.run = exports.fight = undefined;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _account = require('../models/account');

var _account2 = _interopRequireDefault(_account);

var _monster = require('../models/monster');

var _monster2 = _interopRequireDefault(_monster);

var _skill = require('../models/skill');

var _skill2 = _interopRequireDefault(_skill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

// 몬스터 리젠
var initServer = false;
var regenMonster = setInterval(loadMonsterList, 1000 * 60 * 3);
var bossGen = 0;
var monsters;
var localMonsterList = [];
var fightInterval = new Object();
var restInterval = new Object();

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
        monObj.maxHP = monsters[monCount].maxHP;
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

var run = function run(io, info) {
  fightInterval[info.userName + "fighting"] = false;
  clearInterval(fightInterval[info.userName + "monsterAttack"]);
  clearInterval(fightInterval[info.userName + "userAttack"]);
  io.emit(info.ch, info.userName + "님이 도망갑니다.");
};

// 스킬 사용
var useSkill = function useSkill(io, info) {
  _account2.default.find({ username: info.username }).exec(function (err, account) {
    if (err) throw err;

    var userInfo = account;
    userInfo = eval(userInfo[0]);
    var monNum = checkFightMonster(info.ch);

    if (monNum == null) {
      return false;
    }

    _skill2.default.find({ name: info.skillname }).exec(function (err, skill) {
      if (err) throw err;
      var skillInfo = eval(skill[0]);

      var userMP = userInfo.mp - skillInfo.mp;
      if (userMP < 0) {
        userMP = 0;
      }
      // 엠피 소모 업데이트
      _account2.default.update({ username: userInfo.username }, { $set: { mp: userMP } }, function (err, output) {
        if (err) console.log(err);

        io.emit(userInfo.username + "userMP", userMP + "-" + userInfo.max_mp);
        if (fightInterval[userInfo.username + "skill"]) {
          io.emit(userInfo.username + "fight", "[skill]이미 스킬을 시전 중 입니다.");
          return false;
        }
        if (skillInfo.lv > userInfo.lv) {
          io.emit(userInfo.username + "fight", "[skill]레벨이 부족해서 해당 기술을 사용 할 수 없습니다.");
          return false;
        }

        if (skillInfo.mp > userInfo.mp) {
          io.emit(userInfo.username + "fight", "[skill]MP가 부족해 기술을 사용 할 수 없습니다.");
          return false;
        }

        if (userInfo.hp <= 0) {
          io.emit(userInfo.username + "fight", "[skill]죽은자는 행동 할 수 없습니다.");
          clearInterval(fightInterval[userInfo.username + "skillInterval"]);
          fightInterval[userInfo.username + "CastingCount"] = null;
          fightInterval[userInfo.username + "skillInterval"] = null;
          fightInterval[userInfo.username + "skill"] = false;
          return false;
        }

        var skillCasting = skillInfo.casting.split(",");
        fightInterval[userInfo.username + "CastingCount"] = 0;
        fightInterval[userInfo.username + "skill"] = true;
        fightInterval[userInfo.username + "skillInterval"] = setInterval(function () {
          if (fightInterval[userInfo.username + "CastingCount"] == null) {
            clearInterval(fightInterval[userInfo.username + "skillInterval"]);
            return false;
          }

          var castingCount = fightInterval[userInfo.username + "CastingCount"];
          // 캐스팅
          io.emit(info.ch + "fight", "[skill]" + skillCasting[castingCount]);
          fightInterval[userInfo.username + "CastingCount"] = fightInterval[userInfo.username + "CastingCount"] + 1;
          if (skillCasting.length <= fightInterval[userInfo.username + "CastingCount"]) {

            // 공격 시작
            var dmg = userInfo.int + userInfo.str + (userInfo.int + userInfo.str) * 0.3 * skillInfo.dmg - localMonsterList[monNum].dp;
            dmg = Math.round(dmg);
            var targetCurrentHP = 9999;
            for (var count = 0; count < skillInfo.hit; count++) {
              var skillAttackMsg = "";
              var critical = checkCritical(userInfo.dex);
              var result = "";
              if (critical) {
                dmg = dmg * 1.7;
                dmg = Math.round(dmg);
                skillAttackMsg = "[skill]" + skillInfo.attackMsg + "[" + dmg + "]-[Critical!!!!]";
                localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;
                io.emit(userInfo.username + "[Cri]", "");
              } else {
                skillAttackMsg = "[skill]" + skillInfo.attackMsg + "[" + dmg + "]";
                localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;
              }

              localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;
              targetCurrentHP = localMonsterList[monNum].hp;
              if (localMonsterList[monNum].hp < 0) {
                targetCurrentHP = 0;
              }

              var monHPMsg = localMonsterList[monNum].name + "의 남은 체력 : " + targetCurrentHP;
              io.emit(info.ch + "fight", skillAttackMsg);
              io.emit(info.ch + "fight", monHPMsg);
            }

            // 몬스터 처치
            if (localMonsterList[monNum].hp <= 0) {
              fightInterval[userInfo.username + "fighting"] = false; // 몬스터 처치후 발동되는 인터벌 막기위한 변수
              clearInterval(fightInterval[userInfo.username + "monsterAttack"]);
              clearInterval(fightInterval[userInfo.username + "userAttack"]);
              localMonsterList[monNum].exist = false;
              io.emit(info.ch, localMonsterList[monNum].dieMsg);
              io.emit(info.ch + "fight", localMonsterList[monNum].dieMsg);
              io.emit(info.ch + "monsterHP", targetCurrentHP + "-" + localMonsterList[monNum].maxHP);
              expLevelup(userInfo, io, monNum, info); // 렙업인지 경치만 획득인지 계산한다
            }

            clearInterval(fightInterval[userInfo.username + "skillInterval"]);
            fightInterval[userInfo.username + "CastingCount"] = null;
            fightInterval[userInfo.username + "skillInterval"] = null;
            fightInterval[userInfo.username + "skill"] = false;
          }
        }, 1000); // 인터벌 종료
      }); // 엠피 소모 업데이트 종료
    }); // 스킬 정보 가져오기 정료

  }); // 유저정보 가져오기 종료
};

var fight = function fight(io, info) {
  console.log("전투 시작");
  _account2.default.find({ username: info.userName }).exec(function (err, account) {
    if (err) throw err;
    var userInfo = account;
    userInfo = eval(userInfo[0]);
    var monNum = checkFightMonster(info.ch);

    if (monNum == null) {
      return false;
    }

    if (!info.fighting && (fightInterval[userInfo.username + "fighting"] == undefined || !fightInterval[userInfo.username + "fighting"])) {
      // 몬스터가 유저를 공격하는 인터벌
      fightInterval[userInfo.username + "fighting"] = true; // 몬스터 처치후 발동되는 인터벌 막기위한 변수
      fightInterval[userInfo.username + "HP"] = userInfo.hp;

      // 몬스터가 공격
      fightInterval[userInfo.username + "monsterAttack"] = setInterval(function () {
        var reDmg = localMonsterList[monNum].ap;
        var userHP = fightInterval[userInfo.username + "HP"] - reDmg;
        fightInterval[userInfo.username + "HP"] -= reDmg;

        // 몬스터 처치후 발동되는 인터벌 막기위한 판단
        if (!fightInterval[userInfo.username + "fighting"]) {
          console.log(userInfo.username + "전투 중단");
          return false;
        }

        if (userHP < 0) {
          userHP = 0;
        }

        _account2.default.update({ username: userInfo.username }, { $set: { hp: userHP } }, function (err, output) {
          if (err) console.log(err);
          io.emit(info.ch + "fight", "[피격]" + localMonsterList[monNum].attackMsg + " " + userInfo.username + "님이[" + reDmg + "]의 피해를 입었습니다.");
          io.emit(userInfo.username + "userHP", userHP + "-" + userInfo.max_hp);
          io.emit(userInfo.username + "currentUserHP", userHP + "-" + userInfo.max_hp);

          // 맞고 디졌을떄
          if (userHP <= 0) {
            fightInterval[userInfo.username + "fighting"] = false;
            clearInterval(fightInterval[userInfo.username + "monsterAttack"]);
            clearInterval(fightInterval[userInfo.username + "userAttack"]);
            _account2.default.update({ username: userInfo.username }, { $set: { hp: userInfo.max_hp } }, function (err, output) {
              if (err) console.log(err);
              io.emit(info.ch + "fight", localMonsterList[monNum].name + "의 일격을 맞고 " + userInfo.username + "님이 정신을 잃고 쓰러집니다.");
              io.emit(userInfo.username, "[시스템] 운영자 cheesu님께서 당신의 죽음을 불쌍히 여겨 체력이 회복 되었습니다.");
              io.emit(userInfo.username + "DEAD", "");
              io.emit(userInfo.username + "currentUserHP", userInfo.max_hp + "-" + userInfo.max_hp);
            });
          }
        });
      }, localMonsterList[monNum].speed * 10);

      // 유저 공격 속도
      var attackSpeed = 1800 - userInfo.dex * 3;

      // 유저가 공격
      fightInterval[userInfo.username + "userAttack"] = setInterval(function () {

        // 몬스터 처치후 발동되는 인터벌 막기위한 판단
        if (!fightInterval[userInfo.username + "fighting"]) {
          console.log(userInfo.username + "전투 중단");
          return false;
        }

        var dmg = userInfo.int + userInfo.str + (userInfo.int + userInfo.str) * 0.3 - localMonsterList[monNum].dp;
        dmg = Math.round(dmg);

        var critical = checkCritical(userInfo.dex);
        var result = "";
        if (critical) {
          dmg = dmg * 1.7;
          dmg = Math.round(dmg);
          result = "Critical!!!! " + userInfo.username + "님께서 " + info.target + "에게 " + dmg + "의 공격을 하였습니다.";
          localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;
          io.emit(userInfo.username + "[Cri]", "");
        } else {
          result = userInfo.username + "님께서 " + info.target + "에게 " + dmg + "의 공격을 하였습니다.";
          localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;
        }

        var targetCurrentHP = localMonsterList[monNum].hp;
        if (localMonsterList[monNum].hp < 0) {
          targetCurrentHP = 0;
        }

        var monHPMsg = localMonsterList[monNum].name + "의 남은 체력 : " + targetCurrentHP;
        io.emit(info.ch + "fight", result);
        io.emit(info.ch + "fight", monHPMsg);
        io.emit(info.ch + "monsterHP", targetCurrentHP + "-" + localMonsterList[monNum].maxHP);

        // 몬스터 처치
        if (localMonsterList[monNum].hp <= 0) {
          fightInterval[userInfo.username + "fighting"] = false; // 몬스터 처치후 발동되는 인터벌 막기위한 변수
          clearInterval(fightInterval[userInfo.username + "monsterAttack"]);
          clearInterval(fightInterval[userInfo.username + "userAttack"]);
          localMonsterList[monNum].exist = false;
          io.emit(info.ch, localMonsterList[monNum].dieMsg);
          io.emit(info.ch + "fight", localMonsterList[monNum].dieMsg);
          expLevelup(userInfo, io, monNum, info); // 렙업인지 경치만 획득인지 계산한다
        }
      }, attackSpeed);
    }
  });
};

//크리티컬 계산
function checkCritical(dex) {
  var result = false;
  dex = dex / 5;
  var random = Math.floor(Math.random() * 100) + 1;
  if (random <= dex) {
    result = true;
  }
  return result;
}

//경험치 획득 &
function expLevelup(userInfo, io, monNum, info) {
  // 경험치 계산
  var upExp = localMonsterList[monNum].exp;
  var gap = userInfo.lv - localMonsterList[monNum].lv;
  if (gap > 7) {
    upExp = Math.round(upExp / 2);
  }
  if (gap < -2) {
    upExp = Math.round(upExp * 1.5);
  }
  var totalExp = userInfo.exp + upExp;

  // 경험치 업데이트
  _account2.default.update({ username: info.userName }, { $set: { exp: totalExp } }, function (err, output) {
    if (err) console.log(err);
    io.emit(userInfo.username, "[시스템] " + localMonsterList[monNum].name + "을 쓰러뜨려 경험치 " + localMonsterList[monNum].exp + "를 획득 하였습니다.");
    io.emit(userInfo.username + "fight", "[시스템] " + localMonsterList[monNum].name + "을 쓰러뜨려 경험치 " + localMonsterList[monNum].exp + "를 획득 하였습니다.");
    io.emit(userInfo.username + "전투", "endFight");
    io.emit(userInfo.username + "endFight", "");
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
var restEnd = function restEnd(socket, name) {
  clearInterval(restInterval[name]);
  restInterval[name + "rest"] = false;
};

var rest = function rest(socket, name) {

  if (restInterval[name] == undefined || !restInterval[name + "rest"]) {
    socket.emit(name, "[휴식]안전한 곳에 앉아 휴식을 취합니다.");
    //휴식 시작
    restInterval[name] = setInterval(function () {
      _account2.default.find({ username: name }).exec(function (err, account) {
        if (err) console.log(err);
        restInterval[name + "rest"] = true;

        var userInfo = account;
        userInfo = eval(userInfo[0]);

        var currentHP = userInfo.hp;
        var currentMP = userInfo.mp;
        var maxHP = userInfo.max_hp;
        var maxMP = userInfo.max_mp;
        var healHP = userInfo.str * 4;
        var healMP = userInfo.int * 4;

        var upHP = currentHP + healHP;
        var upMP = currentMP + healMP;

        if (upHP >= maxHP) {
          healHP = upHP - maxHP - healHP;
          upHP = maxHP;
        }

        if (upMP >= maxMP) {
          healMP = upMP - maxMP - healMP;
          upMP = maxMP;
        }

        _account2.default.update({ username: name }, { $set: { mp: upMP, hp: upHP } }, function (err, output) {
          if (err) console.log(err);
          socket.emit(name, "[휴식]휴식을 취하며 HP:" + healHP + " MP:" + healMP + " 회복 되었습니다.");
          if (upHP == maxHP && upMP == maxMP) {
            socket.emit(name, "[휴식]모두 회복되어 최상의 컨디션 입니다. 휴식을 끝내고 자리에서 일어납니다.");
            clearInterval(restInterval[userInfo.username]);
            restInterval[userInfo.username + "rest"] = false;
          }
        });
      });
    }, 15000);
  } // 이프 조건
  else {
      socket.emit(name, "이미 휴식중 입니다.");
    }
};

exports.fight = fight;
exports.run = run;
exports.localMonsterList = localMonsterList;
exports.checkMonster = checkMonster;
exports.useSkill = useSkill;
exports.rest = rest;
exports.restEnd = restEnd;