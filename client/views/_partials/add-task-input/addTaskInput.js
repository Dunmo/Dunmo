
var numberkeys = [];

Template.addTaskInput.rendered = function () {
  $("form").on("submit", function(e) {e.preventDefault()});
};

Template.addTaskInput.helpers({
  endOfDayString: function () {
    var endOfDay = Meteor.user().endOfDay();
    endOfDay = Date.timeString(endOfDay);
    return endOfDay;
  }
});

Template.addTaskInput.events({
  'keydown input[type="number"]': function (event) {
    if (!(!event.shiftKey //Disallow: any Shift+digit combination
            && !(event.keyCode < 48 || event.keyCode > 57) //Disallow: everything but digits
            || !(event.keyCode < 96 || event.keyCode > 105) //Allow: numeric pad digits
            || event.keyCode == 46 // Allow: delete
            || event.keyCode == 8  // Allow: backspace
            || event.keyCode == 9  // Allow: tab
            || event.keyCode == 27 // Allow: escape
            || (event.keyCode == 65 && (event.ctrlKey === true || event.metaKey === true)) // Allow: Ctrl+A
            || (event.keyCode == 67 && (event.ctrlKey === true || event.metaKey === true)) // Allow: Ctrl+C
            //Uncommenting the next line allows Ctrl+V usage, but requires additional code from you to disallow pasting non-numeric symbols
            //|| (event.keyCode == 86 && (event.ctrlKey === true || event.metaKey === true)) // Allow: Ctrl+Vpasting
            || (event.keyCode >= 35 && event.keyCode <= 40) // Allow: Home, End, arrow keys
            )) {
        event.preventDefault();
    }
  },

  'keydown form.add-task input, click button.add-task': function (e) {
    if(e.which && ! (e.which == 13 || e.which == 1) ) return;
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

    var endOfDay = Date.timeString(Meteor.user().endOfDay());
    console.log('endOfDay: ', endOfDay);

    if (taskDueAt === '')      taskDueAt = 'tomorrow at ' + endOfDay;

    if (taskTitle === '')      {  $taskTitle.addClass('text-red invalid');      return;  }

    if (taskHours === '' && taskMinutes === '') {
      $taskHours.addClass('text-red invalid');
      $taskMinutes.addClass('text-red invalid');
      return;
    }
    else if(taskHours === '') {
      taskHours = '0';
    }
    else if(taskMinutes === '') {
      taskMinutes = '0';
    }

    if (taskHours === '0' && taskMinutes === '0') {
      $taskHours.addClass('text-red invalid');
      $taskMinutes.addClass('text-red invalid');
      return;
    }

    var val = '';
    val += taskTitle;
    val += ' for '
    if(taskHours !== '0')
      val += taskHours + ' hours';
    if(taskHours !== '0' && taskMinutes !== '0')
      val += ' and ';
    if(taskMinutes !== '0')
      val += taskMinutes + ' minutes'
    val += ' due ' + taskDueAt;
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
    }

    $taskTitle.val('');
    $taskHours.val('');
    $taskMinutes.val('');
    $taskDueAt.val('');
    $taskImportance.val('');

    gapi.syncTasksWithCalendar();
  }
});
