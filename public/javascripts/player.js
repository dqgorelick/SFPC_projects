document.addEventListener("DOMContentLoaded", function() {

    var socket = new WebSocket("ws://0.0.0.0:8088/");

    socket.onmessage = function(evt) {
        // console.log('evt.data',evt.data);
        var data = JSON.parse(evt.data);
        console.log('data',data);
    };

    var player = {
        mouseX: 0,
        mouseY: 0,
        lastMouseX: null,
        lastMouseY: null
    };


    document.onmousemove = function(e){
        player.mouseX = e.pageX;
        player.mouseY = e.pageY;
    };

    function playerStatus() {
        if (player.mouseX !== player.lastMouseX || player.mouseY !== player.lastMouseY) {
            // console.log('moved mouse', player.mouseX, player.mouseY);
            var status = (JSON.stringify({
                status: {
                    x: player.mouseX,
                    y: player.mouseY
                }
            }));
            console.log('status',status);
            socket.send(status);
        } else {
            console.log('didn’t move mouse');
        }
        player.lastMouseY = player.mouseY;
        player.lastMouseX = player.mouseX;
    }

    loopManager.run(playerStatus);
});
