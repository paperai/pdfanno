/**
    WebSocket Controllers.
*/

module.exports = function (server) {
    const io = require('socket.io')(server)

    // Sample.
    io.of('ws').on('connect', function (socket) {
        console.log('connected!!')
    })
}

