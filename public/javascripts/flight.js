/*
    Incoming data on socket
 */
var socket = new WebSocket('ws://0.0.0.0:8082/');

socket.onmessage = function(evt) {
    var result = JSON.parse(evt.data);
    console.log('result',result);
};
