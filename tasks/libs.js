var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

var watcherSetupDone = false;

function getSources() {
  var libs = $packages.getBowerValues('js').map(function(file) {
    return $config.basePath + 'bower_components/' + file;
  });
  if($config.libs) libs = libs.concat($config.libs);
  return libs;
}

/* Concat libs js */
gulp.task('libs', function() {

  /* Watchers for libs.js rebuild */
  if(!watcherSetupDone) {
    $config._watchFuncs.push(function() {
      return gulp.watch(
        $packages.getFolders(true, '/gulpsi.json').concat(getSources()),
        ['libs'],
        function(event) {
          gutil.log("Changed  '" + gutil.colors.cyan('libs') + "' " + event.path.substr($config.basePath.length));
        }
      );
    });
    watcherSetupDone = true;
  }


  if($config.argv.verbose) {
    libs.forEach(function(lib) {
      gutil.log('including lib ' + lib.substr($config.basePath.length));
    });
    gutil.log(gutil.colors.yellow('Warning: ') + ' every non existing file gets skipped silently!');
  }

  var s = gulp.src(getSources(), {base: $config.basePath});

  // init sourcemaps
  s = s.pipe(sourcemaps.init());
  s = s.pipe(concat('libs.js'));

  // minify build
  if($config.minify) {
    s = s.pipe(uglify());
    s = s.pipe(rename({suffix: '.min'}));
  }

  s = s.pipe(sourcemaps.write('.', {includeContent: true, sourceRoot: '/'}));
  s = s.pipe(gulp.dest($config.dest));

  return s;
});

