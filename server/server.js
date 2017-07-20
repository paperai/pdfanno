const path = require('path');
const fs = require('fs');
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');

// create Application.
const app = express();

// Settings for POST request.
app.use(bodyParser.json({ limit : '50mb' }));
app.use(bodyParser.urlencoded({ limit : '50mb', expented : true }));


//============ Settings for local development (from) ==================//
// Routing for static files.
let STATIC_ROOT = path.join('..', (process.env.NODE_ENV === 'production' ? 'docs' : 'dist'));
app.use('/dist', express.static(path.resolve(__dirname, STATIC_ROOT, 'dist')));
app.use('/pages', express.static(path.resolve(__dirname, STATIC_ROOT, 'pages')));
app.use('/build', express.static(path.resolve(__dirname, STATIC_ROOT, 'build')));
app.use('/pdfs', express.static(path.resolve(__dirname, STATIC_ROOT, 'pdfs')));
app.use('/pdfanno.core.bundle.js', express.static(path.resolve(__dirname, STATIC_ROOT, 'pdfanno.core.bundle.js')));
app.use('/pdfanno.page.bundle.js', express.static(path.resolve(__dirname, STATIC_ROOT, 'pdfanno.page.bundle.js')));
app.get('/', function(req, res) {
    res.type('html');
    res.send(fs.readFileSync(path.resolve(__dirname, STATIC_ROOT, 'index.html')));
});
//============ Settings for local development (to) ==================//


// Rooting(API) : Uploading a pdf.
app.post('/api/pdf_upload', (req, res) => {

    console.log('Object.keys(req.body)[0]:', Object.keys(req.body)[0].slice(0,100))

    const fileName = 'tmp.pdf';
    const contentBase64 = Object.keys(req.body)[0].replace('data:application/pdf;base64,', '');
    const buf = Buffer.from(contentBase64, 'base64');
    console.log(`${fileName} is uploaded. fileSize=${Math.floor(buf.length / 1024)}KB`);

    // Save to dir.
    if (!fs.existsSync('server-data')) {
        fs.mkdirSync('server-data');
    }
    fs.writeFileSync(path.resolve(__dirname, 'server-data', fileName), buf);

    // Response the result.
    res.json({ status : 'OK' });
});

// Routing: PDF Loader.
// example:
//      http://localhost:8000/?pdf=http://www.yoheim.net/tmp/pdf-sample.pdf
//      http://localhost:8000/?pdf=https://arxiv.org/pdf/1707.03141
app.get('/load_pdf', (req, res) => {

    const pdfURL = req.query.url;
    console.log('pdfURL=', pdfURL);

    const reqConfig = {
        method   : 'GET',
        url      : pdfURL,
        headers : {
            // behave as a browser.
            'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.19 Safari/537.36'
        },
        // treat a response as a binary.
        encoding : null
    };

    request(reqConfig, function(error, response, body) {
        res.setHeader('Content-Length', body.length);
        res.write(body, 'binary');
        res.end();
    });
});

// Port.
let port = process.env.NODE_PORT || 1000;
console.log('PORT:', port);

// Launch app.
app.listen(port, function() {
    console.log(`Express app listening on port ${port}.`);
});
