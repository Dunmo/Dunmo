
Template.calendarSettingsFlow.rendered = function () {
  $(document).on("onboarded:flow:afterComplete", function (e, flow, step) {
    $(".overlay").addClass("hidden");
  });

  tvFlow = Onboarded.load();
  tvFlow.startFlow();
};
