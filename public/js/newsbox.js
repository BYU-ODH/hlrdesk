window.HLRDESK = window.HLRDESK || {};
window.HLRDESK.init = window.HLRDESK.init || {};

window.HLRDESK.init.newsbox = function initNewsbox() {
  function onRowClick(tableId, callback) {
    var table = document.getElementById(tableId),
        rows = table.getElementsByTagName("tr");

    for (var i = 0; i < rows.length; i++) {
        table.rows[i].onclick = function (row) {
            return function () {
                callback(row);
            };
        }(table.rows[i]);
    }
  };
  onRowClick("news-edit-table", function (row){
    if((document.getElementById('news-edit-table').getElementsByTagName('td')).length > 9){
      return;
    }
    for (var i = 0; i < 3; i++) {
      var value = row.getElementsByTagName('td')[i].innerHTML;
      if (i == 0) {
        var src = row.getElementsByTagName('td')[i].getElementsByTagName('img')[0].src;
        row.getElementsByTagName('td')[i].innerHTML = value + '<input id="'+ row.id + '-image-edit" type=text required value="' + src + '">'
      } else {
        row.getElementsByTagName('td')[i].innerHTML = '<textarea id="' + row.id + '-title" rows="5" cols="40" name=title required>' + value + '</textarea>';
      }
    }
    var added = row.insertCell(3)
    added.innerHTML = '<input id=' + row.id + '-delete-btn type=submit class=redBtn value="Delete"><input id=' + row.id + '-update-btn type=submit class=greenBtn value="Update">';
    var newsEdit = document.getElementById(row.id + '-update-btn');
    newsEdit.addEventListener('click', updateNews);
  });

  function updateNews(evt){
    evt.preventDefault()
    console.log("we are here!");
  }
  // var langAdd = document.getElementById('lang-add');

//   langEdit.onsubmit = function(evt) {
//     evt.preventDefault();
//   };
//
//   langAdd.onsubmit = function(evt) {
//     evt.preventDefault();
//     createLanguage(
//       langAdd.code.value,
//       langAdd.langName.value
//     );
//   };
//
//   var children = langEdit.querySelectorAll('[type=submit]');
//   for(var i = 0; i<children.length; i++) {
//     children[i].addEventListener('click', handleEditSubmit);
//   }
//
//   function handleEditSubmit(evt) {
//     var el = evt.target || evt.srcElement;
//
//     if(el.id === 'lang-delete-btn') {
//       removeLanguage(langEdit.code.value);
//     }
//     else if(el.id === 'lang-update-btn') {
//       var newCode = langEdit.code.value;
//       var oldCode = document.getElementById('lang-edit').dataset.oldCode;
//       var newName = langEdit.langName.value;
//       updateLanguage(oldCode, newCode, newName);
//     }
//   }
//
//   function removeLanguageOption(code) {
//     window.HLRDESK.alert.flash('Language deleted!');
//     var el = document.querySelector('#langlist option[data-code="' + code + '"]');
//     if(el) {
//       document.getElementById('langlist').remove(el);
//     }
//     setEditFormDisabled(false);
//   }
//
//   function setEditFormDisabled(bool) {
//     langEdit.querySelector('fieldset').disabled = bool;
//     var submit = langEdit.querySelectorAll('input[type=submit]');
//     for(var i = 0; i<submit.length; i++) {
//       submit[i].disabled = bool;
//     }
//     langSearch.disabled = bool;
//   }
//
//   function setCreateFormDisabled(bool) {
//     langAdd.querySelector('fieldset').disabled = bool;
//     var submit = langAdd.querySelectorAll('input[type=submit]');
//     for(var i = 0; i<submit.length; i++) {
//       submit[i].disabled = bool;
//     }
//   }
//
//   function updateLanguage(oldCode, newCode, newName) {
//     setEditFormDisabled(true);
//     socket.emit('lang.update', {
//       oldCode: oldCode,
//       newCode: newCode,
//       newName: newName,
//       token: window.HLRDESK.token
//     });
//   }
//
//   function removeLanguage(code) {
//     setEditFormDisabled(true);
//     socket.emit('lang.remove', {
//       code: code,
//       token: window.HLRDESK.token
//     });
//   }
//
//   function createLanguage(code, name) {
//     setCreateFormDisabled(true);
//     socket.emit('lang.create', {
//       code: code,
//       name: name,
//       token: window.HLRDESK.token
//     });
//   }
//
//   var socket = io();
//
//   langSearch.addEventListener('input', handleSearch);
//
//   socket.on('alert', function(data){
//     setEditFormDisabled(false);
//     setCreateFormDisabled(false);
//     window.HLRDESK.alert.error(data);
//   });
//   socket.on('lang.itemRemoved', removeLanguageOption);
//   socket.on('lang.itemAdded', addLanguageOption);
//   socket.on('lang.updateSuccess', updateLanguageOption);
//
//   function updateLanguageOption(data) {
//     window.HLRDESK.alert.flash('Language updated!');
//     var opt = document.querySelector('#langlist option[data-code=' + data.oldCode + ']');
//     opt.dataset.name = data.newName;
//     opt.dataset.code = data.newCode;
//     opt.value = data.newName + ' [' + data.newCode + ']';
//     setEditFormDisabled(false);
//   }
//
//   function addLanguageOption(data) {
//     window.HLRDESK.alert.flash('Language added!');
//     var opt = document.createElement('option');
//     opt.dataset.code = data.code;
//     opt.dataset.name = data.name;
//     opt.value = data.name + ' [' + data.code + ']';
//     document.getElementById('langlist').appendChild(opt);
//     setCreateFormDisabled(false);
//   }
//
//   function handleSearch(evt) {
//     var el = evt.target || evt.srcElement;
//     var val = el.value;
//     if(!val) {
//       langEdit.classList.remove('active');
//       return;
//     }
//     var sanitizedSearch = val.replace(/"/g,'\\"');
//     var selector = '#langlist option[value="' + sanitizedSearch + '"]';
//     var opt =  document.querySelector(selector);
//
//     if(!opt) {
//       return;
//     }
//     langEdit.classList.add('active');
//     langEdit.dataset.oldCode = opt.dataset.code;
//     langEdit.code.value = opt.dataset.code;
//     langEdit.langName.value = opt.dataset.name;
//   }
};
