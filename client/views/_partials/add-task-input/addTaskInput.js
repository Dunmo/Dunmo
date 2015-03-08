
Template.addTaskInput.rendered = function () {
  $("form").on("submit", function(e) {e.preventDefault()});
};

Template.addTaskInput.events({
  'submit form.add-task, click button.add-task': function (e) {
    var $input = $(e.target).parents('.input-group').find('.form-control');
    console.log('e.target: ', e.target);
    if( $input.length === 0 ) $input = $(e.target).find('input.add-task');
    console.log('$input: ', $input);
    var val = $input.val();
    console.log('val: ', val);
    Tasks.create(val, { ownerId: Meteor.userId() });
    $input.val('');
    gapi.syncTasksWithCalendar();
  }
});
