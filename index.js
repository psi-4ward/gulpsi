var runSequence = require('run-sequence').use(gulp);
var glob = require('glob');
var gutil;
try {
  gutil = require('gulp-util/index.js');
} catch(e) {
  gutil = require('gulp/node_modules/gulp-util/index.js');
}
var _ = require('lodash');
var path = require('path');
var commander = require('commander');

var $config = require('./defaults.js');

global['runSequence'] = runSequence;
global['gutil'] = gutil;
global['_'] = _;
global['$config'] = $config;
global['$packages'] = {};

commander
  .usage('task [task task ...] [options]')
  .on('--help', function() {
    console.log($config.commanderHelp.join("\n"));
  });

process.nextTick(function() {

  // process config
  $config.commanderOpts.forEach(function(opt) {
    commander.option.apply(commander, opt);
  });
  $config.help = commander.help.bind(commander);
  $config.argv = commander.parse(process.argv);

  if(_.isFunction($config.beforeLoad)) $config.beforeLoad();

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
  $config.help();
});

gulp.task('build', function(cb) {
  if(!$config.minify) gutil.log(gutil.colors.bold.white('Use -m to for minification.'));
  runSequence('clean', $config.buildTasks, cb);
});

gulp.task('dev', function(cb) {
  runSequence($config.buildTasks, $config.devTasks, cb);
});

module.exports = $config;
