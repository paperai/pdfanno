const assert = require('assert')
const gulp = require('gulp')
const uglify = require('gulp-uglify-es').default
const gutil = require('gulp-util')
const sourcemaps = require('gulp-sourcemaps')
const runSequence = require('run-sequence')
const fs = require('fs-extra')
const path = require('path')
const version = require('./package.json').version

let baseDir

function checkIsStableVersion () {
    if (version.indexOf('dev') !== -1) {
        throw 'version is not stable. version=' + version
    }
}

function publish (cb) {
    fs.removeSync(baseDir)
    fs.copySync('dist', baseDir)
    runSequence('_minify-js', cb)
}

gulp.task('_minify-js', () => {
    assert(baseDir, 'baseDir must be set.')
    return gulp.src([
            path.join(baseDir, '**', '*.js'),
            '!' + path.join(baseDir, '**', '*.bundle.js') // already was minified via webpack.
        ])
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .on('error', function (err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString())
        })
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(baseDir))
})

gulp.task('prepare', () => {
    fs.removeSync('dist')
    fs.copySync('build', path.join('dist', 'build'))
    fs.copySync('pages', path.join('dist', 'pages'))
    fs.copySync('pdfs', path.join('dist', 'pdfs'))
})

gulp.task('publish_latest', cb => {
    baseDir = path.join('docs', 'latest')
    publish(cb)
})

gulp.task('publish_stable', cb => {
    checkIsStableVersion()
    baseDir = path.join('docs', version)
    publish(cb)
})

