window.HLRDESK = window.HLRDESK || {};
window.HLRDESK.plugins = window.HLRDESK.plugins || {};
/**
 * @param parameters Object
 * @property string search - the selector for the search input (will select all found)
 * @property string results - the selector within which to insert the widget
 * @property (optional) function clickCallback - what to do when items are clicked
             `this` is bound to the item clicked
 * @property (optional) function removeCallback - what to do when items are removed
 * @property (optional) function filter(item, copy) - a filter functions for searched items
 * @property (optional) boolean showCopies (default false) whether or not to break down
 *           items into their individual, non-checked-out copies. If items are checked
 *           out and this is set to true, those copies will not be returned.
 */
window.HLRDESK.plugins.search = function(parameters) {
  var FIREFOX_SEARCH_DEBOUNCE_TIME = 250;
  var SEARCH_AVAILABLE = 'onsearch' in document.documentElement;

  var LI_TEMPLATE = '\
<li>\
  <button class=closeBtn></button>\
  <div class=details>\
    <span class=title></span>\
    <span class=call></span>\
    <span class=copy></span>\
  </div>\
</li>';

  var searchEl = parameters.search;
  var languageEl = parameters.language;
  var mediaEl = parameters.media;
  var resultsEl = parameters.results;

  var socket = io();
  var results = document.createElement('ul');
  results.classList.add('satchel');
  var resultsCount = document.createElement('small');
  resultsCount.classList.add('results-count');
  var helpText = document.createElement('p');
  helpText.textContent = 'Try a more general search';
  helpText.classList.add('help');

  var node = document.querySelector(resultsEl);
  var debounce = null; // for searching
  node.appendChild(resultsCount);
  node.appendChild(helpText);
  node.appendChild(results);

  socket.on('inv.search.results', populateResults);

  var searchEls = document.querySelectorAll(searchEl);
  for(var i = 0; i<searchEls.length; i++) {
    var el = searchEls[i];
    if(SEARCH_AVAILABLE) {
      el.addEventListener('search', handleSearchEvt);
    }
    else
    {
      el.addEventListener('keyup', function(evt) {
        window.clearTimeout(debounce);
        debounce = window.setTimeout(handleSearchEvt.bind(evt), FIREFOX_SEARCH_DEBOUNCE_TIME);
      });
    }
  }
  var languageEls = document.querySelectorAll(languageEl);
  for(var i = 0; i<languageEls.length; i++) {
    var el = languageEls[i];
    el.addEventListener('change', handleSearchEvt);
  }
  var mediaEls = document.querySelectorAll(mediaEl);
  for(var i = 0; i<mediaEls.length; i++) {
    var el = mediaEls[i];
    el.addEventListener('change', handleSearchEvt);
  }
  // param copy: integer
  // if -1, mark the item as unavailable
  // if 0 (or falsy) don't display the copy
  function createResultLI(item, copy) {
    var div = document.createElement('div');
    div.innerHTML = LI_TEMPLATE;
    var li = div.querySelector('li');
    li.querySelector('.title').textContent = item.title;
    li.querySelector('.call').textContent = item.call_number;

    if(copy === -1) {
      li.querySelector('.copy').textContent = '[unavailable]'
      li.classList.add('unavailable');
      li.dataset.unavailable = true;
    }

    if(copy >= 1 && item.quantity > 1) {
      // the copy number is redundant if there is only one item of this call
      li.querySelector('.copy').textContent = copy;
    }

    li.setAttribute('data-call', item.call_number);
    li.setAttribute('data-title', item.title);
    li.setAttribute('data-copy', copy);

    if(typeof parameters.clickCallback === 'function') {
      li.addEventListener('click', parameters.clickCallback.bind(li));
    }
    if(typeof parameters.closeCallback === 'function') {
      var btn = li.querySelector('.closeBtn');
      btn.addEventListener('click', parameters.closeCallback.bind(li));
    }
    return li;
  }

  function populateResults(items) {
    clearResults();
    var fragment = document.createDocumentFragment();
    var count = items.length;
    var plural = count !== 1 ? 's':'';
    resultsCount.innerText = count + ' item' + plural  + ' found';

    if(count === 0) {
      helpText.classList.add('active');
    }
    else
    {
      helpText.classList.remove('active');
    }

    items.forEach(function(item) {
      if(!parameters.showCopies) {
        fragment.appendChild(createResultLI(item));
        return;
      }

      var copies = item.copies_available;

      if(!copies.length) {
        results.appendChild(createResultLI(item, -1));
        return;
      }

      if(typeof parameters.filter === 'function') {
        copies = item.copies_available.filter(function(copy) {
          return parameters.filter(item, copy);
        });
      }
      copies.sort();
      copies.forEach(function(copy) {
        fragment.appendChild(createResultLI(item, copy));
      });
    });
    results.appendChild(fragment);
  }


  function clearResults() {
    results.innerHTML='';
    resultsCount.innerText = '';
  };

  function handleSearchEvt(evt) {
    var evt = evt || this;
    if (evt.type == "search") {
      var target = evt.target || evt.srcElement || evt.originalTarget;
      var text = target.value;
    } else {
      var text = document.getElementsByClassName('check-out-search')[0].value;
    }
    var language = document.getElementsByClassName('check-out-language')[0].value;
    language = language === '' ? ' AND (l.name LIKE(\'%\')OR l.name IS null) ' : ' AND (l.name like(\'%' + language + '%\')) '
    var media = document.getElementsByClassName('check-out-media')[0].value;
    media = media === '' ? ' AND (m.medium LIKE(\'%\')OR m.medium IS null) ' : ' AND (m.medium like(\'%' + media + '%\')) '
    if(text === '') {
      clearResults();
      return;
    }
    socket.emit('inv.search', {
      'text': text,
      'language': language,
      'media': media,
      token: window.HLRDESK.token
    });
  }

};
