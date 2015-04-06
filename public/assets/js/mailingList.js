$(function () {
  var submitEmail = function () {
    var email = $('.mailing-list input.email').val();
    $('.mailing-list input.email').val('');
    $('.mailing-list input.email').attr('placeholder', 'Success!');
    console.log('email: ', email);
    var data = { email: email };
    // data = JSON.stringify(data);
    $.post('/api/emails', data, function(res) {
      res = JSON.parse(res);
      console.log('res: ', res);
    });
  };

  $('input.email').keypress(function(event) {
    if(event.which != 13) return;
    submitEmail();
  });

  $('.btn-submit').click(submitEmail);
});
