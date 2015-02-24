var path = require('path');

// commandline arguments alter some settings
var defaults = module.exports = {
  basePath: path.join(__dirname, '..', '..'),

  // will try to populate this values from package.json
  appName: 'app',
  version: '0.0.0',

  // should bt must not include a gulpsi.json
  localPackages: [
    'packages/*',
    'modules/*'
  ],

  // must include a gulpsi.json
  foreignPackages: [
    'node_modules/*'
  ],

  dest: path.join(__dirname, '..', '..', 'public'),

  buildTasks: ['app', 'libs', 'assets', 'less', 'processIndexHtml', 'ngTemplates'],
  devTasks: ['jshint', 'watch', 'livereload'], // in addition to buildTasks

  minify: false,

  subfolder: {
    angular: '/angular',
    assets: '/assets',
    less: '/less'
  },

  assetsDest: '', // /assets

  pathNormalization: [
    [/^packages\//, ''],
    [/^(node_)?modules\//, ''],
    [/\/angular(?![^/])/, ''],
    [/^angular(?![^/])/, ''],
    [/^bower_components\//, '']
  ],

  /* folder for local tasks */
  localTasks: false,

  /* callback when everything is loaded */
  // afterLoad: function() {},

  webserverPort: 8080,
  livereloadPort: 35729,
  openBrowserOnServe: true,

  /* Rescan for package-folders
   * and re-init the filewatchers
   * to workaround bugs in gulp.watch
   * (gaze dont emit change events for new/empty files)
   */
  watcherRebuildInterval: 12000,

  commanderOpts: [
    ['-T, --tasks', 'Show gulp tasks'],
    ['-m, --minify', 'Run js/css minifcation', false],
    ['-V --verbose', 'Verbose output', false],
    ['--target <dir>', 'Use this directory for build files']
  ],
  commanderHelp: [
    '  Common tasks:',
    ' ',
    '    build            Build the app',
    '    bower            Generate the bower.json',
    '    dev              Build, start watchers and livereload',
    '    serve            Start the builtin webserver',
    '    list-packages    List all detected packages',
  ],

  taskHooks: {
/*
    ngTemplates: {
      getSources: function() {
        // return array with globbing patterns
      },
      pipe: function(stream) {
        // pipe your stream around
        return stream;
      }
    }
*/
  }
};

// try to fetch appName and version from package.json
try {
  var data = require(defaults.basePath + '/package.json');
  defaults.appName = data.name;
  defaults.version = data.version;
} catch(e) {}
