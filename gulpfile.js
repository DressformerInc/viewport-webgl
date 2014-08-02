/**
 * Created by Miha-ha on 01.08.14.
 */
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    paths = {
        scripts: [
            //libs
            'bower_components/threejs/build/three.min.js',
            'bower_components/threejs-controls/controls/OrbitControls.js',
            'bower_components/threejs-stats/Stats.js',
            'bower_components/dat.gui/dat.gui.min.js',
            //src
            'src/js/*.js'
        ],
        css: ['src/css/*.css']
    };

gulp.task('js', function () {
    gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
        .pipe(concat('viewport-webgl.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
});

gulp.task('css', function () {
    gulp.src(paths.css)
        .pipe(concat('style.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
    gulp.watch(paths.scripts, ['js']);
    gulp.watch(paths.css, ['css']);
});

gulp.task('default', ['watch', 'js', 'css']);