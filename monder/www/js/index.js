
var movies = new Array();
var movie = null;

//imgArray[0] = new Image();
//imgArray[0].src = 'img/movie2.jpg';
//
//imgArray[1] = new Image();
//imgArray[1].src = 'img/movie3.jpg';


var myElement = document.getElementById('box');

var host = 'http://172.27.6.118:8080/';

// create a simple instance
// by default, it only adds horizontal recognizers
var mc = new Hammer(myElement);

var uid = -1;

mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

function next() {
    movie = movies[0];
    $("#title").text(movie.title);
    //$("#box").css('background-image', 'url(' + imgArray.shift().src + ')');
}
// listen to events...
mc.on("swipeleft", function(ev) {
    ev.preventDefault();
    $.ajax(host + 'feedback/' + uid + '/' + movie.movie_id + '/-55');
    next();
});
document.getElementById('emailfield').value = location.host;
mc.on("swiperight", function(ev) {
    ev.preventDefault();
    $.ajax(host + 'feedback/' + uid + '/' + movie.movie_id + '/-10');
    myElement.textContent = ev.type +" gesture detected.";
    next();
});

mc.on("swipeup", function(ev) {
    ev.preventDefault();
    myElement.textContent = ev.type +" gesture detected.";
    next();
});

mc.on("swipedown", function(ev) {
    ev.preventDefault();
    myElement.textContent = ev.type +" gesture detected.";
    next();
});

mc.on("tap", function(ev) {
    $.ajax(host + 'feedback/' + uid + '/tt0111161/-10');
    myElement.textContent = ev.type +" gesture detected.";
    next();
});

mc.on("press", function(ev) {
    myElement.textContent = ev.type +" gesture detected.";
    next();
});

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
