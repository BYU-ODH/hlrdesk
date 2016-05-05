window.HLRDESK.init.checkin = function() {
  var socket = io();

  var employee = window.patron;

  socket.on('checkin event', clearItems);
  socket.on('extend success', itemExtended);
  socket.on('extend error', itemError);
  socket.on('extend error', itemError);
  socket.on('email.sent', emailSent);

  function itemError(data) {
    var el = document.getElementById(data.id);
    $(el).find('button, input').removeAttr('disabled');
    alert("There was an error extending the item.");
  };

  function itemExtended(data) {
    var el = $(document.getElementById(data.id));
    var td = el.find('td.due');
    td.find('button, input').removeAttr('disabled');
    td.removeClass('editing');
    td.find('.date-truncated').text(data.formattedDate);
  }

  function checkin() {
    $(".selected").each(function() {
      if ($(this).data('overdue')) {
        var due = new Date($(this).data('due'));
        var diffDays = Math.round((Math.abs(due - new Date())) / (1000 * 3600 * 24));
        var priceOwed = diffDays * ($(this).data('price'));
        HLRDESK.alert.notice('This item is ' + diffDays + ' days overdue. You should charge a payment of $' + priceOwed.toFixed(2))
      }
      socket.emit('checkin event', {
        call: $(this).data('call'),
        patron: $(this).data('patron'),
        domid: this.id, // add so we know what to clear from client's table
        token: window.HLRDESK.token
      });
    });
  }

  function clearItems(data){
    var selected = document.getElementById(data.domid);
    selected.parentNode.removeChild(selected);
    toggleDisabledButtons();
  }

  $("#filter").keyup(function(){
    var filter = $(this).val(), count = 0;
    $("tbody tr").each(function(){
      if ($(this).text().search(new RegExp(filter, "i")) < 0){$(this).fadeOut(300);}
      else {$(this).show(); count++;}
    });
    var numberItems = count;
    $("#filter-count").text(count + " Items");
  });

  var myTextExtraction = function(node) {
    // extract data from markup and return it
    return $(node).data("date")||$(node).text()
  }
  $(".checkIN").tablesorter( {textExtraction: myTextExtraction} );
  document.querySelector('.check-in-btn').addEventListener ("click", checkin);

  function toggleDisabledButtons() {
    var checkInButton = document.querySelector('.check-in-btn')
    var selected = document.querySelectorAll('.selected');

    if(selected.length === 0) {
      checkInButton.setAttribute('disabled','disabled');
    }
    else
    {
      checkInButton.removeAttribute('disabled');
    }
  }

  $("#checked-out-items tbody tr").click(function(evt){
    var el = (evt.target || evt.srcElement);

    // TODO: refactor
    if( el.classList.contains('edit') ) {
      return;
    }

    if( el.classList.contains('save') ) {
      $(el).parents('td').find('button, input').attr('disabled','disabled');
      var data = $(el).parents('tr')[0].dataset;
      socket.emit('extend', {
        call: data.call,
        copy: data.copy,
        due: $(el).parents('td').find('input[type=date]').val(),
        id: $(el).parents('tr')[0].id,
        token: window.HLRDESK.token
      });
      return;
    }
    if( el.classList.contains('due-extend') ) {
      $(el).parents('td').toggleClass('editing');
      return;
    }
    $( this ).toggleClass( "selected" );
    toggleDisabledButtons();
  });

  $("#add").click(function(){
    $( '#checked-out-items tbody tr:visible' ).addClass( "selected" );
  });

  $("#remove").click(function(){
    $( '#checked-out-items tbody tr:visible' ).removeClass( "selected" );
  });

  var closeModal = function() {};
  function emailSent(data) {
    // this is capricious and i don't like it and really
    // we need a better way of handling modal windows
    // so here i lay a big fat TODO:
    //
    // CloseModal could be a different function by the time
    // this function (i.e., emailSent) is called. It would
    // be beneficial to have an encapsulating object for
    // modal windows to manage event binding etc.
    closeModal();
    HLRDESK.alert.flash(data);
  }

  $(".send-email").click(function(evt) {
    evt.preventDefault();
    var emailPrompt = document.getElementById('send-reminder-email-warning');
    closeModal = window.patternlibrary.displayModal(emailPrompt);
    var $btn = $('.modalWindow .send-email');
    var $tr = $(this).parents('tr');
    var netid = $tr.data('patron');
    $('.modalWindow .netid').text(netid);

    $btn.click(function(e) {
      this.disabled = 'disabled';
      $(this).val('Waiting');

      var method = 'email.' + ($tr.hasClass('overdue') ? 'overdue' : 'reminder');
      socket.emit(method, {
        netid: netid,
        items: [{
          item: $tr.data('call'),
          due: $tr.data('due')
        }],
        token: window.HLRDESK.token
      });
    });
  });
}
