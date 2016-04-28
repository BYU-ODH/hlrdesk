window.HLRDESK = window.HLRDESK || {};
window.HLRDESK.init = window.HLRDESK.init || {};

window.HLRDESK.init.locations = function initLocations() {
  var locSearch = document.getElementById('loc-search');
  var locEdit = document.getElementById('loc-edit');
  var locAdd = document.getElementById('loc-add');

  locEdit.onsubmit = function(evt) {
    evt.preventDefault();
  };

  locAdd.onsubmit = function(evt) {
    evt.preventDefault();
    createLocation(
      locAdd.locName.value
    );
  };

  var children = locEdit.querySelectorAll('[type=submit]');
  for(var i = 0; i<children.length; i++) {
    children[i].addEventListener('click', handleEditSubmit);
  }

  function handleEditSubmit(evt) {
    var el = evt.target || evt.srcElement;

    if(el.id === 'loc-delete-btn') {
      removeLocation(locEdit.locName.value);
    }
    else if(el.id === 'loc-update-btn') {
      var oldName = document.getElementById('loc-edit').dataset.oldName;
      var newName = locEdit.locName.value;
      updateLocation(oldName, newName);
    }
  }

  function removeLocationOption(name) {
    window.HLRDESK.alert.flash('Location deleted!');
    var el = document.querySelector('#loclist option[data-name="' + name + '"]');
    if(el) {
      document.getElementById('loclist').remove(el);
    }
    setEditFormDisabled(false);
  }

  function setEditFormDisabled(bool) {
    locEdit.querySelector('fieldset').disabled = bool;
    var submit = locEdit.querySelectorAll('input[type=submit]');
    for(var i = 0; i<submit.length; i++) {
      submit[i].disabled = bool;
    }
    locSearch.disabled = bool;
  }

  function setCreateFormDisabled(bool) {
    locAdd.querySelector('fieldset').disabled = bool;
    var submit = locAdd.querySelectorAll('input[type=submit]');
    for(var i = 0; i<submit.length; i++) {
      submit[i].disabled = bool;
    }
  }

  function updateLocation(oldName, newName) {
    setEditFormDisabled(true);
    socket.emit('loc.update', {
      oldName: oldName,
      newName: newName,
      token: window.HLRDESK.token
    });
  }

  function removeLocation(name) {
    setEditFormDisabled(true);
    socket.emit('loc.remove', {
      name: name,
      token: window.HLRDESK.token
    });
  }

  function createLocation(name) {
    setCreateFormDisabled(true);
    socket.emit('loc.create', {
      name: name,
      token: window.HLRDESK.token
    });
  }

  var socket = io();

  locSearch.addEventListener('input', handleSearch);

  socket.on('alert', function(data){
    setEditFormDisabled(false);
    setCreateFormDisabled(false);
    window.HLRDESK.alert.error(data);
  });
  socket.on('loc.itemRemoved', removeLocationOption);
  socket.on('loc.itemAdded', addLocationOption);
  socket.on('loc.updateSuccess', updateLocationOption);

  function updateLocationOption(data) {
    window.HLRDESK.alert.flash('Location updated!');
    var opt = document.querySelector('#loclist option[data-name="' + data.oldName + '"]');
    opt.dataset.name = data.newName;
    opt.value = data.newName;
    setEditFormDisabled(false);
  }

  function addLocationOption(data) {
    window.HLRDESK.alert.flash('Location added!');
    var opt = document.createElement('option');
    opt.dataset.name = data.name;
    opt.value = data.name;
    document.getElementById('loclist').appendChild(opt);
    setCreateFormDisabled(false);
  }

  function handleSearch(evt) {
    var el = evt.target || evt.srcElement;
    var val = el.value;
    if(!val) {
      locEdit.classList.remove('active');
      return;
    }
    var sanitizedSearch = val.replace(/"/g,'\\"');
    var selector = '#loclist option[value="' + sanitizedSearch + '"]';
    var opt =  document.querySelector(selector);

    if(!opt) {
      return;
    }
    locEdit.classList.add('active');
    locEdit.dataset.oldName = opt.dataset.name;
    locEdit.locName.value = opt.dataset.name;
  }
};
