var livereload = require('gulp-livereload');

/* Livereload */
gulp.task('livereload', function() {

  // Start livereload server
  livereload.listen($config.livereloadPort, function() {
    gutil.log("Listen   '" + gutil.colors.cyan('livereload') + "' listening on port " + gutil.colors.bold($config.livereloadPort));
  });

  /* Watcher for livereload push */
  $config._watchFuncs.push(function() {
    var w = gulp.watch([$config.dest + '**/*']);
    w.on('change', function(event) {
      var args = arguments;
      setTimeout(livereload.changed.apply(livereload, args), 300);
    });
    return w;
  });
});

