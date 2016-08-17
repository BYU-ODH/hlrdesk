var cal = require('../app_modules/cal');

module.exports = function(socket, app) {

  socket.on('get week events', function(obj) {
    cal.getWeekEvents(obj.room, obj.date, obj.token).then(function(events) {
      app.io.emit('get week events', events);
    });
  });

  socket.on('get day events', function(obj) {
    cal.getAllEvents(obj.date, obj.rooms, obj.token).then(function(events) {
      app.io.emit('get day events', events);
    });
  });
  
  socket.on('new event', function(obj) {
    cal.newEvent(obj.event, obj.token).then(function() {
      app.io.emit('refresh events');
    });
  });

  socket.on('edit event', function(obj) {
    cal.editEvent(obj.event, obj.id, obj.token).then(function() {
      app.io.emit('refresh events');
    })
  });

  socket.on('delete event', function(obj) {
    cal.deleteEvent(obj.event, obj.token).then(function() {
      app.io.emit('refresh events');
    })
  });

};
