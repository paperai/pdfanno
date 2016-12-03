var webpack = require('webpack');

module.exports = {
  entry: {
    app : './src/app.js',
    'pdf-annotate' : './src/pdf-annotatejs/index.js'
  },
  output: {
    filename: './dist/[name].bundle.js',
    library: 'PDFAnnotate',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['add-module-exports']
        }
      }
    ]
  },
  devtool: 'source-map'
};
