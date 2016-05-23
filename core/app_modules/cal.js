var db = require('./db')
var co = require('co');
var auth = require('./auth');
var assert = require('assert');
var request = require('koa-request');
module.exports = {};

var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

module.exports.getWeekEvents = co.wrap(function*(room, date, token) {
  var saturday = new Date(new Date(date).setDate(new Date(new Date(date).getDate() + 5 - new Date(date).getDay()))).toISOString().substring(0,10);
  var events = [];
  var response = yield request('http://scheduler.hlrdev.byu.edu/rooms/'+room+'/events?token='+token+'&date='+date+'&end='+saturday+'&format=json');
  var allEvents = JSON.parse(response.body);

  for (var i = 0; i < allEvents.length; i++) {
    var alreadyExists = false;
    for (var j = 0; j < events.length; j++ ) {
      if (allEvents[i]['id'] == events[j]['id']) {
        alreadyExists = true;
        break;
      }
    }
    if (!alreadyExists) {
      events.push(allEvents[i]);
    }
  }
  /* OR
  loop1:
  for (var i = 0; i < allEvents.length; i++) {
  loop2:
    for (var j = 0; j < events.length; j++ ) {
      if (allEvents[i]['id'] == events[j]['id']) {
        continue loop1;
      }
    }
    events.push(allEvents[i]);
  }
  */
  return events;
});

module.exports.getAllEvents = co.wrap(function*(date, rooms, token) {
  var events = [];
  var response = yield request('http://scheduler.hlrdev.byu.edu/rooms/events?token='+token+'&date='+date+'&format=json');
  var allEvents = JSON.parse(response.body);

  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  for (var i = 0; i < allEvents.length; i++) {

    var eventDays = allEvents[i].days_of_week.split(',')
    if (eventDays.indexOf(days[new Date(new Date(date).setHours(24)).getDay()]) != -1) {

      if (allEvents[i].room in rooms || allEvents[i].room == 0 || allEvents[i].room == -2) {
        events.push(allEvents[i]);
      }

    }

  }
  return(events)
});

/*module.exports.getEvents = co.wrap(function*(rooms, date, token){
  var allEvents = [];
  for (r in rooms) {
    var room = rooms[r].id;
    var response = yield request('http://scheduler.hlrdev.byu.edu/rooms/'+room+'/events?token='+token+'&date='+date );//+'&format=json');
    date = new Date(date)
    date.setHours(24);
    var events = JSON.parse(response.body);
    console.log(events)
    for (var i = 0; i < events.length; i++) {
      if ('name' in events[i]) {
        var eventDays = events[i].days_of_week.split(',');
        for (var j = 0; j < eventDays.length; j++) {
          if (eventDays[j] == days[date.getDay()-1]) {
            events[i].room = room;
            events[i].date = date.toISOString().substring(0, 10);
            allEvents.push(events[i]);
          }
        }
      }
    }
  }
  console.log(allEvents)
  return allEvents;
});*/

/*module.exports.addCalendarEvent = co.wrap(function*(username, event, user){
  var client = db();
  var a = yield auth.isAdmin(username);
  if(!a) {
    assert(username === user);
  }

  var isOverlap = false;
  var allCalendarEvents = yield client.query("SELECT * FROM calendar;");
  allCalendarEvents = allCalendarEvents.rows;
  for (var i = 0; i < allCalendarEvents.length; i++) {
    if ((event.time >= allCalendarEvents[i].time && event.time < allCalendarEvents[i].time + allCalendarEvents[i].duration*3600000) && (event.time+event.duration*3600000 >= allCalendarEvents[i].time && event.time+event.duration*3600000 <= allCalendarEvents[i].time+allCalendarEvents[i].duration*3600000)) {
      isOverlap = true;
    }
  }
  if (!isOverlap) {
    var a = yield auth.isAdmin(username);
    var exists = yield client.query('SELECT * FROM calendar WHERE "time" = $1 AND room = $2 AND "user" = $3;', [event.time, event.room, user]);
    if (exists.rowCount !== 0) {
      yield client.query('UPDATE calendar SET confirmed = $4 WHERE ("user" = $1 AND time = $2 AND room = $3);', [user, event.time, event.room, true]);
    } else {
      yield client.nonQuery('INSERT INTO calendar("user", "time", room, duration, title, confirmed)VALUES ($1, $2, $3, $4, $5, $6);', [user, event.time, event.room, event.duration, event.title, a]);
    }
    if (a) {
      var events = yield client.query('SELECT * FROM calendar');
    } else {
      var events = yield client.query('SELECT * FROM calendar WHERE confirmed = true OR "user" = $1;', [username]);
    }
    return yield events.rows;
  } else {
    console.error("overlap");
    return new Error("Overlap");
  }
});

module.exports.deleteCalendarEvent = co.wrap(function*(username, event){
  var client = db();
  var a = yield auth.isAdmin(username);
  if(event.user == username || a) {
    if (a) {
      var deletedRows = yield client.nonQuery('DELETE FROM calendar WHERE room = $1 AND "time" = $2;', [event.room, event.time]);
    } else {
      var deletedRows = yield client.nonQuery('DELETE FROM calendar WHERE room = $1 AND "time" = $2 AND "user" = $3;', [event.room, event.time, username]);
    }
    if (deletedRows) {
      if (a) {
        var events = yield client.query('SELECT * FROM calendar');
      } else {
        var events = yield client.query('SELECT * FROM calendar WHERE confirmed = true OR "user" = $1;', [username]);
      }
      return yield events.rows;
    }
  }

  return yield Promise.reject(new Error("Nice try."));
});
*/