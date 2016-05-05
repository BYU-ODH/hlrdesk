window.HLRDESK.init.editCatalog = function() {
    var socket = window.io();
    var origCall;
    var oldItem;
    var type;

    document.getElementById('newItem').addEventListener('click', addItem);

    function reserveAlert(){
      if (document.getElementById('onReserve').checked == true)
      {
        alert("Because this is a reserve item, make sure to include the owner of the reserve item in the desctiption and the date to return the item to the owner in the notes section");
        $('#notes').attr('required', 'required');
      }
    }

    function addItem()
    {
      var newItem = document.getElementById('editItem');
      openModal = window.patternlibrary.displayModal(newItem);
      type = 'inv.create';
      $('#quantity').val(1);
      $('#quantity').attr('placeholder', 1);
      document.getElementById('headText').textContent='Add Item';
      $('#checkoutLength').val(1);
      $('#checkoutLength').attr('placeholder', 1);
      document.getElementById('onReserve').addEventListener('change', reserveAlert);
      document.getElementById('delete-item').addEventListener('click', deleteItem);
      document.getElementById('save-item').addEventListener('click', updateDatabase);
    }
    function deleteItem()
    {
      var delInfo = {origCall, token: window.HLRDESK.token}
      socket.emit('deleteItem', delInfo);
    }
    function updateDatabase(){
      var newCall = $('#callNumber').val();
      var title = $('#title').val();
      var icn = $('#icn').val()
      var media = $('#media').val();
      var languages = $('#language').val();
      var quantity = parseInt($('#quantity').val(),10);
      var checkout_period = parseInt($('#checkoutLength').val(),10);
      var is_reserve = document.getElementById('onReserve').checked;
      var on_hummedia = document.getElementById('HLROnline').checked;
      var is_duplicatable = document.getElementById('duplicatable').checked;
      var notes = $('#notes').val();
      var edited = {
        data: {
          call: origCall,
          newCall,
          title,
          icn,
          media,
          languages,
          quantity,
          checkout_period,
          is_reserve,
          on_hummedia,
          is_duplicatable,
          notes
        },
        token: window.HLRDESK.token
      };

      socket.emit(type, edited);
    }


  socket.on('inv.info', function(result){
    type = 'inv.update';
    origCall = result.call;
    $('#callNumber').val(result.call);
    $('#callNumber').attr('placeholder', result.call);

    $('#quantity').val(result.quantity);
    $('#quantity').attr('placeholder', result.quantity);

    $('#language').val(result.languages);
    $('#media').val(result.media);

    $('#title').val(result.title);
    $('#title').attr('placeholder', result.title);

    $('#icn').val(result.icn);
    $('#icn').attr('placeholder', result.icn);
    
    $('#checkoutLength').val(result.checkout_period);
    $('#checkoutLength').attr('placeholder', result.checkout_period);

    $('#onReserve').attr('checked', result.is_reserve);

    $('#duplicatable').attr('checked', result.is_duplicatable);

    $('#HLROnline').attr('checked', result.on_hummedia);

    if(result.date_added) {
      var date = result.date_added.substring(0,10);
    }

    $('#dateAdded').text(date);

    $('#editedBy').text(result.edited_by);

    if ($('#editedBy').text())
    {
      if(result.date_edited)
      {
        var edited = result.date_edited.substring(0,10);
        $('#dateEdited').attr('type', 'date');
        $('#dateEdited').text(edited);
      }
    }
    else{
      $('#dateEdited').text(" N/A");
      $('#editedBy').text(" N/A");
     }

    $('#notes').val(result.notes);
    $('#notes').attr('placeholder', result.notes);
    oldItem =
    {
      quant: result.quantity,
      titl: result.title,
      reserv: result.is_reserve,
      dup: result.is_duplicatable,
      hum: result.on_hummedia,
      notes: result.notes
    };
  });

  window.HLRDESK.plugins.search({
    search: '#editCatalog-search',
    language: '#editCatalog-language',
    media: '#editCatalog-media',
    results: '#editCatalog-search-results',
    hideCheckedOut: false,
    clickCallback: function()
    {
      var item = this;
      var item = { "callNum":this.dataset.call, token: window.HLRDESK.token }
      socket.emit('inv.get', item);
      var editItem = document.getElementById('editItem');
      openModal = window.patternlibrary.displayModal(editItem);
      document.getElementById('onReserve').addEventListener('change', reserveAlert);
      document.getElementById('delete-item').addEventListener('click', deleteItem);
      document.getElementById('save-item').addEventListener('click', updateDatabase);
    }
  });

  socket.on('alertMessage', function(alertMsg){
    alert(alertMsg);
  });

}
