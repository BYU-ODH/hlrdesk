var db = require('../app_modules/db');
var newsbox = require('../app_modules/newsbox');
var auth = require('../app_modules/auth');

module.exports = function(socket, app) {
  socket.on('news.update', function(event) {
    var that = this;

    auth.isAdmin(that.user).then(function(isAdmin) {
      if(!isAdmin) {
        console.error(that.user + ' attempted to update the newsbox but did not have permissions');
        that.emit('alert', 'Must be an admin to update languages');
        return;
      }
      newsbox.update(event.news_id, event.heading, event.news_body, event.img_link)
      .then(function() {
        that.emit('news.updateSuccess', {});
      })
      .catch(function(e) {
        console.error(e);
        console.error(e.stack);
        that.emit('alert', 'Error updating NewsBox');
      });
    });
  }); // end news.update

  socket.on('news.remove', function(event) {
    var that = this;

    auth.isAdmin(that.user).then(function(isAdmin) {
      if(!isAdmin) {
        console.error(that.user + ' attempted to delete news story');
        that.emit('alert', 'Must be an admin to delete news stories');
        return;
      }
      newsbox.remove(event.news_id).then(function() {
        that.emit('news.itemRemoved', event.news_id);
      }).catch(function(error){
        console.error(error);
        that.emit('alert', 'Could not delete news story. Does it exist?');
      });
    });
  }); // end news.remove

  socket.on('news.add', function(event) {
    var that = this;

    auth.isAdmin(that.user).then(function(isAdmin) {
      if(!isAdmin) {
        console.error(that.user + ' attempted to add a news story');
        that.emit('alert', 'Must be an admin to news stories');
        return;
      }
      newsbox.create(event.heading, event.news_body, event.img_link).then(function() {
        that.emit('news.itemAdded', {});
      }).catch(function(error){
        console.error(error);
        that.emit('alert', 'Could not add news story. Does it already exist?');
      });
    });
  }); // end news.add
};
