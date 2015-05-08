var db = require('../app_modules/db');

module.exports = function editCatalog(socket, app) {

  socket.on('getHistory', function(item){
  //TODO: add admin check
    var client = db();
    var uID = this.user;
    client.transaction(function*(t) {
      var query = "SELECT * FROM item_history WHERE call_number = $1";
      var result = yield t.query(query, [item.callNum]);
      app.io.emit('getHistory', result);
    }).catch(console.error);
  });
};
