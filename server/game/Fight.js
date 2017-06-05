
import express from 'express';
import Account from '../models/account';
import Monster from '../models/monster';
const router = express.Router();

// 몬스터 리젠
var regenMonster = setInterval(loadMonsterList, 1000*60*5);

var monsters;
var localMonsterList=[];
loadMonsterList();

function loadMonsterList(){
  Monster.find({type:"normal"})
     .exec((err, monster) => {
         if(err) throw err;
         monsters =   eval(monster);
         console.log("몬스터 로드, 지역 배치 시작");
         for(let monCount = 0; monCount < monsters.length; monCount++){
           console.log(monsters[monCount].name+"배치 시작");
           let monLocalArr = monsters[monCount].area.split(",");
           for(let localCount = 0; localCount < monLocalArr.length; localCount++ ){
              let monObj = new Object();
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
              monObj.area=monLocalArr[localCount];


              localMonsterList.push(monObj);
           }
         }
     });
}


var checkMonster = function (ch){
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



var fight = function (io,info){
   Account.find({username: info.userName})
      .exec((err, account) => {
          if(err) throw err;
          let userInfo = account;
          userInfo =   eval(userInfo[0])
          let monNum = checkFightMonster(info.ch);

          if(monNum==null){

            return false;
          }

          let dmg =  ((userInfo.int+userInfo.str)*userInfo.lv) - localMonsterList[monNum].dp ;
          let result =  userInfo.username+"님께서 "+info.target+"에게 "+dmg+"의 공격을 하였습니다.";
          localMonsterList[monNum].hp = localMonsterList[monNum].hp - dmg;

          let monHPMsg = localMonsterList[monNum].name+"의 남은 체력 : "+localMonsterList[monNum].hp;
          io.emit(info.ch, result);
          io.emit(info.ch, monHPMsg);

          if(localMonsterList[monNum].hp<=0){
            localMonsterList[monNum].exist = false;
            io.emit(info.ch, localMonsterList[monNum].dieMsg);
          }

      });



  };


export { fight ,localMonsterList, checkMonster};
