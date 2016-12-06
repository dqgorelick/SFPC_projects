var osc = require('osc')
var express = require('express')
var _ = require('lodash')
var uuid = require('node-uuid')
var ws = require('ws')

var app = express()
var router = express.Router()

var STATIC_PORT = 8081
var COMM_PORT = 8082
var PLAYER_PORT = 8088

/************************************
    STATIC SERVER
*************************************/
var appResources = __dirname + '/public'
var server = app.listen(STATIC_PORT)


/************************************
    VIEW SOCKET
*************************************/
var wss_view = new(ws.Server)({
    server: server,
    port: COMM_PORT
})

wss_view.on('connection', function (ws) {
    console.log('A Web Socket connection has been established!')
    ws.on('message', function(event) {
        console.log('event',event)
        udpPort.send({
            address: '/test',
            args: event
        })
    })
})

wss_view.broadcast = (data) => {
  wss_view.clients.forEach(function each(client) {
    client.send(data)
  })
}

/************************************
    PLAYER SOCKET
*************************************/
var wss = new(ws.Server)({port: PLAYER_PORT})
var players = {}

wss.broadcast = (data) => {
  wss.clients.forEach(function each(client) {
    client.send(data)
  })
}

wss.on('connection', (ws) => {
    console.log('player socket connection')
    var id_player = uuid.v4()
    players[id_player] = {id: id_player}

    console.log(`Number of players: ${_.size(players)}`)

    ws.on('message', (evt) => {
        var data = JSON.parse(evt)
        console.log('data',data)
    })

    ws.on('close', () => {
        console.log('player left')
        players = _.omit(players, id_player)
        console.log(`Number of players: ${_.size(players)}`)
    })
})

/************************************
    OSC SOCKET
*************************************/

var getIPAddresses = function () {
    var os = require('os')
    var interfaces = os.networkInterfaces()
    var ipAddresses = []
    for (var deviceName in interfaces) {
        var addresses = interfaces[deviceName]
        for (var i = 0; i < addresses.length; i++) {
            var addressInfo = addresses[i]
            if (addressInfo.family === 'IPv4' && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address)
            }
        }
    }
    return ipAddresses
}

var udpPort = new osc.UDPPort({
    localAddress: '0.0.0.0',
    localPort: 57121,
    remoteAddress: "127.0.0.1",
    remotePort: 57120
})

udpPort.on('ready', function () {
    var ipAddresses = getIPAddresses()
    console.log('Listening for OSC over UDP.')
    ipAddresses.forEach(function (address) {
        console.log(' Host:', address + ', Port:', udpPort.options.localPort)
    })
    console.log(`To start the demo, go to http://localhost:${STATIC_PORT} in your web browser.`)
})

udpPort.open()

udpPort.on('message', function (oscMsg) {
    console.log(`An OSC Message was received! ${JSON.stringify(oscMsg)}`)
    if (oscMsg.address === '/notes') {
        wss_view.broadcast(JSON.stringify({data: oscMsg}))
    }
})

/************************************
    FLIGHT RADIO
*************************************/
app.use('/api/', router)
router.route('/test').get(function(req, res) {
    console.log('req.query',req.query)
    wss_view.broadcast(JSON.stringify(req.query))
    res.send('received!')
})


app.use('/', express.static(appResources))
