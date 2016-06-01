
var gulp = require('gulp')

var PATH = {
  JS          : "js/**/*.js",
  HTML        : "*.html",
  CSS         : ['css/styles.css', 'node_modules/bootstrap/dist/css/bootstrap.css'],

  THIRD_PARTY : [
    'node_modules/xlsx/dist/xlsx.core.min.js',
    'node_modules/jquery/dist/jquery.min.js',
    'vendor/bin-packing-master/js/packer.js',
    'vendor/jsPDF-1.2.60/dist/jspdf.min.js'
  ]
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
