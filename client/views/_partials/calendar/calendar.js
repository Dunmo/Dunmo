
Template.calendar.events({
  'click input[type="checkbox"]' : function (e) {
    var active = !this.active;
    console.log('active: ', active);
    this.update({ active: active });
  }
});
