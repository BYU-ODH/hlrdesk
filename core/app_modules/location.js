var co = require('co');
var db = require('./db');

module.exports = {
  create: co.wrap(function*(name) {
    yield db().nonQuery('INSERT INTO LOCATIONS(name) VALUES($1)', [name]);
    return yield Promise.resolve(true);
  }),
  update: co.wrap(function*(name, new_name) {
    var rowsAffected = yield db().nonQuery('UPDATE LOCATIONS SET name=$2 WHERE name=$1', [name, new_name]);
    if(rowsAffected < 1) {
      return yield Promise.reject('Location ' + name + ' could not be updated. Does it exist?');
    }
    return yield Promise.resolve(true);
  }),
  // delete is a reserved word, so I'm using 'remove'
  remove: co.wrap(function*(name) {
    var client = db();
    var rowsAffected = yield client.nonQuery('DELETE FROM LOCATIONS WHERE name=$1', [name]);
    if(rowsAffected < 1) {
      return yield Promise.reject('Could not delete location ' + name);
    }
    return yield Promise.resolve(true);
  })
}

Object.defineProperty(module.exports, 'list', {
  get: co.wrap(function*() {
    var client = db();
    var query = 'SELECT name FROM locations;';
    var results = yield client.query(query);
    return yield Promise.resolve(results.rows);
  })
});
