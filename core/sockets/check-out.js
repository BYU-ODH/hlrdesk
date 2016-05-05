'use strict';

var db = require('../app_modules/db');
var inventory = require('../app_modules/inventory');
var auth = require('../app_modules/auth');

module.exports = function(socket, app) {
  socket.on('inv.search', function(event) {
    var that = this;
    var params = {exclude: event.exclude};

    inventory.search(event.text, event.language, event.media, this.user, params).then(function(results) {
      that.emit('inv.search.results', results);
    }).catch(function(e) {
      console.error(e);
    });
  });
  socket.on('inv.checkout', function(event) {
    var that = this;
    var user = require('../app_modules/user');

    auth.isAdmin(that.user).then(function(isAdmin) {
      if(!isAdmin) {
        console.error(that.user + ' attempted to check out items for ' + event.netid);
        that.emit('alert', 'Must be an admin to check items out');
        return;
      }

      user.update(event.netid, event, true).then(function() {;
        inventory.check_out(event.items, event.netid, that.user).then(function(results) {
          that.emit('inv.checkout.success', results);
        }).catch(function(e) {
          console.error(e.message);
          console.error(e.stack);
          that.emit('alert', 'Could not check out items.');
        });
      }).catch(function(e) {
        console.error(e.message);
        console.error(e.stack);
        that.emit('alert', 'Could not check out items.');
      });
    });
  });
};
