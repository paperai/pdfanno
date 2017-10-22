/**
 * Service - PDF related.
 */
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;
const request = require('request');
const packageJson = require('../../package.json');

/**
 * Save a PDF file, and return the saved path.
 */
module.exports.savePDF = (fileName, content) => {
    return new Promise((resolve, reject) => {

        const dataPath = path.resolve(__dirname, '..', 'server-data');
        if (!fs.existsSync(dataPath)) {
                fs.mkdirSync(dataPath);
        }
        const pdfPath = path.resolve(dataPath, fileName);
        fs.writeFileSync(pdfPath, content);

        resolve(pdfPath);
    });
}

// Analize pdf with pdfreader.jar.
module.exports.analyzePDF = (pdfPath) => {

    return new Promise((resolve, reject) => {

        // Check java command exits.
        execCommand('java -version')
            .then(resolve)
            .catch(() => {
                reject('java command not found.');
            });

    }).then(() => {

        if (isPDFExtractLoaded()) {
            return;
        }

        return loadPDFExract();

    }).then(() => {

        const jarPath = path.resolve(__dirname, '..', 'pdfextract.jar');
        const cmd = `java -classpath ${jarPath} PDFExtractor ${pdfPath} -text -bounding`;
        return execCommand(cmd);

    }).then(({ stdout, stderr }) => {
        return stdout;
    });
}

// Execute an external command.
function execCommand(command) {
    console.log('execCommand: ' + command);
    return new Promise((resolve, reject) => {
        exec(command, { maxBuffer : 1024 * 1024 * 50 }, (err, stdout, stderr) => {
            if (err) {
                reject({ err, stdout, stderr });
            }
            resolve({ stdout, stderr });
        });
    });
}

function getPDFExtractPath () {
    return path.resolve(__dirname, '..', 'extlib', `pdfextract-${packageJson.pdfextract.version}.jar`);
}

function isPDFExtractLoaded () {
    return fs.existsSync(getPDFExtractPath());
}

function loadPDFExract () {

    return new Promise((resolve, reject) => {

        const reqConfig = {
            method   : 'GET',
            url      : packageJson.pdfextract.url,
            encoding : null
        };

        request(reqConfig, function(err, response, buf) {

            if (err) {
                reject(err);
            }

            const dirPath = path.resolve(__dirname, '..', 'extlib')
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath)
            }

            fs.writeFileSync(getPDFExtractPath(), buf);
            resolve();
        });
    });
}
