
import express from 'express';
import Account from '../models/account';

const router = express.Router();

var count = 10;

var fight = function (io,info){
   Account.find({username: info.userName})
      .exec((err, account) => {
          if(err) throw err;
          let userInfo = account;
          userInfo =   eval(userInfo[0])
          count=count-1;

          let result =  userInfo.username+"님께서 "+info.target+"에게 "+userInfo.str+"의 공격을 하였습니다.";
          if(count==0){
            return "몬스터가 쓰러졌습니다.";
          }

          io.emit(info.ch, result);
      });



  };


export { fight };
