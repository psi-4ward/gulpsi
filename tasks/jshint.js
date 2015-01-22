var jshint = require('gulp-jshint');

var watcherSetupDone = false;

/* JSHint */
gulp.task('jshint', function() {

  /* Watchers for jsHint */
  if(!watcherSetupDone) {
    $config._watchFuncs.push(function() {
      var w = gulp.watch($packages.getFolders(true, $config.subfolder.angular + '/**/*.js'));
      w.on('change', function(event) {
        gulp.src(event.path)
          .pipe(jshint())
          .pipe(jshint.reporter('jshint-stylish'));
      });
      return w;
    });
   watcherSetupDone = true;
  }

  return gulp.src($packages.getFolders(true, $config.subfolder.angular + '**/*.js'))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

