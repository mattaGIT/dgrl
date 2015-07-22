var gulp = require('gulp'),
    plugins = require("gulp-load-plugins")({lazy:false}),
    mainBowerFiles = require('main-bower-files'),
    path = require('path');

// function createFileFromString(filename, string) {
//   var src = require('stream').Readable({ objectMode: true })
//   src._read = function () {
//     this.push(new plugins.util.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
//     this.push(null)
//   }
//   return src
// }

gulp.task('scripts', function(){
    //combine all js files of the app
    gulp.src(['!./app/**/*_test.js','./app/**/*.js'])
        .pipe(plugins.ngAnnotate())
        .pipe(plugins.concat('main.js'))
        .pipe(gulp.dest('./build/scripts'));
});
gulp.task('cleanBuild', function () {

    return gulp.src('build', {read: false})
        .pipe(plugins.clean());
});
gulp.task('templates',function(){
    //combine all template files of the app into a js file
    gulp.src([
        './app/**/*.html'])
        .pipe(plugins.angularTemplatecache('templates.js',{standalone:true}))
        .pipe(gulp.dest('./build/scripts'));
});

gulp.task('customCSS', function(){
    gulp.src(['./app/styles/style.css'])
        .pipe(plugins.concat('main.css'))
        .pipe(gulp.dest('./build/styles'));
});

gulp.task('vendorJS', function(){
    var vendorBowerFiles = mainBowerFiles();
    // vendorBowerFiles.push('moment/min/moment-with-locales.min.js');
    //concatenate vendor JS files
    return gulp.src(vendorBowerFiles, { base: './bower_components'})
    .pipe(plugins.filter('**/*.js'))
      /*
       * If you need the scripts to be loaded in a different order,
       * edit the array below
       */    
    .pipe(plugins.order([
      "**/angular.js",
      "**/angular-*.js",
      '**/lo-dash.js',
      '**/restangular.js',
      '**/ngForce.js',
      '**/ngForce-*.js',
      '**/ui-grid.js'
    ]))

    .pipe(plugins.concat('lib.js'))
    
    .pipe(gulp.dest('./build/scripts'));
});

gulp.task('angularGridFonts', function(){
  return gulp.src(mainBowerFiles(), {base: './bower_components/'})
    .pipe(plugins.filter(['angular-ui-grid/*.svg', 'angular-ui-grid/*.eot', 'angular-ui-grid/*.ttf', 'angular-ui-grid/*.woff']))
    .pipe(plugins.flatten())
    .pipe(gulp.dest('./build/styles'))
});

gulp.task('vendorCSS', function(){

  // concatenate vendor CSS files
  return gulp.src(mainBowerFiles(), {base: './bower_components'})
    .pipe(plugins.filter(['**/*.css','!**/bootstrap*']))
    .pipe(plugins.addSrc.append('./app/styles/*bootstrap*'))
    .pipe(plugins.concat('lib.css'))
    .pipe(gulp.dest('./build/styles'));
});

gulp.task('vendorFonts', function(){
    //concatenate vendor font files
    return gulp.src(mainBowerFiles( ), { base: './bower_components'} )
    .pipe(plugins.filter(['**/fonts/*']))
    .pipe(plugins.flatten())
    .pipe(gulp.dest('./build/fonts'));
});

gulp.task('customFonts', function(){
    //concatenate custom font files
    gulp.src('./app/styles/fonts/**')
    .pipe(gulp.dest('./build/fonts'));
});

gulp.task('copy-index', function() {
    gulp.src('./app/index.html')
        .pipe(gulp.dest('./build'));
});

gulp.task('watch',function(){
    gulp.watch([
        'build/**/*.html',
        'build/**/*.js',
        'build/**/*.css'
    ], function(event) {
        return gulp.src(event.path)
            .pipe(plugins.connect.reload());
    });
    gulp.watch(['./app/**/*.js','!./app/**/*test.js'],['scripts']);
    gulp.watch(['!./app/index.html','./app/**/*.html'],['templates']);
    gulp.watch('./app/**/*.css',['customCSS', 'vendorCSS']);
    gulp.watch('./app/index.html',['copy-index']);

});

gulp.task('connect', function(){
  plugins.connect.server({
    root: ['build'],
    port: 9000,
    livereload: true
  })
});

gulp.task('zip-staticresource', function () {
    return gulp.src('**/*', {cwd:path.join(process.cwd(), 'build')})
        .pipe(plugins.zip('SL_DGRL.resource'))
        .pipe(gulp.dest('../src/staticresources'));
});

// gulp.task('meta-staticresource', function () {
//     return createFileFromString('SL_DGRL.resource-meta.xml', '<?xml version="1.0" encoding="UTF-8"?><StaticResource xmlns="http://soap.sforce.com/2006/04/metadata"><cacheControl>Private</cacheControl><contentType>application/zip</contentType></StaticResource>')
//         .pipe(gulp.dest('../src/staticresources'));
// });

// gulp.task('meta-page', function() {
//   return createFileFromString('SL_DGRL.page-meta.xml','<?xml version="1.0" encoding="UTF-8"?><ApexPage xmlns="http://soap.sforce.com/2006/04/metadata"><apiVersion>29.0</apiVersion><availableInTouch>true</availableInTouch><label>SL_DGRL</label></ApexPage>')
//           .pipe(gulp.dest('../src/pages'));
// });

gulp.task('vf-page', function() {
  return gulp.src('./app/SL_DGRL.page')
          .pipe(gulp.dest('../src/pages'));
});

// gulp.task('save', ['zip-staticresource','meta-staticresource', 'meta-page', 'vf-page']);
gulp.task('save', ['zip-staticresource','meta-staticresource']);
gulp.task('buildOnly', ['scripts','templates','customCSS','vendorFonts','customFonts','copy-index','vendorJS','vendorCSS', 'angularGridFonts']);
gulp.task('build', ['connect', 'buildOnly','watch']);
gulp.task('cleanAndBuild', ['cleanBuild'], function() {
  gulp.start('build');
});
gulp.task('default',['cleanAndBuild']);
