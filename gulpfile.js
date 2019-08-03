const
    gulp = require("gulp"),
    webpackStream = require("webpack-stream"),
    webpack = require("webpack"),
    named = require("vinyl-named"),
    concat = require("gulp-concat"),
    rename = require("gulp-rename"),
    browserSync = require("browser-sync").create(),
    del = require("del"),
    terser = require('gulp-terser'),
    replace = require('gulp-replace'),
    moduleName = "jms",
    moduleFileName = toLowerCase(moduleName),
    webpackConfig = require("./webpack.config"),
    output = "./dist",
    declarationDir = "./types",
    srcFolder = "./src";

function clean() {
    return del(output);
}

function script() {
    process.env.NODE_ENV = "development";
    const config = {...{}, ...webpackConfig(moduleName)};
    config.mode = process.env.NODE_ENV;
    return gulp
        .src(`${srcFolder}/index.ts`)
        .pipe(named())
        .pipe(webpackStream(config))
        .pipe(gulp.dest(output));
}

function _build() {
    process.env.NODE_ENV = "production";
    const config = {...{}, ...webpackConfig(moduleName)};
    config.mode = 'none';
    config.plugins = [
        new webpack.DefinePlugin({"process.env.NODE_ENV": JSON.stringify("production")}),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ];
    return gulp
        .src(`${srcFolder}/index.ts`)
        .pipe(named())
        .pipe(webpackStream(config))
        .pipe(gulp.dest(output));
}

function compressJs() {
    return gulp
        .src(`${output}/${moduleFileName}.js`)
        .pipe(terser())
        .pipe(rename(`${moduleFileName}.min.js`))
        .pipe(gulp.dest(output))
}

function start() {
    browserSync.init({
        port: 8080,
        server: {
            baseDir: "./"
        }
    });
    gulp.watch(`${srcFolder}/**/*`, gulp.series(script, done => {
        browserSync.reload();
        done();
    }));
}

function bundleDts() {
    del(`${output}/${moduleFileName}.d.ts`);
    return gulp
        .src(`./${declarationDir}/*.d.ts`)
        .pipe(concat(`${moduleFileName}.d.ts`))
        .pipe(replace(/^[import|export].*/gm, ''))
        .pipe(gulp.dest(output));
}

function toLowerCase(name) {
    return name[0].toLowerCase() + name.substring(1);
}

exports.clean = clean;

exports.bundleDts = bundleDts;

exports.compressJs = compressJs;

exports.script = script;

exports.build = gulp.series(clean, _build, compressJs, bundleDts);

exports.start = gulp.series(clean, script, start);