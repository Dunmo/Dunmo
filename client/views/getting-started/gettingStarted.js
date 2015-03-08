
Template.gettingStarted.events({
  'click .btn-next': function (e) {
    var t = $('#step-3').hasClass('active');
    e.preventDefault();
    console.log('t: ', t);
    if( t ) {
      location.href = '/calendarSettings';
    }
  }
});
