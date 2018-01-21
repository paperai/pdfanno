const multer = require('multer');
const upload = multer();
const express = require('express');
const bodyParser = require('body-parser');
const controller = require('./controller');

// Create an application.
const app = express()
const server = require('http').Server(app)

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
app.use(bodyParser.json({ limit : '50mb' }));
app.use(bodyParser.urlencoded({ limit : '50mb', expented : true }));

/***********************
    Internal APIs.
************************/
// API: upload a pdf and analyze it.
app.post('/api/pdf_upload', upload.fields([]), controller.internal.uploadPDF);
// API: load a pdf from web.
app.get('/load_pdf', controller.internal.loadPDF);
// API: load a annotations from web.
app.get('/api/load_anno', controller.internal.loadAnno);

/***********************
    External APIs.
************************/
app.get('/papi/documents/:documentId/annotations', controller.external.getUserAnnotation)




// Launch the app.
const port = process.env.NODE_PORT || 1000
server.listen(port, function() {
    console.log(`App listening on port ${port}.`);
});
