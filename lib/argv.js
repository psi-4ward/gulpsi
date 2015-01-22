var commander = require('commander');

// cmdline argument support
// TODO: modularize this and make it extendable
commander
  .usage('task [task task ...] [options]')
  .option('-T, --tasks', 'Show gulp tasks')
  .option('-m, --minify', 'Run js/css minifcation', false)
  .option('-V --verbose', 'Verbose output', false)
  .option('--target <dir>', 'Use this directory for build files')
  .on('--help', function() {
    console.log('  Common tasks:');
    console.log(' ');
    console.log('    build            Build the app');
    console.log('    bower            Generate the bower.json');
    console.log('    dev              Build, start watchers and livereload');
    console.log('    serve            Start the builtin webserver');
    console.log('    list-packages    List all detected packages');
  });

module.exports.help = commander.help.bind(commander);
module.exports.argv = commander.parse(process.argv);