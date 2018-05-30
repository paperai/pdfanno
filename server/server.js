const multer = require('multer')
const upload = multer()
const express = require('express')
const bodyParser = require('body-parser')
const controller = require('./controller')

// Create an application.
const app = express()
const server = require('http').Server(app)

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "X-Requested-With")
  res.header("Access-Control-Allow-Headers", "Content-Type")
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS")
  next()
})

// Setup webSocket.
require('./controller/ws')(server)

// Setup the body parser.
app.use(bodyParser.json({ limit : '50mb' }))
app.use(bodyParser.urlencoded({ limit : '50mb', expented : true }))


/***********************
 Internal APIs.
 ************************/
// Upload a PDF and analyze it.
app.post('/internal/api/pdfs/:documentId', upload.fields([]), controller.internal.uploadPDF)
// Load a PDF from the web.
app.get('/internal/api/pdfs', controller.internal.loadPDF)
// Load an annotation from the web.
app.get('/internal/api/annotations', controller.internal.loadAnno)

/***********************
 Internal APIs with DeepScholar.
 ************************/
app.get('/internal/api/deepscholar/:documentId', controller.internalDeepScholar.get)
app.put('/internal/api/deepscholar/:documentId/annotations', controller.internalDeepScholar.upload)

/***********************
 External APIs.
 ************************/
// Get the user annotation which belongs to the specified document.
app.get('/api/documents/:documentId/annotations', controller.external.getUserAnnotation)



// Launch the app.
const port = process.env.NODE_PORT || 1000
server.listen(port, function() {
  console.log(`App listening on port ${port}.`)
})
