$(function () {
  var submitEmail = function () {
    var email = $('.mailing-list input.email').val();
    $('.mailing-list input.email').val('');
    $('.mailing-list input.email').attr('placeholder', 'Success!');
    var url = '/api/emails/' + email;
    $.post(url);
  };

  $('input.email').keypress(function(event) {
    if(event.which != 13) return;
    submitEmail();
  });

  $('.btn-submit').click(submitEmail);
});
