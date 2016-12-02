var m = require('mraa');
var request = require('request');

var tokyoSwitch = new m.Gpio(10);
var newyorkSwitch = new m.Gpio(11);
tokyoSwitch.dir(m.DIR_IN);
newyorkSwitch.dir(m.DIR_IN);

function loop() {
  var nyc =  newyorkSwitch.read();
  var tokyo = tokyoSwitch.read();
  request(`http://192.168.1.237:8081/api/test?nyc=${!!nyc}&&tokyo=${!!tokyo}`, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log('body',body);
    }
  })
  setTimeout(loop, 1000); //call the indicated function after 1 second (1000 milliseconds)
}

loop();
