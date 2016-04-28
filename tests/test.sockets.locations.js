'use strict';

var chai = require('chai'),
    expect = chai.expect,
    client = require('./lib/socket-client.js'),
    app = require('../core/app');

describe('socket: loc.update', function() {
  beforeEach(require('./resetdb'));

  it('should give an error (alert) if the user is not an admin', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'student');
    socket.on('alert', function(data) {
      expect(data).to.equal('Must be an admin to update locations');
      done();
      socket.disconnect();
    });
    var data = {
      oldName: 'Back Cabinet',
      newName: 'Back Cabinet 2.0',
      token: socket.__token
    }
    socket.emit('loc.update', data);
  });

  it('should respond with loc.updateSuccess on success', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    socket.on('loc.updateSuccess', function(data) {
      done();
      socket.disconnect();
    });
    var data = {
      oldName: 'Back Cabinet',
      newName: 'Back Cabinet 2.0',
      token: socket.__token
    }
    socket.emit('loc.update', data);
  });

  it('should not emit "alert" on success', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    var timeout = null;
    socket.on('loc.updateSuccess', function(data) {
      timeout = setTimeout(function() {
        done();
        socket.disconnect();
      },500);
    });
    socket.on('alert', function() {
      socket.disconnect();
      clearTimeout(timeout);
      throw new Error("Alert emitted!");
      done();
    });
    var data = {
      oldName: 'Back Cabinet',
      newName: 'Back Cabinet 2.0',
      token: socket.__token
    }
    socket.emit('loc.update', data);
  });

  it('should respond with alert when updating a nonexistant name', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    socket.on('alert', function(data) {
      done();
      socket.disconnect();
    });
    var data = {
      oldName: 'Right Side Cabinet', // doesn't exist
      newName: 'Left Side Cabinet',
      token: socket.__token
    }
    socket.emit('loc.update', data);
  });

});

describe('socket: loc.remove', function() {
  beforeEach(require('./resetdb'));

  it('should emit an alert if the user is not an admin', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'student');
    socket.on('alert', function(data) {
      done();
      socket.disconnect();
    });
    var data = {
      name: 'Back Cabinet',
      token: socket.__token
    }
    socket.emit('loc.remove', data);
  });

  it('should emit an alert if the name does not exist', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    socket.on('alert', function(data) {
      done();
      socket.disconnect();
    });
    var data = {
      name: 'Right Side Cabinet',
      token: socket.__token
    }
    socket.emit('loc.remove', data);
  });

  it('should emit loc.itemRemoved on success', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    socket.on('loc.itemRemoved', function(data) {
      done();
      socket.disconnect();
    });
    var data = {
      name: 'Back Cabinet',
      token: socket.__token
    }
    socket.emit('loc.remove', data);
  });
});

describe('socket: loc.create', function() {
  beforeEach(require('./resetdb'));
  
  it('should emit an alert if the user is not an admin', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'student');
    socket.on('alert', function(data) {
      done();
      socket.disconnect();
    });
    var data = {
      name: 'Right Side Cabinet',
      token: socket.__token
    }
    socket.emit('loc.create', data);
  });
  it('should emit an alert if the location exists', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    socket.on('alert', function(data) {
      done();
      socket.disconnect();
    });
    var data = {
      name: 'Back Cabinet',
      token: socket.__token
    }
    socket.emit('loc.create', data);
  });
  it('should emit loc.itemAdded on success', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    var data = {
      name: 'Right Side Cabinet',
      token: socket.__token
    }
    socket.on('loc.itemAdded', function(resp) {
      expect(resp.name).to.equal(data.name);
      done();
      socket.disconnect();
    });
    socket.emit('loc.create', data);
  });
});
