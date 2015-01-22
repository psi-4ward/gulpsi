var glob = require('glob');
var path = require('path');
var fs = require('fs');

/**
 * Resolve globbing patterns to module directories
 * @param {string} basePath
 * @param {Array} sources
 * @returns {Array}
 */
module.exports.resolve = function(basePath, localModules, foreignModules) {
  if(!_.isArray(localModules)) localModules = [localModules];
  if(!_.isArray(foreignModules)) foreignModules = [foreignModules];

  // resolve localModules folders
  var local = _(localModules)
    .map(function(pattern) {
      return glob.sync(pattern, {cwd: basePath})
    })
    .flatten()
    .map(function(file) {
      return path.resolve(basePath, file);
    })
    .filter(function(folder) {
      return fs.lstatSync(folder).isDirectory();
    })
    .value();

  // resolve foreignModules folders
  var foreign = _(foreignModules)
    .map(function(pattern) {
      return glob.sync(pattern + '/gulpsi.json', {cwd: basePath})
    })
    .flatten()
    .map(function(file) {
      return path.resolve(basePath, path.dirname(file));
    })
    .value();

  return local.concat(foreign);
}


/**
 * load config.js from each sources directory
 * @param {Array} sources
 * @returns {Array}
 */
module.exports.loadConfigs = function(sources) {
  var configs = [];

  sources.forEach(function(folder) {
    var moduleConfig;
    try {
      moduleConfig = require(folder + '/gulpsi.json');
    }
    catch(e) {
      if(e.code === 'MODULE_NOT_FOUND') {
        if($config.verbose) gutil.log(folder.substr($config.basePath.length) + ' contains no gulpsi.json, skipped');
      } else {
        gutil.log(gutil.colors.red(e.toString()));
      }
      moduleConfig = {};
    }
    moduleConfig.folder = folder.substr($config.basePath.length);
    if(!moduleConfig.weight) moduleConfig.weight = 0; 
    configs.push(moduleConfig);
  });

  configs = _.sortBy(configs, 'weight').reverse();


  /**
   * getFolders(add) mixin
   *
   * @param {bool} absolute  Make the path absolute
   * @param {string} add     Append to each folder
   * @returns {Array}        module folders
   */
  configs.__proto__.getFolders = function(absolute, add) {
    return configs.map(function(config) {
      return (absolute ? $config.basePath : '') + config.folder + (add || '');
    });
  }

  /**
   * fetch a value from all configs
   * and return a flatten, unique array
   *
   * @param {String} objPath dot-seperated object path
   * @returns {Array}
   */
  configs.__proto__.getValues = function(objPath) {
    var parts = objPath.split('.');
    return _(configs)
      .map(function(cfg) {
        for(var i=0; i<parts.length; i++) {
          if(!cfg[parts[i]]) return false;
          cfg = cfg[parts[i]];
        }
        return cfg;
      })
      .flatten()
      .compact()
      .unique()
      .value();
  };


  configs.__proto__.getBowerValues = function(key) {
    return _(configs.getValues('dependencies.bower'))
      .map(function(a) {
        return _.values(a);
      })
      .flatten()
      .map(function(a) {
        return a[key];
      })
      .flatten()
      .compact()
      .value();
  };

  return configs;
}
