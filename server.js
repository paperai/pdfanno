let express = require('express');
let app = express();

// for viewer
app.use('/dist', express.static('dist'));
app.use('/pages', express.static('pages'));
app.use('/build', express.static('build'));
app.use('/pdfs', express.static('pdfs'));
// app.use('/external', express.static('external'));
// app.use('/src', express.static('src'));
// app.use('/node_modules', express.static('node_modules'));

// redirect.
app.get('/', function(req, res) {
    res.redirect('/dist/index.html');
});

// for api
app.get('/api/anno/add', function(req, res) {
    // TODO implement.
    res.send('ok');
});
app.get('/api/anno/get', function(req, res) {
    // TODO implement.
    res.send('ok');
});

app.listen(3000, function() {
    console.log('Express app listening on port 3000.');
});
