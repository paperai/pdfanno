const path = require('path');
const webpack = require('webpack');
const LiveReloadPlugin = require('webpack-livereload-plugin');

function resolve (dir) {
  return path.join(__dirname, dir)
}

let config = {
    entry : {
        'pdfanno.page' : './src/pdfanno.js',
        'pdfanno.core' : './src/core/index.js'
    },
    output : {
        filename      : './dist/[name].bundle.js',
        library       : 'PDFAnnoCore',
        libraryTarget : 'umd'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                include: [resolve('src')],
                exclude: /node_modules/,
                options: {
                    // formatter: require('eslint-friendly-formatter')
                }
            },
            // {
            //     test: /\.js$/,
            //     loader: 'babel-loader',
            //     include: [resolve('src')]
            // }
        ]
    },
    plugins : [
        // LiveReload(watchの時のみ有効)
        new LiveReloadPlugin({
            // LiveReloadのオプション（なんか必要あれば）
            // https://www.npmjs.com/package/webpack-livereload-plugin
        })
    ],
    devServer: {
      host: 'localhost',
      port: 8080,
      watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          secure: false
        },
        '/load_pdf': {
          target: 'http://localhost:3000',
          secure: false
        },
        '/ws': {
          target: 'http://localhost:3000',
          secure: false
        },
        '/socket.io/socket.io.js': {
          target: 'http://localhost:3000',
          secure: false
        }
      }
    },
    devtool : 'source-map'
};

if (process.env.NODE_ENV === 'production') {
    config.plugins.push(new webpack.DefinePlugin({
        'process.env' : {
            'NODE_ENV' : '"production"',
            'SERVER_PATH' : '"' + process.env.SERVER_PATH + '"'
        }
    }));
}

module.exports = config;
