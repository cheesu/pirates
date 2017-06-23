import express from 'express';
import Account from '../models/account';
import Item from '../models/item';

const router = express.Router();


/*
    ACCOUNT SIGNUP: POST /api/account/signup
    BODY SAMPLE: { "username": "test", "password": "test" }
    ERROR CODES:
        1: BAD USERNAME
        2: BAD PASSWORD
        3: USERNAM EXISTS
*/
router.post('/signup', (req, res) => {
    /* to be implemented */
    // CHECK USERNAME FORMAT
    let usernameRegex = /^[가-힣a-zA-Z0-9]+$/;

    if(!usernameRegex.test(req.body.username)) {
        return res.status(400).json({
            error: "BAD USERNAME",
            code: 1
        });
    }

    // CHECK PASS LENGTH
    if(req.body.password.length < 4 || typeof req.body.password !== "string") {
        return res.status(400).json({
            error: "BAD PASSWORD",
            code: 2
        });
    }

    // CHECK USER EXISTANCE
    Account.findOne({ username: req.body.username }, (err, exists) => {
        if (err) throw err;
        if(exists){
            return res.status(409).json({
                error: "USERNAME EXISTS",
                code: 3
            });
        }

        // CREATE ACCOUNT
        let account = new Account({
            username: req.body.username,
            password: req.body.password,
            job: req.body.job,
            lv: 1,
            hp: 100,
            mp: 100,
            str: 10,
            int: 10,
            dex: 10,
            exp:0,
            max_hp:100,
            max_mp:100,
            mount:{w:"",d:""},
            item:[],
            itemCount:{r:0},
            gold:1000,
        });

        account.password = account.generateHash(account.password);

        // SAVE IN THE DATABASE
        account.save( err => {
            if(err) throw err;
            return res.json({ success: true });
        });

    });
});


/*
    ACCOUNT SIGNIN: POST /api/account/signin
    BODY SAMPLE: { "username": "test", "password": "test" }
    ERROR CODES:
        1: LOGIN FAILED
*/
router.post('/signin', (req, res) => {

  if(typeof req.body.password !== "string") {
     return res.status(401).json({
         error: "LOGIN FAILED",
         code: 1
     });
 }

 // FIND THE USER BY USERNAME
 Account.findOne({ username: req.body.username}, (err, account) => {
     if(err) throw err;

     // CHECK ACCOUNT EXISTANCY
     if(!account) {
         return res.status(401).json({
             error: "LOGIN FAILED",
             code: 1
         });
     }

     // CHECK WHETHER THE PASSWORD IS VALID
     if(!account.validateHash(req.body.password)) {
         return res.status(401).json({
             error: "LOGIN FAILED",
             code: 1
         });
     }
     // ALTER SESSION
     let session = req.session;
     session.loginInfo = {
         _id: account._id,
         username: account.username,
         job:account.job,
     };

     // RETURN SUCCESS
     return res.json({
         userInfo: account
     });
 });
});

// 세션 확인 구현
router.get('/getinfo', (req, res) => {
  if(typeof req.session.loginInfo === "undefined") {
        return res.status(401).json({
            error: 1
        });
    }
    Account.find({username: req.session.loginInfo.username})
        .exec((err, account) => {
            if(err) throw err;
            res.json({info:account});
        });

    //res.json({ info: req.session.loginInfo });
});



router.post('/logout', (req, res) => {
  req.session.destroy(err => { if(err) throw err; });
  return res.json({ sucess: true });
});




/*아이템 장착*/
router.get('/mountItem/:itemID', (req, res) => {
    // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
    var itemid =  req.params.itemID;
    Account.find({username: req.session.loginInfo.username})
        .exec((err, accounts) => {
            if(err) throw err;
            let userInfo = eval(accounts[0]);
            if (userInfo.item.indexOf(itemid) != -1) {

              Item.find({id: itemid})
                  .exec((err, item) => {
                    let itemInfo = eval(item[0]);
                    if(itemInfo.kind=="w"){
                      userInfo.mount.w = itemInfo;
                    }
                    else if(itemInfo.kind=="d"){
                      userInfo.mount.d = itemInfo;
                    }
                    Account.update({username: userInfo.username},{$set:{mount:userInfo.mount}}, function(err, output){
                      res.json(item);
                    });
                  });


            }
            else {
              res.json({result:false});
            }
        });
});

/*아이템 사용*/
router.get('/useItem/:itemID', (req, res) => {
    // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
    var itemid =  req.params.itemID;
    Account.find({username: req.session.loginInfo.username})
        .exec((err, accounts) => {
            if(err) throw err;
            let userInfo = eval(accounts[0]);
            var useItemCount = 0;
            try {
               useItemCount = userInfo.itemCount[itemid];
            } catch (e) {
              useItemCount = null;
            }

            if (useItemCount!= null && useItemCount>0){
              userInfo.itemCount[itemid] = userInfo.itemCount[itemid]-1;
              Account.update({username: userInfo.username},{$set:{itemCount:userInfo.itemCount}}, function(err, output){
              });

              Item.find({id: itemid})
                  .exec((err, item) => {
                    let itemInfo = eval(item[0]);
                    if(itemInfo.kind=="p"){

                      let randomHeal = Math.floor(Math.random() * itemInfo.max);
                      var upData = itemInfo.min+randomHeal;

                      if(itemInfo.heal=="hp"){
                        var updateHP = userInfo.hp+upData;
                        if(updateHP >= userInfo.max_hp){
                          upData = upData - (updateHP - userInfo.max_hp);
                          updateHP = userInfo.max_hp;
                          if(upData==0){
                            upData = "전부";
                          }
                        }
                        Account.update({username: userInfo.username},{$set:{hp:updateHP}}, function(err, output){
                          res.json({msg:itemInfo.effectMSG+"  체력이 "+upData+"회복 되었습니다."});
                        });
                      }
                      else if(itemInfo.heal=="mp"){
                        var updateMP = userInfo.mp+upData;
                        if(updateMP >= userInfo.max_mp){
                          upData = upData - (updateMP - userInfo.max_mp);
                          updateMP = userInfo.max_mp;
                          if(upData==0){
                            upData = "전부";
                          }
                        }
                        Account.update({username: userInfo.username},{$set:{mp:updateMP}}, function(err, output){
                          res.json({msg:itemInfo.effectMSG+"  마력이 "+upData+"회복 되었습니다."});
                        });
                      }

                    }

                  });


            }
            else {
              res.json({msg:"없는 아이템 입니다."});
            }
        });
});

/*스크롤 사용*/
router.get('/useScroll/:itemID', (req, res) => {
    // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
    var itemid =  req.params.itemID;
    Account.find({username: req.session.loginInfo.username})
        .exec((err, accounts) => {
            if(err) throw err;
            let userInfo = eval(accounts[0]);
            var useItemCount = 0;
            try {
               useItemCount = userInfo.itemCount[itemid];
            } catch (e) {
              useItemCount = null;
            }

            if (useItemCount!= null && useItemCount>0){
              userInfo.itemCount[itemid] = userInfo.itemCount[itemid]-1;
              Account.update({username: userInfo.username},{$set:{itemCount:userInfo.itemCount}}, function(err, output){
              });

              Item.find({id: itemid})
                  .exec((err, item) => {
                    let itemInfo = eval(item[0]);
                    console.log(itemInfo);
                    Account.update({username: userInfo.username},{$set:{mapName:itemInfo.mapName}}, function(err, output){
                      res.json({msg:itemInfo.effectMSG});
                    });

                  });


            }
            else {
              res.json({msg:"없는 아이템 입니다."});
            }
        });
});



/*전투중 아이템 사용*/
router.get('/fightUseItem/:itemID', (req, res) => {
    // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
    var itemid =  req.params.itemID;
    Account.find({username: req.session.loginInfo.username})
        .exec((err, accounts) => {
            if(err) throw err;
            let userInfo = eval(accounts[0]);
            var useItemCount = 0;
            try {
               useItemCount = userInfo.itemCount[itemid];
            } catch (e) {
              useItemCount = null;
            }

            if (useItemCount!= null && useItemCount>0){
              userInfo.itemCount[itemid] = userInfo.itemCount[itemid]-1;
              Account.update({username: userInfo.username},{$set:{itemCount:userInfo.itemCount}}, function(err, output){
              });

              Item.find({id: itemid})
                  .exec((err, item) => {
                    let itemInfo = eval(item[0]);
                    if(itemInfo.kind=="p"){

                      let randomHeal = Math.floor(Math.random() * itemInfo.max);
                      var upData = itemInfo.min+randomHeal;

                      if(itemInfo.heal=="hp"){
                        var updateHP = userInfo.hp+upData;
                        if(updateHP >= userInfo.max_hp){
                          upData = upData - (updateHP - userInfo.max_hp);
                          updateHP = userInfo.max_hp;
                        }
                        Account.update({username: userInfo.username},{$set:{hp:updateHP}}, function(err, output){
                          let obj = {};
                          obj.heal = "hp";
                          obj.upData = upData;
                          res.json({result:true,obj});
                        });
                      }
                      else if(itemInfo.heal=="mp"){
                        var updateMP = userInfo.mp+upData;
                        if(updateMP >= userInfo.max_mp){
                          upData = upData - (updateMP - userInfo.max_mp);
                          updateMP = userInfo.max_mp;
                        }
                        Account.update({username: userInfo.username},{$set:{mp:updateMP}}, function(err, output){
                          let obj = {};
                          obj.heal = "mp";
                          obj.upData = upData;
                          res.json({result:true,obj});
                        });
                      }

                    }

                  });
            }
            else {
              res.json({result:false,msg:""});
            }
        });
});

/*아이템 구매*/
router.post('/buyItem/', (req, res) => {
    // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX

    console.log("바이 아이템");
    console.log(req.body);
    var itemid  = req.body.name
    var buyCount  = req.body.count
    Account.find({username: req.session.loginInfo.username})
        .exec((err, accounts) => {
            if(err) throw err;
            let userInfo = eval(accounts[0]);

              Item.find({id: itemid})
                  .exec((err, item) => {
                      if(err) throw err;

                    let itemInfo = eval(item[0]);

                    let selePer = 1;

                    if(buyCount>=50){
                      selePer = 0.9;
                    }

                    if((itemInfo.price*buyCount*selePer) > userInfo.gold){
                      res.json({msg:"소지금이 부족합니다 스크립트 조작해서 살 생각 하지 마라"});

                    }
                    else{
                      let haveCheck = userInfo.itemCount[itemInfo.id];
                      if(haveCheck==undefined){
                        haveCheck = 0;
                      }

                      if (userInfo.item.indexOf(itemInfo.id) == -1){
                        userInfo.item.push(itemInfo.id);
                      }

                      userInfo.gold = userInfo.gold - (itemInfo.price*buyCount*selePer);

                      userInfo.itemCount[itemInfo.id] = haveCheck+buyCount;
                      Account.update({username: userInfo.username},{$set:{itemCount:userInfo.itemCount,item:userInfo.item, gold:userInfo.gold }}, function(err, output){
                        res.json({msg:"구매 완료 하였습니다."});
                      });
                    }

                  });

        });
});

/*아이템 판매*/
router.get('/sellItem/:itemID', (req, res) => {
    // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
    var itemid =  req.params.itemID;
    Account.find({username: req.session.loginInfo.username})
        .exec((err, accounts) => {
            if(err) throw err;
            let userInfo = eval(accounts[0]);

              Item.find({id: itemid})
                  .exec((err, item) => {
                      if(err) throw err;

                    let itemInfo = eval(item[0]);

                    if(userInfo.itemCount[itemInfo.id]==undefined || userInfo.itemCount[itemInfo.id] <=0||userInfo.item.indexOf(itemInfo.id) == -1){
                      res.json({msg:"아이템이 없습니다. 팔지 못합니다."});
                    }
                    else{

                      let haveCheck = userInfo.itemCount[itemInfo.id];

                      if(haveCheck==1){
                        userInfo.item.splice(userInfo.item.indexOf(itemInfo.id),1);
                      }


                      userInfo.gold = userInfo.gold + Math.round(itemInfo.price/3);

                      userInfo.itemCount[itemInfo.id] = haveCheck-1;
                      Account.update({username: userInfo.username},{$set:{itemCount:userInfo.itemCount,item:userInfo.item, gold:userInfo.gold }}, function(err, output){
                        res.json({msg:"판매 완료 하였습니다."});
                      });
                    }

                  });

        });
});

/*전직 한다*/
router.get('/changeJob/:jobName', (req, res) => {
    // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
    var jobName =  req.params.jobName;
    Account.find({username: req.session.loginInfo.username})
        .exec((err, accounts) => {
            if(err) throw err;
            let userInfo = eval(accounts[0]);

            if(100000 > userInfo.gold){
              res.json({msg:"소지금이 부족합니다 스크립트 조작해서 살 생각 하지 마라"});
            }
            else if(40 > userInfo.lv){
              res.json({msg:"레벨이 부족 합니다."});
            }
            else{
              userInfo.gold = userInfo.gold - 100000;

              let jobTxt = "";
              let job2 = "";
              if(userInfo.job == "마법사"){
                job2 = '깨달은 현자';
                jobTxt = "깨달은 현자가 되었습니다. 깨달은 현자의 능력 고속영창과 주문보호를 할 수 있습니다.";
              }
              if(userInfo.job == "검사"){
                job2 = '검의 달인';
                jobTxt = "검의 달인이 되었습니다 무기상쇄와 검기를 사용 할 수 있습니다."
              }
              if(userInfo.job == "암살자"){
                job2 = '그림자 살귀';
                jobTxt = "그림자 살귀가 되었습니다. 그림자 숨기와 이화접목을 사용 할 수 있습니다."
              }

              Account.update({username: userInfo.username},{$set:{job2:job2 , gold:userInfo.gold}}, function(err, output){
                res.json({msg:jobTxt});
              });
            }

        });
});

// 맵 이동시 위치 저장
router.get('/saveMap/:mapName', (req, res) => {
  Account.update({username: req.session.loginInfo.username},{$set:{mapName:req.params.mapName}}, function(err, output){
    res.json({msg:"맵이동 저장 완료."});
  });

});


/*
 SEARCH USER: GET /api/account/search/:username
 */
router.get('/search/:username', (req, res) => {
    // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
    var re = new RegExp('^' + req.params.username);
    Account.find({username: {$regex: re}}, {_id: false, username: true, lv: true, job: true })
        .limit(10)
        .sort({username: 1})
        .exec((err, accounts) => {
            if(err) throw err;
            res.json(accounts);
        });
});

// EMPTY SEARCH REQUEST: GET /api/account/search
router.get('/search', (req, res) => {
    res.json([]);
});

export default router;
