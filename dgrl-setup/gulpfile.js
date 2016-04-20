var gulp = require('gulp'),
    util = require('gulp-util'),
    ngAnnotate = require('gulp-ng-annotate'),
    concat = require('gulp-concat'),
    angularTemplatecache = require('gulp-angular-templatecache'),
    order = require('gulp-order'),
    clean = require('gulp-clean'),
    filter = require('gulp-filter'),
    flatten = require('gulp-flatten'),
    addSrc = require('gulp-add-src'),
    connect = require('gulp-connect'),
    zip = require('gulp-zip'),
    mainBowerFiles = require('main-bower-files'),
    sourcemaps = require('gulp-sourcemaps'),
    uglifyJS = require('gulp-uglify'),
    minifyCSS = require('gulp-minify-css'),
    path = require('path');
debug = require('gulp-debug');

gulp.task('vendorJS', function() {
    return gulp.src(mainBowerFiles())
    // .pipe(debug({
    //     title: 'vendor sources'
    // }))
        .pipe(filter('**/*.js'))
        .pipe(order([
            "**/jquery.js",
            "**/angular.js",
            "**/angular-*.js",
            '**/lodash.js',
            '**/restangular.js',
            '**/Scope.safeApply.js',
            '**/ngForce1.js',
            '**/ui-grid.js'
        ]))

        .pipe(concat('lib.js'))
        .pipe(gulp.dest('./build/scripts'));
});

function createFileFromString(filename, string) {
    var src = require('stream').Readable({
        objectMode: true
    })
    src._read = function() {
        this.push(new util.File({
            cwd: "",
            base: "",
            path: filename,
            contents: new Buffer(string)
        }))
        this.push(null)
    }
    return src
}
gulp.task('cleanBuild', function() {

    return gulp.src('build', {
            read: false
        })
        .pipe(clean());
});
gulp.task('scripts', function() {
    //combine all js files of the app
    gulp.src(['!./app/**/*_test.js', './app/**/*.js'])
    .pipe(order([
        "app.js"
    ]))
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./build/scripts'));
});

gulp.task('scriptsMinified', function() {
    //combine all js files of the app
    gulp.src(['!./app/**/*_test.js', './app/**/*.js'])
        .pipe(ngAnnotate())
        .pipe(sourcemaps.init())
        .pipe(uglifyJS())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write('../maps/'))
        .pipe(gulp.dest('./build/scripts'));
});

gulp.task('templates', function() {
    //combine all template files of the app into a js file
    gulp.src([
            './app/**/*.html'
        ])
        .pipe(angularTemplatecache('templates.js', {
            standalone: true
        }))
        .pipe(gulp.dest('./build/scripts'));
});

gulp.task('customCSS', function() {
    gulp.src(['./app/styles/*.css'])
        .pipe(concat('main.css'))
        .pipe(gulp.dest('./build/styles'));
});

gulp.task('customCSSMinified', function() {
    gulp.src(['./app/styles/style.css'])
        .pipe(sourcemaps.init())
        .pipe(minifyCSS())
        .pipe(sourcemaps.write('../maps/'))
        .pipe(concat('main.css'))
        .pipe(gulp.dest('./build/styles'));
});

gulp.task('vendorJSMinified', function() {
    // For some reason the angular minified file isn't working
    var vendorBowerFiles = ['angular-ui-grid/ui-grid.min.js',
        'angular/angular.js',
        'angular-animate/angular-animate.min.js',
        'angular-force/ngForce.js',
        'lodash/lodash.min.js',
        'restangular/dist/restangular.min.js'
    ];
    // vendorBowerFiles.push('moment/min/moment-with-locales.min.js');
    //concatenate vendor JS files
    return gulp.src(vendorBowerFiles, {
            base: './bower_components'
        })
        // .pipe(filter(['**/*.js']))
        /*
         * If you need the scripts to be loaded in a different order,
         * edit the array below
         */
        .pipe(order([
            "**/angular.js",
            "**/angular-*.min.js",
            '**/lo-dash.min.js',
            '**/restangular.min.js',
            '**/ngForce.js',
            '**/ui-grid.min.js'
        ]))

    // .pipe(ngAnnotate())
    // .pipe(sourcemaps.init())
    // .pipe(uglifyJS())
    // .pipe(concat('lib.js'))
    // .pipe(sourcemaps.write('../maps/'))
    .pipe(gulp.dest('./build/scripts'));
});

gulp.task('angularGridFonts', function() {
    return gulp.src(mainBowerFiles(), {
            base: './bower_components/'
        })
        .pipe(filter(['angular-ui-grid/*.svg', 'angular-ui-grid/*.eot', 'angular-ui-grid/*.ttf', 'angular-ui-grid/*.woff']))
        .pipe(flatten())
        .pipe(gulp.dest('./build/styles'))
});

gulp.task('vendorCSS', function() {

    // concatenate vendor CSS files
    return gulp.src(mainBowerFiles(), {
            base: './bower_components'
        })
        .pipe(filter(['**/*.css']))
        .pipe(addSrc.append('./bower_components/boostrap/dist/boostrap.css'))
        .pipe(concat('lib.css'))
        .pipe(gulp.dest('./build/styles'));
});

gulp.task('vendorFonts', function() {
    //concatenate vendor font files
    return gulp.src(mainBowerFiles(), {
            base: './bower_components'
        })
        .pipe(filter(['**/fonts/*']))
        .pipe(flatten())
        .pipe(gulp.dest('./build/fonts'));
});

gulp.task('customFonts', function() {
    //concatenate custom font files
    gulp.src('./styles/fonts/**')
        .pipe(gulp.dest('./build/fonts'));
});

gulp.task('copy-index', function() {
    gulp.src('./index.html')
        .pipe(gulp.dest('./build'));
});

gulp.task('watch', function() {
    gulp.watch([
        'build/**/*.html',
        'build/**/*.js',
        'build/**/*.css'
    ], function(event) {
        return gulp.src(event.path)
            .pipe(connect.reload());
    });
    gulp.watch(['./**/*.js', '!./**/*test.js'], ['scripts']);
    gulp.watch(['!./index.html', './**/*.html'], ['templates']);
    gulp.watch('./**/*.css', ['customCSS', 'vendorCSS']);
    gulp.watch('./index.html', ['copy-index']);

});

gulp.task('connect', function() {
    connect.server({
        root: ['build'],
        port: 9000,
        livereload: true
    })
});

gulp.task('zip-staticresource', function() {
    return gulp.src('**/*', {
            cwd: path.join(process.cwd(), 'build')
        })
        .pipe(zip('DGRL_Setup.resource'))
        .pipe(gulp.dest('../src/staticresources'));
});

gulp.task('meta-staticresource', function() {
    return createFileFromString('DGRL_Setup.resource-meta.xml', '<?xml version="1.0" encoding="UTF-8"?><StaticResource xmlns="http://soap.sforce.com/2006/04/metadata"><cacheControl>Private</cacheControl><contentType>application/zip</contentType></StaticResource>')
        .pipe(gulp.dest('../src/staticresources'));
});

// gulp.task('vf-page', function() {
//   return gulp.src('./SL_DGRL.page')
//           .pipe(gulp.dest('../src/pages'));
// });

gulp.task('save', ['zip-staticresource', 'meta-staticresource']);
gulp.task('buildMinified', ['scriptsMinified', 'templates', 'customCSSMinified', 'vendorFonts', 'customFonts', 'copy-index', 'vendorJSMinified', 'vendorCSS', 'angularGridFonts']);
gulp.task('buildOnly', ['scripts', 'templates', 'customCSS', 'customFonts', 'vendorFonts', 'vendorJS', 'vendorCSS']);
gulp.task('build', ['connect', 'scripts', 'templates', 'customCSS', 'customFonts', 'vendorFonts', 'vendorJS', 'vendorCSS', 'watch']);
gulp.task('cleanAndBuild', ['cleanBuild'], function() {
    gulp.start('build');
});
gulp.task('default', ['cleanAndBuild']);
