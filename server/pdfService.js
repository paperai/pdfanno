/**
 * Service - PDF related.
 */
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;
const request = require('request');
/**
 * Save a PDF file, and return the saved path.
 */
module.exports.savePDF = (fileName, content) => {
    return new Promise((resolve, reject) => {

        const dataPath = path.resolve(__dirname, 'server-data');
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

        // Prepare pdfreader.jar

        const exists = fs.existsSync(path.resolve(__dirname, 'pdfextract.jar'));
        if (exists) {
            return;
        }

        return new Promise((resolve, reject) => {

            const reqConfig = {
                method   : 'GET',
                url      : 'https://cl.naist.jp/~shindo/pdfextract.jar',
                encoding : null
            };

            request(reqConfig, function(err, response, buf) {

                if (err) {
                    reject(err);
                }

                fs.writeFileSync(path.resolve(__dirname, 'pdfextract.jar'), buf);

                resolve();
            });
        });

    }).then(() => {

        const jarPath = path.resolve(__dirname, 'pdfextract.jar');
        const cmd = `java -classpath ${jarPath} TextExtractor ${pdfPath}`;
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
