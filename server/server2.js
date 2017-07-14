const path = require('path');
const fs = require('fs');
const express = require('express');
const request = require('request');

// Load environment.
const NODE_ENV = process.env.NODE_ENV;
const isProduction = NODE_ENV === 'production';
console.log('isProduction=', isProduction);

// Set the static root directory.
let STATIC_ROOT = '../docs';
if (!isProduction) {
    STATIC_ROOT = '../dist';
}

// create Application.
const app = express();

// Settings for POST request.
// app.use(bodyParser.json({ limit : '50mb' }));
// app.use(bodyParser.urlencoded({ limit : '50mb', expented : true }));

// Routing: Static files.
app.use('/dist', express.static(path.resolve(__dirname, STATIC_ROOT, 'dist')));
app.use('/pages', express.static(path.resolve(__dirname, STATIC_ROOT, 'pages')));
app.use('/build', express.static(path.resolve(__dirname, STATIC_ROOT, 'build')));
app.use('/pdfs', express.static(path.resolve(__dirname, STATIC_ROOT, 'pdfs')));
app.use('/pdfanno.core.bundle.js', express.static(path.resolve(__dirname, STATIC_ROOT, 'pdfanno.core.bundle.js')));
app.use('/pdfanno.page.bundle.js', express.static(path.resolve(__dirname, STATIC_ROOT, 'pdfanno.page.bundle.js')));

// Routing: Index file.
app.get('/', function(req, res) {
    res.type('html');
    res.send(fs.readFileSync(path.resolve(__dirname, STATIC_ROOT, 'index.html')));
});

// Routing: PDF Loader.
// example: http://localhost:8001/?pdf=http://www.yoheim.net/tmp/pdf-sample.pdf
app.get('/load_pdf', (req, res) => {

    const pdfURL = req.query.url;
    console.log('pdfURL=', pdfURL);

    const reqConfig = {
        method   : 'GET',
        url      : pdfURL,
        headers : {
            'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.19 Safari/537.36'
        },
        encoding : null     // treat a response as a binary.
    };

    request(reqConfig, function(error, response, body) {

        res.setHeader('Content-Length', body.length);
        res.write(body, 'binary');
        res.end();

    });

});

// Launch app.
const port = 8001;
app.listen(port, function() {
    console.log(`Express app listening on port ${port}.`);
});
