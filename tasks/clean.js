var del = require('del');

/* remove build folder */
gulp.task('clean', function(cb) {
  del([$config.dest], {force: true}, cb);
});
