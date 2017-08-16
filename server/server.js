const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;

let multer = require('multer');
let upload = multer();

const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');

const pdfService = require('./pdfService');

// create Application.
const app = express();

// Settings for POST request.
app.use(bodyParser.json({ limit : '50mb' }));
app.use(bodyParser.urlencoded({ limit : '50mb', expented : true }));

// Rooting(API) : Uploading a pdf.
app.post('/api/pdf_upload', upload.fields([]), (req, res) => {

    // Get an uploaded file.
    const fileName = req.body.filename;
    const buf = Buffer.from(req.body.pdf, 'base64');
    console.log(`${fileName} is uploaded. fileSize=${buf.length}Bytes`);

    // Save.
    pdfService.savePDF(fileName, buf).then(pdfPath => {

        // Analyze.
        return pdfService.analyzePDF(pdfPath);

    }).then(result => {

        // Response the analyze result.
        res.json({ status : 'success', text : result });

    }).catch(err => {

        // Response the error.
        console.log('analyze:error:', err);
        res.json({ status : 'failure' , err });
    });

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

        // Save as temporary.
        const tmpFileName = Date.now() + '.pdf';
        pdfService.savePDF(tmpFileName, body).then(pdfPath => {

            // Analyze.
            return pdfService.analyzePDF(pdfPath);

        }).then(analyzeResult => {

            // Response as success.
            res.json({
                status : 'success',
                pdf    : new Buffer(body).toString('base64'),
                analyzeResult,
            });

        }).catch(err => {

            // Response as error.
            res.json({
                status : 'failure',
                err    : err
            });
        })
    });
});

/**
 * Load an external anno file.
 *
 * Sample: http://localhost:3000/api/load_anno?url=http://www.yoheim.net/tmp/ex1.anno
 */
app.get('/api/load_anno', (req, res) => {

    const annoURL = req.query.url;
    console.log('annoURL=', annoURL);

    const reqConfig = {
        method : 'GET',
        url    : annoURL
    };

    request(reqConfig, function(error, response, body) {

        console.log('response.status:', response)

        if (response.statusCode !== 200) {
            if (response.statusCode === 404) {
                error = 'Resource is not found.';
            }
            return res.json({
                status : 'failure',
                error  : error
            });
        }

        res.json({
            status : 'success',
            anno   : body
        });

    });


});

// Port.
let port = process.env.NODE_PORT || 1000;
console.log('PORT:', port);

// Launch app.
app.listen(port, function() {
    console.log(`Express app listening on port ${port}.`);
});
