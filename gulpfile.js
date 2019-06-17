// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, watch, series, parallel } = require("gulp");
// Importing all the Gulp-related packages we want to use
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
var replace = require("gulp-replace");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
const htmlmin = require("gulp-htmlmin");

// File paths
const files = {
  scssPath: "sass/**/*.scss",
  jsPath: "js/**/*.js",
  tsPath: "*.ts"
};

// Sass task: compiles the style.scss file into style.css
function scssTask() {
  return src(files.scssPath)
    .pipe(sourcemaps.init()) // initialize sourcemaps first
    .pipe(sass()) // compile SCSS to CSS
    .pipe(postcss([autoprefixer(), cssnano()])) // PostCSS plugins
    .pipe(sourcemaps.write(".")) // write sourcemaps file in current directory
    .pipe(dest("dist/css")); // put final CSS in dist folder
}

//Typescript
function tsTask() {
  return tsProject
    .src()
    .pipe(tsProject())
    .js.pipe(dest("js"));
}

//Javascript
function jsTask() {
  return src([
    files.jsPath
    //,'!' + 'includes/js/jquery.min.js', // to exclude any specific files
  ])
    .pipe(concat("all.js"))
    .pipe(uglify())
    .pipe(dest("dist/js"));
}

// Cachebust
var cbString = new Date().getTime();
function cacheBustTask() {
  return src(["index.html"])
    .pipe(replace(/cb=\d+/g, "cb=" + cbString))
    .pipe(dest("."));
}

// Copy html
function htmlTask() {
  return src(["*.html"])
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest("dist"));
}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask() {
  watch(files.scssPath, series(scssTask, cacheBustTask, htmlTask));
  watch(files.tsPath, series(tsTask, jsTask, cacheBustTask, htmlTask));
  watch("*.html", htmlTask);

  //    watch([files.scssPath, files.jsPath],parallel(scssTask, jsTask));
}

// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(
  scssTask,
  tsTask,
  jsTask,
  cacheBustTask,
  htmlTask,
  watchTask
);
