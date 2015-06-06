
Template.taskViewFlow.rendered = function () {
  if(Meteor.user().hasOnboarded('taskView')) return;

  $(document).on("onboarded:flow:afterComplete", function (e, flow, step) {
    $(".overlay").addClass("hidden");
    Meteor.user().setHasOnboarded('taskView');
  });

  tvFlow = Onboarded.load();
  tvFlow.startFlow();
};
