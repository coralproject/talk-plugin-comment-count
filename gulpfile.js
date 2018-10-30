const del = require('del');
const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const ts = require('gulp-typescript');

// Create the typescript project.
const tsProject = ts.createProject('./tsconfig.json');

gulp.task('clean', () => del(['./dist']));

gulp.task('typescript', () =>
  gulp
    .src(['./lib/**/*.ts'])
    .pipe(tsProject())
    .pipe(gulp.dest('./dist'))
);

gulp.task('javascript', () =>
  gulp
    .src(['./lib/**/*.js'])
    .pipe(
      babel({
        presets: [['@babel/env', { targets: 'last 2 versions, ie 11' }]],
      })
    )
    .pipe(uglify({ mangle: true }))
    .pipe(gulp.dest('./dist'))
);

gulp.task('compile', gulp.parallel('typescript', 'javascript'));

gulp.task('default', gulp.series('clean', 'compile'));