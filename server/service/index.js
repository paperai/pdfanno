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
        // TODO Use Async.
        fs.writeFileSync(pdfPath, content);

        resolve(pdfPath);
    });
}

// Analize pdf with pdfreader.jar.
module.exports.analyzePDF = async (pdfPath) => {

    // Check java command exits.
    try {
        await execCommand('java -version')
    } catch (e) {
        throw new Error('java command not found.')
    }

    // Load pdfextract.jar.
    if (!isPDFExtractLoaded()) {
        await loadPDFExract()
    }

    // Analyze the PDF.
    const jarPath = getPDFExtractPath()
    const cmd = `java -classpath ${jarPath} PDFExtractor ${pdfPath} -text -bounding`;
    const { stdout, stderr } = await execCommand(cmd);

    return stdout
}

// Get a user annotation.
module.exports.getUserAnnotation = (documentId, userId) => {

    const annotationPath = path.resolve(__dirname, '..', 'userdata', 'anno', userId, `${documentId}.anno`)
    console.log('annotationPath:', annotationPath)
    if (!fs.existsSync(annotationPath)) {
        return null
    }

    return fs.readFileSync(annotationPath, 'utf-8')
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
