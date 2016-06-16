var inventory = require('../app_modules/inventory.js');

module.exports = function(socket, app) {
  socket.on('checkin event', function(event) {
    var _this = this;
    inventory.check_in(event.call, event.patron, this.user).then(function() {
      _this.emit("checkin event", event);
    });
  });

  socket.on('extend', function(event) {
    var moment = require('moment');
    var _this = this;
    // TODO: send these changes to all admin clients

    inventory.change_due(event.call, event.copy, event.due, this.user).then(function() {
      _this.emit("extend success", {
        id: event.id,
        formattedDate: moment(event.due).format("MMM D")
      });
    }).catch(function(e) {
      console.error(e);
      _this.emit("extend error", {id: event.id});
    });
  });

};
