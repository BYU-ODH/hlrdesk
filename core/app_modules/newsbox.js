var co = require('co');
var db = require('./db');

module.exports = {
  create: co.wrap(function*(heading, body, img_link) {
    yield db().nonQuery('INSERT INTO NEWSBOX(heading, body, img_link) VALUES($1, $2, $3)', [heading, body, img_link]);
    return yield Promise.resolve(true);
  }),
  update: co.wrap(function*(news_id, heading, body, img_link) {
    var rowsAffected = yield db().nonQuery('UPDATE NEWSBOX SET heading=$2, body=$3, img_link=$4, WHERE news_id=$1', [news_id, heading, body, img_link]);
    if(rowsAffected < 1) {
      return yield Promise.reject('News section could not be updated.');
    }
    return yield Promise.resolve(true);
  }),
  // delete is a reserved word, so I'm using 'remove'
  remove: co.wrap(function*(news_id) {
    var client = db();
    var rowsAffected = yield client.nonQuery('DELETE FROM languages WHERE news_id=$1', [news_id]);
    if(rowsAffected < 1) {
      return yield Promise.reject('News section could not be deleted.');
    }
    return yield Promise.resolve(true);
  })
}

Object.defineProperty(module.exports, 'list', {
  get: co.wrap(function*() {
    var client = db();
    var query = 'SELECT * FROM newsbox;';
    var results = yield client.query(query);
    return yield Promise.resolve(results.rows);
  })
});
