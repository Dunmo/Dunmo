
Template.taskViewFlow.rendered = function () {
  $(document).on("onboarded:flow:afterComplete", function (e, flow, step) {
    Meteor.user().setHasOnboarded('taskView');
    $(".overlay").addClass("hidden")
  });
};

Template.taskViewFlow.helpers({
  userEmail: function () {
    return Meteor.user().primaryEmailAddress();
  }
});
