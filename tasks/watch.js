var fs = require('fs');
var path = require('path');
var packagesHelper = require('../lib/packages.js');
var async = require('async');

/* setup all watchers */
gulp.task('watch', function() {
  setTimeout(function() {
    $config._watchFuncs.forEach(function(wFunc) {
      wFunc._watcherRef = wFunc();
    });

    if($config.watcherRebuildInterval) {
      setInterval(function() {
        packagesHelper.resolveAsync($config.basePath, $config.localPackages, $config.foreignPackages, function(err, sources) {
          $config.sources = sources;
          $packages = packagesHelper.loadConfigs($config.sources);

          $config._watchFuncs.forEach(function(wFunc) {
            if(wFunc._watcherRef) {
              wFunc._watcherRef.end();
            }
            wFunc._watcherRef = wFunc();
          });
        });
      }, $config.watcherRebuildInterval);
    }
  }, 350);
});