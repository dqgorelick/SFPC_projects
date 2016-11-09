document.addEventListener("DOMContentLoaded", function() {

    var socket = new WebSocket("ws://0.0.0.0:8088/");

    socket.onmessage = function(evt) {
        // console.log('evt.data',evt.data);
        var data = JSON.parse(evt.data);
        console.log('data',data);
    }
});
