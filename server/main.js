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

app.listen(port, () => {
    console.log('Express is listening on port', port);
});

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


// 소켓 통신 관련
var io = require('socket.io').listen(3303);
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
});
