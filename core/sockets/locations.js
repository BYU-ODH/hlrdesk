var db = require('../app_modules/db');
var location = require('../app_modules/location');
var auth = require('../app_modules/auth');

module.exports = function(socket, app) {
  socket.on('loc.update', function(event) {
    var that = this;

    auth.isAdmin(that.user).then(function(isAdmin) {
      if(!isAdmin) {
        console.error(that.user + ' attempted to update a location but did not have permissions');
        that.emit('alert', 'Must be an admin to update locations');
        return;
      }
      location.update(event.oldName, event.newName)
      .then(function() {
        that.emit('loc.updateSuccess', {
          oldName: event.oldName,
          newName: event.newName
        });
      })
      .catch(function(e) {
        console.error(e);
        console.error(e.stack);
        that.emit('alert', 'Error updating location');
      });
    });
  }); // end loc.update

  socket.on('loc.remove', function(event) {
    var that = this;

    auth.isAdmin(that.user).then(function(isAdmin) {
      if(!isAdmin) {
        console.error(that.user + ' attempted to delete location ' + event.name);
        that.emit('alert', 'Must be an admin to delete locations');
        return;
      }
      location.remove(event.name).then(function() {
        that.emit('loc.itemRemoved', event.name);
      }).catch(function(error){
        console.error(error);
        that.emit('alert', 'Could not delete location ' + event.name + '. Does it exist?');
      });
    });
  });

  socket.on('loc.create', function(event) {
    var that = this;

    auth.isAdmin(that.user).then(function(isAdmin) {
      if(!isAdmin) {
        console.error(that.user + ' attempted to add location ' + event.name);
        that.emit('alert', 'Must be an admin to add locations');
        return;
      }
      location.create(event.name).then(function() {
        that.emit('loc.itemAdded', {name: event.name});
      }).catch(function(error){
        console.error(error);
        that.emit('alert', 'Could not add location ' + event.name +
          'Does it already exist?');
      });
    });
  });
};
