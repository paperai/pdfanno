const multer = require('multer');
const upload = multer();
const express = require('express');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const controller = require('./controller');
const jwt = require('jsonwebtoken')

// Create an application.
const app = express()
// TODO nginx -> nodejs のフォワーディングでhttps対応しているけど大丈夫？
const server = require('http').Server(app)

// for development.
// if (process.env.NODE_PORT === '3000') {
//     console.log('DEV MODE: Allow wildcard Cross Origins.')
//     app.use((req, res, next) => {
//         res.header("Access-Control-Allow-Origin", "*")
//         res.header("Access-Control-Allow-Headers", "X-Requested-With")
//         next()
//     })
// }

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

// Setup websocket.
require('./controller/ws')(server)

// Setup the body parser.
app.use(cookieParser())
app.use(bodyParser.json({ limit : '50mb' }));
app.use(bodyParser.urlencoded({ limit : '50mb', expented : true }));

// API: upload a pdf and analyze it.
app.post('/api/pdf_upload', upload.fields([]), controller.uploadPDF);

// API: load a pdf from web.
app.get('/load_pdf', controller.loadPDF);

// API: load a annotations from web.
app.get('/api/load_anno', controller.loadAnno);

// API: Login check (Sample).
app.get('/api/login/check', (req, res) => {

    // JWT Key.
    // TODO Get from environment variables.
    const JWT_SECRET_KEY = 'bar'

    // Get a token from Cookie.
    const token = req.param('token')
    if (!token) {
        return res.json({ result : false })
    }

    // Verify and Decode the jwt token..
    let user
    try {
        user = jwt.verify(token, JWT_SECRET_KEY)
    } catch (err) {
        // Error.
        // @see https://github.com/auth0/node-jsonwebtoken#jsonwebtokenerror
        console.log('jwt err:', err)
        return res.json({ result : false })
    }

    return res.json({ result : true, user })
})

// Launch the app.
const port = process.env.NODE_PORT || 1000
server.listen(port, function() {
    console.log(`App listening on port ${port}.`);
});
