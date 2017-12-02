/**
    WebSocket Controllers.
*/
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp-promise')

module.exports = function (server) {
    const io = require('socket.io')(server)
    const ws = io.of('ws')

    // Sample.
    ws.on('connect', function (socket) {
        console.log('connected!!', socket.id)

        socket.on('annotation', function (data) {
            console.log('ws:annotation:', data)

            saveAnnotation(data)

            // TODO params check.
            ws.to(socket.id).emit('annotationUpdated', data.updated)
        })
    })
}

/**
 * Save the annotation.
 */
// TODO This function should be at a service.
async function saveAnnotation({ userId, fileName, annotation }) {

    // TODO params check.

    // TODO Use a promise-based file io library.

    const dirpath = path.join(__dirname, '..', 'userdata', 'anno', userId)

    if (!fs.existsSync(dirpath)) {
        // TODO error handling.
        await mkdirp(dirpath)
    }

    // TODO security.
    // TODO Use cripto (https://nodejs.org/api/crypto.html)
    const fpath = path.join(dirpath, fileName.replace('/', ''))

    // TODO Use Async.
    fs.writeFileSync(fpath, annotation, 'utf8')
}
