
var movies = new Array();
var movie = null;

var myElement = document.getElementById('movie-image');

var host = 'http://172.27.6.118:8080/';

// create a simple instance
// by default, it only adds horizontal recognizers
var mc = new Hammer(myElement);

var uid = -1;

mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

angular.module('myApp.directives', [])
       .directive('onTap', function () {
         return function (scope, element, attrs) {
           return $(element).hammer({
             prevent_default: false,
             drag_vertical: false
           })
             .bind("tap", function (ev) {
               return scope.$apply(attrs['onTap']);
             });
         };
       });

function next() {
    movie = movies.shift();
    $("#movie-name").text(movie.title);
    $("#movie-image").attr("src", movie.poster_url);
}
// listen to events...
function onHammer() {
    console.log(ev.toString());
    $.ajax(host + 'feedback/' + uid + '/' + movie.movie_id + '/0');
    next();
}
mc.on("swipeleft", function(ev) {
    //ev.preventDefault();
    console.log(ev.toString());
    $.ajax(host + 'feedback/' + uid + '/' + movie.movie_id + '/0');
    next();
});
//document.getElementById('emailfield').value = location.host;
mc.on("swiperight", function(ev) {
    ev.preventDefault();
    $.ajax(host + 'feedback/' + uid + '/' + movie.movie_id + '/1');
    next();
});

mc.on("swipeup", function(ev) {
    ev.preventDefault();
    $.ajax(host + 'feedback/' + uid + '/' + movie.movie_id + '/3');
    next();
});

mc.on("swipedown", function(ev) {
    ev.preventDefault();
    $.ajax(host + 'feedback/' + uid + '/' + movie.movie_id + '/2');
    next();
});

mc.on("tap", function(ev) {
    // make div visible for details and toggle
    // TODOOOOOOOOO
});

//mc.on("press", function(ev) {
//    myElement.textContent = ev.type +" gesture detected.";
//    next();
//});

//document.getElementById("menuButton").addEventListener("click", function() {
//   var e = document.getElementById("menu");
//   console.log(e.style.visibility);
//   if (e.style.visibility == "hidden") {
//    e.style.visibility = "visible";
//   } else {
//    e.style.visibility = "hidden";
//   }
//});

// this is actually login
document.getElementById("loginbutton").addEventListener("click", function() {
    console.log('in');
    var username = document.getElementById("namefield").value;
    console.log(username);
    $.ajax(host + 'getUserId/' + username, {
        success: function(userId){
            uid = userId;
            $.ajax(host + 'getRecommendations/' + uid, { success: function(recommendations) {
                movies = recommendations;
                next();
                document.getElementById("login").style.visibility = "hidden";
                document.getElementById("swipe").style.visibility = "visible";
                }
            });
        }
    });
    console.log(uid);
});
