document.addEventListener("DOMContentLoaded", function() {

    var socket = new WebSocket("ws://0.0.0.0:8090/");

    socket.onmessage = function(evt) {
        var data = JSON.parse(evt.data);
        console.log('data',data);

    };

    var canvas = document.getElementById('view');
    var context = canvas.getContext('2d');
    var width = window.innerWidth;
    var height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;


});
