// Enables navigation with the administrative sidebar
var oneMinute = 1000 * 60;
(function leftNavBar() {
  window.addEventListener('popstate', function (evt) {
    if (!evt.state) { return; }
    loadPage(evt.state.title, evt.state.href);
  });

  function loadPage(title, href) {
    if (!href || href === '/') {
      $("#loader").html('');
      return;
    }
    document.getElementById("caption").classList.remove("aboveLoader");
    if (href.indexOf('?') === - 1) {
      href += '?ajax=true';
    }
    else {
      href += '&ajax=true';
    }
    checkForUnread();

    document.title = title + ' | HLRDesk';
    $("#loader").load(href);
  }

  $(".lpanel[data-title]").click(function loadMsg(ev) {
    var href = $(this).attr('href');
    var title = $(this).data('title');

    history.pushState({ href: href, title: title }, title, href);
    ev.preventDefault();
    loadPage(title, href);
  });
  // TODO: account for query strings
  var href = location.pathname + location.search;
  var title = document.title;
  history.pushState({ href: href, title: title }, title, href);

  $('document').ready(function () {
    if (!sessionStorage.timer) {
      sessionStorage.timer = Date.now() + oneMinute * 60; // hour
    } else if (sessionStorage.timer < Date.now()) {
      checkTimeout();
    }
    setTimeout(checkForUnread, 1000);
  });

  var socket = window.io();
  function checkForUnread() {
    socket.emit('unread message', { token: window.HLRDESK.token });
  };

  socket.on('unread message', function () {
    $("#messageDisplay").show().one();
  });

  socket.on('expired token', function (service) {
    window.HLRDESK.alert.error('Your session has expired. Please log in again.');
    window.setTimeout(function () {
      window.location.href = '/logout';
    }, 3000);
  });
})();

window.HLRDESK.init.messages();//not sure this is the best way to load messages sockets

window.onunload = function() {
  sessionStorage.removeItem("timer");
}

$('#logout').click(function(){
  sessionStorage.removeItem("timer");
});

function showMessage() {
  $("#messageDisplay").show().one();
}

function checkTimeout() {
  if (!sessionStorage.timer || sessionStorage.timer < Date.now()) {
    alert('Your session has expired. Please log in again.');
    sessionStorage.removeItem("timer");
    window.location.href = '/logout';
  }
  setTimeout(checkTimeout, oneMinute / 2); // Check every 30 seconds for logout
}
// checkTimeout();
setTimeout(checkTimeout, 5000);
