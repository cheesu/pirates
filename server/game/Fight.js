
import express from 'express';
import Account from '../models/account';
import Monster from '../models/monster';
import Skill from '../models/skill';
const router = express.Router();

// 몬스터 리젠
var initServer = false;
var regenMonster = setInterval(loadMonsterList, 1000*60*3);
var bossGen = 0;
var monsters;
var localMonsterList=[];
var fightInterval = new Object();
var restInterval = new Object();

loadMonsterList();

function loadMonsterList(){
  Monster.find()
     .exec((err, monster) => {
         if(err) throw err;
         monsters =   eval(monster);
         console.log("몬스터 로드, 지역 배치 시작");
         var genMonster = [];
         for(let monCount = 0; monCount < monsters.length; monCount++){
           console.log(monsters[monCount].name+"배치 시작");
           let monLocalArr = monsters[monCount].area.split(",");
           for(let localCount = 0; localCount < monLocalArr.length; localCount++ ){
              let monObj = new Object();
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
              monObj.area= monsters[monCount].mapName+"-"+monLocalArr[localCount];
              if(!initServer){
                localMonsterList.push(monObj);
              }else{
                if(!localMonsterList[monCount].exist&&localMonsterList[monCount].type=="normal"){
                  localMonsterList[monCount] = monObj;
                }
                else if(!localMonsterList[monCount].exist&&localMonsterList[monCount].type=="boss"&&bossGen==4){
                  localMonsterList[monCount] = monObj;
                }
                bossGen++;
              }

           }
         }
     });
}


var checkMonster = function (ch){
  console.log(ch);
  let monster=null;
  for(let count = 0; count < localMonsterList.length; count++){
    if(localMonsterList[count].area==ch && localMonsterList[count].exist == true){
      monster = localMonsterList[count];
    }
  }
  return monster;
}

var checkFightMonster = function (ch){
  let monNum=null;
  for(let count = 0; count < localMonsterList.length; count++){
    if(localMonsterList[count].area==ch && localMonsterList[count].exist == true){
      monNum = count;
    }
  }
  return monNum;
}


var run = function (io,info){
  fightInterval[info.userName+"fighting"] = false;
  clearInterval(fightInterval[info.userName+"monsterAttack"]);
  clearInterval(fightInterval[info.userName+"userAttack"]);
  io.emit(info.ch, info.userName+"님이 도망갑니다.");

}

// 스킬 사용
var useSkill = function(io,info){
  Account.find({username: info.username})
     .exec((err, account) => {
       if(err) throw err;

       let userInfo = account;
       userInfo =   eval(userInfo[0])
       let monNum = checkFightMonster(info.ch);

       if(monNum==null){
         return false;
       }


       Skill.find({name: info.skillname})
          .exec((err, skill) => {
            if(err) throw err;
            let skillInfo = eval(skill[0]);

            let userMP = userInfo.mp - skillInfo.mp;
            if(userMP<0){
              userMP = 0;
            }
            // 엠피 소모 업데이트
            Account.update({username: userInfo.username},{$set:{mp:userMP}}, function(err, output){
              if(err) console.log(err);

              io.emit(userInfo.username+"userMP", userMP+"-"+userInfo.max_mp);
              fightInterval[userInfo.username+"MP"] = userMP;
              if(fightInterval[userInfo.username+"skill"]){
                io.emit(userInfo.username+"fight", "[skill]이미 스킬을 시전 중 입니다.");
                return false;
              }
              if(skillInfo.lv > userInfo.lv){
                io.emit(userInfo.username+"fight", "[skill]레벨이 부족해서 해당 기술을 사용 할 수 없습니다.");
                return false;
              }

              if(skillInfo.mp > userInfo.mp){
                io.emit(userInfo.username+"fight", "[skill]MP가 부족해 기술을 사용 할 수 없습니다.");
                return false;
              }

              if(userInfo.hp<=0){
                io.emit(userInfo.username+"fight", "[skill]죽은자는 행동 할 수 없습니다.");
                clearInterval(fightInterval[userInfo.username+"skillInterval"]);
                fightInterval[userInfo.username+"CastingCount"] = null;
                fightInterval[userInfo.username+"skillInterval"] = null;
                fightInterval[userInfo.username+"skill"] = false;
                return false;
              }


              let skillCasting = skillInfo.casting.split(",");
              fightInterval[userInfo.username+"CastingCount"] = 0;
              fightInterval[userInfo.username+"skill"] = true;
              fightInterval[userInfo.username+"skillInterval"] = setInterval(function(){
                if(fightInterval[userInfo.username+"CastingCount"]==null){
                  clearInterval(fightInterval[userInfo.username+"skillInterval"]);
                  return false;
                }


                let castingCount = fightInterval[userInfo.username+"CastingCount"];
                // 캐스팅


                io.emit(info.ch+"fight", "[skill]"+skillCasting[castingCount]);
                fightInterval[userInfo.username+"CastingCount"] = fightInterval[userInfo.username+"CastingCount"]+1;
                if(skillCasting.length <= fightInterval[userInfo.username+"CastingCount"] ){

                  // 공격 시작

                  // 무기 이름
                  var wName = "";

                  wName = userInfo.mount.w.name;
                  if(wName==NaN || wName==null|| wName==""||wName==undefined){
                    wName = "맨손";
                  }

                  // 무기 최소 데미지
                  var wMinAP = userInfo.mount.w.min;
                  if(wMinAP==NaN || wMinAP==null|| wMinAP==""||wMinAP==undefined){
                    wMinAP = 0;
                  }

                  // 무기 최대 데미지
                  var wMaxAP = userInfo.mount.w.min;
                  if(wMaxAP==NaN || wMaxAP==null|| wMaxAP==""||wMaxAP==undefined){
                    wMaxAP = 0;
                  }

                  let randomAP = Math.floor(Math.random() * wMaxAP) + 1;

                  var wAP = wMinAP+randomAP;


                  let dmg =  (((userInfo.int+userInfo.str)+((userInfo.int+userInfo.str)*0.3)+wAP)*skillInfo.dmg) - localMonsterList[monNum].dp;
                  dmg = Math.round(dmg);
                  let targetCurrentHP=9999;
                  for(var count=0; count < skillInfo.hit; count++){
                    let skillAttackMsg = "";
                    var critical = checkCritical(userInfo.dex);
                    let result="";
                    if(critical){
                      dmg = dmg*1.7;
                      dmg = Math.round(dmg);
                      skillAttackMsg =  "[skill]"+skillInfo.attackMsg+"["+dmg+"]-[Critical!!!!]"
                      localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;
                      io.emit(userInfo.username+"[Cri]", "");
                    }else{
                      skillAttackMsg =  "[skill]"+skillInfo.attackMsg+"["+dmg+"]"
                      localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;
                    }


                    localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;
                     targetCurrentHP = localMonsterList[monNum].hp;
                    if(localMonsterList[monNum].hp < 0){
                      targetCurrentHP = 0;
                    }

                  //  let monHPMsg = localMonsterList[monNum].name+"의 남은 체력 : "+targetCurrentHP;
                    io.emit(info.ch+"fight", skillAttackMsg);
                  //  io.emit(info.ch+"fight", monHPMsg);

                  }

                  io.emit(info.ch+"monsterHP", targetCurrentHP+"-"+localMonsterList[monNum].maxHP);

                  // 몬스터 처치
                  if(localMonsterList[monNum].hp<=0){
                    fightInterval[userInfo.username+"fighting"] = false;// 몬스터 처치후 발동되는 인터벌 막기위한 변수
                    clearInterval(fightInterval[userInfo.username+"monsterAttack"]);
                    clearInterval(fightInterval[userInfo.username+"userAttack"]);
                    localMonsterList[monNum].exist = false;
                    io.emit(info.ch, "[monsterDieMsg]"+localMonsterList[monNum].dieMsg);
                    io.emit(info.ch+"fight", "[monsterDieMsg]"+localMonsterList[monNum].dieMsg);

                    expLevelup(userInfo,io,monNum,info); // 렙업인지 경치만 획득인지 계산한다
                  }

                  clearInterval(fightInterval[userInfo.username+"skillInterval"]);
                  fightInterval[userInfo.username+"CastingCount"] = null;
                  fightInterval[userInfo.username+"skillInterval"] = null;
                  fightInterval[userInfo.username+"skill"] = false;
                }
              },1000); // 인터벌 종료

            }); // 엠피 소모 업데이트 종료

          }); // 스킬 정보 가져오기 정료


     }); // 유저정보 가져오기 종료
}

// 전투중 아이템 사용
var fightUseItem = function(io,info){
  if(info.heal=="hp"){
    fightInterval[info.username+"HP"] = fightInterval[info.username+"HP"]+info.upData;
    io.emit(info.username+"userHP", fightInterval[info.username+"HP"]+"-"+info.maxHP);
    io.emit(info.username+"fight", "[item] 급하게 체력 포션을 마십니다. 체력이"+info.upData+"회복 되었습니다.");
  }
  else if(info.heal=="mp"){
    fightInterval[info.username+"MP"] = fightInterval[info.username+"MP"]+info.upData;
    io.emit(info.username+"userMP", fightInterval[info.username+"MP"]+"-"+info.maxMP);
    io.emit(info.username+"fight", "[item] 적의 공격을 피해 마력 포션을 마십니다.마력이"+info.upData+"회복 되었습니다.");
  }

}

var fight = function (io,info){
  console.log("전투 시작");
   Account.find({username: info.userName})
      .exec((err, account) => {
          if(err) throw err;
          let userInfo = account;
          userInfo =   eval(userInfo[0])
          let monNum = checkFightMonster(info.ch);

          if(monNum==null){
            return false;
          }

          if(!info.fighting && (fightInterval[userInfo.username+"fighting"]==undefined || !fightInterval[userInfo.username+"fighting"])){
            // 몬스터가 유저를 공격하는 인터벌
            fightInterval[userInfo.username+"fighting"] = true; // 몬스터 처치후 발동되는 인터벌 막기위한 변수
            fightInterval[userInfo.username+"HP"] = userInfo.hp;

            // 몬스터가 공격
            fightInterval[userInfo.username+"monsterAttack"] = setInterval(function(){


              let reDmg = localMonsterList[monNum].ap
              let userHP = fightInterval[userInfo.username+"HP"] - reDmg;
              fightInterval[userInfo.username+"HP"] -= reDmg;

              // 몬스터 처치후 발동되는 인터벌 막기위한 판단
              if(!fightInterval[userInfo.username+"fighting"]){
                  console.log(userInfo.username+"전투 중단");
                  return false;
              }

              if(userHP < 0){
                userHP = 0;
              }

              Account.update({username: userInfo.username},{$set:{hp:userHP}}, function(err, output){
                if(err) console.log(err);
                io.emit(info.ch+"fight", "[피격]"+localMonsterList[monNum].attackMsg+" "+userInfo.username+"님이["+reDmg+"]의 피해를 입었습니다.");
                io.emit(userInfo.username+"userHP", userHP+"-"+userInfo.max_hp);
                io.emit(userInfo.username+"currentUserHP", userHP+"-"+userInfo.max_hp);

                // 맞고 디졌을떄
                if(userHP<=0){
                  fightInterval[userInfo.username+"fighting"] = false;
                  clearInterval(fightInterval[userInfo.username+"monsterAttack"]);
                  clearInterval(fightInterval[userInfo.username+"userAttack"]);
                  Account.update({username: userInfo.username},{$set:{hp:userInfo.max_hp}}, function(err, output){
                    if(err) console.log(err);
                    io.emit(info.ch+"fight", localMonsterList[monNum].name+"의 일격을 맞고 "+userInfo.username+"님이 정신을 잃고 쓰러집니다.");
                    io.emit(userInfo.username, "[시스템] 운영자 cheesu님께서 당신의 죽음을 불쌍히 여겨 체력이 회복 되었습니다.");
                    io.emit(userInfo.username+"DEAD", "");
                    io.emit(userInfo.username+"CONTROLLDEAD", "");
                    io.emit(userInfo.username+"currentUserHP", userInfo.max_hp+"-"+userInfo.max_hp);
                  });
                }
              });



            },localMonsterList[monNum].speed*10);


            // 유저 공격 속도
            let attackSpeed = 1800 - (userInfo.dex*3);

            // 유저가 공격
            fightInterval[userInfo.username+"userAttack"] = setInterval(function(){

              // 몬스터 처치후 발동되는 인터벌 막기위한 판단
              if(!fightInterval[userInfo.username+"fighting"]){
                  console.log(userInfo.username+"전투 중단");
                  return false;
              }

              // 무기 이름
              var wName = userInfo.mount.w.name;
              if(wName==NaN || wName==null|| wName==""||wName==undefined){
                wName = "맨손";
              }

              // 무기 최소 데미지
              var wMinAP = userInfo.mount.w.min;
              if(wMinAP==NaN || wMinAP==null|| wMinAP==""||wMinAP==undefined){
                wMinAP = 0;
              }

              // 무기 최대 데미지
              var wMaxAP = userInfo.mount.w.min;
              if(wMaxAP==NaN || wMaxAP==null|| wMaxAP==""||wMaxAP==undefined){
                wMaxAP = 0;
              }

              let randomAP = Math.floor(Math.random() * wMaxAP) + 1;

              var wAP = wMinAP+randomAP;

              console.log("무기 공격력"+wMinAP+"+"+randomAP+"="+wAP);

              let dmg =  (userInfo.int+userInfo.str)+((userInfo.int+userInfo.str)*0.3)+wAP - localMonsterList[monNum].dp ;
              dmg = Math.round(dmg);

              var critical = checkCritical(userInfo.dex);
              let result="";
              if(critical){
                dmg = dmg*1.7;
                dmg = Math.round(dmg);
                result =  "Critical!!!! "+userInfo.username+"님께서 "+info.target+"에게 "+wName+"을(를) 휘둘러"+dmg+"의 공격을 하였습니다.";
                localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;
                io.emit(userInfo.username+"[Cri]", "");
              }else{
                result =  userInfo.username+"님께서 "+info.target+"에게 "+wName+"을(를) 휘둘러"+dmg+"의 공격을 하였습니다.";
                localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;
              }


              let targetCurrentHP = localMonsterList[monNum].hp;
              if(localMonsterList[monNum].hp < 0){
                targetCurrentHP = 0;
              }

            //  let monHPMsg = localMonsterList[monNum].name+"의 남은 체력 : "+targetCurrentHP;
              io.emit(info.ch+"fight", result);
            //  io.emit(info.ch+"fight", monHPMsg);
              io.emit(info.ch+"monsterHP", targetCurrentHP+"-"+localMonsterList[monNum].maxHP);


              // 몬스터 처치
              if(localMonsterList[monNum].hp<=0){
                fightInterval[userInfo.username+"fighting"] = false;// 몬스터 처치후 발동되는 인터벌 막기위한 변수
                clearInterval(fightInterval[userInfo.username+"monsterAttack"]);
                clearInterval(fightInterval[userInfo.username+"userAttack"]);
                localMonsterList[monNum].exist = false;
                io.emit(info.ch, "[monsterDieMsg]"+localMonsterList[monNum].dieMsg);
                io.emit(info.ch+"fight", "[monsterDieMsg]"+localMonsterList[monNum].dieMsg);
                expLevelup(userInfo,io,monNum,info); // 렙업인지 경치만 획득인지 계산한다
              }

            },attackSpeed);


          }



      });
  };

//크리티컬 계산
function checkCritical(dex){
  let result = false;
  dex = dex/5;
  let random = Math.floor(Math.random() * 100) + 1;
  if(random <= dex ){
    result = true;
  }
  return result;
}

//경험치 획득 &
  function expLevelup(userInfo,io,monNum,info){
    // 경험치 계산
    let upExp =  localMonsterList[monNum].exp;
    let gap = userInfo.lv - localMonsterList[monNum].lv;
    if(gap > 7){
      upExp = Math.round(upExp/2);
    }
    if(gap < -2 ){
      upExp = Math.round(upExp*1.5);
    }
    let totalExp = userInfo.exp + upExp;
    let random = Math.floor(Math.random() * 100) + 1;
    let getGold = localMonsterList[monNum].gold+random;
    let setGold = userInfo.gold + getGold;
    // 경험치 업데이트
    Account.update({username: info.userName},{$set:{exp:totalExp, gold:setGold}}, function(err, output){
      if(err) console.log(err);
      io.emit(userInfo.username, "[시스템] "+localMonsterList[monNum].name+"을 쓰러뜨려 경험치 "+localMonsterList[monNum].exp+"과 "+getGold +"골드를 획득 하였습니다.");
      io.emit(userInfo.username+"fight", "[시스템] "+localMonsterList[monNum].name+"을 쓰러뜨려 경험치 "+localMonsterList[monNum].exp+"를 획득 하였습니다.");
      io.emit(userInfo.username+"전투", "endFight");
      io.emit(userInfo.username+"endFight", "");
    });

    // 레벨업 판단
    if((logB(userInfo.lv, 20)*1000)*userInfo.lv*userInfo.lv/6 < totalExp){
      let lvUp = userInfo.lv+1;
      let strUP = userInfo.str+2;
      let dexUP = userInfo.dex+2;
      let intUP = userInfo.int+2;
      let max_mpUP = userInfo.max_mp;
      let max_hpUP = userInfo.max_hp;
      let jobBouns = 2;
      if(userInfo.job=="검사"){
        strUP = strUP+jobBouns;
        intUP = intUP-1;
        max_mpUP += (userInfo.lv*10)*0.2;
        max_hpUP += (userInfo.lv*10)*0.6;
      }
      else if(userInfo.job=="마법사"){
        intUP = intUP+jobBouns;
        dexUP = dexUP-1;
        max_mpUP += (userInfo.lv*10)*0.6;
        max_hpUP += (userInfo.lv*10)*0.2;
      }
      else if(userInfo.job=="암살자"){
        dexUP = dexUP+jobBouns;
        strUP = strUP-1
        max_mpUP += 15
        max_mpUP += (userInfo.lv*10)*0.3;
        max_hpUP += (userInfo.lv*10)*0.5;
      }

      Account.update({username: userInfo.username},{$set:{lv:lvUp, str:strUP, int:intUP, dex:dexUP, max_hp:max_hpUP, max_mp:max_mpUP, mp:max_mpUP, hp:max_hpUP}}, function(err, output){
        if(err) console.log(err);
        io.emit("Gchat", "[LEVEL UP!!] ["+userInfo.username+"] 님께서 레벨업 하셨습니다");
      });



    }

  }

// 경험치 레벨 계산
  function logB(x, base) {
  return Math.log(x) / Math.log(base);
}
var restEnd = function(socket,name){
  clearInterval(restInterval[name]);
  restInterval[name+"rest"] = false;
}

var rest = function (socket,name){
  restEnd(socket,name);
  if(restInterval[name]==undefined || !restInterval[name+"rest"]){
    socket.emit(name, "[휴식]안전한 곳에 앉아 휴식을 취합니다.");
    //휴식 시작
    restInterval[name] = setInterval(function(){
      Account.find({username: name})
         .exec((err, account) => {
             if(err) console.log(err);
          restInterval[name+"rest"] = true;

           let userInfo = account;
           userInfo =   eval(userInfo[0]);

           let currentHP = userInfo.hp;
           let currentMP = userInfo.mp;
           let maxHP = userInfo.max_hp;
           let maxMP = userInfo.max_mp;
           let healHP = userInfo.str*4;
           let healMP = userInfo.int*4;

           let upHP = currentHP+healHP;
           let upMP = currentMP+healMP;

           if(upHP >= maxHP){
             healHP =(upHP-maxHP)-healHP;
             upHP = maxHP
           }

           if(upMP >= maxMP){
             healMP =(upMP-maxMP)-healMP;
             upMP = maxMP
           }

           Account.update({username: name},{$set:{mp:upMP, hp:upHP}}, function(err, output){
             if(err) console.log(err);
             socket.emit(name, "[휴식]휴식을 취하며 HP:"+healHP+" MP:"+healMP+" 회복 되었습니다.");
             if(upHP == maxHP && upMP == maxMP){
               socket.emit(name, "[휴식]모두 회복되어 최상의 컨디션 입니다. 휴식을 끝내고 자리에서 일어납니다.");
               clearInterval(restInterval[userInfo.username]);
               restInterval[userInfo.username+"rest"] = false;
             }
           });
         });
    },15000);
  }// 이프 조건
  else{
     socket.emit(name, "이미 휴식중 입니다.");
  }

}



export { fight,run ,localMonsterList, checkMonster, useSkill, rest,restEnd, fightUseItem};
