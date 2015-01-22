var rename = require('gulp-rename');
var htmlmin = require('gulp-htmlmin');
var sourcemaps = require('gulp-sourcemaps');
var templateCache = require('gulp-angular-templatecache');
var glob = require('glob');
var async = require('async');

var watcherSetupDone = false;
var indexHtml = false;

function getSources() {
  var sources = [];
  // create globbing pattern for each module
  $packages.forEach(function(cfg) {
    sources.push($config.basePath + cfg.folder + $config.subfolder.angular + '/**/*.html');
    // exclude the index.html
    if(cfg.indexHtml) indexHtml = $config.basePath + cfg.folder + $config.subfolder.angular + '/index.html';
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
    function(patter, cb) {
      // resolve globbing to files
      glob(patter, {nodir: true}, cb);
    },
    function(err, files) {
      if(err) return cb(err);

      // strip node_modules/sails4angular-module-*/angular/*.html
      // which is overwritten in modules/sails4angular-module-*/angular/*.html
      // and strip index.html entrypoint
      files = _(files)
        .flatten()
        .unique(function(file) {
          file = file.substr($config.basePath.length);
          $config.pathNormalization.forEach(function(replace) {
            file = file.replace(replace[0], replace[1]);
          });
          return file;
        })
        .filter(function(file) {
          return file !== indexHtml;
        })
        .value();

      // run the ngTemplates pipe
      var s = gulp.src(files, {base: $config.basePath});
      s = s.pipe(sourcemaps.init());
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



