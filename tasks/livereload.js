var livereload = require('gulp-livereload');

/* Livereload */
gulp.task('livereload', function() {

  // Start livereload server
  livereload.listen($config.livereloadPort);
  gutil.log("Listen   '" + gutil.colors.cyan('livereload') + "' listening on port " + gutil.colors.bold($config.livereloadPort));

  /* Watcher for livereload push */
  $config._watchFuncs.push(function livereloadWatcher() {
    // dont reload .map files cause it leads to a pagereload for css
    return gulp.watch([$config.dest + '**/*', '!' + $config.dest + '**/*.map'], function(event) {
      var args = arguments;
      setTimeout(livereload.changed.apply(livereload, args), 100);
    });
  });
});

