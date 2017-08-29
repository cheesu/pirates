'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fightUseItem = exports.restEnd = exports.rest = exports.useSkill = exports.checkMonster = exports.localMonsterList = exports.run = exports.fight = undefined;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _account = require('../models/account');

var _account2 = _interopRequireDefault(_account);

var _slave = require('../models/slave');

var _slave2 = _interopRequireDefault(_slave);

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
        monObj.sp = []; // 디버프 담아놓는 그릇
        monObj.Aggravation = []; // 기여도 담아놓는 그릇
        monObj.AggravationTaget = []; // 기여도 담아놓는 그릇
        monObj.area = monsters[monCount].mapName + "-" + monLocalArr[localCount];
        monObj.dropItem = monsters[monCount].dropItem;
        monObj.dropPer = monsters[monCount].dropPer;
        monObj.debuff = {};

        if (!initServer) {

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

  _slave2.default.find({ master: info.userName }).exec(function (err, slave) {
    if (err) throw err;
    var slaveInfo = slave;
    slaveInfo = eval(slaveInfo[0]);
    clearInterval(fightInterval[slaveInfo.id + "monsterAttack"]);
    clearInterval(fightInterval[slaveInfo.id + "userAttack"]);
  });

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

        // 소켓 1
        if (userInfo.mount.w.socket1 != undefined && userInfo.mount.w.socket1.name != undefined) {
          if (userInfo.mount.w.socket1.option.option == "casting") {
            coolDown = coolDown + 1000 / 100 * userInfo.mount.w.socket1.option.per;
          }

          if (coolDown > 950) {
            coolDown = 950;
          }
        }

        // 소켓2
        if (userInfo.mount.w.socket2 != undefined && userInfo.mount.w.socket2.name != undefined) {
          if (userInfo.mount.w.socket2.option.option == "casting") {
            coolDown = coolDown + 1000 / 100 * userInfo.mount.w.socket2.option.per;
          }
          if (coolDown > 950) {
            coolDown = 950;
          }
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

            // 소켓 무기 공격력 추가
            if (userInfo.mount.w.socket1 != undefined && userInfo.mount.w.socket1.name != undefined) {
              wAP = wAP + userInfo.mount.w.socket1.min;
            }

            if (userInfo.job2 == '검의 달인') {
              var passive = Math.floor(Math.random() * 1000) + 1;
              if (userInfo.str > passive) {
                wAP = wAP * 2;
                io.emit(info.ch + "fight", "[passive] 검의 달인 " + userInfo.username + "님의 " + userInfo.mount.w.name + "에서 푸른 검기가 생성됩니다. 공격력이 증가 합니다.");
              }
            }

            /*특수 스킬 */
            if (skillInfo.sp != undefined) {
              /***힐***/
              if (skillInfo.sp.type == 'heal') {
                var memberCount;

                (function () {
                  var healUp = (userInfo.int + wAP) * skillInfo.sp.val;
                  for (memberCount = 0; memberCount < info.partyMember.length; memberCount++) {
                    // 같은 맵에 있으면 분배
                    _account2.default.findOne({ username: info.partyMember[memberCount] }, function (err, partyAccount) {
                      if (err) throw err;
                      var partyMember = eval(partyAccount);
                      if (partyMember.mapName == info.mapName) {

                        if (fightInterval[partyMember.username + "HP"] + healUp > partyMember.max_hp) {
                          healUp = partyMember.max_hp - fightInterval[partyMember.username + "HP"];
                        }

                        fightInterval[partyMember.username + "HP"] = fightInterval[partyMember.username + "HP"] + healUp;
                        io.emit(partyMember.username + "userHP", fightInterval[partyMember.username + "HP"] + "-" + partyMember.max_hp);
                        io.emit(partyMember.username + "fight", "[skill] " + userInfo.username + "님이 사랑의 힐을 주었습니다. 체력이 [" + healUp + "] 회복 됩니다.");
                      }
                    });
                  }
                })();
              }
              /***힐 끝***/
              else if (skillInfo.sp.type == 'berserker') {
                  if (fightInterval[userInfo.username + "berserker"] != true) {
                    fightInterval[userInfo.username + "berserker"] = true;
                    setTimeout(function () {
                      io.emit(userInfo.username + "fight", "[skill]" + skillInfo.name + "의 효과가 끝났습니다.");
                      fightInterval[userInfo.username + "berserker"] = false;
                    }, 1000 * skillInfo.sp.time);
                  } else {
                    io.emit(userInfo.username + "fight", "[skill] 이미 동일한 스킬이 걸려 있습니다.");
                  }
                }
                /***공깍***/
                else {

                    for (var _spCount = 0; _spCount < localMonsterList[monNum].sp.length; _spCount++) {
                      if (localMonsterList[monNum].sp[_spCount].type == skillInfo.sp.type) {
                        io.emit(userInfo.username + "fight", "[skill] 이미 동일한 스킬이 걸려 있습니다.");
                        io.emit(userInfo.username + "[SkillEnd]", "");
                        clearInterval(fightInterval[userInfo.username + "skillInterval"]);
                        fightInterval[userInfo.username + "CastingCount"] = null;
                        fightInterval[userInfo.username + "skillInterval"] = null;
                        fightInterval[userInfo.username + "skill"] = false;
                        return false;
                      }
                    }
                    var spIndex = localMonsterList[monNum].sp.length;
                    localMonsterList[monNum].sp.push(skillInfo.sp);
                    setTimeout(function () {
                      localMonsterList[monNum].sp.splice(spIndex, 1);
                      io.emit(info.ch + "fight", "[skill]" + skillInfo.name + "의 효과가 끝났습니다.");
                    }, 1000 * skillInfo.sp.time);
                  }
              /***공깍 끝***/

              var skillAttackMsg = "[skill]" + skillInfo.attackMsg;
              io.emit(info.ch + "fight", skillAttackMsg);

              io.emit(userInfo.username + "[SkillEnd]", "");
              clearInterval(fightInterval[userInfo.username + "skillInterval"]);
              fightInterval[userInfo.username + "CastingCount"] = null;
              fightInterval[userInfo.username + "skillInterval"] = null;
              fightInterval[userInfo.username + "skill"] = false;
              return false;
            }
            /*특수 스킬 끝*/
            console.log("특수 스킬 끝");

            /*특수스킬 방깍*/
            var downDpVal = 0;
            for (var spCount = 0; spCount < localMonsterList[monNum].sp.length; spCount++) {
              if (localMonsterList[monNum].sp[spCount].type == "downDp") {
                var skillVal = localMonsterList[monNum].sp[spCount].val;
                downDpVal = localMonsterList[monNum].dp / 100 * skillVal;
              }
            }

            var lvGap = (localMonsterList[monNum].lv - userInfo.lv) * 2;
            if (lvGap < -10) {
              lvGap = -10;
            }
            var lvBonus = userInfo.lv / (20 + lvGap);

            var buffDmg = 1;
            if (fightInterval[userInfo.username + "berserker"]) {
              buffDmg = 2;
            }

            if (userInfo.job == '마법사') {
              buffDmg = 1.2;
            }
            if (userInfo.job == '깨달은 현자') {
              buffDmg = 1.4;
            }

            var ring = userInfo.mount.r;
            var necklace = userInfo.mount.n;
            var upSkillDmg = 1;
            // 목걸이 추가 뎀지
            if (necklace != undefined && necklace != null && necklace != "") {
              wAP = wAP + necklace.min;
              if (necklace.option.option == "offerings") {
                fightInterval[info.username + "HP"] = fightInterval[info.username + "HP"] - necklace.option.hp;
                upSkillDmg = upSkillDmg + necklace.option.per / 100;
              }
            }

            var dmg = (userInfo.int + userInfo.str + (userInfo.int + userInfo.str + wAP) * lvBonus) * skillInfo.dmg * buffDmg - (localMonsterList[monNum].dp - downDpVal);

            var targetCurrentHP = 9999;
            var criCount = 1;

            // 소켓 스킬공격 옵션
            // 소켓 2 효과 발동
            if (userInfo.mount.w.socket2 != undefined && userInfo.mount.w.socket2.name != undefined) {
              var socketPer = Math.floor(Math.random() * 100);
              // 확률로 엠피 회복
              if (userInfo.mount.w.socket2.option.option == "healM" && userInfo.mount.w.socket2.option.per > socketPer) {
                var healMP = userInfo.max_mp / 100 * 30;
                healMP = Math.round(healMP);
                fightInterval[userInfo.username + "MP"] = fightInterval[userInfo.username + "MP"] + healMP;
                if (fightInterval[userInfo.username + "MP"] > userInfo.max_mp) {
                  fightInterval[userInfo.username + "MP"] = userInfo.max_mp;
                }
                io.emit(userInfo.username + "userMP", fightInterval[userInfo.username + "MP"] + "-" + userInfo.max_mp);
              }
            }

            // hit 연타 시작
            for (var count = 0; count < skillInfo.hit; count++) {

              if (userInfo.job != "암살자") {
                dmg = (userInfo.int + userInfo.str + (userInfo.int + userInfo.str + wAP) * lvBonus) * skillInfo.dmg * buffDmg - (localMonsterList[monNum].dp - downDpVal);
              }
              if (userInfo.job == "암살자") {
                dmg = (userInfo.int + userInfo.str + userInfo.dex + (userInfo.int + userInfo.str + userInfo.dex + wAP) * lvBonus) * skillInfo.dmg * buffDmg - (localMonsterList[monNum].dp - downDpVal);
              }

              // 소켓 스킬공격 옵션
              // 소켓 2 효과 발동
              if (userInfo.mount.w.socket2 != undefined && userInfo.mount.w.socket2.name != undefined) {
                var _socketPer = Math.floor(Math.random() * 100);
                if (userInfo.mount.w.socket2.option.option == "normalM_skill" && localMonsterList[monNum].type > "normal") {
                  dmg = dmg + dmg / 100 * userInfo.mount.w.socket2.option.per;
                }
              }

              dmg = Math.round(dmg * upSkillDmg);
              var _skillAttackMsg = "";

              if (lvGap < 0) {
                lvGap = 0;
              }

              var critical = checkCritical(userInfo.dex - lvGap * 15);
              var upCriDmg = 1.7;
              var result = "";

              if (userInfo.job == "암살자") {
                upCriDmg = upCriDmg + 0.2;
              }

              if (necklace != undefined && necklace != null && necklace != "") {
                if (necklace.option.option == "upCriDmg") {
                  upCriDmg = upCriDmg + necklace.option.per / 100;
                }
              }

              if (critical) {
                criCount++;
                dmg = dmg * upCriDmg;
                dmg = Math.round(dmg);
                _skillAttackMsg = "[skill]" + skillInfo.attackMsg + "[" + dmg + "]-[Critical!!!!]";
                localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;
                io.emit(userInfo.username + "[Cri]", "");
              } else {
                _skillAttackMsg = "[skill]" + skillInfo.attackMsg + "[" + dmg + "]";
                localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;
              }

              targetCurrentHP = localMonsterList[monNum].hp;
              if (localMonsterList[monNum].hp < 0) {
                targetCurrentHP = 0;
              }

              // 피흡 마나흡 옵션
              if (ring != undefined && ring != null && ring != "") {
                if (ring.option.option == 'lifeDrain') {
                  var drainHP = dmg / 100 * ring.option.per;
                  drainHP = Math.round(drainHP);
                  fightInterval[userInfo.username + "HP"] = fightInterval[userInfo.username + "HP"] + drainHP;

                  if (fightInterval[userInfo.username + "HP"] > userInfo.max_hp) {
                    fightInterval[userInfo.username + "HP"] = userInfo.max_hp;
                  }
                } else if (ring.option.option == 'manaDrain') {
                  var drainMP = dmg / 100 * ring.option.per;
                  drainMP = Math.round(drainMP);
                  fightInterval[userInfo.username + "MP"] = fightInterval[userInfo.username + "MP"] + drainMP;
                  io.emit(userInfo.username + "userMP", fightInterval[userInfo.username + "MP"] + "-" + userInfo.max_mp);
                  if (fightInterval[userInfo.username + "MP"] > userInfo.max_mp) {
                    fightInterval[userInfo.username + "MP"] = userInfo.max_mp;
                  }
                }
              }

              /*어그로 */
              var aggro = localMonsterList[monNum].Aggravation; // 어그로
              if (aggro.length == 0) {
                // 선빵 친놈 등록
                var _aggroObj = {};
                _aggroObj.name = userInfo.username;
                _aggroObj.dmg = dmg;

                if (userInfo.job == '검사') {
                  _aggroObj.dmg = _aggroObj.dmg * 2.5;
                }

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
              io.emit(info.ch + "fight", _skillAttackMsg);
              //  io.emit(info.ch+"fight", monHPMsg);
            }

            // 디버프 옵션
            // 소켓 1 효과 발동
            if (userInfo.mount.w.socket1 != undefined && userInfo.mount.w.socket1.name != undefined) {
              var _socketPer2 = Math.floor(Math.random() * 100);

              if (userInfo.mount.w.socket1.option.option == "stone" && userInfo.mount.w.socket1.option.per > _socketPer2) {

                localMonsterList[monNum].debuff = { name: "stone" };

                setTimeout(function () {
                  localMonsterList[monNum].debuff = {};
                  io.emit(info.ch + "fight", "석화가 해제 되었습니다.");
                }, 1000 * userInfo.mount.w.socket1.option.time);
              }
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

              expLevelup(userInfo, io, monNum, info, "스킬", "user"); // 렙업인지 경치만 획득인지 계산한다

              _account2.default.update({ username: userInfo.username }, { $set: { hp: fightInterval[userInfo.username + "HP"], mp: fightInterval[userInfo.username + "MP"] } }, function (err, output) {});
            }

            io.emit(userInfo.username + "userHP", fightInterval[userInfo.username + "HP"] + "-" + userInfo.max_hp);
            io.emit(userInfo.username + "currentUserHP", fightInterval[userInfo.username + "HP"] + "-" + userInfo.max_hp);
            io.emit(userInfo.username + "[SkillEnd]", "");
            if (fightInterval[userInfo.username + "MP"] > userInfo.max_mp) {
              fightInterval[userInfo.username + "MP"] = userInfo.max_mp;
            }
            _account2.default.update({ username: userInfo.username }, { $set: { hp: fightInterval[userInfo.username + "HP"], mp: fightInterval[userInfo.username + "MP"] } }, function (err, output) {});

            criCount = 0;
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
  _account2.default.find({ username: info.userName }).exec(function (err, account) {
    if (err) throw err;
    var userInfo = account;
    userInfo = eval(userInfo[0]);
    var monNum = checkFightMonster(info.ch);

    if (monNum == null) {
      return false;
    }

    /*************노예가 공격*************/
    _slave2.default.find({ master: info.userName }).exec(function (err, slave) {
      if (err) throw err;

      if (slave == "" || slave == null || slave == undefined) {
        return false;
      }

      var slaveInfo = slave;
      slaveInfo = eval(slaveInfo[0]);

      if (fightInterval[slaveInfo.id + "fighting"]) {
        fightInterval[slaveInfo.id + "fighting"] = null;
        console.log("노예가 이미 전투중임");
        return false;
      }

      // 유저 공격 속도
      var attackSpeed = 1800 - slaveInfo.dex * 3;
      if (attackSpeed < 800) {
        attackSpeed = 800;
      }

      fightInterval[slaveInfo.id + "fighting"] = true; // 몬스터 처치후 발동되는 인터벌 막기위한 변수

      // 노예 공격 인터벌
      fightInterval[slaveInfo.id + "userAttack"] = setInterval(function () {

        // 몬스터 처치후 발동되는 인터벌 막기위한 판단
        if (!fightInterval[slaveInfo.id + "fighting"]) {
          console.log(slaveInfo.id + "전투 중단");
          return false;
        }

        console.log(slaveInfo.name + "공격");

        // 무기 이름
        var wName = slaveInfo.mount.w.name;
        if (wName == NaN || wName == null || wName == "" || wName == undefined) {
          wName = "맨손";
        }

        // 무기 최소 데미지
        var wMinAP = slaveInfo.mount.w.min;
        if (wMinAP == NaN || wMinAP == null || wMinAP == "" || wMinAP == undefined) {
          wMinAP = 0;
        }

        // 무기 최대 데미지
        var wMaxAP = slaveInfo.mount.w.max;
        if (wMaxAP == NaN || wMaxAP == null || wMaxAP == "" || wMaxAP == undefined) {
          wMaxAP = 0;
        }

        var randomAP = Math.floor(Math.random() * wMaxAP) + 1;

        var wAP = wMinAP + randomAP;

        if (slaveInfo.job2 == '검의 달인') {
          var passive = Math.floor(Math.random() * 1000) + 1;
          if (slaveInfo.str > passive) {
            wAP = wAP * 2;
            io.emit(info.ch + "fight", "[passive] 검의 달인 " + slaveInfo.name + "님의 " + slaveInfo.mount.w.name + "에서 푸른 검기가 생성됩니다. 공격력이 증가 합니다.");
          }
        }

        console.log("무기 공격력" + wMinAP + "+" + randomAP + "=" + wAP);
        var lvGap = localMonsterList[monNum].lv - slaveInfo.lv;
        if (lvGap < -4) {
          lvGap = -4;
        }
        var lvBonus = slaveInfo.lv / (20 + lvGap);

        var dmg = slaveInfo.int + slaveInfo.str + (slaveInfo.int + slaveInfo.str + wAP) * lvBonus - localMonsterList[monNum].dp;

        /*스킬 발동!*/
        var skillRandom = Math.floor(Math.random() * 100) + 1;
        var skillPer = slaveInfo.lv / 4;
        console.log("노예 스킬 랜덤:" + skillRandom + "노예 스킬 퍼센트:" + skillPer);
        if (skillRandom < skillPer) {
          console.log("노예 스킬 발동 :");

          var skillCount = slaveInfo.chat.length; // 보유 스킬 개수
          console.log("노예 스킬 개수:" + skillCount);
          if (skillCount != 0) {
            var randomNo = Math.floor(Math.random() * skillCount);
            var slaveSkill = slaveInfo.skill[randomNo];
            var skillMsg = "";
            var skillAddLvDmg = slaveInfo.lv / 10 + 1;
            var skillDmg = 1;
            console.log("노예스킬 랜덤 번호:" + randomNo);
            console.log(slaveSkill);
            if (slaveSkill == "그림자 기습") {
              skillDmg = 6;
              skillMsg = slaveInfo.name + "이(가) 적의 등뒤로 돌아 강력한 일격을 날립니다. ";
            } else if (slaveSkill == "매직 에로우") {
              skillDmg = 6;
              skillMsg = slaveInfo.name + "이(가) 마나를 응축해 푸른색 화살을 날립니다. ";
            } else if (slaveSkill == "크러쉬") {
              skillDmg = 3;
              skillMsg = slaveInfo.name + "이(가) 온몸의 힘을 모아 적을 부숴버릴듯 공격 합니다. ";
            } else if (slaveSkill == "힐") {
              skillDmg = 0;
              var healUp = slaveInfo.int * (slaveInfo.lv / 2);
              // 같은 맵에 있으면 분배
              _account2.default.findOne({ username: slaveInfo.master }, function (err, masterAccount) {
                if (err) throw err;
                var masterInfo = eval(masterAccount);
                if (masterInfo.mapName == info.mapName) {
                  if (fightInterval[masterInfo.username + "HP"] + healUp > masterInfo.max_hp) {
                    healUp = masterInfo.max_hp - fightInterval[masterInfo.username + "HP"];
                  }
                  fightInterval[masterInfo.username + "HP"] = fightInterval[masterInfo.username + "HP"] + healUp;
                  io.emit(masterInfo.username + "userHP", fightInterval[masterInfo.username + "HP"] + "-" + masterInfo.max_hp);
                  io.emit(masterInfo.username + "fight", "[skill] " + slaveInfo.name + "이(가) 사랑의 힐을 주었습니다. 체력이 [" + healUp + "] 회복 됩니다.");
                }
              });

              return false;
            }

            dmg = (slaveInfo.int + slaveInfo.str + (slaveInfo.int + slaveInfo.str + wAP) * lvBonus) * skillDmg * skillAddLvDmg - localMonsterList[monNum].dp;
            io.emit(info.ch + "fight", "[skill]" + skillMsg);
          }
        }
        /*스킬 발동 종료*/

        dmg = Math.round(dmg);

        if (dmg < 0) {
          dmg = 1;
        }

        if (lvGap < 1) {
          lvGap = 1;
        }

        var critical = checkCritical(slaveInfo.dex / lvGap);
        var upCriDmg = 1.7;
        var result = "";

        if (critical) {
          dmg = dmg * upCriDmg;
          dmg = Math.round(dmg);
          result = "Critical!!!! " + slaveInfo.name + "이(가) " + info.target + "에게 " + wName + "을(를) 휘둘러" + dmg + "의 공격을 하였습니다.";
          localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;
          io.emit(slaveInfo.name + "[Cri]", "");
        } else {
          result = slaveInfo.name + "이(가) " + info.target + "에게 " + wName + "을(를) 휘둘러" + dmg + "의 공격을 하였습니다.";
          localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;
        }

        var aggro = localMonsterList[monNum].Aggravation; // 어그로

        if (aggro.length == 0) {
          // 선빵 친놈 등록
          var _aggroObj = {};
          _aggroObj.name = slaveInfo.name;
          _aggroObj.dmg = dmg;
          localMonsterList[monNum].Aggravation.push(_aggroObj);
        } else {

          var checkAggro = false;
          // 이미 치고 있을떄 뎀지 누적
          for (var aggrocount = 0; aggrocount < aggro.length; aggrocount++) {
            if (aggro[aggrocount].name == slaveInfo.name) {
              localMonsterList[monNum].Aggravation[aggrocount].dmg = localMonsterList[monNum].Aggravation[aggrocount].dmg + dmg;
              checkAggro = true;
            }
          }

          // 딴놈이 치고 있을떄 들어옴
          if (!checkAggro) {
            var _aggroObj3 = {};
            _aggroObj3.name = slaveInfo.name;
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
        targetCurrentHP = Math.round(targetCurrentHP);
        io.emit(info.ch + "monsterHP", targetCurrentHP + "-" + localMonsterList[monNum].maxHP);

        // 몬스터 처치
        if (localMonsterList[monNum].hp <= 0) {
          fightInterval[slaveInfo.id + "fighting"] = false; // 몬스터 처치후 발동되는 인터벌 막기위한 변수
          clearInterval(fightInterval[slaveInfo.id + "monsterAttack"]);
          clearInterval(fightInterval[slaveInfo.id + "userAttack"]);
          // localMonsterList[monNum].exist = false;

          expLevelup(slaveInfo, io, monNum, info, "평타", "slave"); // 렙업인지 경치만 획득인지 계산한다
        }
      }, attackSpeed);
    });
    /**************노예가 공격 끝******************/

    if (!info.fighting && (fightInterval[userInfo.username + "fighting"] == undefined || !fightInterval[userInfo.username + "fighting"])) {
      // 몬스터가 유저를 공격하는 인터벌
      fightInterval[userInfo.username + "fighting"] = true; // 몬스터 처치후 발동되는 인터벌 막기위한 변수
      fightInterval[userInfo.username + "HP"] = userInfo.hp;

      var distanceCount = 2; // 원거리 캐릭은 2타를 맞지 않는다.


      // 몬스터가 공격 인터벌 시작
      fightInterval[userInfo.username + "monsterAttack"] = setInterval(function () {

        // 석화
        if (localMonsterList[monNum].debuff.name == "stone") {
          io.emit(info.ch + "fight", "[피격] " + localMonsterList[monNum].name + "이(가) '석화되어 움직이지 못합니다.");
          return false;
        }

        //어그로 기여도 계산

        if (localMonsterList[monNum].Aggravation.length != 0) {
          var aggro = localMonsterList[monNum].Aggravation;
          var maxDmg = 0;
          var maxCount = 0;
          for (var aggroCount = 0; aggroCount < aggro.length; aggroCount++) {
            if (aggro[aggroCount].dmg > maxDmg && fightInterval[userInfo.username + "fighting"]) {
              maxDmg = aggro[aggroCount].dmg;
              maxCount = aggroCount;
            }
          }
          if (aggro[maxCount].name != userInfo.username) {
            return false;
          }
        }

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

        var dpBo = userInfo.lv / 2;
        randomDP = randomDP + randomDP / 100 * dpBo;

        var lvGap = localMonsterList[monNum].lv - userInfo.lv;
        if (lvGap < 0) {
          lvGap = 1;
        }

        lvGap = lvGap / 10;

        var reDmg = localMonsterList[monNum].ap + localMonsterList[monNum].ap * lvGap - randomDP;

        if (userInfo.username == "1111" || userInfo.username == "2222") {
          reDmg = reDmg + reDmg * 1.2;
        }

        var bossCri = 0;
        if (localMonsterList[monNum].type == "boss") {
          bossCri = 80;
        }

        var critical = checkCritical(lvGap + bossCri);
        var result = "";
        if (critical) {
          reDmg = reDmg * 1.7;
          reDmg = Math.round(reDmg);
        }

        if (localMonsterList[monNum].name == "아나히타") {
          if (localMonsterList[monNum].hp < 10000000 && localMonsterList[monNum].hp > 5000000) {
            reDmg = reDmg * 2;
            io.emit(info.ch + "fight", "[피격] '이.. 이 어리석은 인간들이!!!!! ' 아나히타의 분노가 모두를 업압 합니다.");
          }
        }

        if (localMonsterList[monNum].name == "성기사 정찰대 대장") {
          if (localMonsterList[monNum].hp < 1500000 && localMonsterList[monNum].hp > 800000) {
            reDmg = reDmg * 1.3;
            io.emit(info.ch + "fight", "[피격] '지옥으로 떨어져라 버리지들아!' 성기사 정찰대 대장의 눈이 붉게 변합니다.");
          }
        }

        if (localMonsterList[monNum].name == "펜릴 기사단장 존세나" || localMonsterList[monNum].name == "신사르 기사단장 지이예") {
          if (localMonsterList[monNum].hp < 15000000 && localMonsterList[monNum].hp > 100) {
            reDmg = reDmg * 1.3;
            io.emit(info.ch + "fight", "[피격] '더이상 봐줄 수 없겠어!!!' 분노로 가득차 붉게 변합니다.");
          }
        }

        /*특수스킬 공깍*/
        for (var spCount = 0; spCount < localMonsterList[monNum].sp.length; spCount++) {
          if (localMonsterList[monNum].sp[spCount].type == "downAp") {
            var skillVal = localMonsterList[monNum].sp[spCount].val;
            reDmg = Math.floor(reDmg * ((100 - skillVal) / 100));
          }
        }

        if (reDmg < 0) {
          reDmg = 1;
        }
        reDmg = Math.round(reDmg);
        // 패시브 발동 확률(렙 격차 따라서 발동확률은 낮아진다.)
        var passive = Math.floor(Math.random() * 1000) + lvGap * 10;

        if (userInfo.job2 == '깨달은 현자' && fightInterval[userInfo.username + "skill"]) {
          reDmg = reDmg * 0.8;
          reDmg = Math.round(reDmg);
          io.emit(userInfo.username + "fight", "[passive] 캐스팅중인 깨달은 현자  " + userInfo.username + "님의 " + userInfo.mount.w.name + "이(가) 빛이나며 보호막이 생성됩니다. 주문보호의 영향으로 데미지가 감소합니다.");
        }

        if (userInfo.job2 == '검의 달인') {
          var berserker = false;
          if (fightInterval[userInfo.username + "berserker"]) {
            berserker = true;
            reDmg = 1;
          }

          var passiveLimit = userInfo.str;
          if (passiveLimit > 500) {
            passiveLimit = 500;
          }

          if (passiveLimit > passive) {
            reDmg = 0;
            io.emit(userInfo.username + "fight", "[passive] 검의 달인 " + userInfo.username + "님의 " + userInfo.mount.w.name + "이(가) '카아아아앙!' 하는 금속 마찰음을 내며 적의 공격을 상쇄합니다");
          }
        }

        if (userInfo.job2 == '그림자 살귀') {
          var _passiveLimit = userInfo.dex / 3;
          if (_passiveLimit > 250) {
            _passiveLimit = 250;
          }
          if (_passiveLimit > passive) {
            reDmg = 0;
            io.emit(userInfo.username + "fight", "[passive] 그림자 살귀 " + userInfo.username + "님이 어둠속으로 몸을 숨겨 적의 공격을 회피 합니다.");
          }
        }

        if (userInfo.job2 == '그림자 살귀') {
          var _passiveLimit2 = userInfo.dex;
          if (_passiveLimit2 > 500) {
            _passiveLimit2 = 500;
          }
          if (_passiveLimit2 > passive) {
            localMonsterList[monNum].hp = localMonsterList[monNum].hp - reDmg * 10;
            reDmg = Math.round(reDmg);
            io.emit(userInfo.username + "fight", "[passive] 그림자 살귀 " + userInfo.username + "님의 " + userInfo.mount.w.name + "이(가) 적의 공격을 타고 흘러 반격합니다. [" + reDmg * 10 + "]");
          }
        }

        if (userInfo.job == '검사') {
          var _reDmg = _reDmg * 0.85;
        }
        reDmg = Math.round(reDmg);
        try {
          if (userInfo.mount.d.type == "unique") {
            var ud = userInfo.mount.d;
            var active = Math.floor(Math.random() * 100) + 1;
            // 확률성 아이템
            if (active <= ud.option.per) {
              /*if(ud.option.option=="heal"){
                userInfo.hp = userInfo.max_hp;
                fightInterval[userInfo.username+"HP"] = userInfo.max_hp;
                userHP = userInfo.max_hp;
                io.emit(userInfo.username+"fight", "[item] "+ud.option.msg);
              }
              else */
              if (ud.option.option == "block") {
                userInfo.hp += reDmg;
                fightInterval[userInfo.username + "HP"] += reDmg;
                userHP += reDmg;
                reDmg = 0;
                io.emit(userInfo.username + "fight", "[item] " + ud.option.msg);
              } else if (ud.option.option == "counter") {
                localMonsterList[monNum].hp = localMonsterList[monNum].hp - reDmg * 10;
                io.emit(userInfo.username + "fight", "[item] " + ud.option.msg + "[" + reDmg * 10 + "]");
              } else if (ud.option.option == "downDmg") {
                reDmg = reDmg / 100 * userInfo.mount.d.option.val;
                io.emit(userInfo.username + "fight", "[item] " + ud.option.msg);
              }
            }

            //고정 아이템
            if (ud.option.option == "conversionMP") {
              var conversionMP = reDmg / 100 * ud.option.per;
              conversionMP = Math.floor(conversionMP);
              fightInterval[userInfo.username + "MP"] = fightInterval[userInfo.username + "MP"] + conversionMP;
              io.emit(userInfo.username + "userMP", fightInterval[userInfo.username + "MP"] + "-" + userInfo.max_mp);
              io.emit(userInfo.username + "fight", "[item] " + ud.option.msg + "[" + conversionMP + "]");
            }
          }
        } catch (e) {
          console.log("유닉 방어구 발동 오류");
          console.log(e);
        }

        reDmg = Math.round(reDmg);

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

          if (critical) {
            io.emit(info.ch + "fight", "[피격]" + localMonsterList[monNum].attackMsg + "강력한 일격!!!!!! " + userInfo.username + "님이[" + reDmg + "]의 피해를 입었습니다.[CRITICAL!!!]");
          } else {
            io.emit(info.ch + "fight", "[피격]" + localMonsterList[monNum].attackMsg + " " + userInfo.username + "님이[" + reDmg + "]의 피해를 입었습니다.");
          }

          // 원거리 캐릭 2타 무효
          if (distanceCount > 0 && (userInfo.job == "마법사" || userInfo.job == "마법사")) {
            reDmg = 0;
            io.emit(userInfo.username + "fight", "[passive] " + localMonsterList[monNum].name + " 멀리 떨어져있는 " + userInfo.username + " 님에게 공격을 가하지 못했습니다.");
            distanceCount--;
          }

          io.emit(userInfo.username + "userHP", userHP + "-" + userInfo.max_hp);
          io.emit(userInfo.username + "currentUserHP", userHP + "-" + userInfo.max_hp);

          // 맞고 디졌을떄
          if (userHP <= 0) {
            fightInterval[userInfo.username + "fighting"] = false;
            clearInterval(fightInterval[userInfo.username + "monsterAttack"]);
            clearInterval(fightInterval[userInfo.username + "userAttack"]);

            _slave2.default.find({ master: info.userName }).exec(function (err, slave) {
              if (err) throw err;
              var slaveInfo = slave;
              slaveInfo = eval(slaveInfo[0]);
              clearInterval(fightInterval[slaveInfo.id + "monsterAttack"]);
              clearInterval(fightInterval[slaveInfo.id + "userAttack"]);
            });

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
        // 소켓 무기 공격력 추가
        if (userInfo.mount.w.socket1 != undefined && userInfo.mount.w.socket1.name != undefined) {
          wAP = wAP + userInfo.mount.w.socket1.min;
        }
        var ring = userInfo.mount.r;
        var necklace = userInfo.mount.n;
        // 목걸이 추가 뎀지
        if (necklace != undefined && necklace != null && necklace != "") {
          wAP = wAP + necklace.min;
        }

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

        var buffDmg = 1;
        if (fightInterval[userInfo.username + "berserker"]) {
          buffDmg = 1;
        }

        var dmg = (userInfo.int + userInfo.str + (userInfo.int + userInfo.str + wAP) * lvBonus) * buffDmg - localMonsterList[monNum].dp;

        /*특수스킬 방깍*/
        for (var spCount = 0; spCount < localMonsterList[monNum].sp.length; spCount++) {
          if (localMonsterList[monNum].sp[spCount].type == "downDp") {
            var skillVal = localMonsterList[monNum].sp[spCount].val;
            dmg = userInfo.int + userInfo.str + (userInfo.int + userInfo.str + wAP) * lvBonus - localMonsterList[monNum].dp * ((100 - skillVal) / 100);
          }
        }

        // 피흡 마나흡 옵션
        if (ring != undefined && ring != null && ring != "") {
          if (ring.option.option == 'lifeDrain') {
            var drainHP = dmg / 100 * ring.option.per;
            drainHP = Math.round(drainHP);
            fightInterval[userInfo.username + "HP"] = fightInterval[userInfo.username + "HP"] + drainHP;

            if (fightInterval[userInfo.username + "HP"] > userInfo.max_hp) {
              fightInterval[userInfo.username + "HP"] = userInfo.max_hp;
            }
            io.emit(userInfo.username + "userHP", fightInterval[userInfo.username + "HP"] + "-" + userInfo.max_hp);
          } else if (ring.option.option == 'manaDrain') {
            var drainMP = dmg / 100 * ring.option.per;
            drainMP = Math.round(drainMP);
            fightInterval[userInfo.username + "MP"] = fightInterval[userInfo.username + "MP"] + drainMP;

            if (fightInterval[userInfo.username + "MP"] > userInfo.max_mp) {
              fightInterval[userInfo.username + "MP"] = userInfo.max_mp;
            }
            io.emit(userInfo.username + "userMP", fightInterval[userInfo.username + "MP"] + "-" + userInfo.max_mp);
          }
        }

        dmg = Math.round(dmg);

        if (dmg < 0) {
          dmg = 1;
        }

        if (lvGap < 1) {
          lvGap = 1;
        }

        var critical = checkCritical(userInfo.dex / lvGap);
        var upCriDmg = 1.7;
        var result = "";

        if (necklace != undefined && necklace != null && necklace != "") {
          if (necklace.option.option == "upCriDmg") {
            upCriDmg = upCriDmg + necklace.option.per / 100;
          }
        }
        if (critical) {
          dmg = dmg * upCriDmg;
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
            var _aggroObj4 = {};
            _aggroObj4.name = userInfo.username;
            _aggroObj4.dmg = dmg;
            localMonsterList[monNum].Aggravation.push(_aggroObj4);
          }
        }

        var targetCurrentHP = localMonsterList[monNum].hp;
        if (localMonsterList[monNum].hp < 0) {
          targetCurrentHP = 0;
        }

        //  let monHPMsg = localMonsterList[monNum].name+"의 남은 체력 : "+targetCurrentHP;
        io.emit(info.ch + "fight", result);
        //  io.emit(info.ch+"fight", monHPMsg);
        targetCurrentHP = Math.round(targetCurrentHP);
        io.emit(info.ch + "monsterHP", targetCurrentHP + "-" + localMonsterList[monNum].maxHP);

        if (localMonsterList[monNum].name == "성기사 정찰대 대장") {
          if (localMonsterList[monNum].hp < 600000) {
            localMonsterList[monNum].dp = localMonsterList[monNum].dp + 50;
            io.emit(info.ch + "fight", "[피격] '그분께서 나를 지키신다!!' 흰 빛이 성기사 정찰대 대장의 주변을 감쌉니다. 성기사 정찰대 대장의 방어력이 [50] 상승합니다.");
          }
        }

        // 몬스터 처치
        if (localMonsterList[monNum].hp <= 0) {
          fightInterval[userInfo.username + "fighting"] = false; // 몬스터 처치후 발동되는 인터벌 막기위한 변수
          clearInterval(fightInterval[userInfo.username + "monsterAttack"]);
          clearInterval(fightInterval[userInfo.username + "userAttack"]);
          localMonsterList[monNum].exist = false;
          io.emit(info.ch, "[monsterDieMsg]" + localMonsterList[monNum].dieMsg);
          io.emit(info.ch + "fight", "[monsterDieMsg]" + localMonsterList[monNum].dieMsg);
          expLevelup(userInfo, io, monNum, info, "평타", "user"); // 렙업인지 경치만 획득인지 계산한다
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
function expLevelup(userInfo, io, monNum, info, kind, userSlave) {

  console.log(userSlave + "렙업 판단 시작");

  //어그로 기여도 계산
  var aggro = localMonsterList[monNum].Aggravation;
  var myDmg = 0;
  for (var aggroCount = 0; aggroCount < aggro.length; aggroCount++) {
    if (aggro[aggroCount].name == userInfo.username) {
      myDmg = aggro[aggroCount].dmg;
    }
  }

  if (myDmg < 1) {
    myDmg = 1;
  }

  if (myDmg > localMonsterList[monNum].maxHP) {
    myDmg = localMonsterList[monNum].maxHP;
  }

  var aggroPer = myDmg / localMonsterList[monNum].maxHP * 100;

  // 경험치 계산

  var upExp = Math.round(localMonsterList[monNum].exp * aggroPer / 100);

  if (userSlave == "slave") {
    upExp = Math.round(upExp + localMonsterList[monNum].exp * 0.4);
  }

  var random = Math.floor(Math.random() * 100) + 1;
  var getGold = Math.round((localMonsterList[monNum].gold + random) * aggroPer / 100);

  var gap = userInfo.lv - localMonsterList[monNum].lv;
  if (gap > 5) {
    upExp = Math.round(upExp / 3);
    getGold = Math.round(getGold / 3);
  }

  var partyExp = 0;
  var partyGold = 0;

  if (info.party) {
    upExp = Math.round(upExp / 100 * 70);
    partyExp = Math.round(localMonsterList[monNum].exp / 100 * 40);
    getGold = Math.round(getGold / 100 * 70);
    partyGold = Math.round((localMonsterList[monNum].gold + random) / 100 * 40);

    partyExp = Math.round(partyExp / info.partyMember.length);
    partyGold = Math.round(partyGold / info.partyMember.length);
  }

  var totalExp = Math.round(userInfo.exp + upExp);
  var setGold = Math.round(userInfo.gold + getGold);

  try {
    var dropPer = Math.floor(Math.random() * 1000) + 1;

    if (userInfo.username == "1111" || userInfo.username == "2222") {
      dropPer = dropPer / 2;
    }

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

    if (localMonsterList[monNum].dropPer != undefined && dropPer <= localMonsterList[monNum].dropPer * 10) {
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
      io.emit(userInfo.username, "[시스템] 축하드립니다 전리품을 획득 하였습니다.");
    }
  } catch (e) {
    console.log("일반몹 템드랍  오류");
    console.log(e);
  }

  try {
    // 보스 템드랍
    if (localMonsterList[monNum].type == "boss") {

      var jname = 'j1';
      if (localMonsterList[monNum].lv >= 90) {
        jname = 'j4';
      } else if (localMonsterList[monNum].lv >= 70) {
        jname = 'j3';
      } else if (localMonsterList[monNum].lv >= 50) {
        jname = 'j2';
      } else if (localMonsterList[monNum].lv >= 10) {
        jname = 'j1';
      }

      if (userInfo.item.indexOf(jname) == -1) {
        userInfo.item.push(jname);
      }

      if (userInfo.itemCount[jname] == undefined) {
        userInfo.itemCount[jname] = 1;
      } else {
        userInfo.itemCount[jname] = userInfo.itemCount[jname] + 1;
      }

      var _dropPer = Math.floor(Math.random() * 100) + 1;
      if (userInfo.username == "1111" || userInfo.username == "2222") {
        _dropPer = _dropPer / 2;
      }
      if (_dropPer < 70) {
        if (userInfo.item.indexOf('ph4') == -1) {
          userInfo.item.push('ph4');
        }
        if (userInfo.itemCount.ph3 == undefined) {
          userInfo.itemCount.ph3 = 5;
        } else {
          userInfo.itemCount.ph3 = userInfo.itemCount.ph3 + 5;
        }

        if (userInfo.item.indexOf('pm4') == -1) {
          userInfo.item.push('pm4');
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
        var _dropItems = localMonsterList[monNum].dropItem;
        var _itemIndex = Math.floor(Math.random() * _dropItems.length);
        var _getItem = _dropItems[_itemIndex];

        if (userInfo.item.indexOf(_getItem) == -1) {
          userInfo.item.push(_getItem);
        }
        if (userInfo.itemCount[_getItem] == undefined) {
          userInfo.itemCount[_getItem] = 1;
        } else {
          userInfo.itemCount[_getItem] = userInfo.itemCount[_getItem] + 1;
        }
        io.emit(userInfo.username, "[시스템] 축하드립니다 보스를 쓰러뜨려 엄청난 전리품을 획득 하였습니다.");
        io.emit(userInfo.username + "fight", "[시스템]  축하드립니다 보스를 쓰러뜨려 엄청난 전리품을 획득 하였습니다.");
      }
    }
  } catch (e) {
    console.log("보스 템드랍  오류");
    console.log(e);
  }
  // 경험치 업데이트


  if (userSlave == "slave") {
    console.log("현재 노예 경치 : " + userInfo.exp);
    console.log("현재 노예 토탈 경치 : " + totalExp);
    _slave2.default.update({ id: userInfo.id }, { $set: { exp: totalExp } }, function (err, output) {
      if (err) console.log(err);
      io.emit(userInfo.master, "[시스템] " + localMonsterList[monNum].name + "을 쓰러뜨려 " + userInfo.name + "이(가) 경험치 " + upExp + "을 획득 하였습니다.");
      io.emit(userInfo.master + "fight", "[시스템] " + localMonsterList[monNum].name + "을 쓰러뜨려 " + userInfo.name + "이(가)  경험치 " + upExp + "을 획득 하였습니다.");

      var addLV = Math.floor(userInfo.lv / 10);
      if (addLV == 0) {
        addLV = 1;
      }
      console.log("버그 확인");
      console.log(totalExp);
      console.log(userInfo.lv);
      console.log(addLV);
      console.log(logB(userInfo.lv, 20) * 1000 * userInfo.lv * userInfo.lv / 6 * addLV);

      // 레벨업 판단

      var over100 = 1;

      if (userInfo.lv > 99) {
        over100 = userInfo.lv - 98;
      }

      if (logB(userInfo.lv, 20) * 1000 * userInfo.lv * userInfo.lv / 6 * addLV * over100 < totalExp) {

        var lvUp = userInfo.lv + 1;
        var strUP = userInfo.str + userInfo.upStr;
        var dexUP = userInfo.dex + userInfo.upDex;
        var intUP = userInfo.int + userInfo.upInt;
        var max_mpUP = userInfo.max_mp;
        var max_hpUP = userInfo.max_hp;

        max_mpUP += Math.floor(userInfo.lv * 10 * 0.5);
        max_hpUP += Math.floor(userInfo.lv * 10 * 0.7);

        console.log(userInfo.name + "레벨업");
        _slave2.default.update({ id: userInfo.id }, { $set: { lv: lvUp, str: strUP, int: intUP, dex: dexUP, max_hp: max_hpUP, max_mp: max_mpUP, mp: max_mpUP, hp: max_hpUP } }, function (err, output) {
          if (err) console.log(err);
          io.emit("Gchat", "[LEVEL UP!!] " + userInfo.master + "의 노예 [" + userInfo.name + "] 이(가) 레벨업 하였습니다. ");
        });
      }
      // 레벨업 판단 끝

    });
  } else {
    _account2.default.update({ username: userInfo.username }, { $set: { exp: totalExp, gold: setGold, item: userInfo.item, itemCount: userInfo.itemCount } }, function (err, output) {
      if (err) console.log(err);
      io.emit(userInfo.username, "[시스템] " + localMonsterList[monNum].name + "을 쓰러뜨려 경험치 " + upExp + "과 " + getGold + "골드를 획득 하였습니다.");
      io.emit(userInfo.username + "fight", "[시스템] " + localMonsterList[monNum].name + "을 쓰러뜨려 경험치 " + upExp + "과 " + getGold + "골드를 획득 하였습니다.");
      io.emit(userInfo.username + "전투", "endFight");
      io.emit(userInfo.username + "endFight", "");
    });
  }

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
  console.log("버그 확인");
  console.log(totalExp);
  console.log(userInfo.lv);
  console.log(addLV);
  console.log(logB(userInfo.lv, 20) * 1000 * userInfo.lv * userInfo.lv / 6 * addLV);

  // 레벨업 판단

  var over100 = 1;

  if (userInfo.lv > 99) {
    over100 = userInfo.lv - 98;
  }

  if (logB(userInfo.lv, 20) * 1000 * userInfo.lv * userInfo.lv / 6 * addLV * over100 < totalExp && userSlave != "slave") {
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