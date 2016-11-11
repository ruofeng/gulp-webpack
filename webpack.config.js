var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');
var ugliyfyPlugin = new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        });

// dir
var SRC_DIR = path.resolve(process.cwd(), 'src');

// 获取多页面的每个入口文件，用于配置中的entry
function getEntry() {
    var jsPath = path.resolve(SRC_DIR, 'scripts');
    var dirs = fs.readdirSync(jsPath);
    var matchs = [], files = {};

    // for Each
    dirs.forEach(function (item) {
        matchs = item.match(/(.+)\.js$/);
        if (matchs) {
            files[matchs[1]] = path.resolve(SRC_DIR, 'scripts', item);
        }
    });

    return files;
}

module.exports = {
    cache: true,
    devtool: 'source-map',
    plugins: [commonsPlugin, ugliyfyPlugin],
    entry: getEntry(),
    output: {
        path: path.join(__dirname, '.tmp/scripts/'),
        filename: '[name].js'
    },
    module: {
        loaders: [
            {test: /\.css$/, loader: 'style-loader!css-loader'},
            {test: /\.js$/, loader: 'jsx-loader?harmony'},
            {test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
            {test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'}
        ]
    },
    resolve: {
        root: SRC_DIR,
        extensions: ['', '.js', '.json', '.scss'],
        alias: {
        }
    }
};