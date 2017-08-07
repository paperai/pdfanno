const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;

let multer = require('multer');
let upload = multer();

const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');

// create Application.
const app = express();

// Settings for POST request.
app.use(bodyParser.json({ limit : '50mb' }));
app.use(bodyParser.urlencoded({ limit : '50mb', expented : true }));

// Rooting(API) : Uploading a pdf.
app.post('/api/pdf_upload', upload.fields([]), (req, res) => {

    console.log('keys:', Object.keys(req.body));

    const fileName = req.body.filename;
    console.log('fileName:', fileName);
    // const contentBase64 = Object.keys(req.body)[0].replace('data:application/pdf;base64,', '');
    // const contentBase64 = Object.keys(req.body)[0];
    // console.log('base64.length:', contentBase64.length, contentBase64.slice(0, 100));
    const buf = Buffer.from(req.body.pdf, 'base64');
    // const buf = req.body.file;
    console.log(`${fileName} is uploaded. fileSize=${buf.length}Bytes`);

    // Save to dir.
    if (!fs.existsSync('server-data')) {
        fs.mkdirSync('server-data');
    }
    const pdfPath = path.resolve(__dirname, 'server-data', fileName);
    fs.writeFileSync(pdfPath, buf);

    // Analyze PDF contents.
    analyzePDF(pdfPath).then(result => {
        res.json({ status : 'OK', result });
    }).catch(err => {
        console.log('analyze:error:', err);
        res.json({ status : 'NG' , err });
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


// Analize pdf with pdfreader.jar.
function analyzePDF(pdfPath) {

    return new Promise((resolve, reject) => {

        // Check java command exits.
        execCommand('java -version')
            .then(resolve)
            .catch(() => {
                reject('java command not found.');
            });

    }).then(() => {

        // Prepare pdfreader.jar

        const exists = fs.existsSync(path.resolve(__dirname, 'pdfreader.jar'));
        if (exists) {
            return;
        }

        return new Promise((resolve, reject) => {

            const reqConfig = {
                method   : 'GET',
                url      : 'https://cl.naist.jp/~shindo/pdfreader.jar',
                encoding : null
            };

            request(reqConfig, function(err, response, buf) {
                console.log('request:err:', err);
                console.log('request:response:', response);
                console.log('request:buf:', buf);

                if (err) {
                    reject(err);
                }

                fs.writeFileSync(path.resolve(__dirname, 'pdfreader.jar'), buf);

                resolve();
            });
        });

    }).then(() => {

        const jarPath = path.resolve(__dirname, 'pdfreader.jar');
        const cmd = `java -classpath ${jarPath} TextDrawImageExtractor ${pdfPath}`;
        console.log('cmd:', cmd);
        return execCommand(cmd);

    }).then(({ stdout, stderr }) => {

        console.log('stdout:', stdout);
        console.log('stderr:', stderr);

        return stdout;
    });
}









function execCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, { maxBuffer : 1024 * 1024 * 50 }, (err, stdout, stderr) => {
            if (err) {
                reject({ err, stdout, stderr });
            }
            resolve({ stdout, stderr });
        });
    });
}
