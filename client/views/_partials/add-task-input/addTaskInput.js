
Template.addTaskInput.rendered = function () {
  $("form").on("submit", function(e) {e.preventDefault()});
};

Template.addTaskInput.events({
  'submit form.add-task, click button.add-task': function (e) {
    $('#input-validation-msg').html('');

    var taskTitle = $('#taskTitle').val();
    var taskHours = $('#taskHours').val();
    var taskMinutes = $('#taskMinutes').val();
    var taskDueAt = $('#taskDueAt').val();
    var taskImportance = $('#taskImportance').val();

    console.log("taskTitle: ", taskTitle);
    console.log("taskHours: ", taskHours);
    console.log("taskMinutes: ", taskMinutes);
    console.log("taskDueAt: ", taskDueAt);
    console.log("taskImportance: ", taskImportance);

    if (taskTitle === '') taskTitle = 'Task title';
    if (taskHours === '') taskHours = '0';
    if (taskMinutes === '') taskMinutes = '30';
    if (taskDueAt === '') taskDueAt = 'tomorrow';
    if (taskImportance === '') taskImportance = 'not very';

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
