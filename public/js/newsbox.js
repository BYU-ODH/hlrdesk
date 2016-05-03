window.HLRDESK = window.HLRDESK || {};
window.HLRDESK.init = window.HLRDESK.init || {};

window.HLRDESK.init.newsbox = function initNewsbox() {
  newsEditForm = document.getElementById('news-edit-form');
  newsEditTable = document.getElementById('news-edit-table');
  addNews = document.getElementById('addNews');
  var socket = io();

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
    document.getElementById('addNews').disabled = "disabled";
    if((row.getElementsByTagName('td')).length > 3){
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
    added.innerHTML = '<input id=' + row.id + '-delete-btn type=submit class=redBtn value="Delete"><input id=' + row.id + '-update-btn type=submit class=greenBtn value="Update"><button id=cancel class=myBtn type="button" name="cancel" >Cancel</button>';
    var newsEdit = document.getElementById(row.id + '-update-btn');
    var newsDelete = document.getElementById(row.id + '-delete-btn');
    var cancel = document.getElementById('cancel');
    newsEdit.addEventListener('click', updateNews);
    newsDelete.addEventListener('click', deleteNews);
    cancel.addEventListener('click', resetform);

    function updateNews(evt){
      evt.preventDefault()
      var news_id = row.getElementsByTagName('td')[0].id;
      var img_link = row.getElementsByTagName('td')[0].getElementsByTagName('input')[0].value;
      var heading = row.getElementsByTagName('td')[1].getElementsByTagName('textarea')[0].value;
      var news_body = row.getElementsByTagName('td')[2].getElementsByTagName('textarea')[0].value;
      socket.emit('news.update', {
        news_id: news_id,
        img_link: img_link,
        heading: heading,
        news_body: news_body,
        token: window.HLRDESK.token
      });
    }

    function deleteNews(evt){
      evt.preventDefault()
      var news_id = row.getElementsByTagName('td')[0].id;
      socket.emit('news.remove', {
        news_id: news_id,
        token: window.HLRDESK.token
      });
    }
  });

  socket.on('news.updateSuccess', updateNewsOption);

  function updateNewsOption() {
    resetform();
    window.HLRDESK.alert.flash('NewsBox updated!');
  }

  socket.on('news.itemRemoved', removeNewsOption);

  function removeNewsOption(code) {
    resetform();
    window.HLRDESK.alert.flash('News story deleted!');
  }

  function resetform(){
    location.reload();
  }

  addNews.onclick = function() {
    document.getElementById('addNews').disabled = "disabled";
    newsEditTable.insertRow(-1);
    var last_row = newsEditTable.rows[ newsEditTable.rows.length - 1];
    for (var i = 0; i < 4; i++){
      var cell = last_row.insertCell(-1);
      switch(i) {
        case 0:
          cell.innerHTML = '<input id="new-img-link" type=text required value="">'
          break;
        case 1:
          cell.innerHTML = '<textarea id="new-img-heading" rows="5" cols="40" name=title required></textarea>'
          break;
        case 2:
          cell.innerHTML = '<textarea id="new-img-body" rows="5" cols="40" name=title required></textarea>'
          break;
        case 3:
          cell.innerHTML = '<input id="news-add-btn" type=submit class=greenBtn value="Save"><button id=cancel class=myBtn type="button" name="cancel" >Cancel</button>'
          break;
      }
    }
    var newsAdd = document.getElementById('news-add-btn');
    var cancel = document.getElementById('cancel');

    newsAdd.addEventListener('click', addNews);
    cancel.addEventListener('click', resetform);

    function addNews(evt){
      evt.preventDefault()
      var img_link = document.getElementById('new-img-link').value;
      var heading = document.getElementById('new-img-heading').value;
      var news_body = document.getElementById('new-img-body').value;
      socket.emit('news.add', {
        img_link: img_link,
        heading: heading,
        news_body: news_body,
        token: window.HLRDESK.token
      });
    }
  }

  socket.on('news.itemAdded', addNewsOption);

  function addNewsOption(data) {
    location.reload();
    window.HLRDESK.alert.flash('News Story Added!');
  }

  socket.on('alert', function(data){
    window.HLRDESK.alert.error(data);
  });

};
