var gulp = require('gulp');
var fs = require('fs-extra');
var path = require('path');

gulp.task('prepare', function() {
    fs.removeSync('dist');
    fs.copySync('build', path.join('dist', 'build'));
    fs.copySync('pages', path.join('dist', 'pages'));
    fs.copySync('pdfs', path.join('dist', 'pdfs'));
    // fs.copySync(path.join('node_modules', 'anno-ui', 'dist', 'anno-ui.bundle.js'), path.join('dist', 'anno-ui.bundle.js'));
    // fs.copySync(path.join('node_modules', 'anno-ui', 'dist', 'anno-ui.bundle.js.map'), path.join('dist', 'anno-ui.bundle.js.map'));
});

gulp.task('publish', function() {
    fs.removeSync('docs');
    fs.copySync('dist', 'docs');
});
