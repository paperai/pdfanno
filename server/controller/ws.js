/**
    WebSocket Controllers.
*/

module.exports = function (server) {
    const io = require('socket.io')(server)
    const ws = io.of('ws')

    // Sample.
    ws.on('connect', function (socket) {
        console.log('connected!!', socket.id)

        socket.on('annotation', function (data) {
            console.log('ws:annotation:', data)

            ws.to(socket.id).emit('annotationUpdated', { msg : 'hello'})
        })
    })
}

