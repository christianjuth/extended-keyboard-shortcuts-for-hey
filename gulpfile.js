const gulp = require('gulp');
const zip = require('gulp-zip');
const webpack = require('webpack-stream');
const named = require('vinyl-named');
var clean = require('gulp-clean');

function cleanTask(cb) {
  gulp.src('./build/', {allowEmpty: true})
    .pipe(clean())
    .pipe(gulp.dest('./build'))
    .on('end', cb)
}

function copyTask(cb) {
  gulp.src('./src/**/*')
    .pipe(gulp.dest('./build'))
    .on('end', cb)
}

function babelTask(cb) {
  gulp.src('./build/*.js')
    .pipe(named())
    .pipe(webpack({
      mode: 'production',
      devtool: 'source-map',
      module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
                plugins: [
                  '@babel/plugin-proposal-class-properties',
                  ["@babel/plugin-transform-runtime", {
                    "regenerator": true
                  }]
                ]
              }
            }
          }
        ],
      },
    }))
    .pipe(gulp.dest('./build'))
    .on('end', cb)
}

function zipTask(cb) {
  gulp.src('./build/*')
    .pipe(zip('build.zip'))
    .pipe(gulp.dest('./'))
    .on('end', cb)
}

exports.default = gulp.series(cleanTask, copyTask, babelTask, zipTask)