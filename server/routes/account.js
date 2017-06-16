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
            itemCount:{},
            gold:100,
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
router.get('/buyItem/:itemID', (req, res) => {
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

                    if(itemInfo.price > userInfo.gold){
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

                      userInfo.gold = userInfo.gold - itemInfo.price;

                      userInfo.itemCount[itemInfo.id] = haveCheck+1;
                      Account.update({username: userInfo.username},{$set:{itemCount:userInfo.itemCount,item:userInfo.item, gold:userInfo.gold }}, function(err, output){
                        res.json({msg:"구매 완료 하였습니다."});
                      });
                    }

                  });

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
