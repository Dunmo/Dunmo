var View = Template.landing;

View.onRendered(function () {
    
    var $nav = $('.landing-navigation');
    var fnav = 'landing-navigation--fixed';
    
    var waypoint = new Waypoint({
        element: document.getElementById('hero'),
        handler: function(direction) {
            $nav.toggleClass(fnav);
        },
        offset: -10
    })
      
});