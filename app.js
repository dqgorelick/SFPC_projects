var path = require('path');
var express = require('express');
var app = express();

var _ = require('lodash');
var ws = require('ws');
var uuid = require('node-uuid');

const PORT_PUBLIC = 9000;
const PORT_PLAYER = 8088;

var wss = new(ws.Server)({port: PORT_PLAYER});
var players = {};

wss.broadcast = (data) => {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

wss.on('connection', (ws) => {
    console.log('player socket connection');
    var id_player = uuid.v4();

    players[id_player] = {id: id_player};

    // ws.send(JSON.stringify({players: players}));
    console.log(JSON.stringify(players));

    var payload = JSON.stringify({ players: players });
    ws.send(payload);
    wss.broadcast(payload);

    ws.on('close', () => {
        console.log('player left');
        players = _.omit(players, id_player);

    })
});




app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT_PUBLIC, () => {
    console.log(`serving public on ${PORT_PUBLIC}`);
});
