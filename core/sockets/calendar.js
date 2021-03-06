var cal = require('../app_modules/cal');

module.exports = function(socket, app) {

  socket.on('get week events', function(obj) {
    cal.getWeekEvents(obj.room, obj.date).then(function(events) {
      app.io.emit('get week events', events, obj.room, obj.date);
    });
  });

  socket.on('get day events', function(obj) {
    cal.getAllEvents(obj.date, obj.rooms).then(function(events) {
      app.io.emit('get day events', events, obj.rooms, obj.date);
    });
  });
  
  socket.on('new event', function(obj) {
    cal.newEvent(obj.event).then(function() {
      app.io.emit('refresh events');
    });
  });

  socket.on('edit event', function(obj) {
    cal.editEvent(obj.event, obj.id).then(function() {
      app.io.emit('refresh events');
    })
  });

  socket.on('delete event', function(obj) {
    cal.deleteEvent(obj.event).then(function() {
      app.io.emit('event deleted', obj.event);
      app.io.emit('refresh events');
    })
  });

};
