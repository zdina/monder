/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
//var app = {
//    // Application Constructor
//    initialize: function() {
//      var element = document.getElementById('box');
//      Hammer(element).on('swipeleft', function() {
//          console.log('you swiped left me!');
//          element.style.backgroundColor = 'white';
//      });
//      // this.onDeviceReady();
//      //   this.bindEvents();
//    },
//    // Bind Event Listeners
//    //
//    // Bind any events that are required on startup. Common events are:
//    // 'load', 'deviceready', 'offline', and 'online'.
//    bindEvents: function() {
//      document.addEventListener('deviceready', this.onDeviceReady, false);
//    },
//    // deviceready Event Handler
//    //
//    // The scope of 'this' is the event. In order to call the 'receivedEvent'
//    // function, we must explicitly call 'app.receivedEvent(...);'
//    onDeviceReady: function() {
//      var element = document.getElementById('box');
//      element.style.backgroundColor = 'white';
//      // Hammer(element).on('swipeleft', function() {
//      //     console.log('you swiped left me!');
//      // });
//      //app.receivedEvent('deviceready');
//    },
//    // Update DOM on a Received Event
//    receivedEvent: function(id) {
//        var parentElement = document.getElementById(id);
//        var listeningElement = parentElement.querySelector('.listening');
//        var receivedElement = parentElement.querySelector('.received');
//
//        listeningElement.setAttribute('style', 'display:none;');
//        receivedElement.setAttribute('style', 'display:block;');
//
//        console.log('Received Event: ' + id);
//    }
//};

var colors = ["white", "red", "yellow", "green", "purple", "black"];

var myElement = document.getElementById('box');

// create a simple instance
// by default, it only adds horizontal recognizers
var mc = new Hammer(myElement);

mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

// listen to events...
mc.on("swipeleft", function(ev) {
    ev.preventDefault();
    console.log("swipe left");
    myElement.textContent = ev.type +" gesture detected.";
    var rand = parseInt(Math.random() * colors.length);
    console.log(rand);
    myElement.style.backgroundColor = colors[rand];
});

mc.on("swiperight", function(ev) {
    ev.preventDefault();
    myElement.textContent = ev.type +" gesture detected.";
    myElement.style.backgroundColor = "red";
});

mc.on("swipeup", function(ev) {
    ev.preventDefault();
    myElement.textContent = ev.type +" gesture detected.";
    myElement.style.backgroundColor = "yellow";
});

mc.on("swipedown", function(ev) {
    ev.preventDefault();
    myElement.textContent = ev.type +" gesture detected.";
    myElement.style.backgroundColor = "green";
});

mc.on("tap", function(ev) {
    myElement.textContent = ev.type +" gesture detected.";
    myElement.style.backgroundColor = "purple";
});

mc.on("press", function(ev) {
    myElement.textContent = ev.type +" gesture detected.";
    myElement.style.backgroundColor = "black";
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