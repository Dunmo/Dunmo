
resetTaskListItemWidths = function () {
  $('.task .title').width(Math.ceil(_.max($('.task .title').toArray().map(function (obj) { return $(obj).width() })))+24);

  var cl = '.remaining';
  var textWidth = _.max($('.task .line-prop'+cl+' .task-text').toArray().map(function (obj) { return $(obj).width() }));
  var iconWidth = $('.task .line-prop'+cl+' .fa-wrapper').width();
  $('.task .line-prop'+cl+'').width(textWidth + iconWidth + 10);

  cl = '.due';
  textWidth = _.max($('.task .line-prop'+cl+' .task-text').toArray().map(function (obj) { return $(obj).width() }));
  iconWidth = $('.task .line-prop'+cl+' .fa-wrapper').width();
  $('.task .line-prop'+cl+'').width(textWidth + iconWidth + 10);
};
