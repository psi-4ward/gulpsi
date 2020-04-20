var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var path = require('path');
var virtualFile = require('gulp-file');

var watcherSetupDone = false;

/* LESS */
gulp.task('less', function(cb) {

  /* Watcher for less rebuild */
  if(!watcherSetupDone) {
    $config._watchFuncs.push(function() {
      return gulp.watch(
        $packages.getFolders(true, '/**/*.less').concat($packages.getFolders(true, '/**/*.css')),
        ['less'],
        function(event) {
          gutil.log("Changed  '" + gutil.colors.cyan('less') + "' " + event.path.substr($config.basePath.length));
        }
      );
    });
    watcherSetupDone = true;
  }


  var lessImport = '';

  $packages.getBowerValues('less').forEach(function(lessFile) {
    lessImport += '@import "' + $config.basePath + 'bower_components/' + lessFile + "\";\n";
  });
  $packages.getBowerValues('css').forEach(function(lessFile) {
    lessImport += '@import (inline) "' + $config.basePath + 'bower_components/' + lessFile + "\";\n";
  });

  $packages.forEach(function(pkgCfg) {
    // aggregate less from configs
    if(pkgCfg.less) {
      if(!_.isArray(pkgCfg.less)) pkgCfg.less = [pkgCfg.less];
      pkgCfg.less.forEach(function(lessFile) {
        lessImport += '@import "' + $config.basePath + pkgCfg.folder + '/' + lessFile + "\";\n";
      });
    }

    // aggregate/inline css from configs
    if(pkgCfg.css) {
      if(!_.isArray(pkgCfg.css)) pkgCfg.css = [pkgCfg.css];
      pkgCfg.css.forEach(function(lessFile) {
        lessImport += '@import (inline) "' + $config.basePath + pkgCfg.folder + lessFile + "\";\n";
      });
    }
  });

  var s = virtualFile('styles.less', lessImport, {src: true});

  // init sourcemaps for minify builds
  s.pipe(sourcemaps.init());

  var lessCompiler = less({javascriptEnabled: true});
  lessCompiler.on('error', cb);
  s = s.pipe(lessCompiler);
  // dont run a gulp.dest() here, it sets a new base path attrib
  // and sourcemaps() can not find the less-files for content inclusion

  // minify build
  if($config.minify) {
    s = s.pipe(minifyCSS());
    s = s.pipe(rename({suffix: '.min'}));
  }

  s = s.pipe(sourcemaps.write('.', {
    includeContent: true,
    sourceRoot: '/'
  }));

  s = s.pipe(gulp.dest($config.dest));
  s.on('end', cb);
});



