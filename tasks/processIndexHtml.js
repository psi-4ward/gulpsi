var cheerio = require('gulp-cheerio');
var _ = require('lodash');

var watcherSetupDone = false;

gulp.task('processIndexHtml', function(cb) {

  // find index.html in config
  var mod = _.find($packages, {indexHtml: true});
  if(!mod) return cb('Could not find any module with index.html');
  var file = $config.basePath + mod.folder + '/angular/index.html';

  /* Watchers for index.html rebuild */
  if(!watcherSetupDone) {
    $config._watchFuncs.push(function() {
      return gulp.watch(
        file,
        ['processIndexHtml'],
        function(event) {
          gutil.log("Changed  '" + gutil.colors.cyan('processIndexHtml') + "' " + event.path.substr($config.basePath.length));
        }
      );
    });
    watcherSetupDone = true;
  }

  var s = gulp.src(file);

  s = s.pipe(cheerio({
    run: function($) {

      // rewrite the ng-app attribute to use the appName
      $('[ng-app]').attr('ng-app', $config.appName);
      $('script[src="app.js"]').attr('src', $config.appName + '.js');

      if($config.minify) {
        // rewrite <script> and <link> to use .min files
        $('link[href]:not(.no-min), script[src]:not(.no-min)').each(function rewriteHref(k, el) {
          el = $(el);
          function rewrite(str) {
            return str.replace(/^(.*)\.([^\.]+)$/, "$1.min.$2");
          }

          if(el.attr('src')) el.attr('src', rewrite(el.attr('src')));
          if(el.attr('href')) el.attr('href', rewrite(el.attr('href')));
        });
      }
    }
  }));
  s = s.pipe(gulp.dest($config.dest));

  return s;
});
