
var movies = new Array();
var movie = null;

var myElement = document.getElementById('box');

var host = 'http://172.27.6.118:8080/';

// create a simple instance
// by default, it only adds horizontal recognizers
var mc = new Hammer(myElement);

var uid = -1;

mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

function next() {
    movie = movies.shift();
    $("#title").text(movie.title);
    $("#box").css('background-image', 'url(' + movie.poster_url + ')');
}
// listen to events...
mc.on("swipeleft", function(ev) {
    ev.preventDefault();
    $.ajax(host + 'feedback/' + uid + '/' + movie.movie_id + '/0');
    next();
});
document.getElementById('emailfield').value = location.host;
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

document.getElementById("menuButton").addEventListener("click", function() {
   var e = document.getElementById("menu");
   console.log(e.style.visibility);
   if (e.style.visibility == "hidden") {
    e.style.visibility = "visible";
   } else {
    e.style.visibility = "hidden";
   }
});

// this is actually login
document.getElementById("loginbutton").addEventListener("click", function() {
    var username = document.getElementById("emailfield").value;
    console.log(username);
    $.ajax(host + 'getUserId/' + username, {
        success: function(userId){
            uid = userId;
            $.ajax(host + 'getRecommendations/' + uid, { success: function(recommendations) { movies = recommendations; next(); } });
        }
    });
    console.log(uid);
});

document.getElementById("linkfriend").addEventListener("click", function() {
    var username = document.getElementById("friendfield").value;
    console.log(username);
    $.ajax(host + 'getUserId/' + username, {
        success: function(userId){
            var friendId = userId;
            $.ajax(host + 'getRecommendations/' + uid + '/' + friendId, { success: function(recommendations) { movies = recommendations; next(); } });
        }
    });
    console.log(uid);
});
