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
    if (!alreadyExists && (allEvents[i]['room'] == room['id'] || allEvents[i]['room'] == -2 || allEvents[i]['room'] == 0 || allEvents[i]['room'] == -1)) {
      events.push(allEvents[i]);
    }
  }
  return events;
});

module.exports.getAllEvents = co.wrap(function*(date, rooms, token) {
  var roomIds = [];
  for (room in rooms) {
    roomIds.push(rooms[room].id)
  }

  var events = [];
  var response = yield request('http://scheduler.hlrdev.byu.edu/rooms/events?token='+token+'&date='+date+'&format=json');
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

module.exports.newEvent = co.wrap(function*(event, token) {
  event.frequency = 'single';
  event.note = 'added from web client';

  var dateYear = event['start_date'].split(',')[0];
  var dateMonth = (event['start_date'].split(',')[1].length < 2 ? '0' : '') + event['start_date'].split(',')[1];
  var dateDate = (event['start_date'].split(',')[2].length < 2 ? '0' : '') + event['start_date'].split(',')[2];
  var formattedDate = dateYear+dateMonth+dateDate;
  var dateInfo = yield request('https://ws.byu.edu/rest/v1/academic/controls/controldatesws/json/asofdate/'+formattedDate+'/current_yyt')

  var termCodes = {'1':'Winter', '3':'Spring', '4':'Summer', '5':'Fall'}

  event.term = termCodes[JSON.parse(dateInfo.body).ControldateswsService.response.date_list[0].year_term.charAt(4)];

  url = String("http://scheduler.hlrdev.byu.edu/event?token="+token+"&format=JSON");

  var response = yield request.post(url, {form:event});

  return;

});

module.exports.editEvent = co.wrap(function*(event, token) {

});

module.exports.deleteEvent = co.wrap(function*(event, token) {
  eventId = event.id;
  var response = yield request.del('http://scheduler.hlrdev.byu.edu/event/'+eventId+'?token='+token+'&format=json');
  return;
});