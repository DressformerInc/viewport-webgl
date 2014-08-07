/**
 * Created by Miha-ha on 01.08.14.
 */
var gulp = require('gulp'),
    sequence = require('run-sequence'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    bump = require('gulp-bump'),
    exec = require('gulp-exec'),
    rimraf = require('gulp-rimraf'),
    paths = {
        scripts: [
            //libs
            'node_modules/threejs/build/three.min.js',
            'node_modules/threejs-controls/controls/OrbitControls.js',
            'node_modules/threejs-stats/Stats.js',
            'node_modules/dat.gui/dat.gui.min.js',
            //src
            'src/js/main.js',
            'src/js/*.js',
            '!src/js/viewport-webgl.js'
        ],
        css: ['src/css/*.css', '!src/css/style.css'],
        compiled: {
            script: ['src/js/viewport_webgl.js'],
            css: ['src/css/style.css']
        },
        assets: ['src/assets/**/*']
    };

gulp.task('js', function () {
    gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
        .pipe(concat('viewport-webgl.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/js/'));
});

gulp.task('css', function () {
    gulp.src(paths.css)
        .pipe(concat('style.css'))
        .pipe(gulp.dest('src/css'));
});

gulp.task('dist', ['js', 'css'], function(){
    gulp.src([
//        'src/assets/**/*.*',
        'src/js/viewport-webgl.js',
        'src/css/style.css',
        'src/index.html'
    ], { base: './src' }).pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
    gulp.watch(paths.scripts, ['js']);
    gulp.watch(paths.css, ['css']);
});

/**
 * RELEASE
 */

gulp.task('rimraf', function () {
    return gulp.src(['dist/*', 'release.zip'], { read: false })
        .pipe(rimraf());
});

gulp.task('bump', function () {
    return gulp.src(['./package.json'])
        .pipe(bump())
        .pipe(gulp.dest('./'));
});

gulp.task('git', function () {
    var v = 'v' + require('./package.json').version,
        options = {
            silent: true,
            v: v,
            msg: 'Release ' + v
        };

    return gulp.src('')
        .pipe(exec('git commit -am "<%=options.msg%>"', options))
        .pipe(exec('git tag -a <%=options.v%> -m "<%=options.msg%>"', options))
        .pipe(exec('git push origin --follow-tags')); //отправляю изменения и тэги вместе
//        .pipe(exec('git push origin --tags'));
});

gulp.task('zip', ['dist'], function () {
    return gulp.src('').pipe(exec('cd dist && zip -r ../release.zip ./ && cd ..', {
        silent: true,
        continueOnError: true
    }));
});

gulp.task('deploy-test', function () {
    var v = require('./package.json').version;

    return gulp.src('').pipe(
        exec('ssh deploy@95.163.87.227 test viewport-webgl v' + v, {
            silent: false,
            continueOnError: false
        }));
});

gulp.task('deploy-release', function () {
    var v = require('./package.json').version;

    return gulp.src('').pipe(
        exec('ssh deploy@192.168.10.10 site-v2 deploy v' + v, {
            silent: false,
            continueOnError: false
        }));
});

gulp.task('log', function () {
    return gulp.src('').pipe(
        exec('ssh deploy@192.168.10.10 tail site-v2.log', {silent: false})
    );
});

gulp.task('github-release', require('./github/release').createAndUpload);

//combo tasks
gulp.task('default', ['js', 'css', 'watch']);
gulp.task('release', function (cb) {
    sequence(
        'bump',
        'git',
        'zip',
        'github-release',
        'deploy-test',
//        'deploy-release',
        'rimraf',
        cb);
});