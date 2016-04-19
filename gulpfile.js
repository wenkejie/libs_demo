/**
 *
 * 奥林前端自动化配置
 *
 */

'use strict';

var gulp            = require('gulp');
// var $            = require('gulp-load-plugins')();
// var coffee       = require('gulp-coffee');
var concat          = require('gulp-concat');
// var uglify       = require('gulp-uglify');
// var imagemin     = require('gulp-imagemin');
var less            = require('gulp-less');
var sourcemaps      = require('gulp-sourcemaps');
var sass            = require('gulp-sass');
var autoprefixer    = require('gulp-autoprefixer');
// var minifyCss       = require('gulp-minify-css');
var rename          = require('gulp-rename');
// var watch        = require('gulp-watch');
// var livereload   = require('gulp-livereload');
var connect         = require('gulp-connect');
var textReplace     = require('gulp-replace');
var plumber         = require('gulp-plumber');//阻止报错而停止watch
// var del          = require('del');
var browserSync     = require('browser-sync');
var reload          = browserSync.reload;


//参数来源我们产品的谷歌统计，严禁修改
var AUTOPREFIXER_BROWSERS = [
'ie >= 6',
'ie_mob >= 6',
'ff >= 29',
'chrome >= 21',
'safari >= 6',
'opera >= 22',
'ios >= 7',
'android >= 4.4',
'bb >= 10'
];



var devPath = './';

var paths = {
  // scripts: ['client/js/**/*.coffee', '!client/external/**/*.coffee'],
  // images: 'client/img/**/*',
  
  serve:{
    baseDir:  devPath
    // fx:       'fx/src',
    // finance:  'finance/finance-front/src/main/webapp'
  },
  css:  devPath+'/css/*.css',
  less: devPath+'/less/**/*.less',
  html: devPath+'/*.html',
  sass: devPath+'/vendor/avalon/**/*.scss'
};




// gulp.task('less', function () {
//   // gulp.src(devPath+'/less/test.less')
//   gulp.src([devPath+'/less/layout.less',devPath+'/less/register.less',devPath+'/less/register-new.less',devPath+'/less/en-register.less',devPath+'/less/widget/*.less'])
//   .pipe(plumber())
//   .pipe(sourcemaps.init())
//   .pipe(less())
//   .pipe(autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
//   // .pipe(minifyCss({compatibility: 'ie7'}))
//   .pipe(sourcemaps.write('./maps'))
//   .pipe(gulp.dest(devPath+'/css'))
//   .pipe(connect.reload());
// });




gulp.task('serve', function () {
	browserSync({
		notify: false,
		directory: true,
		port: 9909,
    // Inject CSS changes
    injectChanges: true,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
    	baseDir: ['.tmp', paths.serve.baseDir]
    }
  });
	gulp.watch(paths.html, reload);
	// gulp.watch(paths.less,['less']);
	gulp.watch(paths.css,reload);
});



// Not all tasks need to use streams
// A gulpfile is just another node program and you can use all packages available on npm
gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['build'], cb);
});

// gulp.task('scripts', ['clean'], function() {
//   // Minify and copy all JavaScript (except vendor scripts)
//   // with sourcemaps all the way down
//   return gulp.src(paths.scripts)
//     .pipe(sourcemaps.init())
//       .pipe(coffee())
//       .pipe(uglify())
//       .pipe(concat('all.min.js'))
//     .pipe(sourcemaps.write())
//     .pipe(gulp.dest('build/js'));
// });

// Copy all static images
// gulp.task('images', ['clean'], function() {
//   return gulp.src(paths.images)
//     // Pass in options to the task
//     .pipe(imagemin({optimizationLevel: 5}))
//     .pipe(gulp.dest('build/img'));
// });


// The default task (called when you run `gulp` from cli)
gulp.task('default', ['serve']);