const path = require('path');
const webpack = require('webpack');
const LiveReloadPlugin = require('webpack-livereload-plugin');


let resolves = [];
if (process.env.ANNO_UI === 'YES') {
    console.log('ANNO_UI DEPLOYMENT MODE.')
    // resolves.push(path.resolve('../anno-ui/src'))
}

module.exports = {
  entry: {
    'pdfanno.page' : './src/pdfanno.js',
    'pdfanno.core' : './src/core/index.js'
  },
  output: {
    filename      : './dist/[name].bundle.js',
    library       : 'PDFAnnoCore',
    libraryTarget : 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-1'],
          plugins: ['add-module-exports']
        }
      }
    ]
  },
  plugins: [
    // LiveReload(watchの時のみ有効)
    new LiveReloadPlugin({
      // LiveReloadのオプション（なんか必要あれば）
      // https://www.npmjs.com/package/webpack-livereload-plugin
    })
  ],
  resolve : {
    root : resolves
  },
  devtool: 'source-map'
};
