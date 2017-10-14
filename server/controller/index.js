const request = require('request');
const service = require('../service');

/**
 * Upload a PDF file and analyze it.
 */
module.exports.uploadPDF = function (req, res) {

    // Get an uploaded file.
    const fileName = req.body.filename;
    const buf = Buffer.from(req.body.pdf, 'base64');
    console.log(`${fileName} is uploaded. fileSize=${buf.length}Bytes`);

    // Save.
    service .savePDF(fileName, buf).then(pdfPath => {
        // Analyze.
        return service .analyzePDF(pdfPath);
    }).then(result => {
        // Response the analyze result.
        res.json({ status : 'success', text : result });
    }).catch(err => {
        // Response the error.
        console.log('analyze:error:', err);
        res.json({ status : 'failure' , err });
    });
}

/**
 * Load a PDF file from web.
 *
 * Examples:
 *  - http://localhost:8080/dist/?pdf=http://www.yoheim.net/tmp/pdf-sample.pdf
 *  - http://localhost:8080/dist/?pdf=https://arxiv.org/pdf/1707.03141
 */
module.exports.loadPDF = function (req, res) {

    const pdfURL = req.query.url;
    console.log('pdfURL=', pdfURL);

    const reqConfig = {
        method   : 'GET',
        url      : pdfURL,
        headers  : {
            // behave as a browser.
            'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.19 Safari/537.36'
        },
        // treat a response as a binary.
        encoding : null
    };

    request(reqConfig, function(error, response, body) {

        // Save as temporary.
        const tmpFileName = Date.now() + '.pdf';
        service .savePDF(tmpFileName, body).then(pdfPath => {
            // Analyze.
            return service .analyzePDF(pdfPath);
        }).then(analyzeResult => {
            // Response as success.
            res.json({
                status : 'success',
                pdf    : new Buffer(body).toString('base64'),
                analyzeResult,
            });
        }).catch(err => {

            console.log('ERROR:', err);

            // Response as error.
            res.json({
                status : 'failure',
                err    : err
            });
        })
    });
}

/**
 * Load an anno file from web.
 *
 * Examples:
 *  - http://localhost:8080/dist/?pdf=http://www.yoheim.net/tmp/pdf-sample.pdf&anno=http://www.yoheim.net/tmp/ex1.anno
 */
module.exports.loadAnno = function (req, res) {

    const annoURL = req.query.url;
    console.log('annoURL=', annoURL);

    const reqConfig = {
        method : 'GET',
        url    : annoURL
    };
    request(reqConfig, function(error, response, body) {
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
}
