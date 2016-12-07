let gulp = require('gulp');
let fs = require('fs-extra');
let path = require('path');

gulp.task('prepare', () => {
    fs.removeSync('dist');
    fs.copySync('build', path.join('dist', 'build'));
    fs.copySync('pages', path.join('dist', 'pages'));
    fs.copySync('pdfs', path.join('dist', 'pdfs'));
});

gulp.task('publish', () => {
    fs.removeSync('docs');
    fs.copySync('dist', 'docs');
});