var gulp = require('gulp');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');

// Development Tasks 
// -----------------

// Start browserSync server
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    }
  })
})


// Watchers
gulp.task('watch', function() {
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
})

// Optimization Tasks 
// ------------------

// Optimizing CSS and JavaScript 
gulp.task('useref', function() {

  return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf(['*.js', '!*.min.js'], uglify()))
    .pipe(gulp.dest('dist'));
});

// Optimizing assets 
gulp.task('assets', function() {
  return gulp.src('app/assets/**/*.+(png|jpg|jpeg|gif|svg|ico)')
    .pipe(cache(imagemin({     //Caching images that ran through imagemin
      interlaced: true,
    })))
    .pipe(gulp.dest('dist/assets'))
});

// Copying others 
gulp.task('others', function() {
  return gulp.src('app/**/**/*.+(xml|json|dae)')
    .pipe(gulp.dest('dist'))
})

// Cleaning 
gulp.task('clean', function() {
  return del.sync('dist').then(function(cb) {
    return cache.clearAll(cb);
  });
})

gulp.task('clean:dist', function() {
  return del.sync(['dist/**/*', '!dist/assets', '!dist/assets/**/*']);
});

// Build Sequences
// ---------------

gulp.task('default', function(callback) {
  runSequence(['browserSync'], 'watch',
    callback
  )
})

gulp.task('build', function(callback) {
  runSequence(
    'clean:dist',
    ['useref', 'assets'],
    callback
  )
})