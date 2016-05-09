var socket = io();

$(document).ready(function(){

////////////////////////////////////////FRONTEND//////////////////////////////////////

  var displayedDate = new Date().toISOString().substring(0, 10);
  var currentEvents = [];
  var currentView = 'multiple rooms';
  var selectedCells = [];
  var currentlySelecting = false;

  $('#roomsSelector').on('change', function(){
    var roomTemplateIds = {'Study Rooms':'studyRooms', 'Recording Studio':'recordingStudio', 'FLAC':'flac', 'Other Rooms':'otherRooms'}
    changeGridTo(roomTemplateIds[this.value], displayedDate);
  });
  $('#dateSelector').on('change', function() {
    var selectedDate = new Date($(this).val()).setHours(24);
    if (selectedDate < new Date().setHours(0,0,0,0)) { //disables ability to select previous days by forcing current day
      //$(this).val(new Date(new Date().setHours(0,0,0,0)).toISOString().substring(0,10));
      //selectedDate = new Date().setHours(0,0,0,0);
    } else if (new Date(selectedDate).getDay() === 0) { //disables ability to select sundays by forcing the following monday
      $(this).val(new Date(selectedDate + 86400000).toISOString().substring(0,10));
      selectedDate = new Date($(this).val()).setHours(24);
    }
    if (currentView == 'multiple rooms') {
      displayedDate = $(this).val();
      $('#roomsSelector').trigger('change', [currentView, displayedDate])
    } else {
      var dayDifference = (new Date(selectedDate).getDay()-1)*86400000;
      mondayDate = new Date(selectedDate - dayDifference).toISOString().substring(0,10); //Monday of that week
      if (displayedDate !== mondayDate) {
        displayedDate = mondayDate;
        $('#roomsSelector').trigger('change', [currentView, displayedDate]);
        populateColumnDays(displayedDate);
      }
    }
  });

  function populateColumnDays(mondayDate) {
    var days = $('#daysHeader').children();
    for (var i = 1; i < days.length; i++) {
      var dayColumn = $('#'+days[i].id);
      dateToBeDisplayed = new Date((new Date(displayedDate).setHours(24)+((i-1)*86400000))).toDateString().substring(4, 10).replace(/\s0/, ' ');
      if (dayColumn.text().indexOf(' ') == -1) {
        dayColumn.text(dayColumn.text()+' '+dateToBeDisplayed);
      } else {
        dayColumn.text(dayColumn.text().substring(0, dayColumn.text().indexOf(' '))+' '+dateToBeDisplayed);
      }
    }
  }

  function changeGridTo(view, date) {
    $('#visibleGrid')[0].innerHTML = $('#'+view).html();
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
      getEventsFor(window.rooms[view], date);
    } else if (view == 'recordingStudio' || view == 'flac') {
      currentView = 'single room';

      var selectedDate = new Date($('#dateSelector').val()).setHours(24);
      var dayDifference = (new Date(selectedDate).getDay()-1)*86400000;
      displayedDate = new Date(selectedDate - dayDifference).toISOString().substring(0,10);
      populateColumnDays(displayedDate);

      if (view == 'recordingStudio') {
        getEventsFor(window.rooms[13], date)
      } else if (view == 'flac') {
        getEventsFor(window.rooms[15], date)
      }
    }
    $('td').mousedown(function() {
      if (!$(this).hasClass('booked')) {
        $(this).addClass('hover');
        $(this).parent().children('th').addClass('hover');
        selectedCells.length = 0;
        selectedCells.push($(this));
        currentlySelecting = true;
      } else {
        //displayEditor($(this));
        selectedCells = $(this).data('eventCells');
        displayWindow();
      }
    });
    $('td').mouseover(function(e) {
      //if (e.buttons === 1) {
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
          } else if (thisElementTime > fromElementTime + 0.5) {
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
          //displayCreator(selectedCells.itemAt(0))
          displayWindow(selectedCells.itemAt(0));
        }
      }
    });
  }
  changeGridTo('studyRooms');

  function displayWindow() {
    var firstCell = selectedCells.itemAt(0);
    var cellColumn = firstCell.attr('id').substring(0, firstCell.attr('id').indexOf('-'));
    var prompt = $('#eventWindow');
    prompt.css('left', '33%');
    prompt.css('top', '33%');
    prompt.show();
    cloak('');

    if (firstCell.data('event')) {
      var selectedEvent = firstCell.data('event');
    }
    var duration = selectedCells.length/2;
    var startTime = Number(selectedCells.itemAt(0).data('time'));

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
      $('#eventName').val(cellEvent.name);
    } else {
      var editing = false;
      $('#eventHeader').text('Create Event');
      $('.editing').hide();
      $('.creating').show();
      $('#eventName').val('');
    }

    //Populate Time Options
    $('#eventTime > option').each(function() {
      $(this).removeAttr('disabled');
      var c = $('#'+cellColumn+'-'+$(this).val().replace('.','\\.'));
      if (c.hasClass('booked') && c.data('event') !== selectedCells.itemAt(0).data('event')) {
        $(this).attr('disabled', 'disabled');
      }
    });

    updateStartTime();
    updateDurationSelect();
    updateDuration();
    updateSelection();

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
      if (getAvailableBlock(newFirstCell).length < duration) {
        duration = getAvailableBlock(newFirstCell).length/2;
      }
      selectedCells = getAvailableBlock(newFirstCell, duration);
      updateDurationSelect();
      updateDuration();
      updateSelection();
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
      updateSelection();
    }

    //table cells
    function updateSelection() {
      $('td').removeClass('hover');
      $('th').removeClass('hover');
      selectedCells = getAvailableBlock(firstCell, duration);
      for (c in selectedCells) {
        if (selectedCells.hasOwnProperty(c)) {
          var cell = selectedCells.itemAt(c);
          cell.addClass('hover');
          cell.parent().children('th').addClass('hover')
        }
      }
      console.log(selectedCells)
      var endTime = Number(selectedCells.itemAt(-1).data('time')+0.5);
      var endTimeReadable = (Math.floor(endTime<=13?endTime:endTime-12))+(endTime%1==0?':00':':30')+' '+(endTime<12?'AM':'PM');
      $('#eventEndTime').text(endTimeReadable);
    }

    function getAvailableBlock(firstCell, duration) {
      var cellsInColumn = firstCell.data('room') ? $('[data-room="'+firstCell.data('room')+'"]') : $('[data-day="'+firstCell.data('day')+'"]');
      var newSelection = [];
      for (var i = 0; i < cellsInColumn.length; i++) {
        cellToBeAdded = $('#'+cellsInColumn[i].id.replace('.','\\.'));
        if (cellToBeAdded.data('time') >= firstCell.data('time') && cellToBeAdded.data('time') < firstCell.data('time')+(duration||22)) {
          if (!cellToBeAdded.hasClass('booked') || cellToBeAdded.data('event') == selectedEvent) {//firstCell.data('event')) {
            newSelection.push(cellToBeAdded);
          } else {
            break;
          }
        }
      }
      return newSelection;
    }

    $('#overseerNetid').hide();
    $('#clientIsOverseer').prop('checked', false);
    $('#clientIsOverseer').click(function() {
      if ($(this).prop('checked')) {
        $('#overseerNetid').show();
      } else {
        $('#overseerNetid').hide();
      }
    });

    $('#saveEvent').click(function() {
      alert("This doesn't do anything yet!")
    });

    $('#cancel').click(function() {
      selectedCells.length = 0;
      clearSelection();
    });

  }

  function clearSelection() {
    $('td').removeClass('hover');
    $('th').removeClass('hover');
    $('.window').hide();;
    uncloak();
    $('#roomsSelector').prop('disabled', false);
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
      var sharedEventCells = cell.data('eventCells');
      for (var i = 0; i < sharedEventCells.length; i++) {
        sharedEventCells[i].toggleClass('hover')
      }
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

  function placeEvents(events) { //get this organized into day/week
    /*if (currentView == 'multiple rooms') {
      var column = event.roomNumber;
    } else {
      //var column = event['days_of_week'];
      console.log(event.date)
    }*/
    clearGrid();
    for (var e = 0; e < events.length; e++) {
      var event = events[e];
      var days = {'Monday':1, 'Tuesday':2, 'Wednesday':3, 'Thursday':4, 'Friday':5, 'Saturday':6};
      console.log(event['days_of_week'].split(','));
      event.roomNumber = window.rooms[event.room].location.replace(' ','_');
      var eventStart = Number(event.start_time.substring(0,2))+Number(event.start_time[4]==0?0:0.5)
      var hourDiff = 0;

      var cell = $('#'+event.roomNumber+'-'+String(eventStart+hourDiff).replace('.','\\.'));
      cell.addClass('top')
      cell.text(event.name)
      while (eventStart + hourDiff < Number(event.end_time.substring(0,2))) {
        cell = $('#'+event.roomNumber+'-'+String(eventStart+hourDiff).replace('.','\\.'));
        cell.addClass('booked')
        cell.data('event', event.id)
        hourDiff=hourDiff+0.5;
      }
      cell.addClass('.bottom')

    }
    $('.booked').each(function() {

      var sharedEventCells = [];
      var room = $(this).data('room');
      var event = $(this).data('event');
      $('[data-room="'+room+'"]').each(function() {
        if ($(this).data('event') == event) {
          sharedEventCells.push($(this));
        }
      });

      $(this).data('eventCells', sharedEventCells);
      $(this).mouseover(function() {
        highlightEvent($(this));
      });
    });
    uncloak();
  }

  /*function placeEvents(events) {
    if (currentView == 'multiple rooms') {
      for (var e = 0; e < events.length; e++) {
        var event = events[e];
        event.roomNumber = window.rooms[event.room].location.replace(' ','_');
        var eventStart = Number(event.start_time.substring(0,2))+Number(event.start_time[4]==0?0:0.5)
        var hourDiff = 0;

        var cell = $('#'+event.roomNumber+'-'+String(eventStart+hourDiff).replace('.','\\.'));
        cell.addClass('top')
        cell.text(event.name)
        while (eventStart + hourDiff < Number(event.end_time.substring(0,2))) {
          cell = $('#'+event.roomNumber+'-'+String(eventStart+hourDiff).replace('.','\\.'));
          cell.addClass('booked')
          cell.data('event', event.id)
          hourDiff=hourDiff+0.5;
        }
        cell.addClass('.bottom')

      }
    } else if (currentView == 'single room') {
      for (var e = 0; e < events.length; e++) {
        var event = events[e];

      }
    }
    $('.booked').each(function() {
      var sharedEventCells = [];
      var room = $(this).data('room');
      var event = $(this).data('event');
      $('[data-room="'+room+'"]').each(function() {
        if ($(this).data('event') == event) {
          sharedEventCells.push($(this));
        }
      });

      $(this).data('eventCells', sharedEventCells);
      $(this).mouseover(function() {
        highlightEvent($(this));
      });
      $(this).mouseleave(function() {
        highlightEvent($(this));
      });
    });
  }*/

  function getEventsFor(rooms, date) {
    cloak('Loading...');
    socket.emit('get events', {'user':window.user, 'rooms':rooms, 'date':date, 'token':'ABC123'});
  }
  socket.on('get events', function(events) {
    for (var i = 0; i < events.length; i++) {
      if ('name' in events[i] && events[i].start_time != "21:00:00") {
        currentEvents.push(events[i]);
      }
    }
    placeEvents(currentEvents)
  });
});

//////////////////////////////////////PROTOTYPE MODIFICATIONS/////////////////////////////
if (!Array.prototype.last) {
  Array.prototype.last = function() {
    if (this[this.length-1]) {
      return this[this.length-1];
    } else {
      return this[0];
    }
  }
}

if (!Array.prototype.itemAt) {
  Array.prototype.itemAt = function(index) {
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
}
