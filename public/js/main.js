var $items = $('.cardlist>li');
var $page = $('.page:visible');
var appName = "Anna";
$.keyframe.define([{
    name: 'rotate-left',
    '0%': {
        'transform': 'rotate(0deg)',
        'opacity': 1
    },
    '100%': {
        'transform': 'rotate(-40deg) translateY(-80px)',
        'opacity': 0
    }
}, {
    name: 'rotate-right',
    '0%': {
        'transform': 'rotate(0deg)',
        'opacity': 1
    },
    '100%': {
        'transform': 'rotate(40deg) translateY(-80px)',
        'opacity': 0
    }
}]);
function stackDeck(force) {
    $page = $('.page:visible');    
    console.log($page.data());
    var $li = $page.find('.cardcontainer>.cardlist>li');
    if (!force && $page.data('stacked'))
        return;
    console.log('stacking the deck');
    $page.data('stacked', true);
    //add cards in order they are in DOM    
    $li.each(function (i, el) {
        if (!$(this).hasClass('deck-title')) {
            if (i % 2 === 0)
                $(this).addClass('deck-clockwise');
            else
                $(this).addClass('deck-anticlockwise');
        }
        //remove all styles added as part of animation        
        $(this).removeAttr('style').removeClass('hidden current boostKeyframe');
    });
    //by default, set only the first item as current
    $li.first().addClass('current');
}
function init() {
    $('.button-collapse').sideNav({
        menuWidth: 280, // Default is 240
        edge: 'left', // Choose the horizontal origin
        closeOnClick: false,
        draggable: false
    });
    $('ul.tabs').tabs({
        onShow: function (el) {
            console.log('Got tab', el);
            stackDeck(); //Every time a tab is changed, stack the deck again
        }
    }); //init tabs
    stackDeck();
    if(window.localStorage){
        if(!localStorage.getItem('tutorial')){
            tutorial.show();
            localStorage.setItem('tutorial','shown');
        }        
    }    
}
$items.swipe({
    swipe: function (e, direction, distance) {
        console.log('Swiped!', e, direction, distance);
        var $el = $(this);
        if (direction === 'left') {
            $(this).playKeyframe({
                name: 'rotate-left', duration: '0.7s', complete: function () {
                    $el.removeClass('current').addClass('hidden');
                }
            });
            $(this).next().addClass('current');

        } else if (direction === 'right') {
            $(this).playKeyframe({
                name: 'rotate-right', duration: '0.7s', complete: function () {
                    $el.removeClass('current').addClass('hidden');
                }
            });
            $(this).next().addClass('current');
            // $(this).addClass('hidden');
        }
    }
});
$('.touchScreen').swipe({
    swipe: function (e, direction, distance) {
        console.log('swiped on touchscreen');
        if (direction === 'left') {
            $('.button-collapse').sideNav('hide');
        } else if (direction === 'right') {
            $('.button-collapse').sideNav('show');
        }
    },
    tap: function (e, t) {
        //Go back to the earlier card
        console.log('tapped!');
        var $current = $page.find('.current');
        if ($current.prev() && $current.prev().hasClass('deck')) {
            $current.removeClass('current');
            $current.prev().removeAttr('style').removeClass('hidden current boostKeyframe').addClass('current');
        }
    }
});
//Intercept all clicks to external URLs
// $('a').on('click',function(e){    
//     var href = $(this).attr('href');
//     console.log('Got link',href);
//     if(!href||href.toString().indexOf('#')>=0)
//     return;    
//     e.preventDefault();
//     window.location = 'webpage.html?urlString='+encodeURI(href);
// });
function home(){    
    window.location = 'index.html';
}

$('.close-panel').click(function(e){
    $('.button-collapse').sideNav('hide');    
});
//initialize deck on page load
$(init);

//create Anno tutorials
var tutorial = new Anno([{
  target  : '.deck', // second block of code
  position: 'top',
  content : 'Try swiping through the deck of questions'
}, {
  target  : '.deck',
  position: 'center-bottom',
  content : "Tap outside to go back in the deck",
}, {
  target  : '.deck',
  position: 'top',
  content : "Tap on a Card Heading to get the answer"
}]);

function getData(callback){
    console.log('Getting data with fallbacks');
    $.ajaxSetup({timeout:1000}); //set a 1s timeout for get requests
    $.get('localhost:8080/appid/data',null,function(data){
        console.log('Loaded some data');
    });
}

function generateCards(categories,data,callback){
    
}

function reloadPage(){
    window.location.reload();
}