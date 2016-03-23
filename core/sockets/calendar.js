var cal = require('../app_modules/cal');

module.exports = function(socket, app) {
  
  socket.on('get events', function(eventsObj) {
    cal.getEvents(eventsObj.rooms, eventsObj.date, eventsObj.token).then(function(events){
      app.io.emit('get events', events);
    });
  });
  /*socket.on('calendar event', function(event) {
    cal.addCalendarEvent(this.user, event, event.user).then(function(events) {
      app.io.emit("calendar event", events, event.submittedBy);
    });
  });

  socket.on('delete calendar event', function(event) {
    cal.deleteCalendarEvent(this.user, event).then(function(events) {
      app.io.emit("calendar event", events, event.submittedBy);
    });
  });*/
};
