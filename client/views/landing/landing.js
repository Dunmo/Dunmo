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
    
    var slideLeft = {
        opacity: 1,
        right: 0
    };
    
    var slideLeftReturn = {
        opacity: 0,
        right: '-50%'
    };
    
    var slideRight = {
        opacity: 1,
        left: 0
    };
    
    var slideRightReturn = {
        opacity: 0,
        left: '-50%'
    };
        
    var duration = 350;
    
    var featureAnimate = function(id, direction, side) {
        if (side == 'left') {
            if (direction == 'down') {
                $('#features' + id).animate(slideRight, duration);
            } else if (direction == 'up') {
                $('#features' + id).animate(slideRightReturn, duration);
            }
        } else if (side == 'right') {
            if (direction == 'down') {
                $('#features' + id).animate(slideLeft, duration);
            } else if (direction == 'up') {
                $('#features' + id).animate(slideLeftReturn, duration);
            }
        }
    }
    
    var featureOffset = 400;
    
    var features1 = new Waypoint({
        element: document.getElementById('features1'),
        handler: function(direction) {
            featureAnimate(1, direction, 'right');
        },
        offset: featureOffset
    })
    
    var features2 = new Waypoint({
        element: document.getElementById('features2'),
        handler: function(direction) {
            featureAnimate(2, direction, 'left');
        },
        offset: featureOffset
    })
    
    var features3 = new Waypoint({
        element: document.getElementById('features3'),
        handler: function(direction) {
            featureAnimate(3, direction, 'right');
        },
        offset: featureOffset
    })
    
    var features4 = new Waypoint({
        element: document.getElementById('features4'),
        handler: function(direction) {
            featureAnimate(4, direction, 'left');
        },
        offset: featureOffset
    })
      
});