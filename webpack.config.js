const path = require('path');
const webpack = require('webpack');

let config = {
    entry : {
        'pdfanno.page' : './src/pdfanno.js',
        'pdfanno.core' : './src/core/index.js'
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
        }]
    },
    plugins : [],
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
