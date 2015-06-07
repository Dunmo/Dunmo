
resetTaskListItemWidths = function () {
  window.setTimeout(function () {
    $('.task .title').width(Math.ceil(_.max($('.task .title .task-text').toArray().map(function (obj) { return $(obj).width() })))+24);
  }, 100);
};
