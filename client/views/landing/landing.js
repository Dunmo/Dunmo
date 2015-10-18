var View = Template.landing;

View.onRendered(function () {
    
    var $nav = $('.landing-navigation');
    var fnav = 'landing-navigation--fixed';
    
    var navigation = new Waypoint({
        element: document.getElementById('hero'),
        handler: function(direction) {
            $nav.toggleClass(fnav);
        },
        offset: -10
    })
    
    var slide = {
        opacity: 1,
        right: 0
    };
    
    var slideR = {
        opacity: 0,
        right: '-50%'
    };
        
    var duration = 500;
    
    var featureAnimate = function(id, direction) {
        if (direction == 'down') {
            $('#features' + id).animate(slide, duration);
        } else if (direction == 'up') {
            $('#features' + id).animate(slideR, duration);
        }
    }
    
    var featureOffset = 400;
    
    var features1 = new Waypoint({
        element: document.getElementById('features1'),
        handler: function(direction) {
            featureAnimate(1, direction);
        },
        offset: featureOffset
    })
    
    var features2 = new Waypoint({
        element: document.getElementById('features2'),
        handler: function(direction) {
            featureAnimate(2, direction);
        },
        offset: featureOffset
    })
    
    var features3 = new Waypoint({
        element: document.getElementById('features3'),
        handler: function(direction) {
            featureAnimate(3, direction);
        },
        offset: featureOffset
    })
    
    var features4 = new Waypoint({
        element: document.getElementById('features4'),
        handler: function(direction) {
            featureAnimate(4, direction);
        },
        offset: featureOffset
    })
      
});