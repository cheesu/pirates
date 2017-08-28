'use strict';

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackDevServer = require('webpack-dev-server');

var _webpackDevServer2 = _interopRequireDefault(_webpackDevServer);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _systemnotice = require('./models/systemnotice');

var _systemnotice2 = _interopRequireDefault(_systemnotice);

var _slave = require('./models/slave');

var _slave2 = _interopRequireDefault(_slave);

var _Fight = require('./game/Fight');

var _Alarm = require('./game/Alarm');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// PARSE HTML BODY

var RedisStore = require("connect-redis")(_expressSession2.default); // HTTP REQUEST LOGGER


var app = (0, _express2.default)();
var port = 3000;
var devPort = 4000;

app.use((0, _morgan2.default)('dev'));
app.use(_bodyParser2.default.json());

/* mongodb connection */
var db = _mongoose2.default.connection;
db.on('error', console.error);
db.once('open', function () {
  console.log('Connected to mongodb server');
});
_mongoose2.default.connect('mongodb://cheesu:duswkr88##@ds145389.mlab.com:45389/cheesustudy');
//mongoose.connect('mongodb://127.0.0.1:27017/codelab');

/* use session */
app.use((0, _expressSession2.default)({
  secret: 'CodeLab1$1$234',
  resave: false,
  saveUninitialized: true
}));

app.use('/', _express2.default.static(_path2.default.join(__dirname, './../public')));

app.use('/api', _routes2.default);

/* support client-side routing */
app.get('*', function (req, res) {
  res.sendFile(_path2.default.resolve(__dirname, './../public/index.html'));
});

/* handle error */
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.get('/hello', function (req, res) {
  return res.send('Hello CodeLab');
});

/*
app.listen(process.env.PORT||port, () => {
    console.log('Express is listening on port update', process.env.PORT||port);
});*/

if (process.env.NODE_ENV == 'development') {
  console.log('Server is running on development mode');
  var config = require('../webpack.dev.config');
  var compiler = (0, _webpack2.default)(config);
  var devServer = new _webpackDevServer2.default(compiler, config.devServer);
  devServer.listen(devPort, function () {
    console.log('webpack-dev-server is listening on port', devPort);
  });
}

// 소켓 통신 관련 일반
/*var io = require('socket.io').listen(3303);
console.log("socket server run!!");




// 소켓 통신 날린 사람만 받을 수 있는 것.
io.sockets.on("connection", function(socket){
  socket.on('private', function(msg){ // 응답
    socket.emit('private',msg); // 요청
  });
});


// 커넥션된 모드에게 날려주는 것
io.on('connection', function(socket){
  socket.on('chat', function(msg){
    io.emit('chat', msg);
  });
});*/

// 소켓통신 heriku 용

var server = app.use(function (req, res) {
  return res.sendFile(_path2.default.resolve(__dirname, './../public/index.html'));
}).listen(process.env.PORT || port, function () {
  return console.log('Listening on ' + (process.env.PORT || port));
});

var socketIO = require('socket.io');
var io = socketIO(server);

// 시스템 알림
var notice = setInterval(function () {
  _systemnotice2.default.find().exec(function (err, notice) {
    if (err) throw err;

    var randomNo = Math.floor(Math.random() * notice.length);
    var noticeInfo = eval(notice[randomNo]);
    io.emit('NoticeChat', "[시스템] " + " " + noticeInfo.text);
  });
}, 1000 * 60 * 2);

var chatUserList = []; // 채팅 소켓 접속자 목록

io.on('connection', function (socket) {

  socket.on('Gchat', function (msg) {

    msg = msg.replace(/섹스/gi, "저는 여자 손도 못잡아본 찐따 입니다. 음담패설로 자위하는 쓰레기 입니다.");
    msg = msg.replace(/sex/gi, "전 여자랑 자볼일이 앞으로도 없는 개 찐따라라서  음담패설로 자위하는 쓰레기 찌끄레기 입니다.");
    msg = msg.replace(/세엑스/gi, "저는 여자 손도 못잡아본 찐따 입니다. 음담패설로 자위하는 쓰레기 입니다.");
    msg = msg.replace(/아흥/gi, "실제로 여자 신음소리 한번도 못들어본 찐따 입니다..");
    msg = msg.replace(/앗흥/gi, "실제로 여자 신음소리 한번도 못들어본 찐따 입니다..");

    if (msg.indexOf('섹') != -1) {
      msg = msg.replace(/섹/gi, "저는 여자 손도 못잡아본 찐따 입니다. 음담패설로 자위하는 쓰레기 입니다.");
      if (msg.indexOf('스') != -1) {

        msg = msg.replace(/스/gi, "실제로 여자 신음소리 한번도 못들어본 찐따 입니다..");
      }
    }

    if (msg.toLowerCase().indexOf('s') != -1) {
      if (msg.toLowerCase().indexOf('e') != -1) {
        if (msg.toLowerCase().indexOf('x') != -1) {
          msg = msg.replace(/s/gi, "저는 여자 손도 못잡아본 찐따 입니다. 음담패설로 자위하는 쓰레기 입니다.");
          msg = msg.replace(/S/gi, "저는 여자 손도 못잡아본 찐따 입니다. 음담패설로 자위하는 쓰레기 입니다.");
        }
      }
    }

    console.log(msg);

    io.emit('Gchat', msg);
  });
  socket.on('NoticeChat', function (msg) {

    for (var count = 0; count < chatUserList.length; count++) {
      console.log(chatUserList[count].socketID);
      console.log(chatUserList[count].userID);
      if (chatUserList[count].socketID == socket.id) {
        if (chatUserList[count].userID == '운영자') {
          io.emit('NoticeChat', msg);
        }
      }
    }
  });

  socket.on('alarmNoticeChat', function (msg) {

    for (var count = 0; count < chatUserList.length; count++) {
      console.log(chatUserList[count].socketID);
      console.log(chatUserList[count].userID);
      if (chatUserList[count].socketID == socket.id) {
        if (chatUserList[count].userID == '운영자') {
          var alarm = (0, _Alarm.alarmNotice)(msg);
        }
      }
    }
  });

  socket.on('totalCount', function (addUserName) {
    var msg = addUserName + "포함 총인원:" + chatUserList.length;
    io.emit('chat', msg);
  });

  socket.on('chat', function (msg) {
    msg = msg.replace(/섹스/gi, "저는 여자 손도 못잡아본 찐따 입니다. 음담패설로 자위하는 쓰레기 입니다.");
    msg = msg.replace(/sex/gi, "전 여자랑 자볼일이 앞으로도 없는 개 찐따라라서  음담패설로 자위하는 쓰레기 찌끄레기 입니다.");
    msg = msg.replace(/세엑스/gi, "저는 여자 손도 못잡아본 찐따 입니다. 음담패설로 자위하는 쓰레기 입니다.");
    msg = msg.replace(/아흥/gi, "실제로 여자 신음소리 한번도 못들어본 찐따 입니다..");
    msg = msg.replace(/앗흥/gi, "실제로 여자 신음소리 한번도 못들어본 찐따 입니다..");

    if (msg.indexOf('섹') != -1) {
      msg = msg.replace(/섹/gi, "저는 여자 손도 못잡아본 찐따 입니다. 음담패설로 자위하는 쓰레기 입니다.");
      if (msg.indexOf('스') != -1) {

        msg = msg.replace(/스/gi, "실제로 여자 신음소리 한번도 못들어본 찐따 입니다..");
      }
    }

    if (msg.toLowerCase().indexOf('s') != -1) {
      if (msg.toLowerCase().indexOf('e') != -1) {
        if (msg.toLowerCase().indexOf('x') != -1) {
          msg = msg.replace(/s/gi, "저는 여자 손도 못잡아본 찐따 입니다. 음담패설로 자위하는 쓰레기 입니다.");
          msg = msg.replace(/S/gi, "저는 여자 손도 못잡아본 찐따 입니다. 음담패설로 자위하는 쓰레기 입니다.");
        }
      }
    }

    var ch = msg.split(":ch:");
    io.emit(ch[0], ch[1]);
    var idArr = ch[1].split(":");

    if (idArr != undefined) {

      var userId = idArr[0].replace(/ /gi, "");
      console.log("유저 아이디 :" + userId + ":");
      _slave2.default.find({ master: userId }).exec(function (err, slave) {
        if (err) throw err;
        var slaveInfo = slave;
        slaveInfo = eval(slaveInfo[0]);

        if (slave == "" || slave == null || slave == undefined || userId == "") {
          return false;
        }
        console.log(slaveInfo);
        var chatCount = slaveInfo.chat.length;
        console.log(chatCount);
        var randomNo = Math.floor(Math.random() * chatCount);
        console.log("랜덤번호:" + randomNo);
        console.log(slaveInfo.chat);
        var slaveChat = slaveInfo.chat[randomNo];
        io.emit(ch[0], slaveInfo.tribe + " [" + slaveInfo.name + "] : " + slaveChat);
      });
    }
  });

  socket.on('slaveChat', function (msg) {
    var ch = msg.split(":ch:");
    var userId = ch[1];

    if (userId != undefined) {

      console.log("유저 아이디 :" + userId + ":");
      _slave2.default.find({ master: userId }).exec(function (err, slave) {
        if (err) throw err;
        var slaveInfo = slave;
        slaveInfo = eval(slaveInfo[0]);

        if (slave == "" || slave == null || slave == undefined || userId == "") {
          return false;
        }
        var chatCount = slaveInfo.chat.length;
        var randomNo = Math.floor(Math.random() * chatCount);
        var slaveChat = slaveInfo.chat[randomNo];
        io.emit(ch[0], slaveInfo.tribe + " [" + slaveInfo.name + "] : " + slaveChat);
      });
    }
  });

  socket.on('addUser', function (addUserName, userLV) {
    console.log("유저 접속 :" + addUserName);

    var userSocketId = socket.id;
    var userObj = new Object();
    userObj.userID = addUserName;
    userObj.socketID = userSocketId;

    for (var count = 0; count < chatUserList.length; count++) {
      if (chatUserList[count].userID == addUserName) {
        io.emit(addUserName + "[중복접속]", "");
        chatUserList.splice(count, 1);
        io.emit('Gchat', addUserName + "님이 중복 접속으로 퇴장 하셨습니다.");
        return false;
      }
    }

    chatUserList.push(userObj);
    console.log(addUserName + ":접속");

    if (userLV > 100) {
      io.emit('Gchat', "한계를 돌파한자 [" + addUserName + "]님이 입장 하셨습니다.");
    } else {
      io.emit('Gchat', addUserName + "님이 입장 하셨습니다.");
    }

    var msg = addUserName + "포함 총인원:" + chatUserList.length;
    //socket.request.session = {};

    io.emit('Gchat', msg);
  });

  //귓말
  socket.on('whisper', function (wObj) {
    var msg = wObj.msg;
    msg = msg.replace(/섹스/gi, "저는 여자 손도 못잡아본 찐따 입니다. 음담패설로 자위하는 쓰레기 입니다.");
    msg = msg.replace(/sex/gi, "전 여자랑 자볼일이 앞으로도 없는 개 찐따라라서  음담패설로 자위하는 쓰레기 찌끄레기 입니다.");
    msg = msg.replace(/세엑스/gi, "저는 여자 손도 못잡아본 찐따 입니다. 음담패설로 자위하는 쓰레기 입니다.");
    msg = msg.replace(/아흥/gi, "실제로 여자 신음소리 한번도 못들어본 찐따 입니다..");
    msg = msg.replace(/앗흥/gi, "실제로 여자 신음소리 한번도 못들어본 찐따 입니다..");

    if (msg.indexOf('섹') != -1) {
      msg = msg.replace(/섹/gi, "저는 여자 손도 못잡아본 찐따 입니다. 음담패설로 자위하는 쓰레기 입니다.");
      if (msg.indexOf('스') != -1) {

        msg = msg.replace(/스/gi, "실제로 여자 신음소리 한번도 못들어본 찐따 입니다..");
      }
    }

    if (msg.toLowerCase().indexOf('s') != -1) {
      if (msg.toLowerCase().indexOf('e') != -1) {
        if (msg.toLowerCase().indexOf('x') != -1) {
          msg = msg.replace(/s/gi, "저는 여자 손도 못잡아본 찐따 입니다. 음담패설로 자위하는 쓰레기 입니다.");
          msg = msg.replace(/S/gi, "저는 여자 손도 못잡아본 찐따 입니다. 음담패설로 자위하는 쓰레기 입니다.");
        }
      }
    }
    wObj.msg = msg;
    console.log(wObj);
    var sedMsg = "[귓속말] " + wObj.sendUser + ": " + wObj.msg;
    var sedMsg2 = "[귓속말] " + wObj.target + ">>: " + wObj.msg;
    io.emit(wObj.target, sedMsg);
    io.emit(wObj.sendUser, sedMsg2);
  });

  socket.on('attack', function (info) {
    console.log("어택 인포");
    console.log(info);
    var result = (0, _Fight.fight)(io, info);
  });

  socket.on('useSkill', function (info) {
    var result = (0, _Fight.useSkill)(io, info);
  });

  socket.on('useItem', function (info) {
    var result = (0, _Fight.fightUseItem)(io, info);
  });

  socket.on('run', function (info) {
    console.log(info);
    var result = (0, _Fight.run)(io, info);
  });

  // 노예 정보

  socket.on('slaveInfo', function (userID) {

    _slave2.default.find({ master: userID }).exec(function (err, slave) {
      if (err) throw err;
      var slaveInfo = slave;
      slaveInfo = eval(slaveInfo[0]);

      io.emit("slaveInfoChat", "------------------------------------------");
      io.emit("slaveInfoChat", "이름:" + slaveInfo.name);
      io.emit("slaveInfoChat", "종족:" + slaveInfo.tribe + "     레벨:" + slaveInfo.lv);
      io.emit("slaveInfoChat", "힘:" + slaveInfo.str + "  민첩:" + slaveInfo.dex + "    지력:" + slaveInfo.int);
      io.emit("slaveInfoChat", "스킬:" + slaveInfo.skill);
      io.emit("slaveInfoChat", "-----------------------------------------");
      //   io.emit("slaveInfoChat",slaveInfoArr);
      io.emit("slaveInfoChat", slaveInfo.tribe + " [" + slaveInfo.name + "] : 뭘 그렇게 보는 겁니까?");
    });
  });

  // 초대
  socket.on('invite', function (wObj) {
    var sedMsg = "[귓속말] " + wObj.sendUser + ": " + wObj.msg;
    var sedMsg2 = "[귓속말] " + wObj.target + ">>: " + wObj.msg;

    if (wObj.sendUser == wObj.target) {
      io.emit(wObj.sendUser, wObj.target + '오빠는 같이 파티맺을 친구도 없는 찐따구나?.');
    } else {
      io.emit(wObj.target + "invite", wObj);
      io.emit(wObj.sendUser, wObj.target + '님에게 파티 초대 요청을 하였습니다.');
    }
  });

  // 파티
  socket.on('party', function (msg, partyArr) {
    for (var count = 0; count < partyArr.length; count++) {
      io.emit(partyArr[count], msg);
    }
  });

  // 파티 수락
  socket.on('accept', function (sendUser, target) {
    io.emit(sendUser + 'accept', target);
  });

  // 파티 멤버 셋팅
  socket.on('setPartyMember', function (partyArr) {
    for (var count = 0; count < partyArr.length; count++) {
      io.emit(partyArr[count] + "setPartyMember", partyArr);
    }
  });

  socket.on('disconnect', function () {
    var disUserSocketId = socket.id;
    for (var count = 0; count < chatUserList.length; count++) {
      var disSocketId = chatUserList[count].socketID;
      if (disSocketId == disUserSocketId) {
        var disUserName = chatUserList[count].userID;
        //알림
        io.emit('Gchat', disUserName + "님이 퇴장 하셨습니다.");
        io.emit('disconnecParty', disUserName);
        console.log('Client disconnected : ' + disUserName);
        // 리스트에서 삭제
        chatUserList.splice(count, 1);
      }
    }

    io.emit('nowUserList', chatUserList);
  });
});

io.sockets.on("connection", function (socket) {
  socket.on('callUserList', function (addUserName) {
    socket.emit('callUserList', JSON.stringify(chatUserList));
  });

  socket.on('viewMap', function (msg, local) {

    for (var countY = 0; countY < msg.length; countY++) {
      for (var countX = 0; countX < msg[countY].length; countX++) {
        var val = msg[countY][countX];
        if (val == 0) {
          msg[countY][countX] = '□';
        } else if (val == -1 || val == 8) {
          msg[countY][countX] = '■';
        } else if (val == 3) {
          msg[countY][countX] = '※';
        } else if (val == 4) {
          msg[countY][countX] = '※';
        } else if (val == 9) {
          msg[countY][countX] = '♨';
        } else if (val == 11) {
          msg[countY][countX] = '♣';
        } else if (val == 99) {
          msg[countY][countX] = 'Β';
        }

        try {
          if (local[0] == countY && local[1] == countX) {
            msg[countY][countX] = '★';
          }
        } catch (e) {} finally {}
      }
    }
    socket.emit('viewMap', msg);
  });

  socket.on('move', function (msg) {
    socket.emit('private', msg);
  });

  socket.on('private', function (msg) {
    socket.emit('private', msg);
  });

  socket.on('rest', function (name) {
    var result = (0, _Fight.rest)(socket, name);
  });
  socket.on('restEnd', function (name) {
    var result = (0, _Fight.restEnd)(socket, name);
  });

  socket.on('setLocalCh', function (msg) {
    console.log("소켓 셋 로컬 채널 " + msg);
    socket.emit('setLocalCh', msg);

    var monster = (0, _Fight.checkMonster)(msg);
    socket.emit('setMonster', monster);
  });

  socket.on('getMap', function (mapName) {
    socket.emit('getMap', map);
  });

  socket.on('checkParty', function (data) {
    socket.emit('checkParty', data);
  });
});

var firebase = require("firebase");

firebase.initializeApp({
  serviceAccount: {
    projectId: "pirates-ec4b6",
    clientEmail: "foo@pirates-ec4b6.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDP4j7So9kIERed" + "\nz1PPUFfVCse1bP+pWfolZMeQHmZzx/33Yx+SBHFMnlRwoacc/dHaGr3LKMlce1Yr\nwjVKCxzGGYrItyyvSp1KkfHOw5gzx8enFkoj0PY" + "rr5YoOB6PsuvT1hPT7kZCQNm1\nLfqxCk0d4h7m+FSraiJb+ik2ysAVhbUbxGieJs3XZx2bhqn4zxfd+8kVp8ekJCrm\nEmb8g6IMMkx3pC+bC" + "IpAdRpNvSOa0xBocwq6THUkG0PZkptsCry09j8cIFTBCZBT\nmPizxgbCeQRU0NycnQC77k2C7DEN37dhVuT8G6y6oSdP0Uhx53zD4Q4LoZ/603s1\n9kqQPj" + "LRAgMBAAECggEAFl67R0F4c69wgiaIV0ZxsoGOzLgmVDFULhKdOFCn0mJo\nCDyzbgFqYRtR7NjducyaeMTokuRttApVqIR6kDWH6s1e1jXX6iO2WgrrIXEs1LhK\nhMb" + "CQv5pLyRIR/BaDDlDEAWjwT+NHJ4L5Lzw6CeP9Yearwd0B7TLw71fZ/+uEeKi\n3I9a5m8p7RJqGOQSGYsn67BglhMMqRH7JQ85I5ueAoJq2brKKBTrKP7zOtjjhaPT\ntwyXIG" + "F9Fj1A6rK8pFeSldX8OuZpo82ePxvYewGonbx55Yi51ns9Psk1CMLDcyQO\n5mHMJKTZEgZcDMo2RKlNyiS6An9Wpzj4f5xuu6vmLQKBgQDntXWMTYzRfXRP6VUL\nvi0kmdz3N" + "ZMFBMrblj6gSzQevQWzlB0COsyo8zysmGZf888C2xD7BrI5QD2L5jxH\n/CkNHxwQDO4YlGFwCYX2i5zfH/kokBq1yjyJFvmm2E/ndsoLugqwb88Hk/CNKAaa\n19MhZvaR8b+kbi" + "bHj3/X/F0pwwKBgQDlrWArzre26bVdlygC0X+X8/JtTswfEwai\nfGDUtefE6TQ4IbkbJVclDX9sWTFpBCYpfuZ9V0HNWrAeutSjQgn4LsaXbRfck5UK\n6Ax3EpTVnl6" + "3vwziFg+++RhHrrhBSwSC32FQFXD3ttJbxkGPBIPB6AwhHOtXsehs\n6qkuuqYT2wKBgQCmbM9hVtIuJc3FF/Ld3FrQTzNG3FQc5rRNxDx3JYzqBxpxQZEU\naOdW8l5CGbRuds/ZXT91D" + "fo05M9QDK5/hb52jkG5xY++V9Ukg7KUwvKJ0I1FdTu6\nFugkDzyBehzqQ4gbpCTJVYV+C+RbfsQ/s4USGMJBUUI0+GkiLQ/GMp03wQKBgCeC\nncqrcvsqV" + "SLWf/GMLJDtTET1izPFSBznnJi6+jXrkCof0wISeF1NZyAyb8eLCS2W\nQPxK6Gz1Ltr6dN3o3GIvWcZu4+30DW2k4ZASSDw/VDfzy7mQ5gCKRVz/d37z8sC4\nwLrQFXDnqGRVR" + "K3frvLKglun5+xcFIm4DIaXYT6FAoGBAMXD1yNjOrE/Ta9/tJYT\nOrywFQxOtv8TiaZWuW4AxjbONTi64hWj1GVZf/vj589NCXpASKmEcGkfegJKnHof\n0w2O/tbXF/T/kf6x" + "IK76ype1wiK9dqJJuRUkKDcvj/KAAxTCmvLOi2q9bG7EQGzL\nhEvapmwp9fidDK5TNbGCSmHa\n-----END PRIVATE KEY-----\n"
  },
  databaseURL: "https://pirates-ec4b6.firebaseio.com/"
});