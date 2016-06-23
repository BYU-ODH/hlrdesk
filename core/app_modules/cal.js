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
    //if (!alreadyExists) {
    if (!alreadyExists && (allEvents[i]['room'] == room['id'] || allEvents[i]['room'] == -2 || allEvents[i]['room'] == 0 || allEvents[i]['room'] == -1)) {
      events.push(allEvents[i]);
    }
  }
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
  return events;
});

module.exports.newEvent = co.wrap(function*(event, token, currentView) {
  event.frequency = 'single';

  url = String("http://scheduler.hlrdev.byu.edu/event?token="+token+"&format=JSON");
  console.log(event);

  var response = yield request.post({'url':url, 'form':event}, function(err, httpResponse, body) {
    console.log('entering callback');
    console.log(err);
    console.log(httpResponse);
    //return currentView;
  });
  //console.log(response.body)
  //console.log(JSON.parse(response.body));
});

module.exports.editEvent = co.wrap(function*(event, token, currentView) {

});