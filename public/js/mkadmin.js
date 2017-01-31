window.HLRDESK = window.HLRDESK || {};
window.HLRDESK.init = window.HLRDESK.init || {};

window.HLRDESK.init.mkadmin = function() {
  document.forms.admin_form.onsubmit = function(evt) {
    var name = document.getElementById("admin_name").value;
    if (!confirm('Are you sure you want to make ' + name + ' an admin?')) {
      evt.preventDefault();
    }
  };

function verifyForms() {
    delete_forms = document.querySelectorAll('#admin_list form');
    for(var i = 0; i<delete_forms.length; i++) {
      var form = delete_forms[i];

      form.onsubmit = function(evt) {
        var name = this.querySelector('input[name=user]').value;
        if (!confirm('Are you sure you want to revoke privileges for ' + name + '?')) {
          evt.preventDefault();
        }
      }
    }
  }
  verifyForms();

  $('button.editButton').click(function() {
    openEdit($(this));
  });


  function openEdit(rowEditButton) {
    var netid = rowEditButton.parent().parent().attr('id');
    $('button').prop('disabled', true);
    $('.saveBtn').prop('disabled', false);
    $('.cancelBtn').prop('disabled', false);
    $('#'+netid).html(($('#'+netid+"Edit").html()));
    $('button.cancelBtn').click(function() {
      closeEdit($(this));
    });
  }
  function closeEdit(rowCancelButton) {
    var netid = rowCancelButton.parent().parent().attr('id');
    $('#'+netid).html(($('#'+netid+"Original").html()));
    $('button').prop('disabled', false);
    $('button.editButton').click(function() {
      openEdit($(this));
    });
    verifyForms();
  }
}
