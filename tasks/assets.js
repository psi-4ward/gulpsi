var rename = require('gulp-rename');

var watcherSetupDone = false;

function getSources() {
  return $packages.getFolders(true, $config.subfolder.assets + '/**/*')
    .concat(
      $packages.getBowerValues('assets').map(function(v) {
        return $config.basePath + 'bower_components/' + v;
      })
    );
}

function runAssetsCopy(sources) {
  return gulp.src(sources, {base: $config.basePath})
    .pipe(rename(function(opt) {
      // normalize path
      $config.pathNormalization.forEach(function(replace) {
        opt.dirname = opt.dirname.replace(replace[0], replace[1]);
      });
      return opt;
    }))
    .pipe(gulp.dest($config.dest + $config.assetsDest));
}

gulp.task('assets', function(cb) {

  if(!watcherSetupDone) {
    $config._watchFuncs.push(
      function() {
        var w = gulp.watch(getSources());
        w.on('change', function(event) {
          gutil.log("Changed  '" + gutil.colors.cyan('assets') + "' " + event.path.substr($config.basePath.length));
          return runAssetsCopy(event.path);
        });
        return w;
      }
    );
    watcherSetupDone = true;
  }

  return runAssetsCopy(getSources());
});
