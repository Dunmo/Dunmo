
Template.calendarSettingsFlow.rendered = function () {
  $(document).on("onboarded:flow:afterComplete", function (e, flow, step) {
    Meteor.user().setHasOnboarded('calendarSettings');
    $(".overlay").addClass("hidden")
  });
};

Template.calendarSettingsFlow.helpers({
  userEmail: function () {
    return Meteor.user().primaryEmailAddress();
  }
});
