/*NOTES
 *While this calendar does function, it is not free of bugs
 *Namely, it is possible to have overlapping reservations
 *The CSS could also use some revision
*/

$(document).ready(function(){
  $('.room').mouseover(function(){
    var roomColumn = $(this);
    var roomNum = roomColumn[0].textContent.substring(0, roomColumn[0].textContent.indexOf(" "));
    var roomInfo = $('#'+roomNum);
    roomInfo.removeClass('hidden')
    roomInfo.css('left', (roomColumn[0].offsetParent.offsetLeft + roomColumn[0].offsetLeft)+'px');
    roomInfo.css('top', (roomColumn[0].offsetParent.offsetTop + roomColumn[0].offsetHeight)+'px');
    roomInfo.addClass('show');
  })
  $('.room').mouseleave(function(){
    var roomColumn = $(this);
    var roomNum = roomColumn[0].textContent.substring(0, roomColumn[0].textContent.indexOf(" "));
    var roomInfo = $('#'+roomNum);
    roomInfo.removeClass('show');git 
    roomInfo.on('transitionend', function() {
      if (!roomInfo.hasClass('show')) {
        roomInfo.addClass('hidden');
      }
    })
  });
});

/*(function(){

var events = window.allEvents.rows;

var socket = io();

var selectedTime;
var selectedDate;
var selectedRoom;
var eventTitle;

var weekDiff = 0;
window.now = new Date(window.now);
var cellDate = window.now;
var displayedDate = window.now.toDateString();
var days = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var currentView = "week";

if (window.isAdmin){
  $("#requestButton" ).hide();
}
else{
  $("#saveButton").hide();
}

document.getElementById("resourceSelect").addEventListener("change", function() {changeResource()});
document.getElementById("displayRoomSelect").addEventListener("change", function(event) {updateGrid();});
if (document.getElementById("displayCheckbox")) {document.getElementById("displayCheckbox").addEventListener("change", function(){updateGrid();});}
document.getElementById("dateSelect").addEventListener("change", function(event) {selectCell();});
document.getElementById("timeSelect").addEventListener("change", function(event) {selectCell();});
document.getElementById("roomSelect").addEventListener("change", function(event) {selectCell(); document.getElementById("displayRoomSelect").selectedIndex = document.getElementById("roomSelect").selectedIndex; updateGrid();});
document.getElementById("durationSelect").addEventListener("change", function(event) {selectCell();});
document.getElementById("forwardBtn").addEventListener("click", function() {changeWeek(1);});
document.getElementById("backBtn").addEventListener("click", function() {changeWeek(-1);});
document.getElementById("switchView").addEventListener("click", function() {changeView();});
document.getElementById("previousDay").addEventListener("click", function() {changeDay(-1);});
document.getElementById("nextDay").addEventListener("click", function() {changeDay(1);});
document.getElementById("saveButton").addEventListener("click", function() {submit();});
document.getElementById("deleteButton").addEventListener("click", function() {cancel();});
document.getElementById("requestButton").addEventListener("click", function() {submit();});

function updateGrid() {

  //initially marks all cells as enabled
  var cells = document.querySelectorAll(((currentView === "week") ? "#weekView":"#dayView")+" td");
  for (var i = 0; i < cells.length; i++) {
    markCellAsEnabled(cells[i]);
  }

  //marks all reserved cells
  if (currentView === "week") {
    for (var i = 0; i < events.length; i++) { //marks reservations
      if (document.getElementById(days[new Date(events[i].time).getDay()]+" "+new Date(events[i].time).getHours()) && document.getElementById(new Date(events[i].time).toDateString()) && events[i].room === document.getElementById("displayRoomSelect").value) {
        if (window.isAdmin && !events[i].confirmed) {
          if (document.getElementById("displayCheckbox").checked) {
            markCell(events[i]);
          }
        } else {
          markCell(events[i]);
        }
      }
    }
    for (var day = 1; weekDiff === 0 && day <= window.now.getDay(); day++) { //disables all past cells
      for (var hour = 8; hour <= 20 && (day < window.now.getDay() || (day === window.now.getDay() && hour < window.now.getHours())); hour++) {
        markCellAsDisabled(document.getElementById(days[day]+" "+hour));
      }
    }
  } else if (currentView === "day") {
    for (var i = 0; i < events.length; i++) {
      if (document.getElementById(events[i].room+" "+new Date(events[i].time).getHours()) && new Date(events[i].time).toDateString() === displayedDate) {
        if (window.isAdmin && !events[i].confirmed) {
          if (document.getElementById("displayCheckbox").checked) {
            markCell(events[i]);
          }
        } else {
          markCell(events[i]);
        }
      }
    }  
    for (var i = 0; i < document.getElementById("displayRoomSelect").options.length; i++) { //disables all past cells
      for (var hour = 8; hour <= 20 && (displayedDate === new Date(window.now).toDateString() && hour < window.now.getHours()); hour++) {
        markCellAsDisabled(document.getElementById(document.getElementById("displayRoomSelect").options[i].value+" "+hour));
      }
    }
  }

  function markCell(event) {
    var firstFieldOfCellId = (currentView === "week") ? days[new Date(event.time).getDay()] : event.room;
    if (event.confirmed === false) {
      markCellAs(document.getElementById(firstFieldOfCellId+" "+new Date(event.time).getHours()), event, "pending");
    } else {
      if (window.userName === event.user || window.isAdmin === true) {
        markCellAs(document.getElementById(firstFieldOfCellId+" "+new Date(event.time).getHours()), event, "bookedByUser");
      } else {
        markCellAs(document.getElementById(firstFieldOfCellId+" "+new Date(event.time).getHours()), event, "requested");
      }
    }
  }

}
updateGrid();
if (now.getHours() >= 21 && now.getDay() == 6) {changeWeek(1);}

function changeResource(event) {
  document.getElementById("popup").classList.add("hidden");
  deselectCells();
  document.getElementById("displayRoomSelect").options.length = 0;
  document.getElementById("roomSelect").options.length = 0;
  switch (document.getElementById("resourceSelect").value) {
    case "HLRC":
      for (var i = 0; i < window.rooms.HLRC.length; i++) {
        var option = document.createElement("option");
        option.text = window.rooms.HLRC[i];
        document.getElementById("displayRoomSelect").add(option);
        document.getElementById("roomSelect").add(document.getElementById("displayRoomSelect").options[i].cloneNode(true));
        document.getElementById("dayGrid").innerHTML = document.getElementById("dayViewHLRC").innerHTML;
        updateGrid();
      }
      break;
    case "HTRSC":
      for (var i = 0; i < window.rooms.HTRSC.length; i++) {
        var option = document.createElement("option");
        option.text = window.rooms.HTRSC[i];
        document.getElementById("displayRoomSelect").add(option);
        document.getElementById("roomSelect").add(document.getElementById("displayRoomSelect").options[i].cloneNode(true));
        document.getElementById("dayGrid").innerHTML = document.getElementById("dayViewHTRSC").innerHTML;
        updateGrid();
      }
      break;
  }
}

function markCellAs(cell, event, cellClass) {
  var firstFieldOfCellId = (currentView === "week") ? days[cell.dataset.day] : cell.dataset.room;
  switch (event.duration) {
    case 1:
      cells = [cell];
      break;
    case 2:
      cells = [cell, document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)+1))];
      break;
    case 3:
      cells = [cell, document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)+1)), document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)+2))];
      break;
  }
  for (var i = 0; i < cells.length; i++) {
    cells[i].className = "";
    switch (i) {
      case 0:
        if (i !== cells.length-1) {
          cells[i].classList.add("topBox");
        }
        cells[i].innerHTML = event.title+" - "+event.user;
        break;
      case 1:
        if (i === cells.length-1) {
          cells[i].classList.add("bottomBox");
        } else {
          cells[i].classList.add("middleBox");
        }
        break;
      case 2:
        cells[i].classList.add("bottomBox");
        break;
    }
    switch (cellClass) {
      case "pending":
        cells[i].classList.add("pending");
        cells[i].removeEventListener("click", clickCell);
        cells[i].addEventListener("mouseover", highlight);
        cells[i].addEventListener("mouseleave", unhighlight);
        if (window.isAdmin) {
          cells[i].removeEventListener("click", deleteCell);
          cells[i].addEventListener("click", processRequest);
        } else {
          cells[i].removeEventListener("click", processRequest);
          cells[i].addEventListener("click", deleteCell);
        }
        break;
      case "bookedByUser":
        cells[i].classList.add("bookedByUser");
        cells[i].removeEventListener("click", clickCell);
        cells[i].addEventListener("mouseover", highlight);
        cells[i].addEventListener("mouseleave", unhighlight);
        cells[i].addEventListener("click", deleteCell);
        break;
      case "requested":
        cell.removeEventListener("click", clickCell);
        cells[i].classList.add("requested");
        break;
    }
  }
}

function markCellAsDisabled(cell) {
  cell.className = "";
  cell.classList.add("disabled");
  cell.removeEventListener("mouseover", highlight);
  cell.removeEventListener("click", deleteCell);
  cell.removeEventListener("click", clickCell);
  cell.removeEventListener("click", processRequest);
  cell.innerHTML = "";
}
function markCellAsEnabled(cell) {
  cell.removeEventListener("click", deleteCell);
  cell.className = "";
  cell.removeEventListener("mouseover", highlight);
  cell.removeEventListener("click", processRequest);
  cell.classList.add("enabled");
  cell.addEventListener("click", clickCell);
  cell.innerHTML = "";
}


function highlight(event) {
  var cell = event.target;
  var firstFieldOfCellId = (currentView === "week") ? days[cell.dataset.day] : cell.dataset.room;
  if (cell.classList.contains("topBox")) {
    cell.classList.add("highlight");
    document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)+1)).classList.add("highlight");
    if (document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)+1)).classList.contains("middleBox")) {
      document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)+2)).classList.add("highlight");
    }
  } else if (cell.classList.contains("middleBox")) {
    document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)-1)).classList.add("highlight");
    cell.classList.add("highlight");
    document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)+1)).classList.add("highlight");
  } else if (cell.classList.contains("bottomBox")) {
    if (document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)-1)).classList.contains("middleBox")) {
      document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)-2)).classList.add("highlight");
    }
    document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)-1)).classList.add("highlight");
    cell.classList.add("highlight");
  } else {
    cell.classList.add("highlight");
  }
}
function unhighlight(event) {
  var cell = event.target;
  var firstFieldOfCellId = (currentView === "week") ? days[cell.dataset.day] : cell.dataset.room;
  if (cell.classList.contains("topBox")) {
    cell.classList.remove("highlight");
    document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)+1)).classList.remove("highlight");
    if (document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)+1)).classList.contains("middleBox")) {
      document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)+2)).classList.remove("highlight");
    }
  } else if (cell.classList.contains("middleBox")) {
    document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)-1)).classList.remove("highlight");
    cell.classList.remove("highlight");
    document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)+1)).classList.remove("highlight");
  } else if (cell.classList.contains("bottomBox")) {
    if (document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)-1)).classList.contains("middleBox")) {
      document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)-2)).classList.remove("highlight");
    }
    document.getElementById(firstFieldOfCellId+" "+(Number(cell.dataset.time)-1)).classList.remove("highlight");
    cell.classList.remove("highlight");
  } else {
    cell.classList.remove("highlight");
  }
}

function deselectCells() {
  while (document.getElementsByClassName("selected").length > 0) {
    document.getElementsByClassName("selected")[0].classList.remove("topBox");
    document.getElementsByClassName("selected")[0].classList.remove("middleBox");
    document.getElementsByClassName("selected")[0].classList.remove("bottomBox");
    document.getElementsByClassName("selected")[0].classList.remove("selected");
  }
}

function selectCells(cell, duration) {
  for (var i = 1; i <= Number(document.getElementById("durationSelect").value); i++) { //marks cell(s) as selected
    if (document.getElementById((currentView === "week" ? days[cell.dataset.day] : cell.dataset.room)+" "+(Number(cell.dataset.time)+(i-1))) && document.getElementById((currentView === "week" ? days[cell.dataset.day] : cell.dataset.room)+" "+(Number(cell.dataset.time)+(i-1))).classList.contains("enabled")) {
      document.getElementById((currentView === "week" ? days[cell.dataset.day] : cell.dataset.room)+" "+(Number(cell.dataset.time)+(i-1))).classList.add("selected");
    } else {
      document.getElementById("durationSelect").selectedIndex--;
      duration--;
      i--;
    }
  }
  switch (duration) {
    case 1:
      document.getElementById((currentView === "week" ? days[cell.dataset.day] : cell.dataset.room)+" "+(Number(cell.dataset.time))).classList.add("topBox");
      document.getElementById((currentView === "week" ? days[cell.dataset.day] : cell.dataset.room)+" "+(Number(cell.dataset.time)+1)).classList.add("bottomBox");
      break;
    case 2:
      document.getElementById((currentView === "week" ? days[cell.dataset.day] : cell.dataset.room)+" "+(Number(cell.dataset.time))).classList.add("topBox");
      document.getElementById((currentView === "week" ? days[cell.dataset.day] : cell.dataset.room)+" "+(Number(cell.dataset.time)+1)).classList.add("middleBox");
      document.getElementById((currentView === "week" ? days[cell.dataset.day] : cell.dataset.room)+" "+(Number(cell.dataset.time)+2)).classList.add("bottomBox");
      break;
  }
}

function clickCell(event) { //places the popup box
  var cell = event.target ? event.target : event;

  while (!cell.classList.contains("enabled") && !cell.classList.contains("selected")) { //places popup box at latest available time
    if (document.getElementById((currentView === "week" ? days[cell.dataset.day] : cell.dataset.room)+" "+(Number(cell.dataset.time)+1))) {
      cell = document.getElementById((currentView === "week" ? days[cell.dataset.day] : cell.dataset.room)+" "+(Number(cell.dataset.time)+1));
    } else {
      cell = null;
      document.getElementById("popup").classList.add("hidden");
      alert("Sorry, the requested time slot is not available. Please select a different time or room.")
      break;
    }
  }

  deselectCells();

  selectCells(cell, document.getElementById("durationSelect").selectedIndex);

  placePopup(cell);
}

function placePopup(cell) {

  document.getElementById("popup").classList.remove("hidden");
  document.getElementById("popup").style.left = 'calc('+(cell.offsetLeft.toString()-((document.getElementById("popup").offsetWidth-cell.offsetWidth)/2))+"px + 1em"+')';

  if (document.getElementById("weekView").offsetTop + cell.offsetTop - document.getElementById("popup").offsetHeight >= 0) { //places the popup box either above or beneath the selected cell
    document.getElementById("popup").style.top = 'calc('+(document.getElementById(currentView+"View").offsetTop + cell.offsetTop - document.getElementById("popup").offsetHeight)+"px + 3em"+')';
    document.getElementById("popup").classList.remove("under");
  } else {
    document.getElementById("popup").style.top = 'calc('+(document.getElementById(currentView+"View").offsetTop + cell.offsetTop + cell.offsetHeight)+"px + 3em + 1.7em"+')';
    document.getElementById("popup").classList.add("under");
  }

  for (var i = 0; i < document.getElementById("dateSelect").length; i++) { //selects right date
   if (new Date(document.getElementById("dateSelect").options[i].value).toDateString() == new Date((currentView === "week") ? new Date(new Date().setDate(window.now.getDate()+7*weekDiff+(cell.dataset.day-window.now.getDay()))) : cellDate = new Date(displayedDate)).toDateString()) {
      document.getElementById("dateSelect").selectedIndex = i;
      break;
    }
  }

  for (var i = 8; i <= 20; i++) {  //selects right time
    document.getElementById("timeSelect").options[i-8].disabled = false;
    if (document.getElementById("dateSelect").value === window.now.toDateString() &&window.now.getHours() > i) {
      document.getElementById("timeSelect").options[i-8].disabled = true;
    }
  }
  document.getElementById("timeSelect").selectedIndex = cell.dataset.time-8;

  if (currentView === "day") { //selects right room
    for (var i = 0; i < document.getElementById("roomSelect").options.length; i++) {
      if (document.getElementById("roomSelect").options[i].value == cell.dataset.room) {
        document.getElementById("roomSelect").selectedIndex = i;
        break;
      }
    }
  }

}

function selectCell() { //changes week/day if necessary and selects cell
  deselectCells();
  if (currentView == "week") {
    if (new Date(document.getElementById("dateSelect").value) >  new Date(document.getElementsByClassName("day")[5].id)) {
      do {changeWeek(1)} while (new Date(document.getElementById("dateSelect").value) >  new Date(document.getElementsByClassName("day")[5].id));
    } else if (new Date(document.getElementById("dateSelect").value) <  new Date(document.getElementsByClassName("day")[0].id)) {
      do {changeWeek(-1)} while (new Date(document.getElementById("dateSelect").value) <  new Date(document.getElementsByClassName("day")[0].id));
    }
    clickCell(document.getElementById(days[new Date(document.getElementById("dateSelect").value).getDay()]+" "+(document.getElementById("timeSelect").selectedIndex+8)));
  } else if (currentView == "day") {
    if (new Date(document.getElementById("dateSelect").value).toDateString() != displayedDate) {
      changeDay((new Date(document.getElementById("dateSelect").value).getTime() - new Date(displayedDate).getTime())/86400000);
    }
    clickCell(document.getElementById(document.getElementById("roomSelect").value+" "+(document.getElementById("timeSelect").selectedIndex+8)));
  }
}

function changeWeek(direction) {
  document.getElementById("popup").classList.add("hidden");
  weekDiff = weekDiff+direction;
  var tableDays = document.getElementsByClassName("day");
  for (var i = 0; i <= 5; i++) {
    tableDays[i].innerHTML = days[i+1] +" "+ (new Date(new Date(tableDays[i].id).getTime() + 604800000*direction).getDate()).toString();
    tableDays[i].id = new Date(new Date(tableDays[i].id).getTime() + 604800000*direction).toDateString();
  }
  updateGrid();
  document.getElementById("backBtn").disabled = (weekDiff === 0) ? true : false;
  document.getElementById("forwardBtn").disabled = (weekDiff >= 2) ? true : false;
  document.getElementById("backBtn").className = document.getElementById("backBtn").disabled ? "disabledBtn" : "mainBtn";
  document.getElementById("forwardBtn").className = document.getElementById("forwardBtn").disabled ? "disabledBtn" : "mainBtn";
}

function changeDay(direction) {
  document.getElementById("popup").classList.add("hidden");
  displayedDate = new Date(new Date(displayedDate).getTime() + 86400000*direction).toDateString();
  if (new Date(displayedDate).getDay() === 0) {displayedDate = new Date(new Date(displayedDate).getTime() + 86400000*direction).toDateString()}
  document.getElementById("date").innerHTML = displayedDate;
  updateGrid();
  document.getElementById("previousDay").disabled = (displayedDate === window.now.toDateString()) ? true : false;
  document.getElementById("nextDay").disabled =  (new Date(displayedDate).getTime() - 1209600000 >= window.now.getTime()) ? true : false;
  document.getElementById("previousDay").className = document.getElementById("previousDay").disabled ? "disabledBtn" : "mainBtn";
  document.getElementById("nextDay").className = document.getElementById("nextDay").disabled ? "disabledBtn" : "mainBtn";
  selectedDay = displayedDate;
}

function changeView() {
  document.getElementById("popup").classList.add("hidden");
  if (currentView === "week") {
    document.getElementById("weekView").classList.toggle("hidden");
    document.getElementById("dayView").classList.toggle("hidden");
    if (document.getElementById("resourceSelect").value === "HLRC") {
      document.getElementById("dayGrid").innerHTML = document.getElementById("dayViewHLRC").innerHTML;
    } else if (document.getElementById("resourceSelect").value === "HTRSC") {
      document.getElementById("dayGrid").innerHTML = document.getElementById("dayViewHTRSC").innerHTML;
    }
    currentView = "day";
  } else if (currentView === "day") {
    document.getElementById("weekView").classList.toggle("hidden");
    document.getElementById("dayView").classList.toggle("hidden");
    currentView = "week";
  }
  deselectCells();
  updateGrid();
}

socket.on("calendar event", function(eventsArray, eventSubmittedBy){
  events = eventsArray;
  if (eventSubmittedBy !== window.userName) {
    if (document.getElementsByClassName("selected").length > 0) {
      var selectedCells = [];
      for (var i = 0; i <= document.getElementById("durationSelect").selectedIndex; i++) {
        selectedCells.push(document.getElementsByClassName("selected")[i]);
        updateGrid();
        selectCells(selectedCells[0], selectedCells.length-1);
      }
    } else {
      updateGrid();
    }
  } else {
    document.getElementById("popup").classList.add("hidden");
    updateGrid();
  }
  
});

socket.on("calendar overlap", function(event){
  alert("Sorry, but this time slot is not available");
});

function deleteCell(event, bypassPrompt) {
  if (!bypassPrompt) {
    closeModal = window.patternlibrary.displayModal(document.getElementById("prompt"));
    document.getElementById("promptTitle").innerHTML = "Confirm Deletion";
    document.getElementById("promptText").innerHTML = "Are you sure you wish to delete this "+(event.target.classList.contains("requested") ? "request?" : "reservation?");
    document.getElementById("promptYes").innerHTML = "Yes";
    document.getElementById("promptNo").innerHTML = "No";
    document.getElementById("promptYes").addEventListener("click", function yes() {
      closeModal();
      deleteEvent(event);
    });
    document.getElementById("promptNo").addEventListener("click", function no() {
      closeModal();
    });
  } else {
    deleteEvent(event);
  }
  function deleteEvent(event) {
    cell = event.target;
    if (cell.classList.contains("middleBox")) {
      cell = document.getElementById(((currentView === "week") ? days[cell.dataset.day] : cell.dataset.room)+" "+(cell.dataset.time-1));
    } else if (cell.classList.contains("bottomBox")) {
      cell = document.getElementById(((currentView === "week") ? days[cell.dataset.day] : cell.dataset.room)+" "+((cell.dataset.time)-((document.getElementById(((currentView === "week") ? days[cell.dataset.day] : cell.dataset.room)+" "+(cell.dataset.time-1)).classList.contains("topBox")) ? 1 : 2)));
    }
    if (cell.classList.contains("requested") || cell.classList.contains("bookedByUser")) {
      var confirmed = true;
    } else {
      var confirmed = false;
    }
    eventDate = new Date((currentView === "week") ? new Date(new Date().setDate(window.now.getDate()+7*weekDiff+(cell.dataset.day-window.now.getDay()))) : cellDate = new Date(displayedDate)).toDateString();
    eventTime = new Date(new Date(eventDate).setHours(cell.dataset.time)).toLocaleString();
    socket.emit('delete calendar event', {"token": window.HLRDESK.token, "room":(currentView === "week" ? document.getElementById("displayRoomSelect").value : cell.dataset.room), "time":eventTime, "user":window.userName, "confirmed": confirmed, "submittedBy":window.userName});
  }
}

function processRequest(event) {
  closeModal = window.patternlibrary.displayModal(document.getElementById("prompt"));
  document.getElementById("promptTitle").innerHTML = "Confirm Request";
  document.getElementById("promptText").innerHTML = "Do you wish to confirm or delete this request?";
  document.getElementById("promptYes").innerHTML = "Confirm";
  document.getElementById("promptNo").innerHTML = "Delete";
  document.getElementById("promptYes").addEventListener("click", function yes() {
    closeModal();
    var cell = event.target;
      for (var i = 0; i < events.length; i++) {
        if ((currentView === "week" ? cell.dataset.day : new Date(displayedDate).getDay()) == new Date(events[i].time).getDay() && cell.dataset.time == new Date(events[i].time).getHours()) {
          events[i].confirmed = true;
          events[i].time = new Date(new Date(events[i].time).setHours(cell.dataset.time)).toLocaleString();
          submit(events[i]);
          break;
        }
      }
  });
  document.getElementById("promptNo").addEventListener("click", function no() {
    closeModal();
    deleteCell(event, true);
  });
}

function submit(event) {
  if (!event) {
    eventTitle = document.getElementById("nameInput").value;
    eventTime = new Date(document.getElementById("dateSelect").value+" "+Number(document.getElementById("timeSelect").value)+":00:00").toLocaleString();
    selectedRoom = document.getElementById("roomSelect").value;
    selectedDuration = Number(document.getElementById("durationSelect").value);
    if (document.getElementById("userInput")) {
      var user = document.getElementById("userInput").value;
    } else {
      var user = window.userName;
    }
    socket.emit('calendar event', {"token": window.HLRDESK.token, "user":user, "time":eventTime, "room":selectedRoom, "duration":selectedDuration, "title":eventTitle, "confirmed":window.isAdmin, "submittedBy":window.userName});
  } else {
    event.token = window.HLRDESK.token;
    event.submittedBy = window.userName;
    socket.emit('calendar event', event);
  }
 }

function cancel() {
  document.getElementById("popup").classList.add("hidden");
  deselectCells();
  updateGrid();
}

})();*/