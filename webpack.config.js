var webpack = require('webpack');

module.exports = {
  entry: {
    pdfanno : './src/pdfanno.js',
    'pdfanno-core' : './src/core/index.js'
  },
  output: {
    filename: './dist/[name].bundle.js',
    library: 'PDFAnnoCore',
    libraryTarget: 'umd'
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
  devtool: 'source-map'
};
