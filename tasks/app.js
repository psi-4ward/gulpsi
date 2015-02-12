var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var add = require('gulp-add');

var watcherSetupDone = false;

/* Concat app js */
gulp.task('app', function() {

  /* Watcher for app rebuild */
  if(!watcherSetupDone) {
    $config._watchFuncs.push(function() {
      return gulp.watch(
        $packages.getFolders(true, $config.subfolder.angular + '/**/*.js'),
        ['app'],
        function(event) {
          gutil.log("Changed  '" + gutil.colors.cyan('app') + "' " + event.path.substr($config.basePath.length));
        }
      );
    });
    watcherSetupDone = true;
  }


  var angularDependencies = $packages.getValues('dependencies.angular').map(function(dep) {
    return "'"+dep+"'";
  });
  var header = '!function(){ "use strict"; var app = angular.module(\'' + $config.appName + '\', [' + angularDependencies.join(',') + ']); ' + "\n";
  var footer = "}();" + "\n";

  var s = gulp.src($packages.getFolders(true, $config.subfolder.angular + '/**/*.js'), {base: $config.basePath});
  s = s.pipe(add($config.appName + '-generated-header.js', header, true));
  s = s.pipe(add($config.appName + '-generated-footer.js', footer));

  s = s.pipe(sourcemaps.init());

  s = s.pipe(concat($config.appName + '.js'));

  var ngan = ngAnnotate();
  ngan.on('error', function(e) {
    gutil.log(
      gutil.colors.red('Error')
      + "    '" + gutil.colors.cyan('app') + "' "
      + gutil.colors.red(e.toString().replace(/\r?\n/g, ' '))
    );
  });
  s = s.pipe(ngan);

  // minify build
  if($config.minify) {
    s = s.pipe(uglify());
    s = s.pipe(rename({suffix: '.min'}));
  }

  s = s.pipe(sourcemaps.write('.', {includeContent: true, sourceRoot: '/'}));
  s = s.pipe(gulp.dest($config.dest));

  return s;
});

