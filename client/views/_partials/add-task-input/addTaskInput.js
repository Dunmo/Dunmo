
Template.addTaskInput.rendered = function () {
  $("form").on("submit", function(e) {e.preventDefault()});
};

Template.addTaskInput.events({
  'submit form.add-task, click button.add-task': function (e) {
    $('#input-validation-msg').html('');
    var $input = $(e.target).parents('.input-group').find('.form-control');
    if( $input.length === 0 ) $input = $(e.target).find('input.add-task');
    var val = $input.val();
    var ret = Tasks.create(val, { ownerId: Meteor.userId() });

    console.log('ret: ', ret);

    if (ret && ret.err) {
      $('#input-validation-msg').flash_message({
          text: ret.err,
          how: 'append'
      });
      return;
    };
    $input.val('');
    gapi.syncTasksWithCalendar();
  }
});
