
Template.addTaskInput.rendered = function () {
  $("form").on("submit", function(e) {e.preventDefault()});
};

Template.addTaskInput.events({
  'submit form.add-task, click button.add-task': function (e) {
    $('#input-validation-msg').html('');

    var $taskTitle = $('#taskTitle');
    var $taskHours = $('#taskHours');
    var $taskMinutes = $('#taskMinutes');
    var $taskDueAt = $('#taskDueAt');
    var $taskImportance = $('#taskImportance');

    $taskTitle.removeClass('text-red invalid');
    $taskHours.removeClass('text-red invalid');
    $taskMinutes.removeClass('text-red invalid');
    $taskDueAt.removeClass('text-red invalid');
    $taskImportance.removeClass('text-red invalid');

    taskTitle = $taskTitle.val();
    taskHours = $taskHours.val();
    taskMinutes = $taskMinutes.val();
    taskDueAt = $taskDueAt.val();
    taskImportance = $taskImportance.val();

    if (taskTitle === '')      {  $taskTitle.addClass('text-red invalid');      return;  }
    if (taskHours === '')      {  $taskHours.addClass('text-red invalid');      return;  }
    if (taskMinutes === '')    {  $taskMinutes.addClass('text-red invalid');    return;  }
    if (taskDueAt === '')      {  $taskDueAt.addClass('text-red invalid');      return;  }
    if (taskImportance === '') {  $taskImportance.addClass('text-red invalid'); return;  }

    var val = '';
    val += taskTitle;
    val += ' for ' + taskHours;
    val += ' hours and ' + taskMinutes;
    val += ' minutes due ' + taskDueAt;
    val += ' ' + taskImportance + ' important';

    console.log("val: ", val);

    var ret = Tasks.create(val, { ownerId: Meteor.userId() });

    console.log('ret: ', ret);

    if (ret && ret.err) {
      $('#input-validation-msg').flash_message({
          text: ret.err,
          how: 'append'
      });
      return;
    };

    taskTitle = '';
    taskHours = '';
    taskMinutes = '';
    taskDueAt = '';
    taskImportance = '';

    gapi.syncTasksWithCalendar();
  }
});
