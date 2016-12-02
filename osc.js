var osc = require('osc')
var express = require('express')

var app = express()
var router = express.Router();
var WebSocket = require('ws')

var PORT = 8081
var COMM_PORT = 8082

// Create an Express-based Web Socket server to which OSC messages will be relayed.
var appResources = __dirname + '/public'
var server = app.listen(PORT)


var wss = new WebSocket.Server({
    server: server,
    port: COMM_PORT
});

wss.on('connection', function (ws) {
    console.log('A Web Socket connection has been established!');
    ws.on('message', function(event) {
        console.log('event',event);
        udpPort.send({
            address: '/test',
            args: event
        });
    })
});

wss.broadcast = (data) => {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

var getIPAddresses = function () {
    var os = require('os')
    var interfaces = os.networkInterfaces()
    var ipAddresses = [];
    for (var deviceName in interfaces) {
        var addresses = interfaces[deviceName];
        for (var i = 0; i < addresses.length; i++) {
            var addressInfo = addresses[i];
            if (addressInfo.family === 'IPv4' && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }
    return ipAddresses;
};

// Bind to a UDP socket to listen for incoming OSC events.
var udpPort = new osc.UDPPort({
    localAddress: '0.0.0.0',
    localPort: 57121,
    remoteAddress: "127.0.0.1",
    remotePort: 57120
});

udpPort.on('ready', function () {
    var ipAddresses = getIPAddresses();
    console.log('Listening for OSC over UDP.');
    ipAddresses.forEach(function (address) {
        console.log(' Host:', address + ', Port:', udpPort.options.localPort);
    });
    console.log(`To start the demo, go to http://localhost:${PORT} in your web browser.`);
});

udpPort.open();

udpPort.on('message', function (oscMsg) {
    console.log(`An OSC Message was received! ${JSON.stringify(oscMsg)}`);
    if (oscMsg.address === '/notes') {
        wss.broadcast(JSON.stringify({data: oscMsg}));
    }
});

app.use('/api/', router);
router.route('/test').get(function(req, res) {
    console.log('req.query',req.query);

    wss.broadcast(JSON.stringify(req.query));
    res.send('received!');

});


app.use('/', express.static(appResources));
