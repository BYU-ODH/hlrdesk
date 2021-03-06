var _ = require('koa-route')
var koa = require('koa')
var serve = require('koa-static')
var render = require('koa-ejs')
var path = require('path')
var fs = require('fs');
var assert = require('assert');
var request = require('koa-request');

var socket = require('koa-socket');

var session = require('koa-session')
var parse = require('co-body')
var csrf = require('koa-csrf')

var app = koa();

require('koa-csrf')(app)

var email = require('./app_modules/email')

var auth = require('./app_modules/auth')
var db = require('./app_modules/db')
var user = require('./app_modules/user');
var utils = require('./app_modules/utils')
const ENV = process.env;
const SERVICE = auth.service(ENV.HLRDESK_HOST, ENV.PORT, '/signin', !ENV.HLRDESK_DEV);

if(ENV.HLRDESK_DEV) {
  app.use(require('./app_modules/koa-sassy').Sassy);
}

process.on("uncaughtException", function(err) {
  email.serverCrash(err.message, err.stack);
  throw err;
});

app.keys = ['TODO MAKE ME AN ENV VARIABLE', 'I SHOULD NOT BE HARDCODED', 'MY DOG HAS NO NOSE', 'HOW DOES HE SMELL?', 'AWFUL'];
app.use(session());

app.use(serve(path.join(__dirname, '..', 'public')));

if(ENV.NODE_TEST === 'true') {
  // e.g., /logmein?as=prabbit
  // see tests/sessions/* for available users
  require('./app_modules/mock-login')(app);
  var util = require('util');
  var log_file = fs.createWriteStream(path.join(__dirname, '/../', 'debug.log'), {flags : 'a'});
  log_file.write(new Date() + '\n');
  console.error = function(d) { //
    log_file.write(util.format(d) + '\n\n');
  };
}

app.use(function*(next){
  const WHITELIST = ['/signin', '/logmein', '/logout', '/rss'];
  //const GREYLIST = WHITELIST.concat(['/calendar']);
  const GREYLIST = WHITELIST;
  if (!this.session.user && WHITELIST.indexOf(this.request.path) === -1){
    this.session.login_redirect = this.request.path + this.request.search;
    this.redirect('https://cas.byu.edu/cas/login?service=' + SERVICE);
    return;
  }
  var is_admin = yield auth.isAdmin(this.session.user)
  if ( this.session.user && !is_admin && GREYLIST.indexOf(this.request.path) === -1){
    /*this.redirect('https://hlr.byu.edu/schedule/');
    return;*/

    this.session = null; //automatically log out if not admin
    var s = this.request.query.service || null;
    var url = 'https://cas.byu.edu/cas/logout' + (s ? '?service=' + s : '');
    this.redirect(url);
  }
  else{
    yield next;
  }
})

render(app, {
  root: path.join(__dirname, 'templates'),
  layout: 'layout',
  viewExt: 'html',
  cache: !ENV.HLRDESK_DEV,
  debug: ENV.HLRDESK_DEV,
  locals: {
    title: 'HLRDesk',
    token: function() {
      return this.session.token;
    }
  }
});

app.use(function *(next) {
  if(this.request.header['x-requested-with'] === 'XMLHttpRequest')
  {
    this.USE_LAYOUT = false;
  }
  else
  {
    if (this.session){
      var is_admin = yield auth.isAdmin(this.session.user)
      if (is_admin){
        this.USE_LAYOUT = 'layout';
        //TODO: May add read message check here. Likely the best spot
      }
      else{
        this.USE_LAYOUT = 'simple_layout';
      }
    }
    else{
      this.USE_LAYOUT = 'layout';
    }
  }
  captionClass = "undefined";
  yield next;
});

app.use(_.get("/", function *(next) {
  var rdir = this.session.login_redirect;
  if(rdir) {
    this.redirect(rdir);
    delete this.session.login_redirect;
    yield next;
    return;
  }
  yield this.render('layout', {layout: false, body:"", captionClass: "aboveLoader"});
  yield next;
}));

app.use(_.get("/message", function *() {
  var client = db();
  var all_messages = yield client.query("SELECT * FROM messages;");
  var all_tasks = yield client.query("Select * FROM tasks ORDER BY priority ASC");
  yield this.render('msg', {layout: this.USE_LAYOUT, all_messages: all_messages, all_tasks: all_tasks});
}));

app.use(_.get('/check-in', function *() {
  var inv = require('./app_modules/inventory');
  var items = yield inv.checked_out;

  var users = items.reduce(function(prev, item) {
    if(prev.indexOf(item.owner) === -1) {
      prev.push(item.owner);
    }
    return prev;
  }, []);

  var userDetails = yield user.contactInfo.apply(this, users);

  yield this.render('check-in', {
    items: items,
    user: userDetails,
    admin: this.session.user,
    moment: require('moment'),
    title: "Check In",
    layout: this.USE_LAYOUT
  });
}));

app.use(_.get('/check-out', function *() {
  yield this.render('check-out', {
    title: "Check Out",
    layout: this.USE_LAYOUT,
    languages: yield require('./app_modules/language').list,
    media: yield require('./app_modules/media').list,
  });
}));

app.use(_.get('/edit-catalog', function *() {
  var client = db();
  var media_types = yield client.query("SELECT * FROM media ORDER BY media ASC;");
  var lang = yield client.query("SELECT * FROM languages ORDER BY name ASC;");
  var locations = yield client.query("SELECT * FROM locations ORDER BY name ASC;");
  yield this.render('edit-catalog', {
    title: "Edit Item",
    layout: this.USE_LAYOUT,
    languages: yield require('./app_modules/language').list,
    media: yield require('./app_modules/media').list,
    media_types: media_types,
    lang: lang,
    locations: locations
  });
}));

app.use(_.get('/inventory.csv', function *() {
  var json2csv = require('json2csv');
  var client = db();
  var all_items = yield client.query("SELECT * FROM inventory;");
  var fields = Object.keys(all_items.rows[0]);
  this.set({
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename=inventory.csv'
  });
  try {
    this.body = json2csv({ data: all_items.rows, fields: fields });
  } catch (err) {
    throw err;
  }
}));

app.use(_.get('/viewHistory', function *() {
  var client = db();
  yield this.render('view-history', {
    title: "Item History",
    layout: this.USE_LAYOUT,
    languages: yield require('./app_modules/language').list,
    media: yield require('./app_modules/media').list,
  });
}));

app.use(_.get("/extras", function *() {
  yield this.render('extras', {layout: this.USE_LAYOUT });
}));

app.use(_.get("/calendar", function *(next) {
  var token = ENV.SCHEDTOKEN;
  var response = yield request('http://'+ENV.SCHEDHOST+'/rooms?token='+token+'&format=json');
  var rooms = JSON.parse(response.body);
  yield this.render('calendar', {layout: this.USE_LAYOUT, date: new Date(), user: this.session.user, isAdmin:isAdmin, rooms: rooms});
}));

app.use(_.get("/signin", function *(next){
  ticket=this.request.query.ticket;
  try {
    var obj = yield auth.cas_login(ticket, SERVICE);
  } catch (e){
    this.redirect('https://cas.byu.edu/cas/login?service=' + SERVICE);
  }
  auth.login(this, obj);
  if (yield auth.isAdmin(this.session.user)){
    this.redirect('/');
  }
  yield next;
}));

app.use(_.get("/languages", function*() {
  yield this.render('languages', {
    layout: this.USE_LAYOUT,
    languages: yield require('./app_modules/language').list
  });
}));

app.use(_.get("/locations", function*() {
  yield this.render('locations', {
    layout: this.USE_LAYOUT,
    locations: yield require('./app_modules/location').list
  });
}));

app.use(_.get("/media", function*() {
  yield this.render('media', {
    layout: this.USE_LAYOUT,
    media: yield require('./app_modules/media').list,
    csrf: this.csrf
  });
}));

app.use(_.post('/media', function*() {
  var media = require('./app_modules/media');
  var body = yield parse(this); // co-body or something

  try {
    this.assertCSRF(body.csrf);
    assert(yield auth.isAdmin(this.session.user));
  }catch(err) {
    this.status = 403
    this.body = {
      message: 'Unauthorized'
    };
    return;
  }

  if(body['delete']) {
    yield media.remove(body['delete']);
  }
  else if(body['create']) {
    yield media.add(body['new-media']);
  }

  this.redirect('/media');
}));

app.use(_.get("/logout", function *(){
  this.session = null;
  var s = this.request.query.service || null;
  var url = 'https://cas.byu.edu/cas/logout' + (s ? '?service=' + s : '');
  this.redirect(url);
}));

app.use(_.post("/employees",function *(){
  var client = db();
  var body = yield parse(this) // co-body or something
  this.assertCSRF(body.csrf);
  if (body.action == "add") {
    try {
      var status = yield auth.mkadmin(this.session.user, body, true);
      if(!status){
        this.redirect('/employees?status='+status+'&toMk='+to_mk);
      }
      else{
        this.redirect('/employees');
      }
    }
    catch (err) {
      console.error(err);
      this.status = 403
      this.body = {
        message: 'This CSRF token is invalid!'
      }
      return
    }
  } else if (body.action == "edit") {
    try {
      phone = body.user_phone;
      email = body.user_email;
      netid = body.netid;
      status = yield auth.editadmin(this.session.user, netid, phone, email, true);
      if(!status){
        this.redirect('/employees');
      }
      else{
        this.redirect('/employees');
      }
    } catch (err) {
      this.status = 403
      this.body = {
        message: 'This CSRF token is invalid!'
      }
      return
    }
  } else if (body.action == "remove") {
    try {
      to_del=body.user;
      override = (body.override=="true");
      status = yield auth.deladmin(this.session.user, to_del, override);
      if(!status){
        this.redirect('/employees?status='+status+'&toDel='+to_del);
      }
      else{
        this.redirect('/employees');
      }
    }
    catch (err) {
      this.status = 403
      this.body = {
        message: 'This CSRF token is invalid!'
      }
      return
    }
  }
  else
  {
    this.status = 400;
    this.body = {
      message: 'Invalid data'
    }
  }
}));

app.use(_.get("/employees",function *(){
  var isAdmin = yield auth.isAdmin(this.session.user);
  var client = db();
  var allAdmins = yield client.query("SELECT netid, email, telephone, admin FROM users WHERE admin = TRUE;");
  var netids = allAdmins.rows.map(function (a){return a.netid});
  var ldapDetails = yield user.ldapInfo.apply(null, netids);
  var names = Object.keys(ldapDetails).map(function(k){return ldapDetails[k].cn});
  if (isAdmin){
    if (this.request.query.status == "false"){
      yield this.render('mkadmin', {layout: this.USE_LAYOUT, csrf: this.csrf, allAdminsFromDB: allAdmins, alert : true, to_mk : this.request.query.toMk, namesFromDB : names});
    }
    else{
      yield this.render('mkadmin', {layout: this.USE_LAYOUT, csrf: this.csrf, allAdminsFromDB: allAdmins, alert : false, to_mk : undefined, namesFromDB : names});
    }
  }
  else{
    this.status = 403
    this.body = {
      message: 'Wrong place friend!'
    }
    return
  }
}));

app.use(_.get("/rss",function *(){
  var rss = require('rss');
  var newsbox = yield require('./app_modules/newsbox').list;
  var feed = new rss({
    title: 'NewsBox',
    feed_url: utils.gen_url(ENV.HLRDESK_HOST, ENV.PORT, '/rss', !ENV.HLRDESK_DEV),
    site_url: utils.gen_url(ENV.HLRDESK_HOST, ENV.PORT, '/', !ENV.HLRDESK_DEV)
  });
  newsbox.forEach(function(news, index) {
    feed.item({
      title:  news.heading,
      description: news.body,
      url: news.img_link
    });
  });
  this.set('Content-Type', 'application/rss+xml');
  this.body = feed.xml();
}));

app.use(_.get("/newsbox",function *(){
  yield this.render('newsbox', {
    layout: this.USE_LAYOUT,
    newsbox: yield require('./app_modules/newsbox').list
  });
}));

app.use(_.get("/helpdesk", function *() {
  yield this.render('helpdesk', {
    layout: this.USE_LAYOUT,
    csrf: this.csrf,
    helpdeskAction: ENV.HELPDESK_URL,
    helpdeskUsername: ENV.HELPDESK_USER,
    helpdeskPassword: ENV.HELPDESK_PASSWORD
  });
}));

socket.start(app);

socket.use(function*(next){
  this.socket.user = yield auth.getUser(this.data.token);
  if(!this.socket.user){
    this.socket.emit('expired token', SERVICE);
  }
  yield next;
});

// Load in all socket files
fs.readdir(path.join(__dirname, 'sockets'), function (err, files) {
  if(err) {
    throw new Error(err);
  }
  var socket_files = files.filter(function(file) {
    return file.match(/\.js$/);
  });
  socket_files.forEach(function(file){
    try {
      require(path.join(__dirname, 'sockets', file))(socket, app);
    }
    catch(e) {
      console.error("Initializing sockets/" + file + " failed.", e);
      throw e;
    }
  });
});

module.exports = app.server;
