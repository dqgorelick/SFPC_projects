var synth = synth || {};

(function () {
    "use strict";

    synth.SocketSynth = function () {
        this.oscPort = new osc.WebSocketPort({
            url: "ws://localhost:8081"
        });

        this.listen();
        this.oscPort.open();

        this.oscPort.socket.onmessage = function (e) {
            console.log("message", e);
        };
    };

    synth.SocketSynth.prototype.listen = function () {
        this.oscPort.on("open", function() {
            console.log('connected to server');
        });
        this.oscPort.on("message", this.mapMessage.bind(this));
        this.oscPort.on("message", function (msg) {
            console.log("message", msg);
        });
        this.oscPort.on("close", function() {
            console.log('closed!');
        });
    };

    synth.SocketSynth.prototype.mapMessage = function (oscMessage) {
        $("#message").text(fluid.prettyPrintJSON(oscMessage));
        console.log('oscMessage',oscMessage);
        var address = oscMessage.address;
        var value = oscMessage.args[0];
        var transformSpec = this.valueMap[address];

        if (transformSpec) {
            var transformed = transformSpec.transform(value);
            this.synth.set(transformSpec.inputPath, transformed);
        }
    };

}());
