const
    gulp = require("gulp"),
    webpackStream = require("webpack-stream"),
    webpack = require("webpack"),
    named = require("vinyl-named"),
    concat = require("gulp-concat"),
    rename = require("gulp-rename"),
    browserSync = require("browser-sync").create(),
    del = require("del"),
    sourcemaps = require('gulp-sourcemaps'),
    terser = require('gulp-terser');
    replace = require('gulp-replace'),
    moduleName = "jms",
    webpackConfig = require("./webpack.config"),
    output = "./dist",
    declarationDir = "./types",
    srcFolder = "./src";

function clean() {
    return del(output);
}

function generateScript(webpackConfig) {
    const fileName = toLowerCase(moduleName);
    return gulp
        .src(`${srcFolder}/index.ts`)
        .pipe(named())
        .pipe(webpackStream(webpackConfig))
        .pipe(rename(`${fileName}.js`))
        .pipe(sourcemaps.init())
        .pipe(gulp.dest(output))
        .pipe(terser())
        .pipe(rename(`${fileName}.min.js`))
        .pipe(gulp.dest(output))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(output))
}

function script() {
    process.env.NODE_ENV = "development";
    const config = {...{}, ...webpackConfig(moduleName)};
    config.plugins = [
        new webpack.NamedModulesPlugin(),
        new webpack.DefinePlugin({"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)}),
    ];
    return generateScript(config);
}

function _build() {
    process.env.NODE_ENV = "production";
    const config = {...{}, ...webpackConfig(moduleName)};
    config.plugins = [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV) }),
        new webpack.NoEmitOnErrorsPlugin()
    ];
    return generateScript(config);
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
    const fileName = toLowerCase(moduleName);
    del(`${output}/${fileName}.d.ts`);
    return gulp
        .src(`./${declarationDir}/*.d.ts`)
        .pipe(concat(`${fileName}.d.ts`))
        .pipe(replace(/^[import|export].*/gm, ''))
        .pipe(gulp.dest(output));
}

function toLowerCase(name) {
    return name[0].toLowerCase() + name.substring(1);
}

exports.clean = clean;

exports.bundleDts = bundleDts;

exports.build = gulp.series(clean, _build, bundleDts);

exports.start = gulp.series(clean, script, start);