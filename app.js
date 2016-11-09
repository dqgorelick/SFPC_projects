var path = require('path');
var express = require('express');
var app = express();

var _ = require('lodash');
var ws = require('ws');
var uuid = require('node-uuid');

const PORT_PUBLIC = 9000;
const PORT_PLAYER = 8088;
const PORT_VIEW = 8090;

// view socket
var wss_view = new(ws.Server)({port: PORT_VIEW});
var lastView;

var views = {};

players[id_player] = {id: id_player};

// TEMP ERASE COUNT
var count = 0;

wss_view.on('connection', (ws) => {
    console.log('view connected');
    var timer;

    function refreshView() {
        if (!_.isEqual(lastView, players)) {
            console.log('different');
            lastView = players;
        } else {
            console.log('same', count);
            count++;
        }
        timer = setTimeout(refreshView, 25);
    }
    ws.on('close', () => {
        clearTimeout(timer);
    })

    refreshView();
});

// player socket
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

    console.log(`Number of players: ${_.size(players)}`);

    // var playersJSON = JSON.stringify({ players });
    // ws.send(playersJSON);
    // wss.broadcast(playersJSON);

    ws.on('message', (evt) => {
        var data = JSON.parse(evt);
        console.log('data',data);
    });

    ws.on('close', () => {
        console.log('player left');
        players = _.omit(players, id_player);
        console.log(`Number of players: ${_.size(players)}`);
    });
});




app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT_PUBLIC, () => {
    console.log(`serving public on ${PORT_PUBLIC}`);
});
