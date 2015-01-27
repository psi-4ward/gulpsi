var runSequence = require('run-sequence').use(gulp);
var glob = require('glob');
var gutil = require('gulp/node_modules/gulp-util/index.js');
var _ = require('lodash');
var argv = require('./lib/argv');
var path = require('path');

var $config = {
  argv: argv.argv
};

global['runSequence'] = runSequence;
global['gutil'] = gutil;
global['_'] = _;
global['$config'] = $config;
global['$packages'] = {};

process.nextTick(function() {

  // process config
  _.defaults($config, require('./defaults.js'));
  if(!$config._watchFuncs) $config._watchFuncs = [];
  if($config.argv.minify) $config.minify = true;
  if($config.argv.target) $config.dist = $config.argv.target;
  if($config.basePath.substr(-1) !== '/') $config.basePath += '/';

  // resolve sources
  var packagesHelper = require('./lib/packages.js');
  $config.sources = packagesHelper.resolve($config.basePath, $config.localPackages, $config.foreignPackages);
  $packages = packagesHelper.loadConfigs($config.sources);

  // load all tasks
  glob.sync(__dirname + "/tasks/**/*.js").forEach(require);
  if($config.localTasks) {
    glob.sync(path.resolve($config.localTasks) + "/**/*.js").forEach(require);
  }

  if(_.isFunction($config.afterLoad)) $config.afterLoad();

});

gulp.task('default', function() {
  argv.help();
});

gulp.task('build', function(cb) {
  if(!$config.minify) gutil.log(gutil.colors.bold.white('Use -m to for minification.'));
  runSequence('clean', $config.buildTasks, cb);
});

gulp.task('dev', function(cb) {
  runSequence($config.buildTasks, $config.devTasks, cb);
});

module.exports = $config;
