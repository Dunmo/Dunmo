
Template.calendarSettingsFlow.rendered = function () {
  if(Meteor.user().hasOnboarded('calendarSettings')) return;

  $(document).on("onboarded:flow:afterComplete", function (e, flow, step) {
    $(".overlay").addClass("hidden");
    Meteor.user().setHasOnboarded('calendarSettings');
  });

  csFlow = Onboarded.load();
  csFlow.startFlow();
};
