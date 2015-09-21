
  var View = Template.landing;

  View.onRendered(function () {
    // NAV

    //$('.landing-story').waypoint(function () {
    //    $('.landing-nav__item--story').toggleClass('current');
    //})

    //$('.landing-meet').waypoint(function () {
    //    $('.landing-nav__item--story').toggleClass('current');
    //    $('.landing-nav__item--meet').toggleClass('current');
    //    $('.landing-meet__slide').toggleClass('abs')
    //})

    //$('.landing-team').waypoint(function () {
    //    $('.landing-nav__item--meet').toggleClass('current');
    //    $('.landing-nav__item--team').toggleClass('current');
    //})

    //$('.landing-contact').waypoint(function () {
    //    $('.landing-nav__item--team').toggleClass('current');
    //    $('.landing-nav__item--contact').toggleClass('current');
    //})

    // SMOOTH SCROLLING

    // $('a[href*=#]:not([href=#])').click(function () {
    //   if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
    //     var target = $(this.hash);
    //     target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
    //     if (target.length) {
    //       $('html,body').animate({
    //         scrollTop: target.offset().top
    //       }, 750);
    //       return false;
    //     }
    //   }
    // });

    // BOT

    //$('.landing-meet__bot-container').waypoint(function () {
    //    $('.landing-meet__bot').toggleClass('landing-meet__bot--sticky').css({ "bottom": "auto" });
    //}, {
    //    offset: '64px'
    //}) // makes bot sticky
    //$('.landing-team').waypoint(function () {
    //    var difference = $('.landing-team').offset().top - ($('.landing-meet__bot').offset().top + $('.landing-meet__bot').height());
    //    $('.landing-meet__bot').css({ "bottom": difference + "px" }).toggleClass('landing-meet__bot--sticky landing-meet__bot--end');
    //}, {
    //    offset: '100%'
    //}) // stops bot above end of section

    // BOTSPEAK

    //$('.landing-meet').waypoint(function () {
    //    $('.landing-meet__slide').toggle();
    //}, {
    //    offset: '75%'
    //})

    // INITIALIZE SKROLLR

    //var s = skrollr.init({ forceHeight: false });
  });

