var db = require('./db')
var co = require('co');
var auth = require('./auth');
var assert = require('assert');
var request = require('koa-request');
var user = require('./user');

var token = process.env.SCHEDTOKEN;

var SCHEDHOST = process.env.SCHEDHOST;

module.exports = {};

var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

module.exports.getWeekEvents = co.wrap(function*(room, date) {
  var saturday = new Date(new Date(date).setDate(new Date(new Date(date).getDate() + 6 - new Date(date).getDay()))).toISOString().substring(0,10);
  var events = [];
  var response = yield request('http://'+SCHEDHOST+'/rooms/'+room+'/events?token='+token+'&date='+date+'&end='+saturday+'&format=json');
  var allEvents = JSON.parse(response.body);

  for (var i = 0; i < allEvents.length; i++) {
    var alreadyExists = false;
    for (var j = 0; j < events.length; j++ ) {
      if (allEvents[i]['id'] == events[j]['id']) {
        alreadyExists = true;
        break;
      }
    }
    if (!alreadyExists && (allEvents[i]['room'] == room || allEvents[i]['room'] == -2 || allEvents[i]['room'] == 0 || allEvents[i]['room'] == -1)) {
      events.push(allEvents[i]);
    }
  }
  return events;
});

module.exports.getAllEvents = co.wrap(function*(date, rooms) {
  var roomIds = [];
  for (room in rooms) {
    roomIds.push(rooms[room].id)
  }

  var events = [];
  var response = yield request('http://'+SCHEDHOST+'/rooms/events?token='+token+'&date='+date+'&format=json');
  var allEvents = JSON.parse(response.body);

  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (var i = 0; i < allEvents.length; i++) {

    var eventDays = allEvents[i].days_of_week.split(',')
    if (eventDays.indexOf(days[new Date(new Date(date).setHours(24)).getDay()]) != -1) {
      if (roomIds.indexOf(allEvents[i].room) != -1 || allEvents[i].room == 0 || allEvents[i].room == -2) {
        events.push(allEvents[i]);
      }

    }

  }
  return events;
});

module.exports.newEvent = co.wrap(function*(event) {
  event.frequency = 'single';

  var dateYear = event['start_date'].split(',')[0];
  var dateMonth = (event['start_date'].split(',')[1].length < 2 ? '0' : '') + event['start_date'].split(',')[1];
  var dateDate = (event['start_date'].split(',')[2].length < 2 ? '0' : '') + event['start_date'].split(',')[2];
  var formattedDate = dateYear+dateMonth+dateDate;
  var dateInfo = yield request('https://ws.byu.edu/rest/v1/academic/controls/controldatesws/json/asofdate/'+formattedDate+'/current_yyt')

  var termCodes = {'1':'Winter', '3':'Spring', '4':'Summer', '5':'Fall'}

  event.term = termCodes[JSON.parse(dateInfo.body).ControldateswsService.response.date_list[0].year_term.charAt(4)];

  var noteObj = JSON.parse(event.note);
  var userInfo = yield user.ldapInfo.apply(null, [event.request_id]);
  var userName = userInfo[event.request_id]['cn'];
  if (userName) {
    noteObj['name'] = userName;
  }
  var lastName = userInfo[event.request_id]['sn'];
  var firstName = userInfo[event.request_id]['cn'].split(' ')[0];
  event.reqLName = lastName;
  event.reqFName = firstName;
  event.respPersLName = lastName;
  event.respPersFName = firstName;
  if (!event.email) {
    event.email = userInfo[event.request_id]['mail'];
  }
  if (event.responsible_id != event.request_id) {
    var overseerInfo = yield user.ldapInfo.apply(null, [event.responsible_id]);
    if (overseerInfo) {
      var overseerName = overseerInfo[event.responsible_id]['cn'];
      var overseerLastName = overseerInfo[event.responsible_id]['sn'];
      var overseerFirstName = overseerInfo[event.responsible_id]['cn'].split(' ')[0];
      event.respPersLName = overseerLastName;
      event.respPersFName = overseerFirstName;
      event.respPersEmail = overseerInfo[event.responsible_id]['mail'];
      noteObj['overseerName'] = overseerName;
    }
  }
  event.note = JSON.stringify(noteObj);
  url = String('http://'+SCHEDHOST+"/event?token="+token+"&format=JSON");

  var allowed = yield isAllowed(event);
  if (allowed) {
    var response = yield request.post(url, {form:event});
  }

  return;

});

module.exports.editEvent = co.wrap(function*(event, id) {

  event.frequency = 'single';

  eventId = id;
  url = String('http://'+SCHEDHOST+'/event/'+eventId+'?token='+token+'&format=json');

  var allowed = yield isAllowed(event, id);
  if (allowed) {
    var response = yield request.put(url, {form:event});
  }
  return;
});

module.exports.deleteEvent = co.wrap(function*(event) {
  eventId = event.id;

  var allowedRoom = yield isInAllowedRoom(event);
  if (allowedRoom) {
    var response = yield request.del('http://'+SCHEDHOST+'/event/'+eventId+'?token='+token+'&format=json');
  }
  return;
});

isAllowed = co.wrap(function*(event, id) {
  var overlap = yield isOverlap(event, id);
  var allowedRoom = yield isInAllowedRoom(event);
  var oneDay = yield isOneDay(event);
  var notSunday = yield isNotSunday(event);
  //var JSONNote = yield noteIsJSON(event);

  //if (!overlap && allowedRoom && oneDay && JSONNote) { //removed due to events being edited by different calendars that don't put the notes in a json formate
  if (!overlap && allowedRoom && oneDay && notSunday) {
    return yield Promise.resolve(true);
  }
})

isOverlap = co.wrap(function*(event, id) {

  var overlap = false;

  var eventDateArr = event['start_date'].split(',');
  var month = eventDateArr[1].length == 1 ? '0'+ eventDateArr[1] : eventDateArr[1];
  var date = eventDateArr[2].length == 1 ? '0'+ eventDateArr[2] : eventDateArr[2];
  var eventDate = eventDateArr[0]+'-'+month+'-'+date;

  var response = yield request('http://'+SCHEDHOST+'/rooms/events?token='+token+'&date='+eventDate+'&format=json');
  var allEvents = JSON.parse(response.body);

  for (var i = 0; i < allEvents.length; i++) {
    if (allEvents[i].room == event.room && allEvents[i]['start_date'] == eventDate && id !== allEvents[i].id) {

      var otherStart24Hours = Number(allEvents[i]['start_time'].substring(0, allEvents[i]['start_time'].indexOf(':')));
      var otherStartMinutes = allEvents[i]['start_time'].substring(allEvents[i]['start_time'].indexOf(':')+1, allEvents[i]['start_time'].indexOf(':', allEvents[i]['start_time'].indexOf(':')+1))=='30' ? 0.5 : 0;
      var otherStart = otherStart24Hours + otherStartMinutes;

      var otherEnd24Hours = Number(allEvents[i]['end_time'].substring(0, allEvents[i]['end_time'].indexOf(':')));
      var otherEndMinutes = allEvents[i]['end_time'].substring(allEvents[i]['end_time'].indexOf(':')+1, allEvents[i]['end_time'].indexOf(':', allEvents[i]['end_time'].indexOf(':')+1))=='30' ? 0.5 : 0;
      var otherEnd = otherEnd24Hours + otherEndMinutes;

      var eventStartHours = Number(event['start_time'].substring(0, event['start_time'].indexOf(':')));
      var eventStart24Hours = eventStartHours + ((eventStartHours != 12 && event['start_time'].indexOf('PM') != -1) ? 12 : 0);
      var eventStartMinutes = event['start_time'].substring(event['start_time'].indexOf(':')+1, event['start_time'].indexOf(' '))[0] == 3 ? 0.5 : 0;
      var eventStart = eventStart24Hours + eventStartMinutes;

      var eventEndHours = Number(event['end_time'].substring(0, event['end_time'].indexOf(':')));
      var eventEnd24Hours = eventEndHours + ((eventEndHours != 12 && event['end_time'].indexOf('PM') != -1) ? 12 : 0);
      var eventEndMinutes = event['end_time'].substring(event['end_time'].indexOf(':')+1, event['end_time'].indexOf(' '))[0] == 3 ? 0.5 : 0;
      var eventEnd = eventEnd24Hours + eventEndMinutes;

      if ((eventStart >= otherStart && eventStart < otherEnd) || (eventEnd > otherStart && eventEnd <= otherEnd)) {
        console.error('Event overlaps with another event')
        overlap = true;
      }
    }
  }

  return yield Promise.resolve(overlap);
});

isInAllowedRoom = co.wrap(function*(event) {
  var allowedRooms = ['1', '2', '3', '4', '5', '6', '8', '9', '10', '11', '12', '13', '15', '26', '27', '28'];
  if (allowedRooms.indexOf(event['room']) != -1) {
    return yield Promise.resolve(true);
  } else {
    console.error('Reservation not allowed in specified room');
    return yield Promise.resolve(false);
  }
});

isOneDay = co.wrap(function*(event) {
  if (event['end_date'] === event['start_date']) {
    console.error('event spans over invalid range');
    return yield Promise.resolve(false);
  } else {
    return yield Promise.resolve(true);
  }
});

isNotSunday = co.wrap(function*(event) {
  var dateArray = event.start_date.split(',');
  var date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
  if (date.getDay() == 0) {
    console.error('event takes place on a Sunday');
    return yield Promise.resolve(false);
  } else {
    return yield Promise.resolve(true);
  }
});

noteIsJSON = co.wrap(function*(event) {
  try {
    JSON.parse(event['note']);
  } catch (e) {
    console.error("note field is in an invalid format");
    return yield Promise.resolve(false);
  }
  if (event['note'][0] == '{') {
    if (/^[\],:{}\s]*$/.test(event['note'].replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
      return yield Promise.resolve(true);
    }
  } else {
    console.error("note field is in an invalid format");
    return yield Promise.resolve(false);
  }
});
