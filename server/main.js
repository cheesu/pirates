import PropTypes from 'prop-types';
import express from 'express';
import path from 'path';

import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import morgan from 'morgan'; // HTTP REQUEST LOGGER
import bodyParser from 'body-parser'; // PARSE HTML BODY

import mongoose from 'mongoose';
import session from 'express-session';

import api from './routes';


const app = express();
const port = 3000;
const devPort = 4000;

app.use(morgan('dev'));
app.use(bodyParser.json());

/* mongodb connection */
const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => { console.log('Connected to mongodb server'); });
 mongoose.connect('mongodb://cheesu:duswkr88##@ds145389.mlab.com:45389/cheesustudy');
//mongoose.connect('mongodb://127.0.0.1:27017/codelab');

/* use session */
app.use(session({
    secret: 'CodeLab1$1$234',
    resave: false,
    saveUninitialized: true
}));

app.use('/', express.static(path.join(__dirname, './../public')));

app.use('/api', api);

/* support client-side routing */
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './../public/index.html'));
});

/* handle error */
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.get('/hello', (req, res) => {
    return res.send('Hello CodeLab');
});
/*
app.listen(process.env.PORT||port, () => {
    console.log('Express is listening on port update', process.env.PORT||port);
});*/

if(process.env.NODE_ENV == 'development') {
    console.log('Server is running on development mode');
    const config = require('../webpack.dev.config');
    const compiler = webpack(config);
    const devServer = new WebpackDevServer(compiler, config.devServer);
    devServer.listen(
        devPort, () => {
            console.log('webpack-dev-server is listening on port', devPort);
        }
    );
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

const server = app
  .use((req, res) => res.sendFile(path.resolve(__dirname, './../public/index.html')) )
  .listen(process.env.PORT||port, () => console.log(`Listening on ${ process.env.PORT||port }`));

var socketIO = require('socket.io');
const io = socketIO(server);

var chatUserList = []; // 채팅 소켓 접속자 목록

io.on('connection', (socket) => {
    socket.on('chat', function(msg){
      io.emit('chat', msg);
    });

    socket.on('totalCount', function(addUserName){
      const msg = addUserName+"포함 총인원:"+io.eio.clientsCount;
      io.emit('chat', msg);
    });



    socket.on('addUser', function(addUserName){
      let userSocketId =socket.id;
      let userObj = new Object();
      userObj.userID = addUserName;
      userObj.socketID = userSocketId;
      chatUserList.push(userObj);
      console.log(addUserName+":접속");
      const msg = addUserName+"포함 총인원:"+io.eio.clientsCount;
      io.emit('chat', msg);
    });

    socket.on('disconnect', () =>{
      let disUserSocketId =socket.id;
      var disUserName = "";
      var disArrIndex;
      // 나간 사용자 삭제
      for(var count=0;count<chatUserList.length;count++){
        let disSocketId  =chatUserList[count].socketID;
        if(disSocketId == disUserSocketId ){
          disUserName = chatUserList[count].userID;
          disArrIndex = count;
        }
      }
    //제거
    chatUserList.splice(disArrIndex, 1);

    io.emit('chat', disUserName+"님이 퇴장 하셨습니다.");
    io.emit('nowUserList', chatUserList);
    console.log('Client disconnected');
  }
 );
});

io.sockets.on("connection", function(socket){
  socket.on('callUserList', function(addUserName){
    console.log("유저목록 요청");
    io.emit('callUserList', JSON.stringify(chatUserList));
  });
});
