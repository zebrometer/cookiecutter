
var gulp = require('gulp')

var LIBS = {
  XLSX   : 'node_modules/xlsx/dist/xlsx.core.min.js',
  JQUERY : 'node_modules/jquery/dist/jquery.min.js',
  PACKER : 'vendor/bin-packing-master/js/packer.js',
  JSPDF  : 'vendor/jsPDF-1.2.60/dist/jspdf.min.js'
}


var PATH = {
  JS          : "js/**/*.js",
  HTML        : "*.html",
  CSS         : ['css/styles.css', 'node_modules/bootstrap/dist/css/bootstrap.css'],
  THIRD_PARTY : [ LIBS.XLSX, LIBS.JQUERY, LIBS.PACKER, LIBS.JSPDF ]
}

gulp.task('copyJs', function() {
  return gulp.src(PATH.JS).pipe(gulp.dest("public/js"))
})

gulp.task('copyLibs', function() {
  return gulp.src(PATH.THIRD_PARTY).pipe(gulp.dest("public/vendor"))
})

gulp.task('copyHtml', function() {
  return gulp.src(PATH.HTML).pipe(gulp.dest("public"))
})

gulp.task('copyCss', function() {
  return gulp.src(PATH.CSS).pipe(gulp.dest("public/css"))
})

gulp.task('default', ["copyJs", "copyLibs", "copyHtml", "copyCss"])

gulp.watch([PATH.JS, PATH.HTML, PATH.CSS], ["copyJs", "copyHtml", "copyCss"])



var concat = require('gulp-concat')
var rename = require('gulp-rename')
var uglify = require('gulp-uglify')
var strip  = require('gulp-strip-comments')
var runSequence = require('run-sequence')


gulp.task('concatSrc', function() {
  return gulp.src(['js/*.js'])
    .pipe(concat('cookiecutter.min.js'))
    .pipe(gulp.dest('dist/js'))
})

gulp.task('uglifySrc', function() {
  return gulp.src('dist/js/cookiecutter.min.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
})

gulp.task('uglifyPacker', function() {
  return gulp.src(LIBS.PACKER)
    .pipe(uglify())
    .pipe(rename('packer.min.js'))
    .pipe(gulp.dest('dist/js'))
})

gulp.task('copyMinifiedFiles', function() {
  return gulp.src([LIBS.XLSX, LIBS.JQUERY, LIBS.JSPDF])
    .pipe(gulp.dest('dist/js'))
})

gulp.task('concatMinifiedFiles', function() {
  return gulp.src('dist/js/*.js')
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('dist'))
})

gulp.task('stripComments', function() {
  return gulp.src('dist/scripts.js')
    .pipe(strip())
    .pipe(rename('scripts.min.js'))
    .pipe(gulp.dest('dist'))
})

gulp.task('copyResult', function() {
  return gulp.src('dist/scripts.min.js').pipe(gulp.dest('public/js'))
})

gulp.task('buildp', function() {
  runSequence('concatSrc', 'uglifySrc', 'uglifyPacker', 'copyMinifiedFiles', 'concatMinifiedFiles', 'stripComments', 'copyResult')
})
