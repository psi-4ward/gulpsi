var rename = require('gulp-rename');
var htmlmin = require('gulp-htmlmin');
var sourcemaps = require('gulp-sourcemaps');
var templateCache = require('gulp-angular-templatecache');
var glob = require('glob');
var async = require('async');
var minmatch;
try {
  minmatch = require('minimatch');
} catch (e) {
  minmatch = require('glob/node_modules/minimatch');
}

var watcherSetupDone = false;

function getSources() {
  if($config.taskHooks.ngTemplates && $config.taskHooks.ngTemplates.getSources) return $config.taskHooks.ngTemplates.getSources();

  var sources = [];
  // create globbing pattern for each module
  $packages.forEach(function(cfg) {
    sources.push($config.basePath + cfg.folder + $config.subfolder.angular + '/**/*.html');
    // exclude the index.html
    if(cfg.indexHtml) sources.push('!' + $config.basePath + cfg.folder + $config.subfolder.angular + '/index.html');
  });
  return sources;
}

gulp.task('ngTemplates', function(cb) {

  /* Watcher for ngTemplates rebuild */
  if(!watcherSetupDone) {
    $config._watchFuncs.push(function() {
      return gulp.watch(
        getSources(),
        ['ngTemplates'],
        function(event) {
          gutil.log("Changed  '" + gutil.colors.cyan('ngTemplates') + "' " + event.path.substr($config.basePath.length));
        }
      );
    });
    watcherSetupDone = true;
  }


  async.map(
    getSources(),
    function(pattern, cb) {
      if(pattern[0] === '!') return cb(null, pattern);
      // resolve globbing to files
      glob(pattern, {nodir: true}, cb);
    },
    function(err, files) {
      if(err) return cb(err);

      var negative = [];

      files = _(files)
        .flatten()
        // strip negative-patterns
        .filter(function(file) {
          if(file[0] === '!') {
            negative.push(file.substr(1));
            return false;
          }
          return true;
        }).value();

      files = _(files)
        // strip files matching a negative-pattern
        .filter(function(file) {
          return !_.some(negative, function(negativePattern) {
            return minmatch(file, negativePattern);
          });
        })
        .unique(function(file) {
          file = file.substr($config.basePath.length);
          $config.pathNormalization.forEach(function(replace) {
            file = file.replace(replace[0], replace[1]);
          });
          return file;
        })
        .value();

      // run the ngTemplates pipe
      var s = gulp.src(files, {base: $config.basePath});
      s = s.pipe(sourcemaps.init());

      // include the pipe HOOK
      if($config.taskHooks.ngTemplates && $config.taskHooks.ngTemplates.pipe) {
        s = $config.taskHooks.ngTemplates.pipe(s);
      }

      if($config.minify) {
        s = s.pipe(htmlmin({collapseWhitespace: true}));
      }
      s = s.pipe(rename(function(opt) {
        // normalize path
        $config.pathNormalization.forEach(function(replace) {
          opt.dirname = opt.dirname.replace(replace[0], replace[1]);
        });
        return opt;
      }))
      s = s.pipe(templateCache({
        module: $config.appName
      }));
      s = s.pipe(sourcemaps.write('.', {sourceRoot: '/'}));
      s = s.pipe(gulp.dest($config.dest));

      s.on('end', cb);
    }
  )

});



