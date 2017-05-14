const path = require('path');
const fs = require('fs');
let express = require('express');
let app = express();

const NODE_ENV = process.env.NODE_ENV;
const isProduction = NODE_ENV === 'production';
console.log('isProduction=', isProduction);

let STATIC_ROOT = 'docs';
if (!isProduction) {
    STATIC_ROOT = 'dist';
}

// for viewer
// FIXME Path join.
app.use('/dist', express.static(path.resolve(__dirname, STATIC_ROOT, 'dist')));
app.use('/pages', express.static(path.resolve(__dirname, STATIC_ROOT, 'pages')));
app.use('/build', express.static(path.resolve(__dirname, STATIC_ROOT, 'build')));
app.use('/pdfs', express.static(path.resolve(__dirname, STATIC_ROOT, 'pdfs')));

// TODO
app.use('/pdfanno-core.bundle.js', express.static(path.resolve(__dirname, STATIC_ROOT, 'pdfanno-core.bundle.js')));
app.use('/pdfanno.bundle.js', express.static(path.resolve(__dirname, STATIC_ROOT, 'pdfanno.bundle.js')));

app.get('/', function(req, res) {
    res.type('html');
    res.send(fs.readFileSync(path.resolve(__dirname, STATIC_ROOT, 'index.html')));
});

app.post('/api/upload', (req, res) => {
    res.json({ status : 'OK' });
});

// // for api
// app.get('/api/anno/add', function(req, res) {
//     // TODO implement.
//     res.send('ok');
// });
// app.get('/api/anno/get', function(req, res) {
//     // TODO implement.
//     res.send('ok');
// });

app.listen(8000, function() {
    console.log('STATIC_ROOT=', STATIC_ROOT)
    console.log('Express app listening on port 8000.');
});
