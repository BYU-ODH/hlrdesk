var socket = io();
var displayedDate = moment();

$(document).ready(function() {

////////////////////////////////////////EVENT LISTENERS///////////////////////////////
  
  $('#previousBtn').click(function() {
    if (!$(this).hasClass('disabledBtn')) {
      if (currentView == 'multiple rooms') {
        if (displayedDate.day() == 1) { //if day is Monday
          changeDate(displayedDate.subtract(2, 'days'));
        } else {
          changeDate(displayedDate.subtract(1, 'days'));
        }
      } else {
        changeDate(displayedDate.subtract(1, 'weeks'))
      }
    }
  });

  $('#nextBtn').click(function() {
    if (currentView == 'multiple rooms') {
      changeDate(displayedDate.add(1, 'days'));
    } else {
      changeDate(displayedDate.add(1, 'weeks'))
    }
  });

  function changeDate(newDate) {
    while (newDate.isBefore(moment(), 'day') || newDate.format('dddd') == 'Sunday') {
      newDate.add(1, 'days');
    }
    if (currentView == 'multiple rooms') {
      if (displayedDate.isSame(moment(), 'day')) {
        $('#previousBtn').addClass('disabledBtn');
      } else {
        $('#previousBtn').removeClass('disabledBtn');
      }
      displayedDate = newDate;
    } else {
      if (displayedDate.isSame(moment(), 'week')) {
        $('#previousBtn').addClass('disabledBtn');
      } else {
        $('#previousBtn').removeClass('disabledBtn');
      }
      displayedDate = newDate.day(1);
    }
    $('#dateSelector').val(displayedDate.format('YYYY-MM-DD'));
    $('#roomsSelector').trigger('change', [currentView, displayedDate])
  }

////////////////////////////////////////FRONTEND//////////////////////////////////////

  var currentEvents = [];
  var currentView = 'multiple rooms';
  var displayedRooms = 'studyRooms';
  var selectedCells = [];
  var currentlySelecting = false;

  $('#roomsSelector').on('change', function(){
    if (displayedDate < moment()) {
      displayedDate = moment();
    }
    var roomTemplateIds = {'Study Rooms':'studyRooms', 'Recording Studio':'recordingStudio', 'FLAC':'flac', 'Other Rooms':'otherRooms'}
    displayedRooms = roomTemplateIds[this.value];
    changeGridTo(roomTemplateIds[this.value], displayedDate);
  });

  $('#dateSelector').on('change', function() {
    changeDate(moment($(this).val()));
  });

  function populateColumnDays(mondayDate) {
    var days = $('#daysHeader').children();
    for (var i = 1; i < days.length; i++) {
      var dateSpan = $('#'+days[i].children[0].id);
      var dateToBeDisplayed = moment(displayedDate).day(i).format('MMM D');
      if (dateToBeDisplayed === moment().format('MMM D')) {
        days[i].classList.add('today')
      }
      dateSpan.text(dateToBeDisplayed);
    }
  }

  function changeGridTo(view, date) {
    $('td').off('mouseover');
    $('#visibleGrid').html($('#'+view).html());
    if (view == 'studyRooms' || view == 'otherRooms') {
      currentView = 'multiple rooms';
      $('.roomInfo').hide();
      $('.room').mouseover(function(){
        var roomNum = $(this).text().substring(0, $(this).text().indexOf(" "));
        var roomInfoDiv = $('#'+roomNum);
        roomInfoDiv.css('left', (($(this).offset().left + $(this).outerWidth()/2) - (roomInfoDiv.outerWidth()/2))+'px');
        if ((($(this).offset().left + $(this).outerWidth()/2) + roomInfoDiv.outerWidth()/2) > window.innerWidth) {
          roomInfoDiv.css('left', window.innerWidth - roomInfoDiv.outerWidth()+'px');
        }
        roomInfoDiv.css('top', ($(this).parent().offset().top + $(this).outerHeight())+'px');
        roomInfoDiv.stop().slideDown();
      })
      $('.room').mouseleave(function(){
        var roomNum = $(this).text().substring(0, $(this).text().indexOf(" "));
        var roomInfoDiv = $('#'+roomNum);
        roomInfoDiv.stop().slideUp();
      });
      cloak('Loading...');
      getDayEventsForRooms(window.rooms[view], displayedDate);
    } else if (view == 'recordingStudio' || view == 'flac') {
      currentView = 'single room';

      displayedDate.day(1)
      populateColumnDays(displayedDate);

      cloak('Loading...');
      if (view == 'recordingStudio') {
        getRoomEventsForWeek(window.rooms[13], displayedDate);
      } else if (view == 'flac') {
        getRoomEventsForWeek(window.rooms[15], displayedDate)
      }
    }
    disablePastCells();
    $('td').mousedown(function() {
      if (!$(this).hasClass('disabled')) {
        if (!$(this).hasClass('booked')) {
          $(this).addClass('hover');
          $(this).parent().children('th').addClass('hover');
          selectedCells.length = 0;
          selectedCells.push($(this));
          currentlySelecting = true;
        } else {
          currentlySelecting = true;
          var highlightedCells = $('td.hover');
          for (var i = 0; i < highlightedCells.length; i++) {
            selectedCells.push($('#'+highlightedCells[i].id.replace('.','\\.')));
          }
          displayWindow();
        }
      }
    });
    $('td').mouseover(function(e) {
      if (currentlySelecting && !$(this).hasClass('booked')) {
        var fromCell = $('#'+(e.relatedTarget.id.replace('.','\\.')));
        var thisElementColumn = $(this).attr('id').substring(0, $(this).attr('id').indexOf('-'));
        var fromElementColumn = fromCell.attr('id').substring(0, fromCell.attr('id').indexOf('-'));
        var thisElementTime = Number($(this).data('time'));
        var fromElementTime = Number(fromCell.data('time'));
        if (thisElementColumn == fromElementColumn) { //same column
          if (fromElementTime == thisElementTime - 0.5 && fromCell.hasClass('hover')) { //selected cells are in sequence
            selectedCells.push($(this))
            $(this).addClass('hover')
            $(this).parent().children('th').addClass('hover')
          } else if (thisElementTime > fromElementTime + 0.5) { //mouse goes backwards
            clearSelection();
            selectedCells.length = 0;
          } else {
            selectedCells.splice(selectedCells.length-1, 1);
            fromCell.removeClass('hover');
            fromCell.parent().children('th').removeClass('hover');
          }
        } else {
          currentlySelecting = false;
          clearSelection();
          selectedCells.length = 0;
        }
      } else {
        clearSelection();
      }
    });
    $(document).mouseup(function() {
      if (currentlySelecting) {
        currentlySelecting = false;
        if (selectedCells.length > 0) {
          displayWindow(selectedCells.itemAt(0));
        }
      }
    });
  }
  changeGridTo('studyRooms');

  function disablePastCells() {
    var allCells = $('td');
    for (var i = 0; i < allCells.length; i++) {
      var cell = $('#'+allCells[i].id.replace('.', '\\.'))
      if (currentView == 'multiple rooms') {
        if (displayedDate.isSame(moment(), 'day') && (cell.data('time') <= (Number(moment().format('H')) + Number(moment().format('m')/60)))) {
          cell.addClass('disabled');
        }
      } else {
        var days = {'sunday':0, 'monday':1, 'tuesday':2, 'wednesday':3, 'thursday':4, 'friday':5, 'saturday':6};
        if (displayedDate.isSame(moment(), 'week')) { //if dispalying current week
          if ((days[cell.data('day')] < moment().format('d')) || (days[cell.data('day')] == moment().format('d') && (Number(cell.data('time')) <= Number(moment().format('H'))+Number(moment().format('m')/60)))) { //if previous time
            cell.addClass('disabled');
          }
        }
      }
    }
  }

  function displayWindow() {
    var firstCell = selectedCells.itemAt(0);
    var cellColumn = firstCell.attr('id').substring(0, firstCell.attr('id').indexOf('-'));
    if (currentView == 'multiple rooms') {
      var cellRoom = firstCell.data('room');
    } else {
      var cellRoom = 'the ' + $('#roomsSelector').val();
    }
    var prompt = $('#eventWindow');
    var windowLeft = (firstCell.offset().left < $('#visibleGrid').offset().left+($('#visibleGrid').outerWidth())/2) ? firstCell.offset().left + firstCell.outerWidth()*1.5 : firstCell.offset().left - (prompt.outerWidth() + firstCell.outerWidth()*0.5);
    prompt.css('left', windowLeft+'px');
    prompt.css('top', '33%');
    prompt.show();
    cloak('');

    if (firstCell.data('event')) {
      var selectedEvent = firstCell.data('event');
    }
    var duration = selectedCells.length/2;
    var startTime = Number(selectedCells.itemAt(0).data('time'));
    var endTimeReadable;

    $('#eventWindow header').mousedown(function(e){
      drag(e, $(this).parent());
    });

    if (firstCell.hasClass('booked')) {
      var editing = true;
      $('#eventHeader').text('Edit Event');
      $('.editing').show();
      $('.creating').hide();
      for (var i = 0; i < currentEvents.length; i++) {
        if (currentEvents[i].id == firstCell.data('event')) {
          var cellEvent = currentEvents[i];
          break;
        }
      }
      if (Number(cellEvent['room']) <= 0) {
        $('.window').hide();
        $('#editError').show();
        $('#closeErrorWindow').click(function() {
          selectedCells.length = 0;
          clearSelection();
          return;
        });
      }
      $('#eventName').val(cellEvent.name);
      $('#clientNetid').text(cellEvent.contact_netid);
      $('#proxyEvent').hide();
      if (cellEvent.contact_netid !== cellEvent.responsible_netid) {
        $('#proxyEvent').show();
        $('#overseerNetid').text(cellEvent.responsible_netid);
      }
      if (cellEvent.notes[0] == '{') {
        var note = JSON.parse(cellEvent.notes)
        $('#contactEmail').text(note.email);
        $('#contactPhone').text(note.phone);
      }
      $('#roomOfEvent').text(cellRoom);
    } else {
      var editing = false;
      $('#eventHeader').text('Create Event');
      $('.editing').hide();
      $('.creating').show();
      $('#eventName').val('');
      $('#roomOfEvent').text(cellRoom);
      $('#clientNetidInput').val('');
      $('#contactEmailInput').val('');
      $('#contactPhoneInput').val('');
      $('#overseerNetidInputBox').val('');
    }

    //Populate Time Options
    $('#eventTime > option').each(function() {
      $(this).removeAttr('disabled');
      var c = $('#'+cellColumn+'-'+$(this).val().replace('.','\\.'));
      if ((c.hasClass('booked') && c.data('event') !== selectedCells.itemAt(0).data('event')) || c.hasClass('disabled')) {
        $(this).attr('disabled', 'disabled');
      }
    });

    updateStartTime();

    //eventTime
    $('#eventTime').change(function() {
      updateStartTime($(this).val());
    });
    function updateStartTime(newStartTime) {
      if (newStartTime) {
        startTime = newStartTime;
      }
      $('#eventTime').val(startTime);
      newFirstCell = $('#'+cellColumn+'-'+String(startTime).replace('.','\\.'));
      firstCell = newFirstCell;
      if (getAvailableBlock(newFirstCell).length/2 < duration) {
        duration = getAvailableBlock(newFirstCell).length/2;
      }
      selectedCells = getAvailableBlock(newFirstCell, duration);
      updateDurationSelect();
      updateDuration();
    }

    //eventDurationSelect
    function updateDurationSelect() {
      $('#eventDurationSelect').empty();
      for (var i = 0, value = 0.5; i < getAvailableBlock(firstCell).length; i++, value+=0.5) {
        $('#eventDurationSelect').append($('<option>', {'value': value, 'text': value}));
      }
    }
    $('#eventDurationSelect').change(function() {
      updateDuration(Number($(this).val()));
    });
    function updateDuration(newDuration) {
      if (newDuration) {
        duration = newDuration;
      }
      $('#eventDurationSelect').val(duration);
      selectedCells = getAvailableBlock(firstCell, duration);
      updateSelection();
    }

    //table cells
    function updateSelection() {
      $('td').removeClass('hover');
      $('th').removeClass('hover');
      for (c in selectedCells) {
        if (selectedCells.hasOwnProperty(c)) {
          var cell = selectedCells.itemAt(c);
          cell.addClass('hover');
          cell.parent().children('th').addClass('hover')
        }
      }
      var endTime = Number(selectedCells.itemAt(-1).data('time')+0.5);
      endTimeReadable = (Math.floor(endTime<13?endTime:endTime-12))+(endTime%1==0?':00':':30')+' '+(endTime<12?'AM':'PM');
      $('#eventEndTime').text(endTimeReadable);
    }

    function getAvailableBlock(firstCell, duration) {
      var cellsInColumn = firstCell.data('room') ? $('[data-room="'+firstCell.data('room')+'"]') : $('[data-day="'+firstCell.data('day')+'"]');
      var newSelection = [];
      for (var i = 0; i < cellsInColumn.length; i++) {
        cellToBeAdded = $('#'+cellsInColumn[i].id.replace('.','\\.'));
        if (cellToBeAdded.data('time') >= firstCell.data('time') && cellToBeAdded.data('time') < firstCell.data('time')+(duration||22)) {
          if (!cellToBeAdded.hasClass('booked') || cellToBeAdded.data('event') == selectedEvent) {
            newSelection.push(cellToBeAdded);
          } else {
            break;
          }
        }
      }
      return newSelection;
    }

    $('#overseerNetidInput').hide();
    $('#clientIsOverseer').prop('checked', false);
    $('#clientIsOverseer').click(function() {
      if ($(this).prop('checked')) {
        $('#overseerNetidInput').show();
      } else {
        $('#overseerNetidInput').hide();
      }
    });

    $('#saveEvent').click(function() {
      var desc = $('#eventName').val();
      var request_id = $('#clientNetidInput').val();
      if ($('#clientNetidInput').val() !== $('#overseerNetidInput').val()) {
        var responsible_id = $('#overseerNetidInput').val();
      } else {
        var responsible_id = $('#clientNetidInput').val();
      }
      if (currentView == 'multiple rooms') {
        var room = window.rooms[displayedRooms][cellRoom];
        var start_date = displayedDate.format('YYYY')+','+displayedDate.format('M')+','+displayedDate.format('D')+','+Math.floor(firstCell.data('time'))+','+(firstCell.data('time')%1===0?'0':'30')+',0,'+(Number(displayedDate.format('d'))+1);
      } else {
        if (displayedRooms == 'recordingStudio') {
          var room = window.rooms[13];
        } else if (displayedRooms == 'flac') {
          var room = window.rooms[15];
        }
        var days = {'monday':0, 'tuesday':1, 'wednesday':2, 'thursday':3, 'friday':4, 'saturday':5};
        var date = displayedDate.add(days[cellColumn], 'days');
        var start_date = date.format('YYYY')+','+displayedDate.format('M')+','+displayedDate.format('D')+','+Math.floor(firstCell.data('time'))+','+(firstCell.data('time')%1===0?'0':'30')+',0,'+(Number(displayedDate.format('d'))+1);
      }
      var start_time = firstCell.data('timereadable');
      var end_time = endTimeReadable;
      var request_id = $('#clientNetidInput').val();
      var desc = $('#eventName').val();
      if ($('#clientIsOverseer').prop('checked')) {
        var responsible_id = $('#overseerNetidInputBox').val();
      } else {
        var responsible_id = $('#clientNetidInput').val();
      }
      function inputError(field) {
        $('#submitError').show();
        $('#invalidField').text(field);
        $('#eventWindow').addClass('blurred');
        $('#eventWindow').css('z-index', 0)
        $('#closeInvalidWindow').click(function() {
          $('#submitError').hide();          
          $('#eventWindow').removeClass('blurred');
          $('#eventWindow').css('z-index', 1)
        });
      }
      if (desc == '') {
        inputError('n event name');
      } else if (responsible_id == '') {
        inputError(' netid or name')
      } else if ($('#contactEmailInput').val() != '' && !/\S+@\S+\.\S+/.test($('#contactEmailInput').val())) {
        inputError(' valid email address or leave it blank');
      } else if ($('#contactPhoneInput').val() != '' && !/^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})$/.test($('#contactPhoneInput').val())) {
        inputError(' valid nine digit phone number or leave it blank');
      } else {
        var noteObj = {'email':$('#contactEmailInput').val(), 'phone':$('#contactPhoneInput').val()};
        var note = JSON.stringify(noteObj);
        var event = {'room':room['id'], 'start_date':start_date, 'start_time':start_time, 'end_time':end_time, 'request_id':request_id, 'responsible_id':responsible_id, 'desc':desc, 'note':note};
        submitEvent(event);
      }
    });

    $('#editEvent').off('click');
    $('#editEvent').click(function() {
      var editedEvent = {};
      var id = cellEvent['id'];
      if (currentView == 'multiple rooms') {
        var start_date = displayedDate.format('YYYY')+','+displayedDate.format('M')+','+displayedDate.format('D')+','+Math.floor(firstCell.data('time'))+','+(firstCell.data('time')%1===0?'0':'30')+',0,'+(Number(displayedDate.format('d'))+1);
      } else {
        var days = {'monday':0, 'tuesday':1, 'wednesday':2, 'thursday':3, 'friday':4, 'saturday':5};
        var date = displayedDate.add(days[cellColumn], 'days');
        var start_date = date.format('YYYY')+','+displayedDate.format('M')+','+displayedDate.format('D')+','+Math.floor(firstCell.data('time'))+','+(firstCell.data('time')%1===0?'0':'30')+',0,'+(Number(displayedDate.format('d'))+1);
      }
      editedEvent['room'] = cellEvent['room'];
      editedEvent['request_id'] = cellEvent['contact_netid'];
      editedEvent['responsible_id'] = cellEvent['responsible_netid'];
      editedEvent['desc'] = $('#eventName').val();
      editedEvent['start_time'] = firstCell.data('timereadable');
      editedEvent['start_date'] = start_date;
      editedEvent['end_time'] = endTimeReadable;
      editedEvent['note'] = cellEvent['note'];
      editedEvent['term'] = cellEvent['term'];
      editEvent(editedEvent, id);
    });

    $('#deleteEvent').off('click');
    $('#deleteEvent').click(function() {
      deleteEvent(cellEvent);
    });

    $('#cancel').click(function() {
      selectedCells.length = 0;
      clearSelection();
    });

  }

  function clearSelection() {
    $('td').removeClass('hover');
    $('th').removeClass('hover');
    $('.window').hide();
    uncloak();
    $('#roomsSelector').prop('disabled', false);
    $('#eventTime').off('change');
    $('#eventDurationSelect').off('change');
    $('#clientIsOverseer').off('click');
    $('#deleteEvent').off('click');
    $('#saveEvent').off('click');
    $('#editEvent').off('click');
    $('#cancel').off('click');
    $('#eventWindow header').off('mousedown');
  }

  function drag(e, element){
    window.my_dragging = {};
    my_dragging.pageX0 = e.pageX;
    my_dragging.pageY0 = e.pageY;
    my_dragging.elem = element;
    my_dragging.offset0 = element.offset();
    function handle_dragging(e){
        var left = my_dragging.offset0.left + (e.pageX - my_dragging.pageX0);
        var top = my_dragging.offset0.top + (e.pageY - my_dragging.pageY0);
        my_dragging.elem
        .offset({top: top, left: left});
    }
    function handle_mouseup(e){
        $('body')
        .off('mousemove', handle_dragging)
        .off('mouseup', handle_mouseup);
    }
    $('body')
    .on('mouseup', handle_mouseup)
    .on('mousemove', handle_dragging);
  }

  function highlightEvent(cell) {
    if (!currentlySelecting) {
      var cellColumnData = cell.data('room') ? '[data-room="'+cell.data('room')+'"]' : '[data-day="'+cell.data('day')+'"]';
      $('[data-event='+cell.data('event')+']'+cellColumnData).addClass('hover');
    } else {
      selectedCells.length = 0;
      clearSelection();
    }
  }

  function cloak(text) {
    $('#blanket').text(text);
    $('#blanket').show();
    $('#headerBar').addClass('blurred');
    $('#visibleGrid').addClass('blurred');
  }
  function uncloak() {
    $('#blanket').hide();
    $('#headerBar').removeClass('blurred');
    $('#visibleGrid').removeClass('blurred');
  }

  function clearGrid() {
    $('.calendar td').removeClass();
    $('.calendar td').text('');
  }

/////////////////////////////////////////////////BACKEND/////////////////////////////////////////

  function getRoomEventsForWeek(room, monday) {
    mondayString = monday.format('YYYY-MM-DD');
    socket.emit('get week events', {'user':window.user, 'room':room['id'], 'date':mondayString, 'token':'ABC123'});
  }

  function getDayEventsForRooms(rooms, date) {
    var dateString = date.format('YYYY-MM-DD');
    socket.emit('get day events', {'user':window.user, 'rooms':rooms, 'date':dateString, 'token':'ABC123'});
  }

  socket.on('get day events', function(events) {
    currentEvents = events;
    placeDayEvents(events);
  });

  socket.on('get week events', function(events) {
    currentEvents = events;
    placeWeekEvents(events);
  });

  function submitEvent(event) {
    clearSelection();
    selectedCells.length = 0;
    cloak('Submitting...');
    socket.emit('new event', {'event':event, 'token':'ABC123', 'view':currentView})
  }

  socket.on('refresh events', function() {
    selectedCells.length = 0;
    disablePastCells();
    if (currentView == 'multiple rooms') {
      getDayEventsForRooms(window.rooms[displayedRooms], displayedDate);
    } else if (currentView == 'single room') {
      var roomId = displayedRooms == 'recordingStudio' ? 13 : 15;
      getRoomEventsForWeek(window.rooms[roomId], displayedDate);
    }
  });

  function deleteEvent(event) {
    clearSelection();
    cloak('Processing...');
    var cell = $('[data-event="'+event.id+'"]');
    cell.text('');
    cell.removeClass();
    cell.removeAttr('data-event');

    socket.emit('delete event', {'event':event, 'token':'ABC123'});
  }

  function editEvent(event, eventId) {
    clearSelection();
    cloak('Processing...');
    var cell = $('[data-event="'+eventId+'"]');
    cell.text('');
    cell.removeClass();
    cell.removeAttr('data-event');

    socket.emit('edit event', {'event':event, 'id':eventId, 'token':'ABC123'});
  }

  function placeDayEvents(events) {
    for (var i = 0; i < events.length; i++) {
      var event = events[i];
      if (window.rooms[event.room]) {
        eventRoom = window.rooms[event.room]['location'].replace(' ','_');
      }
      eventStart = Number(event['start_time'].substring(event['start_time'][0]==='0' ? 1:0,2) + ((event['start_time'][3]=='3')?'.5':''));
      eventEnd = Number(event['end_time'].substring(0,2) + ((event['end_time'][3]=='3')?'.5':''));
      
      if (event.room == 0 || event.room == -2) {
        var cell = $('[data-time="'+String(eventStart).replace('.','\\.')+'"]');
      } else {
        var cell = $(('#'+eventRoom +'-'+ String(eventStart).replace('.','\\.')));
      }
      cell.text(event.name);
      cell.addClass('top');
      for (var j = eventStart; j < eventEnd; j+=0.5) {
        if (event.room == 0 || event.room == -2) {
          var cell = $('[data-time="'+String(j).replace('.','\\.')+'"]');
        } else {
          var cell = $(('#'+eventRoom +'-'+ String(j).replace('.','\\.')));
        }
        cell.addClass('booked');
        cell.attr('data-event', event['id']);
        if (j == eventEnd - 0.5) {
          cell.addClass('bottom');
        }
      }
    }
    $('td.booked:not(.disabled)').mouseover(function() {
      highlightEvent($(this));
    });
    $('td.booked:not(.disabled)').mouseleave(function() {
      if (!currentlySelecting) {
        $('.hover').removeClass('hover')
      }
    });
    uncloak();
  }

  function placeWeekEvents(events) { //TODO: Displays all events
    for (var i = 0; i < events.length; i++) {
      var event = events[i];
      eventStart = Number(event['start_time'].substring(event['start_time'][0]==='0' ? 1:0,2) + ((event['start_time'][3]=='3')?'.5':''));
      eventEnd = Number(event['end_time'].substring(0,2) + ((event['end_time'][3]=='3')?'.5':''));
      eventDays =  event.days_of_week.split(',');
      
      for (var j = 0; j < eventDays.length; j++) {
        var cell = $(('#'+eventDays[j].toLowerCase() +'-'+ eventStart).replace('.','\\.'));
        cell.text(event.name);
        cell.addClass('top');
        for (var k = eventStart; k < eventEnd; k+=0.5) {
          cell = $('#'+eventDays[j].toLowerCase() +'-'+ String(k).replace('.','\\.'))
          cell.addClass('booked');
          cell.attr('data-event', event['id']);
          if (k == eventEnd - 0.5) {
            cell.addClass('bottom');
          }
        }
      }
    
    }
    $('td.booked:not(.disabled)').mouseover(function() {
      highlightEvent($(this));
    });
    $('td.booked:not(.disabled)').mouseleave(function() {
      if (!currentlySelecting) {
        $('.hover').removeClass('hover')
      }
    });
    uncloak();
  }
});

//////////////////////////////////////PROTOTYPE MODIFICATIONS/////////////////////////////

Array.prototype.itemAt = Array.prototype.itemAt || function(index) {
  if (index < 0) {
    if (this[this.length+index]) {
      return this[this.length+index];        
    } else {
      return this[this.length-1]
    }
  } else {
    return this[index];
  }
}