/**
 * Used for generating Sass files on-the-fly in development
 */

var sass = require('node-sass');
var path = require('path')
var fs = require('fs');

exports.Sassy = function *(next) {
  var matches = this.request.url.match(/^\/css\/(.*)\.css$/);
  if(matches) {
    var filename = matches[1];
    var pubdir = path.join(__dirname, '..', '..', 'public', 'css');
    var sassdir = path.join(__dirname, '..', 'sass');

    try {
      var result = sass.renderSync({
        file: path.join(sassdir, filename + '.scss'),
      });
    }catch(e) {
      console.error(e);
      yield next;
      return;
    }
    fs.writeFileSync(path.join(pubdir, filename + '.css'), result.css);
  }
  yield next;
};
