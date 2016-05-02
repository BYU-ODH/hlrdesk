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
      $(this).val(new Date(new Date().setHours(0,0,0,0)).toISOString().substring(0,10));
      selectedDate = new Date().setHours(0,0,0,0);
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
        displayEditor($(this));
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
          displayCreator(selectedCells.itemAt(0))
        }
      }
    });
  }
  changeGridTo('studyRooms');

  function displayCreator(cell) {
    var prompt = $('#eventCreator');
    prompt.css('left', '33%');
    prompt.css('top', '33%');
    prompt.show();
    creatorText(cell);

    $('#eventCreator header').mousedown(function(e){
      drag(e, $(this).parent())
    });

    cloak('');

    $('#creatorSave').click(function() {
      alert("This doesn't do anything yet!")
    });

    $('#creatorClose').click(function() {
      selectedCells.length = 0;
      clearSelection();
    });

    function creatorText(startCell) {
      if (startCell.data('day')) {
        var dayValOf = {'monday':0, 'tuesday':1, 'wednesday':2, 'thursday':3, 'friday':4, 'saturday':5}
        $('#creatorDate').text(new Date(new Date(displayedDate).setHours(24)+(86400000*dayValOf[selectedCells[0].data('day')])).toDateString());
      } else {
        var dateOfEvent = new Date(new Date(displayedDate).setHours(24));
        $('#creatorDate').text(dateOfEvent.toDateString());
      }

      function getAvailableBlock(firstCell, duration) {
        if (!duration) {duration = 22}
        var cellsInColumn = firstCell.data('room') ? $('[data-room="'+firstCell.data('room')+'"]') : $('[data-day="'+firstCell.data('day')+'"]');
        var newSelection = [];
        for (var i = 0; i < cellsInColumn.length; i++) {
          if (Number(cellsInColumn[i].dataset.time) >= firstCell.data('time')) {
            if (!cellsInColumn[i].classList.contains('booked') && Number(cellsInColumn[i].dataset.time) - Number(firstCell.data('time')) < duration) {
              newSelection.push($('#'+cellsInColumn[i].id.replace('.','\\.')));
            } else {
              break;
            }
          }
        }
        return newSelection;
      }
      $('#creatorDurationSelect').empty();
      for (var i = 0, value = 0.5; i < getAvailableBlock(startCell).length; i++, value = value+0.5) {
        $('#creatorDurationSelect').append($('<option>', {'value': value, 'text': value}));
      }
      $('#creatorDurationSelect').val(selectedCells.length/2);
      $('#creatorDurationSelect').change(function() {
        $('td').removeClass('hover');
        $('th').removeClass('hover');
        selectedCells = getAvailableBlock(startCell, $(this).val());
        for (c in selectedCells) {
          if (selectedCells.hasOwnProperty(c)) {
            var cell = selectedCells[c];
            cell.addClass('hover');
            cell.parent().children('th').addClass('hover')
         }
        }
        var endTime = Number(selectedCells.itemAt(-1).data('time')+0.5);
        var endTimeReadable = (Math.floor(endTime<=13?endTime:endTime-12))+(endTime%1==0?':00':':30')+' '+(endTime<12?'AM':'PM');
        $('#creatorTime').text('From '+selectedCells.itemAt(0).data('timereadable')+' to '+endTimeReadable);
      });
      
      var endTime = Number(selectedCells.itemAt(-1).data('time')+0.5);
      var endTimeReadable = (Math.floor(endTime<=13?endTime:endTime-12))+(endTime%1==0?':00':':30')+' '+(endTime<12?'AM':'PM');
      $('#creatorTime').text('From '+selectedCells.itemAt(0).data('timereadable')+' to '+endTimeReadable);
    
      if (selectedCells[0].data('room')) {
        $('#creatorRoom').text('In '+selectedCells.itemAt(0).data('room'));
      } else {
        $('#creatorRoom').text('In the '+$('#roomsSelector').val());
      }

      $('#overseerNetid').hide();
      $('#clientIsOverseer').click(function() {
        if ($(this).prop('checked')) {
          $('#overseerNetid').show();
        } else {
          $('#overseerNetid').hide();
        }
      })
    }

  }

  function displayEditor(cell) {
    var firstCell = cell.data('cells')[0];
    for (var i = 0; i < currentEvents.length; i++) {
      if (currentEvents[i].id == cell.data('event')) {
        var cellEvent = currentEvents[i];
        break;
      }
    }

    $('#eventEditor header').mousedown(function(e){
      drag(e, $(this).parent())
    });

    cloak('');

    var sharedEventCells = cell.data('cells');
    for (var i = 0; i < sharedEventCells.length; i++) {
      sharedEventCells[i].addClass('hover')
    }

    var prompt = $('#eventEditor').show();
    prompt.css('left', '33%');
    prompt.css('top', '33%');

    $('#editorDate').text('On '+new Date(new Date(cellEvent.date).setHours(24)).toDateString());

    $('#editorDurationSelect').empty();
    for (var i = 0, value = 0.5; i < getAvailableBlock(firstCell).length; i++, value = value+0.5) {
      $('#editorDurationSelect').append($('<option>', {'value': value, 'text': value}));
    }
    $('#editorDurationSelect').val(sharedEventCells.length/2)
    $('#editorDurationSelect').change(function() {
      $('td').removeClass('hover');
      $('th').removeClass('hover');
      selectedCells = getAvailableBlock(firstCell, $(this).val());
      highlightSelection(selectedCells);
      editorText($(this).val());
    });

    $('#editorTime').val(firstCell.data('time'));
    $('#editorTime > option').each(function() {
      $(this).removeAttr('disabled');
      var cellColumn = cell.attr('id').substring(0, cell.attr('id').indexOf('-'));
      var c = $('#'+cellColumn+'-'+$(this).val().replace('.','\\.'));
      if (c.hasClass('booked') && c.data('event') !== cell.data('event')) {
        $(this).attr('disabled', 'disabled');
      }
    });
    $('#editorTime').change(function() {
      var cellColumn = cell.attr('id').substring(0, cell.attr('id').indexOf('-'));
      firstCell = $('#'+cellColumn+'-'+$(this).val().replace('.','\\.'));
      selectedCells = getAvailableBlock(firstCell, $('#editorDurationSelect').val());
      $('#editorDurationSelect').empty();
      for (var i = 0, value = 0.5; i < getAvailableBlock(firstCell).length; i++, value = value+0.5) {
        $('#editorDurationSelect').append($('<option>', {'value': value, 'text': value}));
      }
      $('#editorDurationSelect').val(selectedCells.length/2)
      $('td').removeClass('hover');
      $('th').removeClass('hover');
      highlightSelection(selectedCells);
    });

    $('#editorEventName').val(cellEvent.name);

    function highlightSelection(cells) {
      for (c in selectedCells) {
        if (selectedCells.hasOwnProperty(c)) {
          var cell = selectedCells[c];
          cell.addClass('hover');
          cell.parent().children('th').addClass('hover')
        }
      }
    }

    function editorText(duration) {
      var endTime = getAvailableBlock(firstCell).itemAt(Number(duration*2)-1).data('time')+0.5;
      var endTimeReadable = (Math.floor(endTime<=13?endTime:endTime-12))+(endTime%1==0?':00':':30')+' '+(endTime<12?'AM':'PM');
      $('#editorEndTime').text(endTimeReadable)
    }

    function getAvailableBlock(cell, duration) {
      if (!duration) {duration = 22}
      var cellsInColumn = cell.data('room') ? $('[data-room="'+cell.data('room')+'"]') : $('[data-day="'+cell.data('day')+'"]');
      var availableSlots = [];
      for (var i = 0; i < cellsInColumn.length; i++) {
        var c = $('#'+cellsInColumn[i].id.replace('.', '\\.'));
        if (Number(c.data('time')) >= Number(cell.data('time'))) {
         if ((!c.hasClass('booked') || c.data('event') == cell.data('event')) && Number(c.data('time')) - Number(firstCell.data('time')) < duration) {
            availableSlots.push(c);
          } else {
            break;
          }
        }
      }
      return availableSlots;
    }

    $('#editorSave').click(function() {
      alert("This doesn't do anything yet!")
    });

    $('#editorClose').click(function() {
      selectedCells.length = 0;
      clearSelection();
    });
  }

  function clearSelection() {
    $('td').removeClass('hover');
    $('th').removeClass('hover');
    $('#eventCreator').hide();
    $('#eventEditor').hide();
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
      var sharedEventCells = cell.data('cells');
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

      $(this).data('cells', sharedEventCells);
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

      $(this).data('cells', sharedEventCells);
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
    //currentEvents.length = 0; TODO: This needs to reset. Where should that be done?
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
