var webpack = require('webpack');
var path = require('path');
module.exports = {
    // 가장 처음 읽을 스크립트파일
    // 여기서부터 import 되어있는 다른 스크립트를 불러온다.
    entry: [
        'babel-polyfill',
        './src/index.js',
        './src/style.css'
    ],

    // 파일을 합치고 ./public/bundle.js 에 저장한다.
    output: {
        path: __dirname + '/public',
        filename: 'bundle.js'
    },

    // ES6 문법과 JSX 문법을 사용한다
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'react']
                }
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            }
        ]
    },

    resolve: {
        alias: {
            Components: path.resolve(__dirname, 'src/components/'),
            Containers: path.resolve(__dirname, 'src/containers/'),
            Actions: path.resolve(__dirname, 'src/actions/'),
            Reducers: path.resolve(__dirname, 'src/reducers/')
        }
    }


};