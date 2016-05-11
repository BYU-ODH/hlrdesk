var nodemailer = require('nodemailer');
var fs = require('co-fs');
var auth = require('./auth')
var utils = require('./utils')
var reservation_html = require('./email_templates/reservation.js')
var confirmation_html = require('./email_templates/confirmation.js')
var ejs = require('ejs');
var user = require('./user');
var co = require('co');
var moment = require('moment');
var path = require('path');

const ENV = process.env;


var transporter = nodemailer.createTransport({
  service : ENV.EMAILSERVICE,
  port: ENV.SMTP_PORT || null,
  auth:{
    user: ENV.EMAIL,
    pass: ENV.EMAILPASS
  }
});

function Reservation(from, reserveID){
  var mailOptions = {
      from: from.attributes.name + ' <' + from.attributes.emailAddress + '>', // sender address
      to: ENV.EMAIL, // list of receivers
      subject: 'Room Reservation for ' + from.attributes.name, // Subject line
      text: 'VEIW THE HTML n00blet.', // plaintext body
      html: reservation_html.create_email(from,reserveID)
  }
  return mailOptions
};

function Confirmation(from, time, room){
  var mailOptions = {
      from: ENV.EMAIL + ' <' + ENV.EMAIL + '>', // sender address
      to: from.email, // list of receivers
      subject: 'Confirmation for ' + from.name, // Subject line
      text: 'You have successfully made the reservation for '+ room +'at'+ time, // plaintext body
      html: confirmation_html.create_email(from, time, room)
  }
  return mailOptions
};

function Crash(message, stack){
  var mailOptions = {
    from: ENV.EMAIL + ' <' + ENV.EMAIL + '>',
    to: ENV.EMAIL,
    subject: 'Error in service: HLRDesk',
    text: (new Date()).toUTCString() + "\n\n" + message + "\n\n" + stack
  }
  return mailOptions
};

// works for both reminders about upcoming items as well as reminders
// about overdue items
var Reminder = co.wrap(function * Reminder(items, name, email, template) {
  var template = template || 'reminder.txt';
  var filename = path.join(__dirname, 'email_templates', template)
  var contents = yield fs.readFile(filename, 'utf-8');
  var text = ejs.render(contents, {
    name: name,
    moment: moment,
    items: items
  });
  var opts = {
    from: ENV.EMAIL + ' <' + ENV.EMAIL + '>', // sender address
    to: email,
    text: text,
    content: text,
    subject: 'HLR due date reminder'
  };
  return yield Promise.resolve(opts);
});

module.exports = {
  roomReservation : function(from, reserveID){  transporter.sendMail(Reservation(from, reserveID), function(error, info){
    if(error){
      console.error(error);
    }
  });},
  roomConfirmation : function(from, time, room){  transporter.sendMail(Confirmation(from, time, room), function(error, info){
    if(error){
      console.error(error);
    }
  });},

  // template defaults to reminder.txt
  reminder: function(items, name, email, template) {
    return new Promise(function(resolve, reject) {
      Reminder(items, name, email, template).then(function(opts) {
        function handleResponse(err, response) {
          if(err) {
            reject(err);
          }
          else
          {
            resolve(response);
          }
        }

        transporter.sendMail(opts, handleResponse);

      });
    });
  },

  overdue: function() {
    var args = [];
    for(var i = 0; i<arguments.length; i++) {
      args.push(arguments[i]);
    }
    args.push('overdue.txt');
    return module.exports.reminder.apply(module.exports, args);
  },

  serverCrash: function(message, stack){
    transporter.sendMail(Crash(message, stack), function(error, info){
      if(error){
        console.error(error);
      }
    });
  }

};
