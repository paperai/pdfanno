const path = require('path');
const webpack = require('webpack');
const MinifyPlugin = require("babel-minify-webpack-plugin");

let plugins = []
if (process.env.NODE_ENV === 'production') {
    plugins.push(new MinifyPlugin())
}

let config = {
    mode : 'none',
    entry : {
        'pdfanno.page' : './src/pdfanno.js',
        'pdfanno.core' : './src/core/index.js',
        'embedded-sample' : './src/embedded-sample.js',
        'viewer' : './src/viewer.js',
        'debugger' : './src/debugger.js',
        'compatibility' : './src/compatibility.js',
        'l10n' : './src/l10n.js'
    },
    output : {
        filename : './dist/[name].bundle.js',
        library : 'PDFAnnoCore',
        libraryTarget : 'umd'
    },
    module : {
        rules : [{
            test : /\.js$/,
            loader : 'eslint-loader',
            enforce : 'pre',
            include : [path.join(__dirname, 'src')],
            exclude : /node_modules/
        }, {
            test: /\.css$/,
            use : [
                { loader : 'style-loader' },
                {
                    loader : 'css-loader',
                    options : {
                        url : false
                    }
                }
            ]
        }]
    },
    plugins : [
      new webpack.LoaderOptionsPlugin({ options: {} })
    ],
    devServer : {
      host : 'localhost',
      port : 8080,
      watchOptions : {
        aggregateTimeout : 300,
        poll : 1000
      }
    },
    devtool : 'source-map'
};

if (process.env.NODE_ENV === 'production') {
    config.plugins.push(new webpack.DefinePlugin({
        'process.env' : {
            NODE_ENV : '"production"',
            SERVER_PATH : '"' + process.env.SERVER_PATH + '"'
        }
    }))
}

module.exports = config;
