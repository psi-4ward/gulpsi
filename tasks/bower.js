var fs = require('fs');

gulp.task('bower', function(cb) {
  var file = $config.basePath + 'bower.json';
  try {
    var bowerfile = require(file);
  } catch(e) {
    if(e.code === 'MODULE_NOT_FOUND') {
      gutil.log(
        gutil.colors.red('Error')
          + "    '" + gutil.colors.cyan('bower') + "' "
          + gutil.colors.red('bower.json not found!')
          + ' run ' + gutil.colors.white.bold('bower init'));
      return cb();
    } else return cb(e);
  }

  oldDeps = _.clone(bowerfile.dependencies);
  bowerfile.dependencies = {};

  $packages.getValues('dependencies.bower').forEach(function(deps) {
    _.forEach(deps, function(data, pkg) {
      // TODO: what todo on version mismatch? currently the module wins
      bowerfile.dependencies[pkg] = data.version;
    });
  });

  fs.writeFile(file, JSON.stringify(bowerfile, null, '  '), cb);

  gutil.log(
    gutil.colors.bold.green('bower.json generated') +
    ' run ' +
    gutil.colors.bold.white("bower install") +
    ' to download your dependecies.'
  );

});