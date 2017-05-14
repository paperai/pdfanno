const path = require('path');
const fs = require('fs');
const base64 = require('base64');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();

// Load environment.
const NODE_ENV = process.env.NODE_ENV;
const isProduction = NODE_ENV === 'production';
console.log('isProduction=', isProduction);

// Set the static root directory.
let STATIC_ROOT = 'docs';
if (!isProduction) {
    STATIC_ROOT = 'dist';
}

// create Application.
const app = express();

// Settings for POST request.
app.use(bodyParser.json({ limit : '50mb' }));
app.use(bodyParser.urlencoded({ limit : '50mb', expented : true }));

// Setting for static files.
app.use('/dist', express.static(path.resolve(__dirname, STATIC_ROOT, 'dist')));
app.use('/pages', express.static(path.resolve(__dirname, STATIC_ROOT, 'pages')));
app.use('/build', express.static(path.resolve(__dirname, STATIC_ROOT, 'build')));
app.use('/pdfs', express.static(path.resolve(__dirname, STATIC_ROOT, 'pdfs')));
app.use('/pdfanno-core.bundle.js', express.static(path.resolve(__dirname, STATIC_ROOT, 'pdfanno-core.bundle.js')));
app.use('/pdfanno.bundle.js', express.static(path.resolve(__dirname, STATIC_ROOT, 'pdfanno.bundle.js')));

// Rooting : Index file.
app.get('/', function(req, res) {
    res.type('html');
    res.send(fs.readFileSync(path.resolve(__dirname, STATIC_ROOT, 'index.html')));
});

// Rooting(API) : Uploading a pdf.
app.post('/api/pdf_upload', (req, res) => {

    const fileName = req.body.name;
    const contentBase64 = req.body.content.replace('data:application/pdf;base64,', '');
    const buf = Buffer.from(contentBase64, 'base64');
    console.log(`${fileName} is uploaded. fileSize=${Math.floor(buf.length / 1024)}KB`);

    // Save to dir.
    if (!fs.existsSync('server-data')) {
        fs.mkdirSync('server-data');
    }
    fs.writeFileSync('server-data/' + fileName, buf);

    // Response the result.
    res.json({ status : 'OK' });
});

// Launch app.
app.listen(8000, function() {
    console.log('Express app listening on port 8000.');
});
