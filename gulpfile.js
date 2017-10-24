var gulp = require('gulp');
var fs = require('fs-extra');
var path = require('path');
const version = require('./package.json').version;

gulp.task('prepare', function() {
    fs.removeSync('dist');
    fs.copySync('build', path.join('dist', 'build'));
    fs.copySync('pages', path.join('dist', 'pages'));
    fs.copySync('pdfs', path.join('dist', 'pdfs'));
});

gulp.task('publish_latest', function() {
    const baseDir = path.join('docs', 'latest');
    fs.removeSync(baseDir);
    fs.copySync('dist', baseDir);
});

gulp.task('publish_stable', function() {
    const baseDir = path.join('docs', version);
    fs.removeSync(baseDir);
    fs.copySync('dist', baseDir);
});
