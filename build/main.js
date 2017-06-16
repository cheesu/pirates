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

var _Fight = require('./game/Fight');

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

var chatUserList = []; // 채팅 소켓 접속자 목록

io.on('connection', function (socket) {
  socket.on('Gchat', function (msg) {
    io.emit('Gchat', msg);
  });
  socket.on('NoticeChat', function (msg) {
    io.emit('NoticeChat', msg);
  });

  socket.on('totalCount', function (addUserName) {
    var msg = addUserName + "포함 총인원:" + chatUserList.length;
    io.emit('chat', msg);
  });

  socket.on('chat', function (msg) {
    var ch = msg.split(":ch:");
    io.emit(ch[0], ch[1]);
  });

  socket.on('addUser', function (addUserName) {
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

    var msg = addUserName + "포함 총인원:" + chatUserList.length;
    //socket.request.session = {};

    io.emit('Gchat', msg);
  });

  //귓말
  socket.on('whisper', function (wObj) {
    console.log(wObj);
    var sedMsg = "[귓속말] " + wObj.sendUser + ": " + wObj.msg;
    io.emit(wObj.target, sedMsg);
  });

  socket.on('attack', function (info) {
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

  socket.on('disconnect', function () {
    var disUserSocketId = socket.id;
    for (var count = 0; count < chatUserList.length; count++) {
      var disSocketId = chatUserList[count].socketID;
      if (disSocketId == disUserSocketId) {
        var disUserName = chatUserList[count].userID;
        //알림
        io.emit('Gchat', disUserName + "님이 퇴장 하셨습니다.");
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

  socket.on('viewMap', function (msg) {
    for (var countY = 0; countY < msg.length; countY++) {
      for (var countX = 0; countX < msg[countY].length; countX++) {
        var val = msg[countY][countX];
        if (val == 0) {
          msg[countY][countX] = '□';
        } else if (val == -1) {
          msg[countY][countX] = '■';
        } else if (val == 2) {
          msg[countY][countX] = '★';
        } else if (val == 3) {
          msg[countY][countX] = '※';
        } else if (val == 4) {
          msg[countY][countX] = '※';
        } else if (val == 9) {
          msg[countY][countX] = '♨';
        }
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
});