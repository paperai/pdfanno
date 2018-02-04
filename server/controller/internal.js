/**
    APIs for PDFAnno.
*/

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
 *  # Use deepscholar pdftxt.
 *      - http://localhost:8080/dist/?pdf=http://www.deepscholar.org/api/documents/PMC5000131/PMC5000131.pdf
 *  # Otherwise.
 *      - http://localhost:8080/dist/?pdf=http://www.yoheim.net/tmp/pdf-sample.pdf
 *      - http://localhost:8080/dist/?pdf=https://arxiv.org/pdf/1707.03141
 */
module.exports.loadPDF = async function (req, res) {

    const pdfUrl = req.query.url;
    console.log(`loadPDF: ${pdfUrl}`);

    try {

        const pdf = await service.fetchPDF(pdfUrl);
        if (!pdf) {
            return res.send(404, 'Not Found.');
        }

        const pdftxtUrl = pdfUrl + '.txt'
        let pdftxt = await service.fetchPDFText(pdftxtUrl)

        if (!pdftxt) {
            // Fallback to local pdfextract.
            console.log(`Fallback to local pdfextract. Not found at deepscholar - ${pdftxtUrl}`)
            const tmpFileName = Date.now() + '.pdf'
            const pdfPath = await service.savePDF(tmpFileName, pdf)
            pdftxt = await service.analyzePDF(pdfPath)
        }

        res.json({
            status        : 'success',
            pdf           : new Buffer(pdf).toString('base64'),
            analyzeResult : pdftxt,
        });


    } catch (e) {
        console.log('Failed to load PDF. reason is', e)
        res.send(500, 'Failed.');
    }
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
