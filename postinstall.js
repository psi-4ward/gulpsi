var path = require('path');
var fs = require('fs');

var basePath = path.resolve(__dirname, '..', '..');

// check if gulp is installed
try {
  require('gulp');
} catch(e) {
  console.log();
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.log('WARNING: Seems you have no local gulp installed');
  console.log('Please run "npm install --save-dev gulp');
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.log();
}

// copy gulpfile.sample.js
if(!fs.existsSync(basePath + '/gulpfile.js')) {
  fs.createReadStream(__dirname + '/gulpfile.js.sample').pipe(fs.createWriteStream(basePath + '/gulpfile.js'));
  console.log();
  console.log('Copied the sample gulpfile.js for you :)');
  console.log();
}