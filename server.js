var path = require('path');
var express = require('express');
var app = express();

var PORT = 9000;

// hosts our server for local development
app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => {
    console.log(`serving public on ${PORT}`);
});