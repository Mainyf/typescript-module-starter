const gulp = require("gulp"),
    webpack = require("webpack-stream"),
    named = require("vinyl-named"),
    browserSync = require("browser-sync").create(),
    del = require("del"),
    moduleName = "demo",
    webpackConfig = require("./webpack.config")(moduleName),
    output = "./dist",
    srcFolder = "./src";

function clean() {
    return del(output);
}

function generateScript(webpackConfig) {
    return gulp
        .src(`${srcFolder}/index.ts`)
        .pipe(named())
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest(output));
}

function script() {
    const config = { ...{}, ...webpackConfig };
    config.mode = "development";
    return generateScript(config);
}

function _build() {
    const config = { ...{}, ...webpackConfig };
    config.mode = "production";
    return generateScript(config);
}

function start() {
    browserSync.init({
        server: {
            baseDir: "./"
            // files: [
            //     'dist/*.css',
            //     'dist/*.js',
            // ]
        }
    });
    gulp.watch(`${srcFolder}/**/*`, gulp.series(script, done => {
        browserSync.reload();
        done();
    }));
}

exports.clean = clean;

exports.build = gulp.series(clean, _build);

exports.start = gulp.series(clean, script, start);

