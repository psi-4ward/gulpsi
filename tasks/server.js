var express = require('express');
var connectLivereload = require('connect-livereload');
var open = require('open');

/* Static files server */
gulp.task('serve', function(next) {
  var app = express();
  app.use(connectLivereload());
  app.use(express.static($config.dest));
  app.listen($config.webserverPort, function() {
    gutil.log("Listen   '" + gutil.colors.cyan('serve') + "' Webserver listening on port " + gutil.colors.bold($config.webserverPort));
    if($config.openBrowserOnServe) open("http://localhost:" + $config.webserverPort);
    next();
  });
});