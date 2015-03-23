
Template.addTaskInput.rendered = function () {
  $("form").on("submit", function(e) {e.preventDefault()});
};

Template.addTaskInput.events({
  'submit form.add-task, click button.add-task': function (e) {
    var $input = $(e.target).parents('.input-group').find('.form-control');
    if( $input.length === 0 ) $input = $(e.target).find('input.add-task');
    var val = $input.val();
    var ret = Tasks.create(val, { ownerId: Meteor.userId() });
    $input.val('');
    gapi.syncTasksWithCalendar();
  }
});
