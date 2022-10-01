const { src, dest, series, parallel, watch } = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");
const clean = require("gulp-clean");
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const postcss = require("gulp-postcss");
const browserSync = require("browser-sync").create();

const paths = {
  scss: "./src/scss/**/*.scss",
  js: "./src/js/**/*.js",
  dist: "./dist",
  scssDest: "./dist/css",
  jsDest: "./dist/js",
  imageDest: "./dist/assets/images",
};

// scss to css
const cssTask = () => {
  return src(paths.scss, { allowEmpty: true })
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write("."))
    .pipe(dest(paths.scssDest))
    .pipe(browserSync.stream());
};

const jsTask = () => {
  return src(paths.js, { allowEmpty: true })
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(uglify())
    .pipe(sourcemaps.write("."))
    .pipe(dest(paths.jsDest));
};

// clean
const cleanFiles = () => {
  src(paths.dist, { read: false }).pipe(clean());
};

// copy images
const copyImages = () => {
  return src("src/assets/images/**/*.{png, jpg, jpeg, gif, svg}", {
    allowEmpty: true,
  }).pipe(dest(paths.imageDest));
};

const liveReload = () => {
  browserSync.init({
    server: {
      baseDir: "./",
    },
  });
};

const reload = () => {
  browserSync.reload();
};

const watchFiles = () => {
  watch(paths.scss, series(cssTask, reload));
  watch(paths.js, series(jsTask, reload));
  watch(paths.imageDest, copyImages);
  watch("./*.html").on("change", reload);
};

exports.cleanFiles = cleanFiles;

exports.default = series(
  parallel(copyImages, jsTask, cssTask),
  parallel(liveReload, watchFiles)
);
