// Tool for displaying messages to the user
// e.g., window.HLRDESK.alert.error("THE GOGGLES! THEY DO NOTHING!");
window.HLRDESK = window.HLRDESK || {};

(function(H, pl) {
  if(!pl || !pl.displayModal) {
    throw "Pattern library's displayModal method not found!";
  }

  var FLASH_MESSAGE_DURATION = 1000;

  // should match fadeout time in flash-message.scss
  var FLASH_MESSAGE_FADEOUT_TIME = 500;

  H.alert = {
    error: function(message) { // see core/templates/error-modal.html
      var tpl = document.getElementById('tpl-error-modal');
      var el = document.importNode(tpl.content, true);
      el.querySelector('.error-message').textContent = message;
      pl.displayModal(el);
    },

    flash: function(message) {
      var el = document.createElement('div');
      el.classList.add('flash-message');
      el.textContent = message;
      var pane = document.getElementById('loader');
      pane.insertBefore(el, pane.childNodes[0]);

      setTimeout(function() {
        el.classList.add('fadeout');
        setTimeout(function() {
          pane.removeChild(el);
        }, FLASH_MESSAGE_FADEOUT_TIME);
      }, FLASH_MESSAGE_DURATION);
    },

    notice: function(message) {
      var tpl = document.getElementById('tpl-notice-modal');
      var el = document.importNode(tpl.content, true);
      el.querySelector('.notice-message').textContent = message;
      pl.displayModal(el);
    }
  }

}(window.HLRDESK, window.patternlibrary));
