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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// HTTP REQUEST LOGGER
var app = (0, _express2.default)(); // PARSE HTML BODY

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

app.listen(process.env.PORT || port, function () {
    console.log('Express is listening on port', process.env.PORT || port);
});

if (process.env.NODE_ENV == 'development') {
    console.log('Server is running on development mode');
    var config = require('../webpack.dev.config');
    var compiler = (0, _webpack2.default)(config);
    var devServer = new _webpackDevServer2.default(compiler, config.devServer);
    devServer.listen(devPort, function () {
        console.log('webpack-dev-server is listening on port', devPort);
    });
}

// 소켓 통신 관련
var io = require('socket.io').listen(process.env.PORT || 3303);
console.log("socket server run!!");

// 소켓 통신 날린 사람만 받을 수 있는 것.
io.sockets.on("connection", function (socket) {
    socket.on('private', function (msg) {
        // 응답
        socket.emit('private', msg); // 요청
    });
});

// 커넥션된 모드에게 날려주는 것
io.on('connection', function (socket) {
    socket.on('chat', function (msg) {
        io.emit('chat', msg);
    });
});