const assert = require('assert')
const gulp = require('gulp')
const uglify = require('gulp-uglify-es').default
const cleanCSS = require('gulp-clean-css')
const htmlmin = require('gulp-htmlmin')
const gutil = require('gulp-util')
const sourcemaps = require('gulp-sourcemaps')
const runSequence = require('run-sequence')
const replace = require('gulp-replace')
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
    runSequence('_minify-js', '_minify-css', '_minify-html', cb)
}

gulp.task('_minify-js', () => {
    assert(baseDir, 'baseDir must be set.')
    return gulp.src([
            path.join(baseDir, '**', '*.js'),
            '!' + path.join(baseDir, '**', '*.bundle.js') // already minified via webpack.
        ])
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .on('error', function (err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString())
        })
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(baseDir))
})

gulp.task('_minify-css', () => {
    assert(baseDir, 'baseDir must be set.')
    return gulp.src(path.join(baseDir, '**', '*.css'))
        .pipe(cleanCSS())
        .on('error', function (err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString())
        })
        .pipe(gulp.dest(baseDir))
})

gulp.task('_minify-html', () => {
    assert(baseDir, 'baseDir must be set.')
    return gulp.src(path.join(baseDir, '**', '*.html'))
        .pipe(htmlmin({
            collapseWhitespace : true,
            removeComments : true
        }))
        .on('error', function (err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString())
        })
        .pipe(gulp.dest(baseDir))
})

gulp.task('prepare', () => {
    fs.removeSync('dist')
    fs.copySync('build', path.join('dist', 'build'))
    fs.copySync('pages', path.join('dist'))
    fs.copySync('pdfs', path.join('dist', 'pdfs'))
    fs.copySync('schemas/pdfanno-schema.json', path.join('dist', 'schema.json'))
})

gulp.task('copy-sw', () => {
    return gulp
            .src(path.join('src', 'sw.js'))
            .pipe(gulp.dest('dist'))
})

gulp.task('replace-sw', () => {

    let dir
    if (process.env.BUILD_TARGET === 'latest') {
        dir = 'pdfanno/latest'
    } else if (process.env.BUILD_TARGET === 'stable') {
        dir = 'pdfanno/' + version
    } else {
        // for webpack-dev-server.
        dir = 'dist'
    }
    console.log('dir:', dir)

    return gulp
            .src(path.join('dist', 'sw.js'))
            .pipe(replace('#VERSION', new Date().getTime()))
            .pipe(replace('#BASEDIR', dir))
            .pipe(gulp.dest('dist'))
})

gulp.task('build-sw', cb => {
    runSequence('copy-sw', 'replace-sw', cb)
})

gulp.task('watch-sw', () => {
    gulp.watch([ 'src/sw.js' ], [ 'build-sw' ])
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

