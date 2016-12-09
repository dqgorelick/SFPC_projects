var osc = require('osc')
var express = require('express')
var _ = require('lodash')
var uuid = require('node-uuid')
var ws = require('ws')

var app = express()
var router = express.Router()

var STATIC_PORT = 8081
var VIEW_PORT = 8082
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
  port: VIEW_PORT
})

wss_view.on('connection', function(ws) {
  console.log('A Web Socket connection has been established!')
  ws.on('message', function(event) {
    console.log('event',event);
    var data = JSON.parse(event);
    console.log('data.tempo',data.tempo);
    switch(parseInt(data.tempo)) {
      case 0:
        console.log('/eighth');
        udpPort.send({
          address: '/eighth',
          args: data.note
        })
        break;
      case 1:
        console.log('/quarter');
        udpPort.send({
          address: '/quarter',
          args: data.note
        })
        break;
      case 2:
        console.log('/half');
        udpPort.send({
          address: '/half',
          args: data.note
        })
        break;
      default:
        console.log('data.tempo',data.tempo);
        break;
    }
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
var wss = new(ws.Server)({ port: PLAYER_PORT })
var players = {}

wss.broadcast = (data) => {
  wss.clients.forEach(function each(client) {
    client.send(data)
  })
}

wss.on('connection', (ws) => {
  console.log('player socket connection')
  var id_player = uuid.v4()
  players[id_player] = { id: id_player }

  console.log(`Number of players: ${_.size(players)}`)

  ws.on('message', (evt) => {
    var message = JSON.parse(evt)
    if (message.type === 'notes') {
      players[id_player].notes = message.data
      wss_view.broadcast(JSON.stringify({type: 'notes', id: id_player, tempo: message.tempo, notes: message.data, color: message.color}));
    } else if (message.type === 'tempo') {
      wss_view.broadcast(JSON.stringify({type: 'tempo', id: id_player, tempo: message.tempo}));
    } else if (message.type === 'start') {
      wss_view.broadcast(JSON.stringify({type: 'start', id: id_player}));
    } else if (message.type === 'stop') {
      wss_view.broadcast(JSON.stringify({type: 'stop', id: id_player}));
    } else if (message.type === 'heartbeat') {
      players[id_player].inactive = false;
    }
  })

  ws.on('close', () => {
    console.log('player left')
    players = _.omit(players, id_player)
    wss_view.broadcast(JSON.stringify({type: 'close', id: id_player}));
    console.log(`Number of players: ${_.size(players)}`)
  })
})


function heartbeat() {
  wss.broadcast(JSON.stringify({type: 'heartbeat'}));
  // check if player is active, set to be inactive
  // if inactive, delete player
  // // send message to view
  // _.forOwn(players, function(key, value) {
  //   console.log('key',key);
  //   console.log('value',value);
  //   players[key]
  // })
}

setInterval(heartbeat, 3000);



/************************************
    OSC SOCKET
*************************************/

var getIPAddresses = function() {
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

udpPort.on('ready', function() {
  var ipAddresses = getIPAddresses()
  console.log('Listening for OSC over UDP.')
  ipAddresses.forEach(function(address) {
    console.log(' Host:', address + ', Port:', udpPort.options.localPort)
  })
  console.log(`To start the demo, go to http://localhost:${STATIC_PORT} in your web browser.`)
})

udpPort.open()

udpPort.on('message', function(oscMsg) {
  console.log(`An OSC Message was received! ${JSON.stringify(oscMsg)}`)
  if (oscMsg.address === '/notes') {
    wss_view.broadcast(JSON.stringify({ data: oscMsg }))
  }
})

/************************************
    FLIGHT RADIO
*************************************/
app.use('/api/', router)
router.route('/test').get(function(req, res) {
  console.log('req.query', req.query)
  wss_view.broadcast(JSON.stringify(req.query))
  res.send('received!')
})


app.use('/', express.static(appResources))
