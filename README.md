# GulPsi

Gulp based build system (for angular):
 * packages (local or installed via npm / bower)
 * angular-module dependency aggregation
 * bower dependency aggregation
 * full sourcemap support
 * workarounds for common gulp/sourcemap/watch problems
 * easy configurable and customizable

## Tasks
  * `app`: Generate the `angular.module("appName", [...deps...])` definition and combines your angular code
  * `assets`: Copy the assets
  * `bower`: Update the `bower.json` with aggregated package dependencies
  * `clean`: Cleanup your build directory
  * `jshint`: Lint your code
  * `less`: Compile LESS and combine CSS
  * `livereload`: Livereload :)
  * `ngTemplates`: Concat all html templates into a `templates.js`. Supports overwriting of templates comming from npm_modules
  * `processIndexHtml`: Copy and rewrite the `index.html` to use the minified files and set the `ng-app` name
  * `watch`: A helper-task to react on filechanges
   
## Installation

Theres no npm package yet
```
npm install gulp
npm install psi-4ward/gulpsi
```

## Usage
  * `gulp -h` show the help
  * `gulp build` builds your app (into public folder)
  * `gulp dev` build, start watchers and livereload
  * `gulp serve` start builtin webserver
  * `gulp bower` aggregate the bower dependencies and update *bower.json*

## Configuration

### Module's `gulpsi.json`
```javascript
{

  // define dependencies
  "dependencies": {

    // this gets merged into the angular.module("app", [ ...dependcies... ]);
    "angular": ["ui-router"],

    // your bower dependencies
    "bower": {
      "angular": {
        "version": "~1.3.9",
        // files gets merged into your lib.js
        "js": "angular/angular.js"
      },
      "bootstrap": {
        "version": "~3.3.0",
        
        // could be an array with many files
        "js": [
          "bootstrap/js/affix.js",
          "bootstrap/js/dropdown.js",
          "bootstrap/js/tooltip.js"
        ],
        
        // @import this less file
        // "less": "bootstrap/less/bootstrap.less"
        
        // @import (inline) this css files
        "css": [
          "bootstrap/dist/css/bootstrap.css",
          "bootstrap/dist/css/bootstrap-theme.css"
        ]
      }      
    }
  },

  // @import this less file(s)
  "less": "less/test.less",
  
  // "css": [ ... ]

  // tells the processIndexHtml task that this module
  // has the entrypoint file "index.html"
  "indexHtml": true

}
```

### Buildsystem config

You can configure the buildsystem using the `gulpfile.js` see `defaults.js` for possible values.
Or configure a `localTask` folder for your local task files.

You have some global variables to make the life easier:
* `gulp`: reference to gulp
* `runSequence`: [run-sequence](https://github.com/OverZealous/run-sequence)
* `gutil`: [gulp-util](https://github.com/gulpjs/gulp-util)
* `_`: [lodash](https://lodash.com)
* `$config`: the configuration
* `$packages`: all module configurations

#### `gulpfile.js` example
```javascript
global['gulp'] = require('gulp');
var $config = require('gulpsi');

// define particular apps
var common = ['angular/base', 'angular/theme', 'angular/psi-notify'];
var apps = {
  admin: ['angular/angular-psi-csv', 'angular/admin'],
  editor: ['angular/editor', 'angular/chat'],
  visitor: ['angular/visitor', 'angular/visitor'],
};

// add "--app" cli argument support
$config.commanderOpts.push(['--app <app>', 'Build a particular app']);

// packages containing only angular files, no subfolder necessary 
$config.subfolder.angular = '';

// the beforeLoad Hook is triggered after cli-argument parse but before config parsing 
$config.beforeLoad = function() {
  if(['clean', 'bower', 'jshint', 'serve'].indexOf($config.argv.args[0]) > -1) {
    // use every package for this common tasks
    $config.localPackages = ['angular/*'];
  } else {
    // some --app argument validation
    if(!$config.argv.app) {
      gutil.log(gutil.colors.red('Error') + ': --app argument missing');
      $config.help(); process.exit(1);
    } else if (Object.keys(apps).indexOf($config.argv.app) === -1) {
      gutil.log(gutil.colors.red('Error') + ': invalid app name! Use one of: ' + Object.keys(apps).join(', '));
      $config.help(); process.exit(1);
    }

    // use only defined package directories
    $config.localPackages = common.concat(apps[$config.argv.app]);

    // build to app subfolder
    $config.dest = 'public/' + $config.argv.app;
  }
};

// Add haml support to ngTemplates using the getSources and pipe Hooks 
var haml = require('gulp-haml');
$config.taskHooks.ngTemplates = {
  getSources: function() {
    var sources = [];
    // create globbing pattern for each module
    $packages.forEach(function(cfg) {
      sources.push($config.basePath + cfg.folder + $config.subfolder.angular + '/**/*.html');
      sources.push($config.basePath + cfg.folder + $config.subfolder.angular + '/**/*.haml');
      // exclude the index.html using a negative-globbing pattern
      if(cfg.indexHtml) sources.push('!' + $config.basePath + cfg.folder + $config.subfolder.angular + '/index.html');
    });
    return sources;
  },
  pipe: function(stream) {
    var h = haml({compiler: 'creationix'});
    h.on('error', function(e) {
      gutil.log(
        gutil.colors.red('Error')
        + "    '" + gutil.colors.cyan('haml') + "' "
        + gutil.colors.red(e.toString())
      );
    });
    return stream.pipe(h);
  }
};

// Deploy Task
gulp.task('deploy', function() {
 // .... 
});
```

## TODO:
* Create a task to inject config into app (like api-url for dev-systems)
