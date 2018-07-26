const gulp = require('gulp');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const minifyCss = require('gulp-minify-css');
const autoprefixer = require('gulp-autoprefixer');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const gulpIf = require('gulp-if');
const browserSync = require('browser-sync').create();

// Config
const PUBLIC_PATH = 'public';
const DIST_PATH = 'public/dist';
const SOURCE_PATH = 'src';
const style = 'less'; // css, scss, less

let production = false; // do not change

// Less plugins
const less = require('gulp-less');
const LessAutoprefix = require('less-plugin-autoprefix');
const lessAutoprefix = new LessAutoprefix({
	browsers: ['last 3 versions']
});

// Task for CSS
gulp.task('css', function () {
	console.log('starting css task');
  return gulp.src([SOURCE_PATH + '/css/style.css', SOURCE_PATH + '/css/**/*.css'])
		.pipe(plumber(function (err) {
			console.log('Styles Task Error');
			console.log(err);
			this.emit('end');
		}))
    .pipe(gulpIf(!production, sourcemaps.init()))
		.pipe(autoprefixer())
		.pipe(concat('styles.css'))
		.pipe(minifyCss())
    .pipe(gulpIf(!production, sourcemaps.write()))
    .pipe(gulpIf(!production, browserSync.stream()))
    .pipe(gulp.dest(DIST_PATH));
});

// Task For SCSS
gulp.task('scss', function () {
	console.log('starting scss task');
	return gulp
    .src(SOURCE_PATH + '/scss/styles.scss')
    .pipe(plumber(function(err) {
        console.log('Styles Task Error');
        console.log(err);
        this.emit('end');
      }))
    .pipe(gulpIf(!production, sourcemaps.init()))
    .pipe(autoprefixer())
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(gulpIf(!production, sourcemaps.write()))
    .pipe(gulpIf(!production, browserSync.stream()))
    .pipe(gulp.dest(DIST_PATH));
});

//Task For LESS
gulp.task('less', function () {
	console.log('starting less task');
	return gulp
    .src(SOURCE_PATH + '/less/styles.less')
    .pipe(plumber(function(err) {
        console.log('Styles Task Error');
        console.log(err);
        this.emit('end');
      }))
    .pipe(gulpIf(!production, sourcemaps.init()))
    .pipe(less({ plugins: [lessAutoprefix] }))
    .pipe(minifyCss())
    .pipe(gulpIf(!production, browserSync.stream()))
    .pipe(gulpIf(!production, sourcemaps.write()))
    .pipe(gulp.dest(DIST_PATH));
});

// Scripts
gulp.task('scripts', function () {
	console.log('starting scripts task');
	return gulp
    .src(SOURCE_PATH + '/js/**/*.js')
    .pipe(plumber(function(err) {
        console.log('Scripts Task Error');
        console.log(err);
        this.emit('end');
      }))
    .pipe(gulpIf(!production, sourcemaps.init()))
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(uglify())
    .pipe(concat('scripts.js'))
    .pipe(gulpIf(!production, sourcemaps.write()))
    .pipe(gulp.dest(DIST_PATH));
});

// Default task
gulp.task('default', ['scripts'], ()=> {
  if (style === 'scss') {
    gulp.start('scss');
  } else if (style === 'less') {
    gulp.start('less');
  } else if (style === 'css') {
    gulp.start('css');
  }
});

// Production
gulp.task('build', () => {
  console.log('Building assets in production mode');
  production = true;
  gulp.start('default');
});

// Watch
gulp.task('watch', ['default'], ()=> {
  console.log('Starting watch task');
  browserSync.init({
    server: {baseDir: `./${PUBLIC_PATH}`}
  });
  gulp.watch(`${PUBLIC_PATH}/*.html`).on('change', browserSync.reload);
  gulp.watch(`${DIST_PATH}/*.js`).on('change', browserSync.reload);
  gulp.watch(SOURCE_PATH + '/js/**/*.js', ['scripts']);
  if (style === 'scss') {
    gulp.watch(SOURCE_PATH + '/scss/**/*.scss', ['scss']);
  } else if (style ==='less') {
    gulp.watch(SOURCE_PATH + '/less/**/*.less', ['less']);
  } else if (style === 'css') {
    gulp.watch(SOURCE_PATH + '/css/**/*.css', ['css']);
  }
});