require('file-loader?name=dist/embedded-sample.html!./embedded-sample.html')
require('!style-loader!css-loader!./embedded-sample.css')

console.log('hello')
