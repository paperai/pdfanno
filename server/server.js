const multer = require('multer');
const upload = multer();
const express = require('express');
const bodyParser = require('body-parser');
const controller = require('./controller');

// Create an application.
const app = express()
// TODO nginx -> nodejs のフォワーディングでhttps対応しているけど大丈夫？
const server = require('http').Server(app)

// Setup websocket.
const ws = require('./controller/ws')(server)

// Setup the body parser.
app.use(bodyParser.json({ limit : '50mb' }));
app.use(bodyParser.urlencoded({ limit : '50mb', expented : true }));

// API: upload a pdf and analyze it.
app.post('/api/pdf_upload', upload.fields([]), controller.uploadPDF);

// API: load a pdf from web.
app.get('/load_pdf', controller.loadPDF);

// API: load a annotations from web.
app.get('/api/load_anno', controller.loadAnno);

// Launch the app.
const port = process.env.NODE_PORT || 1000
server.listen(port, function() {
    console.log(`App listening on port ${port}.`);
});
