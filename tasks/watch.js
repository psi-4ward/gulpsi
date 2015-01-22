var fs = require('fs');
var path = require('path');
var packagesHelper = require('../lib/packages.js');

/* setup all watchers */
gulp.task('watch', function() {
  $config._watchFuncs.forEach(function(wFunc) {
    wFunc._watcherRef = wFunc();
  });

  if($config.watcherRebuildInterval) {
    setInterval(function() {
      $config.sources = packagesHelper.resolve($config.basePath, $config.localPackages, $config.foreignPackages);
      $packages = packagesHelper.loadConfigs($config.sources);

      $config._watchFuncs.forEach(function(wFunc) {
        if(wFunc._watcherRef) wFunc._watcherRef.end();
        wFunc._watcherRef = wFunc();
      });
    }, $config.watcherRebuildInterval);
  }
});