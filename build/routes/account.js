'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _account = require('../models/account');

var _account2 = _interopRequireDefault(_account);

var _item = require('../models/item');

var _item2 = _interopRequireDefault(_item);

var _slave = require('../models/slave');

var _slave2 = _interopRequireDefault(_slave);

var _historyip = require('../models/historyip');

var _historyip2 = _interopRequireDefault(_historyip);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

/*
    ACCOUNT SIGNUP: POST /api/account/signup
    BODY SAMPLE: { "username": "test", "password": "test" }
    ERROR CODES:
        1: BAD USERNAME
        2: BAD PASSWORD
        3: USERNAM EXISTS
*/
router.post('/signup', function (req, res) {
  /* to be implemented */
  // CHECK USERNAME FORMAT
  var usernameRegex = /^[가-힣a-zA-Z0-9]+$/;

  if (!usernameRegex.test(req.body.username)) {
    return res.status(400).json({
      error: "BAD USERNAME",
      code: 1
    });
  }

  // CHECK PASS LENGTH
  if (req.body.password.length < 4 || typeof req.body.password !== "string") {
    return res.status(400).json({
      error: "BAD PASSWORD",
      code: 2
    });
  }

  // CHECK USER EXISTANCE
  _account2.default.findOne({ username: req.body.username }, function (err, exists) {
    if (err) throw err;
    if (exists) {
      return res.status(409).json({
        error: "USERNAME EXISTS",
        code: 3
      });
    }

    // CREATE ACCOUNT
    var account = new _account2.default({
      username: req.body.username,
      password: req.body.password,
      job: req.body.job,
      lv: 1,
      hp: 100,
      mp: 100,
      str: 10,
      int: 10,
      dex: 10,
      exp: 0,
      max_hp: 100,
      max_mp: 100,
      mount: { w: "", d: "", r: "", n: "" },
      item: [],
      itemCount: { r: 0 },
      gold: 300000
    });

    account.password = account.generateHash(account.password);

    // SAVE IN THE DATABASE
    account.save(function (err) {
      if (err) throw err;
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
router.post('/signin', function (req, res) {

  if (typeof req.body.password !== "string") {
    return res.status(401).json({
      error: "LOGIN FAILED",
      code: 1
    });
  }

  // FIND THE USER BY USERNAME
  _account2.default.findOne({ username: req.body.username }, function (err, account) {
    if (err) throw err;

    // CHECK ACCOUNT EXISTANCY
    if (!account) {
      return res.status(401).json({
        error: "LOGIN FAILED",
        code: 1
      });
    }

    // CHECK WHETHER THE PASSWORD IS VALID
    if (!account.validateHash(req.body.password)) {
      return res.status(401).json({
        error: "LOGIN FAILED",
        code: 1
      });
    }
    // ALTER SESSION
    var session = req.session;
    session.loginInfo = {
      _id: account._id,
      username: account.username,
      job: account.job
    };

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

    console.log("IP:" + ip);

    var historyip = new _historyip2.default({
      username: account.username,
      ip: ip
    });

    // 로그인 기록
    historyip.save(function (err) {
      if (err) throw err;
      console.log(account.username + "로그인 기록 완료");
    });

    // RETURN SUCCESS
    return res.json({
      userInfo: account
    });
  });
});

// 세션 확인 구현
router.get('/getinfo', function (req, res) {

  console.log("세션 확인");
  console.log(req.session.loginInfo);

  if (typeof req.session.loginInfo === "undefined") {
    return res.status(401).json({
      error: 1
    });
  }
  _account2.default.find({ username: req.session.loginInfo.username }).exec(function (err, account) {
    if (err) throw err;
    var userInfo = eval(account[0]);

    try {
      var test = userInfo.mount.r;
      if (test == undefined) {
        userInfo.mount.r = "";
      }
    } catch (e) {
      userInfo.mount.r = "";
    } finally {}

    try {
      var test2 = userInfo.mount.n;
      if (test2 == undefined) {
        userInfo.mount.n = "";
      }
    } catch (e) {
      userInfo.mount.n = "";
    } finally {}

    console.log("사용자 정보 다시 때려박기");

    res.json({ info: account });
  });

  //res.json({ info: req.session.loginInfo });
});

router.post('/logout', function (req, res) {
  req.session.destroy(function (err) {
    if (err) throw err;
  });
  return res.json({ sucess: true });
});

/*아이템 장착*/
router.get('/mountItem/:itemID', function (req, res) {
  // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
  var itemid = req.params.itemID;
  _account2.default.find({ username: req.session.loginInfo.username }).exec(function (err, accounts) {
    if (err) throw err;
    var userInfo = eval(accounts[0]);
    if (userInfo.item.indexOf(itemid) != -1) {

      _item2.default.find({ id: itemid }).exec(function (err, item) {

        var itemInfo = eval(item[0]);

        if (itemInfo.job == "ALL" || itemInfo.job == "all" || itemInfo.job == "All" || itemInfo.job == userInfo.job) {

          var str = userInfo.str;
          var dex = userInfo.dex;
          var int = userInfo.int;

          // 이전 장착무기에 상승옵션이 있다면 다시 그만큼 스탯 빼주기
          try {
            if (itemInfo.kind == "w" && userInfo.mount.w.option != undefined) {
              if (userInfo.mount.w.option.option == "upStr") {
                str = str - userInfo.mount.w.option.max;
              } else if (userInfo.mount.w.option.option == "upDex") {
                dex = dex - userInfo.mount.w.option.max;
              } else if (userInfo.mount.w.option.option == "upInt") {
                int = int - userInfo.mount.w.option.max;
              }
            }
          } catch (e) {
            console.log("무기 해제 옵션 하향 오류");
            console.log(e);
          }

          if (itemInfo.kind == "w") {
            userInfo.mount.w = itemInfo;
          } else if (itemInfo.kind == "d") {
            userInfo.mount.d = itemInfo;
          } else if (itemInfo.kind == "ring") {
            userInfo.mount.r = itemInfo;
          } else if (itemInfo.kind == "necklace") {
            userInfo.mount.n = itemInfo;
          }

          // 장착할 무기에 상승옵션이 있다면 스탯 적용한다.
          try {
            if (itemInfo.option != undefined) {
              if (itemInfo.option.option == "upStr") {
                str = str + itemInfo.option.max;
              } else if (itemInfo.option.option == "upDex") {
                dex = dex + itemInfo.option.max;
              } else if (itemInfo.option.option == "upInt") {
                int = int + itemInfo.option.max;
              }
            }
          } catch (e) {
            console.log("무기 장착 옵션 상승 오류");
            console.log(e);
          }

          _account2.default.update({ username: userInfo.username }, { $set: { mount: userInfo.mount, str: str, dex: dex, int: int } }, function (err, output) {
            res.json({ result: true, item: item[0] });
          });
        } else {
          res.json({ result: false, msg: "본인의 직업에 맞지 않는 옷 입니다." });
        }
      });
    } else {
      res.json({ result: false });
    }
  });
});

/*아이템 사용*/
router.get('/useItem/:itemID', function (req, res) {
  // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
  var itemid = req.params.itemID;
  _account2.default.find({ username: req.session.loginInfo.username }).exec(function (err, accounts) {
    if (err) throw err;
    var userInfo = eval(accounts[0]);
    var useItemCount = 0;
    try {
      useItemCount = userInfo.itemCount[itemid];
    } catch (e) {
      useItemCount = null;
    }

    if (useItemCount != null && useItemCount > 0) {
      userInfo.itemCount[itemid] = userInfo.itemCount[itemid] - 1;
      _account2.default.update({ username: userInfo.username }, { $set: { itemCount: userInfo.itemCount } }, function (err, output) {});

      _item2.default.find({ id: itemid }).exec(function (err, item) {
        var itemInfo = eval(item[0]);
        if (itemInfo.kind == "p" || itemInfo.kind == "rp") {

          var randomHeal = Math.floor(Math.random() * itemInfo.max);
          var upData = itemInfo.min + randomHeal;

          if (itemInfo.heal == "hp") {
            var updateHP = userInfo.hp + upData;
            if (updateHP >= userInfo.max_hp) {
              upData = upData - (updateHP - userInfo.max_hp);
              updateHP = userInfo.max_hp;
              if (upData == 0) {
                upData = "전부";
              }
            }
            _account2.default.update({ username: userInfo.username }, { $set: { hp: updateHP } }, function (err, output) {
              res.json({ msg: itemInfo.effectMSG + "  체력이 " + upData + "회복 되었습니다." });
            });
          } else if (itemInfo.heal == "mp") {
            var updateMP = userInfo.mp + upData;
            if (updateMP >= userInfo.max_mp) {
              upData = upData - (updateMP - userInfo.max_mp);
              updateMP = userInfo.max_mp;
              if (upData == 0) {
                upData = "전부";
              }
            }
            _account2.default.update({ username: userInfo.username }, { $set: { mp: updateMP } }, function (err, output) {
              res.json({ msg: itemInfo.effectMSG + "  마력이 " + upData + "회복 되었습니다." });
            });
          }
        } else if (itemInfo.kind == "elixir") {
          // 엘릭서 먹져
          if (itemInfo.heal == "str") {
            var upStr = userInfo.str + 1;
            _account2.default.update({ username: userInfo.username }, { $set: { str: upStr } }, function (err, output) {
              res.json({ msg: itemInfo.effectMSG + "  힘이 1 올랐습니다." });
            });
          } else if (itemInfo.heal == "int") {
            var up = userInfo.int + 1;
            _account2.default.update({ username: userInfo.username }, { $set: { int: up } }, function (err, output) {
              res.json({ msg: itemInfo.effectMSG + "  지력이 1 올랐습니다." });
            });
          } else if (itemInfo.heal == "dex") {
            var up = userInfo.dex + 1;
            _account2.default.update({ username: userInfo.username }, { $set: { dex: up } }, function (err, output) {
              res.json({ msg: itemInfo.effectMSG + "  민첩이 1 올랐습니다." });
            });
          } else if (itemInfo.heal == "hp") {
            var up = userInfo.max_hp + 100;
            _account2.default.update({ username: userInfo.username }, { $set: { max_hp: up } }, function (err, output) {
              res.json({ msg: itemInfo.effectMSG + "  최대 체력이 100 올랐습니다." });
            });
          } else if (itemInfo.heal == "mp") {
            var up = userInfo.max_mp + 100;
            _account2.default.update({ username: userInfo.username }, { $set: { max_mp: up } }, function (err, output) {
              res.json({ msg: itemInfo.effectMSG + "  최대 마력이 100 올랐습니다." });
            });
          }
        }
      });
    } else {
      res.json({ msg: "없는 아이템 입니다." });
    }
  });
});

/*스크롤 사용*/
router.get('/useScroll/:itemID', function (req, res) {
  // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
  var itemid = req.params.itemID;
  _account2.default.find({ username: req.session.loginInfo.username }).exec(function (err, accounts) {
    if (err) throw err;
    var userInfo = eval(accounts[0]);
    var useItemCount = 0;
    try {
      useItemCount = userInfo.itemCount[itemid];
    } catch (e) {
      useItemCount = null;
    }

    if (useItemCount != null && useItemCount > 0) {
      userInfo.itemCount[itemid] = userInfo.itemCount[itemid] - 1;
      _account2.default.update({ username: userInfo.username }, { $set: { itemCount: userInfo.itemCount } }, function (err, output) {});

      _item2.default.find({ id: itemid }).exec(function (err, item) {
        var itemInfo = eval(item[0]);
        var targetMap = itemInfo.mapName;

        _account2.default.update({ username: userInfo.username }, { $set: { mapName: targetMap } }, function (err, output) {

          res.json({ msg: itemInfo.effectMSG });
        });
      });
    } else {
      res.json({ msg: "없는 아이템 입니다." });
    }
  });
});

/* 무기 옵션 부여 */

router.get('/changeOption/:grade', function (req, res) {
  var grade = req.params.grade;

  _account2.default.find({ username: req.session.loginInfo.username }).exec(function (err, accounts) {
    if (err) throw err;
    var userInfo = eval(accounts[0]);
    var owCount = 0;
    try {
      owCount = userInfo.itemCount.ow2;
    } catch (e) {
      owCount = 0;
    }

    var price = 20000;

    if (grade == 5) {
      console.log("그레이드 업");
      console.log(grade);
      price = 120000;
    }

    if (userInfo.mount.w.type != 'private') {
      res.json({ msg: userInfo.username + "님이 스크립트 조작하다 서버에서 필터링 되었습니다.", result: false });
      return false;
    } else if (userInfo.gold < price) {
      res.json({ msg: userInfo.username + "님이 스크립트 조작하다 서버에서 필터링 되었습니다.", result: false });
      return false;
    } else if (userInfo.item.indexOf('ow2') == -1 || userInfo.itemCount.ow2 == undefined || userInfo.itemCount.ow2 < grade) {
      res.json({ msg: userInfo.username + "님이 스크립트 조작하다 서버에서 필터링 되었습니다.", result: false });
      return false;
    } else {
      userInfo.itemCount.ow2 = owCount - grade;
      userInfo.gold = userInfo.gold - price;
      _account2.default.update({ username: userInfo.username }, { $set: { itemCount: userInfo.itemCount, gold: userInfo.gold } }, function (err, output) {});

      _item2.default.find({ id: 'ow1' }).exec(function (err, item) {
        var itemInfo = eval(item[0]);

        var option1 = {
          "per": 100,
          "option": "upStr",
          "max": 10,
          "optionName": "거인의 힘",
          "msg": "몸에서 힘이 솟구칩니다."
        };

        var option2 = {
          "per": 100,
          "option": "upDex",
          "max": 10,
          "optionName": "늑대의 민첩",
          "msg": "몸이 한결 가벼워집니다."
        };

        var option3 = {
          "per": 100,
          "option": "upInt",
          "max": 10,
          "optionName": "명문대생의 지혜",
          "msg": "머리가 맑아집니다."
        };

        var optionList = [option1, option2, option3];

        var highOption1 = {
          "per": 100,
          "option": "upStr",
          "max": 30,
          "optionName": "오우거의 힘",
          "msg": "몸에서 힘이 솟구칩니다."
        };

        var highOption2 = {
          "per": 100,
          "option": "upDex",
          "max": 30,
          "optionName": "암살자의 민첩",
          "msg": "몸이 한결 가벼워집니다."
        };

        var highOption3 = {
          "per": 100,
          "option": "upInt",
          "max": 30,
          "optionName": "현자의 지혜",
          "msg": "머리가 맑아집니다."
        };

        // 히든옵

        var _highOption1 = {
          "per": 100,
          "option": "upStr",
          "max": 50,
          "optionName": "학살자의 힘",
          "msg": "몸에서 힘이 솟구칩니다."
        };

        var _highOption2 = {
          "per": 100,
          "option": "upDex",
          "max": 50,
          "optionName": "킬링머신의 민첩",
          "msg": "몸이 한결 가벼워집니다."
        };

        var _highOption3 = {
          "per": 100,
          "option": "upInt",
          "max": 50,
          "optionName": "사기꾼의 지혜",
          "msg": "머리가 엄청나게 맑아집니다."
        };

        var highOptionList = [highOption1, highOption2, highOption3];

        var _highOptionList = [_highOption1, _highOption2, _highOption3];

        var enVal = Math.floor(Math.random() * optionList.length);
        var highEnVal = Math.floor(Math.random() * highOptionList.length);
        var _highEnVal = Math.floor(Math.random() * _highOptionList.length);

        // 착용무기
        _item2.default.find({ id: userInfo.mount.w.id }).exec(function (err, itemW) {
          var itemWInfo = eval(itemW[0]);

          if (grade == 1) {
            console.log("그레이드 1");
            itemWInfo.option = optionList[enVal];
          } else if (grade == 5) {
            console.log("그레이드 2");
            itemWInfo.option = highOptionList[highEnVal];
            var hiddenOption = Math.floor(Math.random() * 100) + 1;

            if (hiddenOption > 50 && hiddenOption < 61) {
              itemWInfo.option = _highOptionList[_highEnVal];
            }
          } else {
            res.json({ msg: userInfo.username + "님의 쓸데없는 호기심과 욕심에 욕망의돌과 골드가 증발 하였습니다.", result: false });
            return false;
          }

          var changeOptionCount = 0;
          try {
            if (itemWInfo.changeOptionCount == undefined) {
              changeOptionCount = 0;
            }
            changeOptionCount = itemWInfo.changeOptionCount * 1;
          } catch (e) {
            changeOptionCount = 0;
          }

          changeOptionCount = changeOptionCount + 1;
          // 강화 업데이트
          _item2.default.update({ id: userInfo.mount.w.id }, { $set: { option: itemWInfo.option, changeOptionCount: changeOptionCount } }, function (err, output) {
            var resultMsg = req.session.loginInfo.username + "님의 [" + itemWInfo.name + "]에 " + itemWInfo.option.optionName + " 부여에 성공 하였습니다";
            res.json({ msg: resultMsg, result: true });
          });
        });
      });
    }
  });
});

router.get('/extendSocket/:lv', function (req, res) {
  console.log("서버 소켓 확장 요청");
  var socketLV = req.params.lv;
  _account2.default.find({ username: req.session.loginInfo.username }).exec(function (err, accounts) {
    if (err) throw err;
    var userInfo = eval(accounts[0]);

    console.log(userInfo);
    console.log("test");
    console.log(userInfo.mount.w.socket1);
    if (userInfo.mount.w.type != 'private') {
      res.json({ msg: "개인무기에만 소켓을 확장 할 수 있습니다.", result: false });
      return false;
    } else if (userInfo.lv < 50 && socketLV == 1) {
      res.json({ msg: "50레벨 이상 부터 개인무기에 소켓을 확장 할 수 있습니다..", result: false });
      return false;
    } else if (userInfo.lv < 100 && socketLV == 2) {
      res.json({ msg: "100레벨 이상 부터 개인무기에 2단계 소켓을 확장 할 수 있습니다..", result: false });
      return false;
    } else if (userInfo.lv < 101 && socketLV == 3) {
      res.json({ msg: "101레벨 이상 부터 개인무기에 3단계 소켓을 확장 할 수 있습니다..", result: false });
      return false;
    } else if (userInfo.mount.w.socket1 != undefined && socketLV == 1) {
      res.json({ msg: "이미 소켓이 확장 되어 있습니다.", result: false });
      return false;
    } else if (userInfo.mount.w.socket2 != undefined && socketLV == 2) {
      res.json({ msg: "이미 소켓이 확장 되어 있습니다.", result: false });
      return false;
    } else if (userInfo.mount.w.socket3 != undefined && socketLV == 3) {
      res.json({ msg: "이미 소켓이 확장 되어 있습니다.", result: false });
      return false;
    } else if (userInfo.gold < 500000 && socketLV == 1) {
      res.json({ msg: "골드가 부족 합니다.", result: false });
      return false;
    } else if (userInfo.gold < 1000000 && socketLV == 2) {
      res.json({ msg: "골드가 부족 합니다.", result: false });
      return false;
    } else if (userInfo.gold < 1000000 && socketLV == 3) {
      res.json({ msg: "골드가 부족 합니다.", result: false });
      return false;
    } else {

      if (socketLV != 1 && socketLV != 2 && socketLV != 3) {
        res.json({ msg: "스크립트로 장난쳤어요?", result: false });
        return false;
      }

      if (socketLV == 1) {
        if (userInfo.item.indexOf('ow2') == -1 || userInfo.itemCount.ow2 == undefined || userInfo.itemCount.ow2 < 10) {
          res.json({ msg: "욕망의 돌이 부족 합니다.", result: false });
          return false;
        } else if (userInfo.item.indexOf('j1') == -1 || userInfo.itemCount.j1 == undefined || userInfo.itemCount.j1 < 20) {
          res.json({ msg: "에메랄드가 부족 합니다.", result: false });
          return false;
        } else if (userInfo.item.indexOf('j2') == -1 || userInfo.itemCount.j2 == undefined || userInfo.itemCount.j2 < 10) {
          res.json({ msg: "루비가 부족 합니다.", result: false });
          return false;
        }
      } else if (socketLV == 2) {
        if (userInfo.item.indexOf('ow2') == -1 || userInfo.itemCount.ow2 == undefined || userInfo.itemCount.ow2 < 20) {
          res.json({ msg: "욕망의 돌이 부족 합니다.", result: false });
          return false;
        } else if (userInfo.item.indexOf('j3') == -1 || userInfo.itemCount.j3 == undefined || userInfo.itemCount.j3 < 20) {
          res.json({ msg: "사파이어가 부족 합니다.", result: false });
          return false;
        } else if (userInfo.item.indexOf('j4') == -1 || userInfo.itemCount.j4 == undefined || userInfo.itemCount.j4 < 5) {
          res.json({ msg: "루벨라이트가 부족 합니다.", result: false });
          return false;
        }
      } else if (socketLV == 3) {
        if (userInfo.item.indexOf('ow2') == -1 || userInfo.itemCount.ow2 == undefined || userInfo.itemCount.ow2 < 20) {
          res.json({ msg: "욕망의 돌이 부족 합니다.", result: false });
          return false;
        } else if (userInfo.item.indexOf('j3') == -1 || userInfo.itemCount.j3 == undefined || userInfo.itemCount.j3 < 20) {
          res.json({ msg: "사파이어가 부족 합니다.", result: false });
          return false;
        } else if (userInfo.item.indexOf('j4') == -1 || userInfo.itemCount.j4 == undefined || userInfo.itemCount.j4 < 20) {
          res.json({ msg: "루벨라이트가 부족 합니다.", result: false });
          return false;
        }
      }

      console.log("소켓 확장 시작");

      if (socketLV == 1) {
        userInfo.itemCount.ow2 = userInfo.itemCount.ow2 - 10;
        userInfo.itemCount.j1 = userInfo.itemCount.j1 - 20;
        userInfo.itemCount.j2 = userInfo.itemCount.j2 - 10;
        userInfo.gold = userInfo.gold - 500000;
      } else if (socketLV == 2) {
        userInfo.itemCount.ow2 = userInfo.itemCount.ow2 - 20;
        userInfo.itemCount.j3 = userInfo.itemCount.j3 - 20;
        userInfo.itemCount.j4 = userInfo.itemCount.j4 - 5;
        userInfo.gold = userInfo.gold - 1000000;
      } else if (socketLV == 3) {
        userInfo.itemCount.ow2 = userInfo.itemCount.ow2 - 20;
        userInfo.itemCount.j3 = userInfo.itemCount.j3 - 20;
        userInfo.itemCount.j4 = userInfo.itemCount.j4 - 20;
        userInfo.gold = userInfo.gold - 1000000;
      }

      _account2.default.update({ username: userInfo.username }, { $set: { itemCount: userInfo.itemCount, gold: userInfo.gold } }, function (err, output) {

        console.log(userInfo.mount.w.id);
        if (socketLV == 1) {
          var socket1 = { test: 1 };
          _item2.default.update({ id: userInfo.mount.w.id }, { $set: { socket1: socket1 } }, function (err, output) {
            var resultMsg = req.session.loginInfo.username + "님의 [" + userInfo.mount.w.name + "]이(가) 1단계 소켓 확장에 성공 하였습니다.";
            res.json({ msg: resultMsg, result: true });
          });
        } else if (socketLV == 2) {
          var socket2 = { test: 1 };
          _item2.default.update({ id: userInfo.mount.w.id }, { $set: { socket2: socket2 } }, function (err, output) {
            var resultMsg = req.session.loginInfo.username + "님의 [" + userInfo.mount.w.name + "]이(가) 2단계 소켓 확장에 성공 하였습니다.";
            res.json({ msg: resultMsg, result: true });
          });
        } else if (socketLV == 3) {
          var socket3 = { test: 1 };
          _item2.default.update({ id: userInfo.mount.w.id }, { $set: { socket3: socket3 } }, function (err, output) {
            var resultMsg = req.session.loginInfo.username + "님의 [" + userInfo.mount.w.name + "]이(가) 3단계 소켓 확장에 성공 하였습니다.";
            res.json({ msg: resultMsg, result: true });
          });
        }
      });
    }
  });
});

/*소켓석 박기*/
router.post('/buySocketItem/', function (req, res) {
  console.log("바이 소켓");
  console.log(req.body);
  var itemid = req.body.name;
  _account2.default.find({ username: req.session.loginInfo.username }).exec(function (err, accounts) {
    if (err) throw err;
    var userInfo = eval(accounts[0]);

    _item2.default.find({ id: itemid }).exec(function (err, item) {
      if (err) throw err;
      var itemInfo = eval(item[0]);

      if (itemInfo.kind == "socket1" && userInfo.mount.w.socket1 == undefined) {
        res.json({ msg: "소켓석을 장착할 자리가 없습니다. 무기강화 상인에게 소켓을 확장 하세요.", result: false });
        return false;
      } else if (itemInfo.kind == "socket2" && userInfo.mount.w.socket2 == undefined) {
        res.json({ msg: "소켓석을 장착할 자리가 없습니다. 무기강화 상인에게 소켓을 확장 하세요.", result: false });
        return false;
      }

      var mPrice = itemInfo.mPrice;
      for (var count = 0; count < mPrice.length; count++) {
        var _mPrice = mPrice[count].id;
        var userMPrice = userInfo.itemCount[_mPrice];
        console.log("재료 확인");
        console.log(_mPrice + ":" + mPrice[count].name);
        console.log(userMPrice);
        if (userMPrice == undefined || userMPrice == "" || userMPrice < mPrice[count].count) {
          res.json({ msg: "소지하고 있는 ." + mPrice[count].name + "이 부족 합니다.", result: false });
          return false;
        } else {
          userInfo.itemCount[_mPrice] = userInfo.itemCount[_mPrice] - mPrice[count].count;
        }
      }

      _account2.default.update({ username: userInfo.username }, { $set: { itemCount: userInfo.itemCount } }, function (err, output) {
        if (itemInfo.kind == "socket1") {
          _item2.default.update({ id: userInfo.mount.w.id }, { $set: { socket1: itemInfo } }, function (err, output) {
            var resultMsg = req.session.loginInfo.username + "님의 [" + userInfo.mount.w.name + "]이(가) 소켓석 장착에 성공 하였습니다";
            res.json({ msg: resultMsg, result: true });
          });
        } else if (itemInfo.kind == "socket2") {
          _item2.default.update({ id: userInfo.mount.w.id }, { $set: { socket2: itemInfo } }, function (err, output) {
            var resultMsg = req.session.loginInfo.username + "님의 [" + userInfo.mount.w.name + "]이(가) 소켓석 장착에 성공 하였습니다";
            res.json({ msg: resultMsg, result: true });
          });
        }
      });
    });
  });
});

/*무기 강화*/
router.get('/enhancement/', function (req, res) {
  _account2.default.find({ username: req.session.loginInfo.username }).exec(function (err, accounts) {
    if (err) throw err;
    var userInfo = eval(accounts[0]);
    var owCount = 0;
    try {
      owCount = userInfo.itemCount.ow1;
    } catch (e) {
      owCount = 0;
    }

    if (userInfo.mount.w.type != 'private') {
      res.json({ msg: userInfo.username + "님이 스크립트 조작하다 서버에서 필터링 되었습니다.", result: false });
      return false;
    } else if (userInfo.gold < 20000) {
      res.json({ msg: userInfo.username + "님이 스크립트 조작하다 서버에서 필터링 되었습니다.", result: false });
      return false;
    } else if (userInfo.item.indexOf('ow1') == -1 || userInfo.itemCount.ow1 == undefined || userInfo.itemCount.ow1 < 1) {
      res.json({ msg: userInfo.username + "님이 스크립트 조작하다 서버에서 필터링 되었습니다.", result: false });
      return false;
    } else {
      userInfo.itemCount.ow1 = owCount - 1;
      userInfo.gold = userInfo.gold - 20000;
      _account2.default.update({ username: userInfo.username }, { $set: { itemCount: userInfo.itemCount, gold: userInfo.gold } }, function (err, output) {});

      _item2.default.find({ id: 'ow1' }).exec(function (err, item) {
        var itemInfo = eval(item[0]);
        var enVal = Math.floor(Math.random() * itemInfo.max) + itemInfo.min; // 강화수치

        // 착용무기
        _item2.default.find({ id: userInfo.mount.w.id }).exec(function (err, itemW) {
          var itemWInfo = eval(itemW[0]);
          itemWInfo.min = itemWInfo.min + enVal;
          var enhancementCount = 0;

          try {
            enhancementCount = itemWInfo.enhancementCount * 1;
          } catch (e) {
            enhancementCount = 0;
          }

          enhancementCount = enhancementCount + 1;
          // 강화 업데이트
          _item2.default.update({ id: userInfo.mount.w.id }, { $set: { min: itemWInfo.min, enhancementCount: enhancementCount } }, function (err, output) {
            var resultMsg = req.session.loginInfo.username + "님의 [" + itemWInfo.name + "]이(가) +" + enVal + "강화에 성공 하였습니다. 총 강화횟수:" + enhancementCount + "번";
            res.json({ msg: resultMsg, result: true });
          });
        });
      });
    }
  });
});

/*전투중 아이템 사용*/
router.get('/fightUseItem/:itemID', function (req, res) {
  // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
  var itemid = req.params.itemID;
  _account2.default.find({ username: req.session.loginInfo.username }).exec(function (err, accounts) {
    if (err) throw err;
    var userInfo = eval(accounts[0]);
    var useItemCount = 0;
    try {
      useItemCount = userInfo.itemCount[itemid];
    } catch (e) {
      useItemCount = null;
    }

    if (useItemCount != null && useItemCount > 0) {
      userInfo.itemCount[itemid] = userInfo.itemCount[itemid] - 1;
      _account2.default.update({ username: userInfo.username }, { $set: { itemCount: userInfo.itemCount } }, function (err, output) {});

      _item2.default.find({ id: itemid }).exec(function (err, item) {
        var itemInfo = eval(item[0]);
        if (itemInfo.kind == "p" || itemInfo.kind == "rp") {

          var randomHeal = Math.floor(Math.random() * itemInfo.max);
          var upData = itemInfo.min + randomHeal;

          if (itemInfo.heal == "hp") {
            var updateHP = userInfo.hp + upData;
            if (updateHP >= userInfo.max_hp) {
              upData = upData - (updateHP - userInfo.max_hp);
              updateHP = userInfo.max_hp;
            }
            _account2.default.update({ username: userInfo.username }, { $set: { hp: updateHP } }, function (err, output) {
              var obj = {};
              obj.heal = "hp";
              obj.upData = upData;
              res.json({ result: true, obj: obj });
            });
          } else if (itemInfo.heal == "mp") {
            var updateMP = userInfo.mp + upData;
            if (updateMP >= userInfo.max_mp) {
              upData = upData - (updateMP - userInfo.max_mp);
              updateMP = userInfo.max_mp;
            }
            _account2.default.update({ username: userInfo.username }, { $set: { mp: updateMP } }, function (err, output) {
              var obj = {};
              obj.heal = "mp";
              obj.upData = upData;
              res.json({ result: true, obj: obj });
            });
          }
        }
      });
    } else {
      res.json({ result: false, msg: "" });
    }
  });
});

/*아이템 구매*/
router.post('/buyItem/', function (req, res) {
  // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX

  console.log("바이 아이템");
  console.log(req.body);
  var itemid = req.body.name;
  var buyCount = req.body.count;
  _account2.default.find({ username: req.session.loginInfo.username }).exec(function (err, accounts) {
    if (err) throw err;
    var userInfo = eval(accounts[0]);

    _item2.default.find({ id: itemid }).exec(function (err, item) {
      if (err) throw err;

      var itemInfo = eval(item[0]);

      var selePer = 1;

      if (buyCount >= 50) {
        selePer = 0.9;
      }

      if (itemInfo.price * buyCount * selePer > userInfo.gold) {
        res.json({ msg: "소지금이 부족합니다 스크립트 조작해서 살 생각 하지 마라" });
      } else {
        var haveCheck = userInfo.itemCount[itemInfo.id];
        if (haveCheck == undefined) {
          haveCheck = 0;
        }

        if (userInfo.item.indexOf(itemInfo.id) == -1) {
          userInfo.item.push(itemInfo.id);
        }

        userInfo.gold = userInfo.gold - itemInfo.price * buyCount * selePer;

        userInfo.itemCount[itemInfo.id] = haveCheck + buyCount;
        _account2.default.update({ username: userInfo.username }, { $set: { itemCount: userInfo.itemCount, item: userInfo.item, gold: userInfo.gold } }, function (err, output) {
          res.json({ msg: "구매 완료 하였습니다." });
        });
      }
    });
  });
});

/*밀수꾼 보석 아이템 구매*/
router.post('/buyJItem/', function (req, res) {
  // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX

  console.log("바이 보석류 아이템");
  console.log(req.body);
  var itemid = req.body.name;
  var buyCount = req.body.count;
  _account2.default.find({ username: req.session.loginInfo.username }).exec(function (err, accounts) {
    if (err) throw err;
    var userInfo = eval(accounts[0]);

    _item2.default.find({ id: itemid }).exec(function (err, item) {
      if (err) throw err;

      var itemInfo = eval(item[0]);

      var userJ1 = userInfo.itemCount.j1;
      var userJ2 = userInfo.itemCount.j2;
      var userJ3 = userInfo.itemCount.j3;
      var userJ4 = userInfo.itemCount.j4;

      if (userJ1 == undefined) {
        userJ1 = 0;
      }
      if (userJ2 == undefined) {
        userJ2 = 0;
      }
      if (userJ3 == undefined) {
        userJ3 = 0;
      }
      if (userJ4 == undefined) {
        userJ4 = 0;
      }

      var itemJ1 = itemInfo.jPrice.j1;
      var itemJ2 = itemInfo.jPrice.j2;
      var itemJ3 = itemInfo.jPrice.j3;
      var itemJ4 = itemInfo.jPrice.j4;

      if (itemJ1 > userJ1 || itemJ2 > userJ2 || itemJ3 > userJ3 || itemJ4 > userJ4) {

        res.json({ msg: "소지 보석이 부족합니다." });
      } else {
        var haveCheck = userInfo.itemCount[itemInfo.id];
        if (haveCheck == undefined) {
          haveCheck = 0;
        }

        if (userInfo.item.indexOf(itemInfo.id) == -1) {
          userInfo.item.push(itemInfo.id);
        }

        userInfo.itemCount.j1 = userJ1 - itemJ1;
        userInfo.itemCount.j2 = userJ2 - itemJ2;
        userInfo.itemCount.j3 = userJ3 - itemJ3;
        userInfo.itemCount.j4 = userJ4 - itemJ4;

        userInfo.itemCount[itemInfo.id] = haveCheck + buyCount;
        _account2.default.update({ username: userInfo.username }, { $set: { itemCount: userInfo.itemCount, item: userInfo.item, gold: userInfo.gold } }, function (err, output) {
          res.json({ msg: "구매 완료 하였습니다." });
        });
      }
    });
  });
});

/*아이템 판매*/
router.get('/sellItem/:itemID', function (req, res) {
  // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
  var itemid = req.params.itemID;
  _account2.default.find({ username: req.session.loginInfo.username }).exec(function (err, accounts) {
    if (err) throw err;
    var userInfo = eval(accounts[0]);

    _item2.default.find({ id: itemid }).exec(function (err, item) {
      if (err) throw err;

      var itemInfo = eval(item[0]);

      if (userInfo.itemCount[itemInfo.id] == undefined || userInfo.itemCount[itemInfo.id] <= 0 || userInfo.item.indexOf(itemInfo.id) == -1) {
        res.json({ msg: "아이템이 없습니다. 팔지 못합니다." });
      } else {

        var haveCheck = userInfo.itemCount[itemInfo.id];

        if (haveCheck == 1) {
          userInfo.item.splice(userInfo.item.indexOf(itemInfo.id), 1);
        }

        userInfo.gold = userInfo.gold + Math.round(itemInfo.price / 2);

        userInfo.itemCount[itemInfo.id] = haveCheck - 1;
        _account2.default.update({ username: userInfo.username }, { $set: { itemCount: userInfo.itemCount, item: userInfo.item, gold: userInfo.gold } }, function (err, output) {
          res.json({ msg: "판매 완료 하였습니다." });
        });
      }
    });
  });
});

/*전직 한다*/
router.get('/changeJob/:jobName', function (req, res) {
  // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
  var jobName = req.params.jobName;
  _account2.default.find({ username: req.session.loginInfo.username }).exec(function (err, accounts) {
    if (err) throw err;
    var userInfo = eval(accounts[0]);

    if (100000 > userInfo.gold) {
      res.json({ msg: "소지금이 부족합니다 스크립트 조작해서 살 생각 하지 마라" });
    } else if (40 > userInfo.lv) {
      res.json({ msg: "레벨이 부족 합니다." });
    } else {
      userInfo.gold = userInfo.gold - 100000;

      var jobTxt = "";
      var job2 = "";
      if (userInfo.job == "마법사") {
        job2 = '깨달은 현자';
        jobTxt = "깨달은 현자가 되었습니다. 깨달은 현자의 능력 고속영창과 주문보호를 할 수 있습니다.";
      }
      if (userInfo.job == "검사") {
        job2 = '검의 달인';
        jobTxt = "검의 달인이 되었습니다 무기상쇄와 검기를 사용 할 수 있습니다.";
      }
      if (userInfo.job == "암살자") {
        job2 = '그림자 살귀';
        jobTxt = "그림자 살귀가 되었습니다. 그림자 숨기와 이화접목을 사용 할 수 있습니다.";
      }

      _account2.default.update({ username: userInfo.username }, { $set: { job2: job2, gold: userInfo.gold } }, function (err, output) {
        res.json({ msg: jobTxt });
      });
    }
  });
});

// 노예 구매
router.post('/buySlave/', function (req, res) {
  console.log("노예 구매");
  console.log(req.body);
  var itemid = req.body.name;
  var slaveName = req.body.slaveName;
  _account2.default.find({ username: req.session.loginInfo.username }).exec(function (err, accounts) {
    if (err) throw err;
    var userInfo = eval(accounts[0]);

    _slave2.default.find({ id: itemid }).exec(function (err, item) {
      if (err) throw err;
      var itemInfo = eval(item[0]);

      //금액 확인
      if (itemInfo.price > userInfo.gold) {
        res.json({ msg: "소지 금액이 부족합니다.", result: false });
      }

      var gold = userInfo.gold - itemInfo.price;

      _account2.default.update({ username: req.session.loginInfo.username }, { $set: { gold: gold } }, function (err, output) {
        if (err) throw err;

        _slave2.default.find({ master: req.session.loginInfo.username }).exec(function (err, slaves) {
          if (err) throw err;
          var slaveInfo = eval(slaves[0]);

          if (slaveInfo == "" || slaveInfo == null || slaveInfo == undefined) {
            var slave = new _slave2.default({
              name: slaveName,
              id: slaveName + req.session.loginInfo.username,
              master: req.session.loginInfo.username,
              kind: itemInfo.kind,
              tribe: itemInfo.tribe,
              job: itemInfo.job,
              lv: itemInfo.lv,
              hp: itemInfo.hp,
              mp: itemInfo.mp,
              str: itemInfo.str,
              int: itemInfo.int,
              dex: itemInfo.dex,
              exp: itemInfo.exp,
              max_hp: itemInfo.max_hp,
              max_mp: itemInfo.max_mp,
              upStr: itemInfo.upStr,
              upInt: itemInfo.upInt,
              upDex: itemInfo.upDex,
              mount: itemInfo.mount,
              msg: itemInfo.msg,
              chat: itemInfo.chat,
              skill: itemInfo.skill
            });

            // 노예 등록
            slave.save(function (err) {
              if (err) throw err;
              var resultMsg = req.session.loginInfo.username + "님께서  [" + itemInfo.tribe + "  " + slaveName + "]을(를) 구매 하였습니다.";
              res.json({ msg: resultMsg, result: true });
            });
          } else {
            // 기존노예에 새로운 노예로 업데이트
            _slave2.default.update({ master: req.session.loginInfo.username }, { $set: { name: slaveName,
                id: slaveName + req.session.loginInfo.username,
                master: req.session.loginInfo.username,
                kind: itemInfo.kind,
                tribe: itemInfo.tribe,
                job: itemInfo.job,
                lv: itemInfo.lv,
                hp: itemInfo.hp,
                mp: itemInfo.mp,
                str: itemInfo.str,
                int: itemInfo.int,
                dex: itemInfo.dex,
                exp: itemInfo.exp,
                max_hp: itemInfo.max_hp,
                max_mp: itemInfo.max_mp,
                upStr: itemInfo.upStr,
                upInt: itemInfo.upInt,
                upDex: itemInfo.upDex,
                mount: itemInfo.mount,
                msg: itemInfo.msg,
                chat: itemInfo.chat,
                skill: itemInfo.skill } }, function (err, output) {
              if (err) throw err;
              var resultMsg = req.session.loginInfo.username + "님께서  [" + itemInfo.tribe + "  " + slaveName + "]을(를) 구매 하였습니다.";
              res.json({ msg: resultMsg, result: true });
            });
          }
        });
      });
    });
  });
});

// 맵 이동시 위치 저장
router.get('/saveMap/:mapName', function (req, res) {
  _account2.default.update({ username: req.session.loginInfo.username }, { $set: { mapName: req.params.mapName } }, function (err, output) {
    res.json({ msg: "맵이동 저장 완료." });
  });
});

/*
 SEARCH USER: GET /api/account/search/:username
 */
router.get('/search/:username', function (req, res) {
  // SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
  var re = new RegExp('^' + req.params.username);
  _account2.default.find({ username: { $regex: re } }, { _id: false, username: true, lv: true, job: true, job2: true }).limit(10).sort({ username: 1 }).exec(function (err, accounts) {
    if (err) throw err;
    res.json(accounts);
  });
});

// EMPTY SEARCH REQUEST: GET /api/account/search
router.get('/search', function (req, res) {
  res.json([]);
});

exports.default = router;