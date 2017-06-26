'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fightUseItem = exports.restEnd = exports.rest = exports.useSkill = exports.checkMonster = exports.localMonsterList = exports.run = exports.fight = undefined;

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
var regenMonster = setInterval(loadMonsterList, 1000 * 60 * 2);
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

    var genMonster = [];
    for (var monCount = 0; monCount < monsters.length; monCount++) {
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
        monObj.gold = monsters[monCount].gold;
        monObj.Aggravation = [];
        monObj.area = monsters[monCount].mapName + "-" + monLocalArr[localCount];

        if (!initServer) {
          if (monObj.type == 'boss') {
            monObj.dropItem = monsters[monCount].dropItem;
            monObj.dropPer = monsters[monCount].dropPer;
          }
          localMonsterList.push(monObj);
        } else {
          for (var listCount = 0; listCount < localMonsterList.length; listCount++) {
            if (!localMonsterList[listCount].exist && monObj.type == "normal" && localMonsterList[listCount].name == monObj.name && localMonsterList[listCount].area == monObj.area) {

              localMonsterList[listCount] = monObj;
            } else if (!localMonsterList[listCount].exist && monObj.type == "boss" && bossGen == 0 && localMonsterList[listCount].name == monObj.name && localMonsterList[listCount].area == monObj.area) {
              console.log("-------------BOSS GEN!----------------------------");
              console.log(monsters[monCount].name + "배치 시작");
              monObj.dropItem = monsters[monCount].dropItem;
              monObj.dropPer = monsters[monCount].dropPer;
              localMonsterList[listCount] = monObj;
            }
          }
        }
      }
    }
    initServer = true;
    bossGen++;
    if (bossGen == 4) {
      bossGen = 0;
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

        /*    if(userInfo.job2 != "깨달은 현자" && info.skillCount==2){
              userInfo.username = userInfo.username+"2";
            }
        */
        io.emit(userInfo.username + "userMP", userMP + "-" + userInfo.max_mp);
        fightInterval[userInfo.username + "MP"] = userMP;

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
        var coolDown = userInfo.int;

        if (userInfo.job2 == "깨달은 현자") {
          coolDown = coolDown * 1.5;
        }
        if (coolDown > 700) {
          coolDown = 700;
        }

        // 스킬 캐스팅 인터벌
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

            // 무기 이름
            var wName = "";

            wName = userInfo.mount.w.name;
            if (wName == NaN || wName == null || wName == "" || wName == undefined) {
              wName = "맨손";
            }

            // 무기 최소 데미지
            var wMinAP = userInfo.mount.w.min;
            if (wMinAP == NaN || wMinAP == null || wMinAP == "" || wMinAP == undefined) {
              wMinAP = 0;
            }

            // 무기 최대 데미지
            var wMaxAP = userInfo.mount.w.max;
            if (wMaxAP == NaN || wMaxAP == null || wMaxAP == "" || wMaxAP == undefined) {
              wMaxAP = 0;
            }

            var randomAP = Math.floor(Math.random() * wMaxAP) + 1;

            var wAP = wMinAP + randomAP;

            if (userInfo.job2 == '검의 달인') {
              var passive = Math.floor(Math.random() * 1000) + 1;
              if (userInfo.str > passive) {
                wAP = wAP * 2;
                io.emit(info.ch + "fight", "[passive] 검의 달인 " + userInfo.username + "님의 " + userInfo.mount.w.name + "에서 푸른 검기가 생성됩니다. 공격력이 증가 합니다.");
              }
            }

            var targetCurrentHP = 9999;
            for (var count = 0; count < skillInfo.hit; count++) {
              var lvGap = (localMonsterList[monNum].lv - userInfo.lv) * 2;
              if (lvGap < -10) {
                lvGap = -10;
              }
              var lvBonus = userInfo.lv / (20 + lvGap);
              var dmg = (userInfo.int + userInfo.str + (userInfo.int + userInfo.str) * lvBonus + wAP) * skillInfo.dmg - localMonsterList[monNum].dp;
              dmg = Math.round(dmg);
              var skillAttackMsg = "";

              if (lvGap < 0) {
                lvGap = 0;
              }

              var critical = checkCritical(userInfo.dex - lvGap * 15);
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

              targetCurrentHP = localMonsterList[monNum].hp;
              if (localMonsterList[monNum].hp < 0) {
                targetCurrentHP = 0;
              }

              /*어그로 */
              var aggro = localMonsterList[monNum].Aggravation; // 어그로
              if (aggro.length == 0) {
                // 선빵 친놈 등록
                var _aggroObj = {};
                _aggroObj.name = userInfo.username;
                _aggroObj.dmg = dmg;
                localMonsterList[monNum].Aggravation.push(_aggroObj);
              } else {

                var checkAggro = false;
                // 이미 치고 있을떄 뎀지 누적
                for (var aggrocount = 0; aggrocount < aggro.length; aggrocount++) {
                  if (aggro[aggrocount].name == userInfo.username) {
                    localMonsterList[monNum].Aggravation[aggrocount].dmg = localMonsterList[monNum].Aggravation[aggrocount].dmg + dmg;
                    checkAggro = true;
                  }
                }

                // 딴놈이 치고 있을떄 들어옴
                if (!checkAggro) {
                  var _aggroObj2 = {};
                  _aggroObj2.name = userInfo.username;
                  _aggroObj2.dmg = dmg;
                  localMonsterList[monNum].Aggravation.push(_aggroObj2);
                }
              }
              /*어그로 끝*/

              //  let monHPMsg = localMonsterList[monNum].name+"의 남은 체력 : "+targetCurrentHP;
              io.emit(info.ch + "fight", skillAttackMsg);
              //  io.emit(info.ch+"fight", monHPMsg);
            }

            io.emit(info.ch + "monsterHP", targetCurrentHP + "-" + localMonsterList[monNum].maxHP);
            io.emit(userInfo.username + "[SkillEnd]", "");
            // 몬스터 처치
            if (localMonsterList[monNum].hp <= 0) {
              fightInterval[userInfo.username + "fighting"] = false; // 몬스터 처치후 발동되는 인터벌 막기위한 변수
              clearInterval(fightInterval[userInfo.username + "monsterAttack"]);
              clearInterval(fightInterval[userInfo.username + "userAttack"]);
              localMonsterList[monNum].exist = false;
              io.emit(info.ch, "[monsterDieMsg]" + localMonsterList[monNum].dieMsg);
              io.emit(info.ch + "fight", "[monsterDieMsg]" + localMonsterList[monNum].dieMsg);

              expLevelup(userInfo, io, monNum, info, "스킬"); // 렙업인지 경치만 획득인지 계산한다
            }

            clearInterval(fightInterval[userInfo.username + "skillInterval"]);
            fightInterval[userInfo.username + "CastingCount"] = null;
            fightInterval[userInfo.username + "skillInterval"] = null;
            fightInterval[userInfo.username + "skill"] = false;
          }
        }, 1000 - coolDown); // 인터벌 종료
      }); // 엠피 소모 업데이트 종료
    }); // 스킬 정보 가져오기 정료

  }); // 유저정보 가져오기 종료
};

// 전투중 아이템 사용
var fightUseItem = function fightUseItem(io, info) {
  if (info.heal == "hp") {
    fightInterval[info.username + "HP"] = fightInterval[info.username + "HP"] + info.upData;
    io.emit(info.username + "userHP", fightInterval[info.username + "HP"] + "-" + info.maxHP);
    io.emit(info.username + "fight", "[item] 급하게 체력 포션을 마십니다. 체력이" + info.upData + "회복 되었습니다.");
  } else if (info.heal == "mp") {
    fightInterval[info.username + "MP"] = fightInterval[info.username + "MP"] + info.upData;
    io.emit(info.username + "userMP", fightInterval[info.username + "MP"] + "-" + info.maxMP);
    io.emit(info.username + "fight", "[item] 적의 공격을 피해 마력 포션을 마십니다.마력이" + info.upData + "회복 되었습니다.");
  }
};

var fight = function fight(io, info) {
  console.log("전투 시작");
  console.log(info);
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

        // 방어구 최소방어
        var dMinDP = userInfo.mount.d.min;
        if (dMinDP == NaN || dMinDP == null || dMinDP == "" || dMinDP == undefined) {
          dMinDP = 0;
        }

        // 방어구 최대 방어
        var dMaxDP = userInfo.mount.d.max;
        if (dMaxDP == NaN || dMaxDP == null || dMaxDP == "" || dMaxDP == undefined) {
          dMaxDP = 0;
        }

        var randomDP = Math.floor(Math.random() * dMaxDP) + dMinDP;

        var lvGap = localMonsterList[monNum].lv - userInfo.lv;
        if (lvGap < 0) {
          lvGap = 1;
        }

        lvGap = lvGap / 10;

        var reDmg = localMonsterList[monNum].ap + localMonsterList[monNum].ap * lvGap - randomDP;

        var critical = checkCritical(lvGap);
        var result = "";
        if (critical) {
          reDmg = reDmg * 1.7;
          reDmg = Math.round(reDmg);
        }

        if (reDmg < 0) {
          reDmg = 1;
        }

        // 패시브 발동 확률(렙 격차 따라서 발동확률은 낮아진다.)
        var passive = Math.floor(Math.random() * 1000) + lvGap * 10;

        if (userInfo.job2 == '깨달은 현자' && fightInterval[userInfo.username + "skill"]) {
          reDmg = reDmg / 2;
          io.emit(info.ch + "fight", "[passive] 캐스팅중인 깨달은 현자  " + userInfo.username + "님의 " + userInfo.mount.w.name + "이(가) 빛이나며 보호막이 생성됩니다. 주문보호의 영향으로 데미지가 감소합니다.");
        }

        if (userInfo.job2 == '검의 달인') {
          var passiveLimit = userInfo.str;
          if (passiveLimit > 500) {
            passiveLimit = 500;
          }

          if (passiveLimit > passive) {
            reDmg = 0;
            io.emit(info.ch + "fight", "[passive] 검의 달인 " + userInfo.username + "님의 " + userInfo.mount.w.name + "이(가) '카아아아앙!' 하는 금속 마찰음을 내며 적의 공격을 상쇄합니다");
          }
        }

        if (userInfo.job2 == '그림자 살귀') {
          var _passiveLimit = userInfo.dex;
          if (_passiveLimit > 500) {
            _passiveLimit = 500;
          }
          if (_passiveLimit > passive) {
            reDmg = 0;
            io.emit(info.ch + "fight", "[passive] 그림자 살귀 " + userInfo.username + "님이 어둠속으로 몸을 숨겨 적의 공격을 회피 합니다.");
          }
        }

        if (userInfo.job2 == '그림자 살귀') {
          var _passiveLimit2 = userInfo.dex;
          if (_passiveLimit2 > 500) {
            _passiveLimit2 = 500;
          }
          if (_passiveLimit2 > passive) {
            localMonsterList[monNum].hp = localMonsterList[monNum].hp - reDmg * 10;
            io.emit(info.ch + "fight", "[passive] 그림자 살귀 " + userInfo.username + "님의 " + userInfo.mount.w.name + "이(가) 적의 공격을 타고 흘러 반격합니다. [" + reDmg * 10 + "]");
          }
        }

        var userHP = fightInterval[userInfo.username + "HP"] - reDmg;
        fightInterval[userInfo.username + "HP"] -= reDmg;

        try {
          if (userInfo.mount.d.type == "unique") {
            var ud = userInfo.mount.d;
            var active = Math.floor(Math.random() * 100) + 1;
            if (active <= ud.option.per) {
              if (ud.option.option == "heal") {
                userInfo.hp = userInfo.max_hp;
                fightInterval[userInfo.username + "HP"] = userInfo.max_hp;
                userHP = userInfo.max_hp;
                io.emit(info.ch + "fight", "[item] " + ud.option.msg);
              } else if (ud.option.option == "block") {
                userInfo.hp += reDmg;
                fightInterval[userInfo.username + "HP"] += reDmg;
                userHP += reDmg;
                reDmg = 0;
                io.emit(info.ch + "fight", "[item] " + ud.option.msg);
              } else if (ud.option.option == "counter") {
                localMonsterList[monNum].hp = localMonsterList[monNum].hp - reDmg * 10;
                io.emit(info.ch + "fight", "[item] " + ud.option.msg + "[" + reDmg * 10 + "]");
              }
            }
          }
        } catch (e) {
          console.log("유닉 방어구 발동 오류");
          console.log(e);
        }

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

          if (critical) {
            io.emit(info.ch + "fight", "[피격]" + localMonsterList[monNum].attackMsg + "강력한 일격!!!!!! " + userInfo.username + "님이[" + reDmg + "]의 피해를 입었습니다.[CRITICAL!!!]");
          } else {
            io.emit(info.ch + "fight", "[피격]" + localMonsterList[monNum].attackMsg + " " + userInfo.username + "님이[" + reDmg + "]의 피해를 입었습니다.");
          }

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
              io.emit(userInfo.username + "CONTROLLDEAD", "");
              io.emit(userInfo.username + "currentUserHP", userInfo.max_hp + "-" + userInfo.max_hp);
            });
          }
        });
      }, localMonsterList[monNum].speed * 10);

      // 유저 공격 속도
      var attackSpeed = 1800 - userInfo.dex * 3;
      if (attackSpeed < 800) {
        attackSpeed = 800;
      }

      // 유저가 공격
      fightInterval[userInfo.username + "userAttack"] = setInterval(function () {

        // 몬스터 처치후 발동되는 인터벌 막기위한 판단
        if (!fightInterval[userInfo.username + "fighting"]) {
          console.log(userInfo.username + "전투 중단");
          return false;
        }

        // 무기 이름
        var wName = userInfo.mount.w.name;
        if (wName == NaN || wName == null || wName == "" || wName == undefined) {
          wName = "맨손";
        }

        // 무기 최소 데미지
        var wMinAP = userInfo.mount.w.min;
        if (wMinAP == NaN || wMinAP == null || wMinAP == "" || wMinAP == undefined) {
          wMinAP = 0;
        }

        // 무기 최대 데미지
        var wMaxAP = userInfo.mount.w.max;
        if (wMaxAP == NaN || wMaxAP == null || wMaxAP == "" || wMaxAP == undefined) {
          wMaxAP = 0;
        }

        var randomAP = Math.floor(Math.random() * wMaxAP) + 1;

        var wAP = wMinAP + randomAP;

        if (userInfo.job2 == '검의 달인') {
          var passive = Math.floor(Math.random() * 1000) + 1;
          if (userInfo.str > passive) {
            wAP = wAP * 2;
            io.emit(info.ch + "fight", "[passive] 검의 달인 " + userInfo.username + "님의 " + userInfo.mount.w.name + "에서 푸른 검기가 생성됩니다. 공격력이 증가 합니다.");
          }
        }

        console.log("무기 공격력" + wMinAP + "+" + randomAP + "=" + wAP);
        var lvGap = localMonsterList[monNum].lv - userInfo.lv;
        if (lvGap < -4) {
          lvGap = -4;
        }
        var lvBonus = userInfo.lv / (20 + lvGap);
        var dmg = userInfo.int + userInfo.str + (userInfo.int + userInfo.str) * lvBonus + wAP - localMonsterList[monNum].dp;
        dmg = Math.round(dmg);
        if (dmg < 0) {
          dmg = 1;
        }

        if (lvGap < 1) {
          lvGap = 1;
        }

        var critical = checkCritical(userInfo.dex / lvGap);
        var result = "";
        if (critical) {
          dmg = dmg * 1.7;
          dmg = Math.round(dmg);
          result = "Critical!!!! " + userInfo.username + "님께서 " + info.target + "에게 " + wName + "을(를) 휘둘러" + dmg + "의 공격을 하였습니다.";
          localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;
          io.emit(userInfo.username + "[Cri]", "");
        } else {
          result = userInfo.username + "님께서 " + info.target + "에게 " + wName + "을(를) 휘둘러" + dmg + "의 공격을 하였습니다.";
          localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;
        }

        var aggro = localMonsterList[monNum].Aggravation; // 어그로

        if (aggro.length == 0) {
          // 선빵 친놈 등록
          var _aggroObj = {};
          _aggroObj.name = userInfo.username;
          _aggroObj.dmg = dmg;
          localMonsterList[monNum].Aggravation.push(_aggroObj);
        } else {

          var checkAggro = false;
          // 이미 치고 있을떄 뎀지 누적
          for (var aggrocount = 0; aggrocount < aggro.length; aggrocount++) {
            if (aggro[aggrocount].name == userInfo.username) {
              localMonsterList[monNum].Aggravation[aggrocount].dmg = localMonsterList[monNum].Aggravation[aggrocount].dmg + dmg;
              checkAggro = true;
            }
          }

          // 딴놈이 치고 있을떄 들어옴
          if (!checkAggro) {
            var _aggroObj3 = {};
            _aggroObj3.name = userInfo.username;
            _aggroObj3.dmg = dmg;
            localMonsterList[monNum].Aggravation.push(_aggroObj3);
          }
        }

        var targetCurrentHP = localMonsterList[monNum].hp;
        if (localMonsterList[monNum].hp < 0) {
          targetCurrentHP = 0;
        }

        //  let monHPMsg = localMonsterList[monNum].name+"의 남은 체력 : "+targetCurrentHP;
        io.emit(info.ch + "fight", result);
        //  io.emit(info.ch+"fight", monHPMsg);
        io.emit(info.ch + "monsterHP", targetCurrentHP + "-" + localMonsterList[monNum].maxHP);

        // 몬스터 처치
        if (localMonsterList[monNum].hp <= 0) {
          fightInterval[userInfo.username + "fighting"] = false; // 몬스터 처치후 발동되는 인터벌 막기위한 변수
          clearInterval(fightInterval[userInfo.username + "monsterAttack"]);
          clearInterval(fightInterval[userInfo.username + "userAttack"]);
          localMonsterList[monNum].exist = false;
          io.emit(info.ch, "[monsterDieMsg]" + localMonsterList[monNum].dieMsg);
          io.emit(info.ch + "fight", "[monsterDieMsg]" + localMonsterList[monNum].dieMsg);
          expLevelup(userInfo, io, monNum, info, "평타"); // 렙업인지 경치만 획득인지 계산한다
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
function expLevelup(userInfo, io, monNum, info, kind) {

  // 경험치 계산
  var upExp = localMonsterList[monNum].exp;
  var random = Math.floor(Math.random() * 100) + 1;
  var getGold = localMonsterList[monNum].gold + random;

  var gap = userInfo.lv - localMonsterList[monNum].lv;
  if (gap > 5) {
    upExp = Math.round(upExp / 3);
    getGold = Math.round(getGold / 3);
  }

  var partyExp = 0;
  var partyGold = 0;

  if (info.party) {
    upExp = Math.round(upExp / 100 * 80);
    partyExp = Math.round(upExp / 100 * 20);
    getGold = Math.round(getGold / 100 * 80);
    partyGold = Math.round(upExp / 100 * 20);
  }

  var totalExp = userInfo.exp + upExp;
  var setGold = userInfo.gold + getGold;

  try {
    var dropPer = Math.floor(Math.random() * 1000) + 1;
    if (dropPer < 5) {
      if (userInfo.item.indexOf('ow1') == -1) {
        userInfo.item.push('ow1');
      }
      if (userInfo.itemCount.ow1 == undefined) {
        userInfo.itemCount.ow1 = 1;
      } else {
        userInfo.itemCount.ow1 = userInfo.itemCount.ow1 + 1;
      }
      io.emit(userInfo.username, "[시스템] 몬스터의 품안에서 심상치 않은 무엇인가가 떨어집니다.");
      io.emit(userInfo.username + "fight", "[시스템]  몬스터의 품안에서 심상치 않은 무엇인가가 떨어집니다.");
    }

    if (dropPer < 10) {
      if (userInfo.item.indexOf('ow2') == -1) {
        userInfo.item.push('ow2');
      }
      if (userInfo.itemCount.ow2 == undefined) {
        userInfo.itemCount.ow2 = 1;
      } else {
        userInfo.itemCount.ow2 = userInfo.itemCount.ow2 + 1;
      }
      io.emit(userInfo.username, "[시스템] 몬스터의 품안에서 심상치 않은 무엇인가가 떨어집니다.");
      io.emit(userInfo.username + "fight", "[시스템]  몬스터의 품안에서 심상치 않은 무엇인가가 떨어집니다.");
    }
  } catch (e) {
    console.log("일반몹 템드랍  오류");
    console.log(e);
  }

  try {
    // 보스 템드랍
    if (localMonsterList[monNum].type == "boss") {
      var _dropPer = Math.floor(Math.random() * 100) + 1;
      if (_dropPer < 70) {
        if (userInfo.item.indexOf('ph3') == -1) {
          userInfo.item.push('ph3');
        }
        if (userInfo.itemCount.ph3 == undefined) {
          userInfo.itemCount.ph3 = 5;
        } else {
          userInfo.itemCount.ph3 = userInfo.itemCount.ph3 + 5;
        }

        if (userInfo.item.indexOf('pm3') == -1) {
          userInfo.item.push('pm3');
        }
        if (userInfo.itemCount.pm3 == undefined) {
          userInfo.itemCount.pm3 = 5;
        } else {
          userInfo.itemCount.pm3 = userInfo.itemCount.pm3 + 5;
        }

        io.emit(userInfo.username, "[시스템] 축하드립니다 보스를 쓰러뜨려 전리품을 획득 하였습니다.");
        io.emit(userInfo.username + "fight", "[시스템]  축하드립니다 보스를 쓰러뜨려 전리품을 획득 하였습니다.");
      }

      if (_dropPer <= localMonsterList[monNum].dropPer) {
        var dropItems = localMonsterList[monNum].dropItem;
        var itemIndex = Math.floor(Math.random() * dropItems.length);
        var getItem = dropItems[itemIndex];

        if (userInfo.item.indexOf(getItem) == -1) {
          userInfo.item.push(getItem);
        }
        if (userInfo.itemCount[getItem] == undefined) {
          userInfo.itemCount[getItem] = 1;
        } else {
          userInfo.itemCount[getItem] = userInfo.itemCount[getItem] + 1;
        }

        userInfo.item.push(getItem);
        io.emit(userInfo.username, "[시스템] 축하드립니다 보스를 쓰러뜨려 엄청난 전리품을 획득 하였습니다.");
        io.emit(userInfo.username + "fight", "[시스템]  축하드립니다 보스를 쓰러뜨려 엄청난 전리품을 획득 하였습니다.");
      }
    }
  } catch (e) {
    console.log("보스 템드랍  오류");
    console.log(e);
  }
  // 경험치 업데이트


  _account2.default.update({ username: userInfo.username }, { $set: { exp: totalExp, gold: setGold, item: userInfo.item, itemCount: userInfo.itemCount } }, function (err, output) {
    if (err) console.log(err);
    io.emit(userInfo.username, "[시스템] " + localMonsterList[monNum].name + "을 쓰러뜨려 경험치 " + upExp + "과 " + getGold + "골드를 획득 하였습니다.");
    io.emit(userInfo.username + "fight", "[시스템] " + localMonsterList[monNum].name + "을 쓰러뜨려 경험치 " + upExp + "과 " + getGold + "골드를 획득 하였습니다.");
    io.emit(userInfo.username + "전투", "endFight");
    io.emit(userInfo.username + "endFight", "");
  });

  /*파티 경험치 돈 분배*/

  if (info.party == true) {
    for (var memberCount = 0; memberCount < info.partyMember.length; memberCount++) {
      _account2.default.findOne({ username: info.partyMember[memberCount] }, function (err, partyAccount) {
        if (err) throw err;

        var partyMember = eval(partyAccount);
        // 같은 맵에 있으면 분배
        if (partyMember.mapName == info.mapName) {
          var totalPartyExp = partyMember.exp + partyExp;
          var totalPartyGold = partyMember.gold + partyGold;
          _account2.default.update({ username: partyMember.username }, { $set: { exp: totalPartyExp, gold: totalPartyGold } }, function (err, output) {
            if (err) console.log(err);
            io.emit(partyMember.username, "[파티] " + localMonsterList[monNum].name + "을 쓰러뜨려 파티 경험치 " + partyExp + "과 " + partyGold + "골드를 획득 하였습니다.");
          });
        }
      });
    }
  }

  /*파티 경험치 돈 분배 끝*/

  var addLV = Math.floor(userInfo.lv / 10);
  if (addLV == 0) {
    addLV = 1;
  }

  // 레벨업 판단
  if (logB(userInfo.lv, 20) * 1000 * userInfo.lv * userInfo.lv / 6 * addLV < totalExp) {
    var lvUp = userInfo.lv + 1;
    var strUP = userInfo.str + 2;
    var dexUP = userInfo.dex + 2;
    var intUP = userInfo.int + 2;
    var max_mpUP = userInfo.max_mp;
    var max_hpUP = userInfo.max_hp;
    var jobBouns = 3;

    if (userInfo.job2 != undefined) {
      jobBouns = 4;
    }

    if (userInfo.job == "검사" || userInfo.job == "투사" || userInfo.job == "검객") {
      strUP = strUP + jobBouns;
      intUP = intUP - 1;
      max_mpUP += 15;
      max_mpUP += 15;
      max_mpUP += userInfo.lv * 10 * 0.3;
      max_hpUP += userInfo.lv * 10 * 0.9;
    } else if (userInfo.job == "마법사" || userInfo.job == "현자" || userInfo.job == "성자") {
      intUP = intUP + jobBouns;
      dexUP = dexUP - 1;
      max_mpUP += 15;
      max_mpUP += 15;
      max_mpUP += userInfo.lv * 10 * 0.7;
      max_hpUP += userInfo.lv * 10 * 0.5;
    } else if (userInfo.job == "암살자" || userInfo.job == "어쌔신" || userInfo.job == "닌자") {
      dexUP = dexUP + jobBouns;
      strUP = strUP - 1;
      max_mpUP += 15;
      max_mpUP += 15;
      max_mpUP += userInfo.lv * 10 * 0.5;
      max_hpUP += userInfo.lv * 10 * 0.7;
    }
    console.log(userInfo.username + "레벨업");
    _account2.default.update({ username: userInfo.username }, { $set: { lv: lvUp, str: strUP, int: intUP, dex: dexUP, max_hp: max_hpUP, max_mp: max_mpUP, mp: max_mpUP, hp: max_hpUP } }, function (err, output) {
      if (err) console.log(err);
      io.emit("Gchat", "[LEVEL UP!!] [" + userInfo.username + "] 님께서 레벨업 하셨습니다");
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
  restEnd(socket, name);
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
exports.fightUseItem = fightUseItem;