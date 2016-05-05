window.HLRDESK = window.HLRDESK || {};
window.HLRDESK.init = window.HLRDESK.init || {};

window.HLRDESK.init.checkout = function initCheckout() {
  var socket = io();
  var searchForm = document.getElementById('check-out-form');
  var selected = document.querySelector('#check-out-search-selection ul');
  var checkOutButton = document.querySelector('#check-out-search-selection .check-out-btn');

  var selectedItems = {};

  var SATCHEL_ANIMATION_DURATION = 250; // MUST MATCH WHAT IS IN CSS

  var results = document.getElementById('check-out-search-results');

  socket.on('alert', function(data){window.HLRDESK.alert.error(data.message)});


  searchForm.addEventListener('submit', function(evt) {
    evt.preventDefault();
  });

  checkOutButton.addEventListener('click', function handleCheckoutClick() {
    var checkOutPrompt = document.getElementById('check-out-prompt');
    closeModal = window.patternlibrary.displayModal(checkOutPrompt);

    document.querySelector('.modalWindow .check-out-verify').onsubmit = submitRequest;
    appendInventory(document.querySelector('.modalWindow .check-out-prompt.inventory'));
  });

  function clear() {
    selected.innerHTML = '';
    selectedItems = {};
    checkOutButton.setAttribute('disabled','disabled');
  }

  function submitRequest(evt) {
    evt.preventDefault();

    // temporarily disable buttons
    var submitBtn = document.querySelector('.modalWindow .check-out-verify input[type=submit]');
    var closeBtn = document.querySelector('.modalWindow .check-out-verify button.close');
    var oldText = submitBtn.textContent;
    submitBtn.value = 'Submitting...';
    submitBtn.disabled = true;


    var el = evt.srcElement || evt.target;
    var items = el.querySelectorAll('.ready-for-checkout');

    var toSubmit = [];

    for(var i = 0; i<items.length; i++) {
      var dateArr = items[i].querySelector('input[name=due]').value.split('-');
      var dueDate = new Date(dateArr[0], dateArr[1]-1, dateArr[2]);
      toSubmit.push({
        //due: new Date(items[i].querySelector('input[name=due]').value+" 21:00:00 GMT-0700 (MST)"),
        due: dueDate,
        call: items[i].querySelector('input[name=call]').value,
        copy: items[i].querySelector('input[name=copy]').value
      });
    }

    var emitMe = {
      netid: el.querySelector('input[name=netid]').value,
      telephone: el.querySelector('input[name=tel]').value,
      email: el.querySelector('input[name=email]').value,
      items: toSubmit,
      token: window.HLRDESK.token
    };

    socket.emit('inv.checkout', emitMe);
    socket.removeAllListeners('inv.checkout.success');
    socket.on('inv.checkout.success', function() {
      clear();
      socket.removeAllListeners('inv.checkout.success');
      submitBtn.value = 'Success!';
      setTimeout(function() {
        closeModal(),
        HLRDESK.alert.flash("Item(s) checked out.");
      }, 750);

    });
  };

  function appendInventory(ol) {
    var items = selected.querySelectorAll('li');
    var fragment = document.createDocumentFragment();

    var tpl = document.getElementById('tpl-checkout-popup-li');
    for(var i = 0; i<items.length; i++) {
      var node = document.importNode(tpl.content, true);
      var li = node.querySelector('li');

      var call  = items[i].getAttribute('data-call'),
          copy  = items[i].getAttribute('data-copy'),
          title = items[i].getAttribute('data-title');

      li.querySelector('.title').textContent = title;
      li.querySelector('.call').textContent = call;
      li.querySelector('.copy').textContent = copy;

      li.querySelector('.input-call').value = call;
      li.querySelector('.input-copy').value = copy;

      var threeDays = new Date();
      threeDays.setDate(threeDays.getDate() + 3);
      threeDays = ($.datepicker.formatDate("yy-mm-dd", threeDays));
      li.querySelector(".due").value = threeDays;
      fragment.appendChild(li);

    }
    ol.appendChild(fragment);
  }

  function addToCollection(call, copy) {
    var icopy = Number(copy);
    selectedItems[call] = selectedItems[call] || [];
    if(selectedItems[call].indexOf(icopy) !== -1) {
      throw "Copy " + icopy + " already selected for checkout for call " + call;
    }
    selectedItems[call].push(icopy);
  }

  function removeFromCollection(call, copy) {
    var icopy = Number(copy);
    var item = selectedItems[call];
    if(item === undefined) {
      throw "Cannot remove call " + call + " from items selected for checkout. Does not exist.";
    }
    var idx = item.indexOf(icopy);
    if(idx === -1) {
      throw "Cannot remove copy " + icopy + " of call " + call + " from items selected for checkout. Does not exist.";
    }
    item.splice(idx, 1);
  }

  function swapLocation(el) {
    el.classList.remove('incoming');

    // debounce
    if(el.classList.contains('outgoing')) {
      return;
    }
    el.classList.add('outgoing');
    var intoSatchel = results.contains(el) ? true : false;
    var opposite = null;
    var call = el.getAttribute('data-call');
    var copy = el.getAttribute('data-copy');

    if(intoSatchel) {
      opposite = selected;
      addToCollection(call, copy);
    }
    else
    {
      opposite = results.querySelector('ul');
      removeFromCollection(call, copy);
    }

    window.setTimeout(function removeFromCollection() {
      opposite.appendChild(el);
      el.classList.remove('outgoing');
      el.classList.add('incoming');
      window.setTimeout(function removeIncomingClass() {
        el.classList.remove('incoming');
      }, SATCHEL_ANIMATION_DURATION);

      if(selected.children.length === 0) {
        checkOutButton.setAttribute('disabled','disabled');
      }
      else
      {
        checkOutButton.removeAttribute('disabled');
      }
    }, SATCHEL_ANIMATION_DURATION);
  }

  function searchFilter(copy, item) {
    if(selectedItems[item.call_number] !== undefined) {
      if(selectedItems[item.call_number].indexOf(copy) !== -1) {
        return false;
      }
    }
    return true;
  }

  window.HLRDESK.plugins.search({
    search: '#check-out-search',
    results: '#check-out-search-results',
    language: '#check-out-language',
    media: '#check-out-media',
    filter: searchFilter,
    clickCallback: function() {
      if(this.dataset.unavailable) {
        return;
      }
      if(results.contains(this)) {
        swapLocation(this);
      }
    },
    closeCallback: function() {
      swapLocation(this);
    },
    showCopies: true
  });
};
