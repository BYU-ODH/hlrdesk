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
    /*cal.newEvent(obj.event, obj.token).then(function(events) {
      if (events.type == 'week') {
        app.io.emit('get week events', events.events);
      } else if (events.type == 'day') {
        app.io.emit('get day events', events.events);
      }
    });*/
    cal.newEvent(obj.event, obj.token, obj.currentView).then(function(currentView) {
      if (currentView == 'multiple rooms') {
        console.log('multiple rooms')
      } else if (currentView == 'single room') {
        console.log('single room')
      }
    });
  });

};
