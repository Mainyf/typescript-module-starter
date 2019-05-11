const 
    gulp = require("gulp"),
    exec = require('child_process').exec,
    webpack = require("webpack-stream"),
    ts = require('gulp-typescript'),
    tsProject = ts.createProject('tsconfig.json'),
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
        port: 8080,
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

function generateDts(cb) {
    del(tsProject.rawConfig.compilerOptions.declarationDir);
    return exec('tsc --watch false -d', function(error, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        clean();
        cb();
    })
}

exports.clean = clean;

exports.generateDts = generateDts;

exports.build = gulp.series(generateDts, clean, _build);

exports.start = gulp.series(clean, script, start);