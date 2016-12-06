document.addEventListener("DOMContentLoaded", function() {
  /*
      SOCKETS
   */
  // home
  // var socket = new WebSocket("ws://192.168.0.4:8088/");
  // sfpc
  var socket = new WebSocket("ws://192.168.1.237:8088/");
  socket.onmessage = function(evt) {
    console.log('evt',evt);
  };

  /*
      LINE LOGIC
   */

  function drawLine() {
    var el = document.getElementsByTagName("canvas")[0];
    var ctx = el.getContext("2d");
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.beginPath();
    ctx.moveTo(0,ctx.canvas.height/2);
    ctx.lineWidth=5;
    ctx.lineTo(ctx.canvas.width,ctx.canvas.height/2);
    ctx.stroke();
    lineCenter = ctx.canvas.height/2;
  }
  drawLine();


  var color = goldenColors.getHsvGolden(0.5, 0.95);
  var lineColorRGB = {r: color.r, g: color.g, b: color.b};
  var lineColor = colorToHex(color.r, color.g, color.b);
  var lineCenter = null;
  var lastTouch = null;
  var crosses = [];

  function drawDot(x) {
    var el = document.getElementsByTagName("canvas")[0];
    var ctx = el.getContext("2d");
    ctx.beginPath();
    ctx.rect(x - 5, ctx.canvas.height/2 - 5, 10, 10);
    ctx.fillStyle = "red";
    ctx.fill();
  }

  function addNode(x, direction) {
    var el = document.getElementsByTagName("canvas")[0];
    var ctx = el.getContext("2d");
    var midi = Math.floor((x / ctx.canvas.width)*16);
    console.log('midi',midi);
    crosses.push({x: x, direction: direction, midi: midi});
    drawDot(x);
  }

  function checkLine(touch) {
    if (!lastTouch) {
      lastTouch = touch;
    } else {
      if (touch.clientY >= lineCenter && lastTouch.clientY < lineCenter) {
        console.log('moved DOWN!');
        addNode((touch.clientX + lastTouch.clientX) / 2, 'down');
      } else if (touch.clientY <= lineCenter && lastTouch.clientY > lineCenter) {
        console.log('moved UP!');
        addNode((touch.clientX + lastTouch.clientX) / 2, 'down');
      }
      lastTouch = touch;
    }
  }


  function colorToHex(r, g, b) {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);
    var color = "#" + r + g + b;
    return color;
  }

  function finishTouch() {
    console.log('crosses',crosses);
    var toSend = [];
    crosses.forEach(function(cross, iter) {
      toSend.push({midi: cross.midi, dir: cross.direction});
    });
    console.log('lineColor',lineColor);
    socket.send(JSON.stringify({type: 'notes', data: toSend, color: {hex: lineColor, rgb: lineColorRGB}}));
    lastNote = null;
    crosses = [];
  }
  /*
      RESIZE LOGIC
   */
  window.onresize = function(event) {
    console.log('resized');
    drawLine();
  };

  /*
      TOUCH EVENTS
   */
  window.startup = function() {
    var el = document.body;
    el.addEventListener("touchstart", handleStart, false);
    el.addEventListener("touchend", handleEnd, false);
    el.addEventListener("touchcancel", handleCancel, false);
    el.addEventListener("touchleave", handleEnd, false);
    el.addEventListener("touchmove", handleMove, false);
    log("initialized.");
  }
  var ongoingTouches = new Array;

  function handleStart(evt) {
    crosses = [];
    lastTouch = null;
    //  log("touchstart.");
    var el = document.getElementsByTagName("canvas")[0];
    var ctx = el.getContext("2d");
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    var touches = evt.changedTouches;
    var offset = findPos(el);


    for (var i = 0; i < touches.length; i++) {
      if (touches[i].clientX - offset.x > 0 && touches[i].clientX - offset.x < parseFloat(el.width) && touches[i].clientY - offset.y > 0 && touches[i].clientY - offset.y < parseFloat(el.height)) {
        evt.preventDefault();
        log("touchstart:" + i + "...");
        ongoingTouches.push(copyTouch(touches[i]));
        ctx.beginPath();
        ctx.arc(touches[i].clientX - offset.x, touches[i].clientY - offset.y, 4, 0, 2 * Math.PI, false); // a circle at the start
        ctx.fillStyle = lineColor;
        ctx.fill();
        drawLine();
        log("touchstart:" + i + ".");
      }
    }
  }

  function handleMove(evt) {

    var el = document.getElementsByTagName("canvas")[0];
    var ctx = el.getContext("2d");
    var touches = evt.changedTouches;
    var offset = findPos(el);

    for (var i = 0; i < touches.length; i++) {
      if (touches[i].clientX - offset.x > 0 && touches[i].clientX - offset.x < parseFloat(el.width) && touches[i].clientY - offset.y > 0 && touches[i].clientY - offset.y < parseFloat(el.height)) {
        evt.preventDefault();
        var idx = ongoingTouchIndexById(touches[i].identifier);
        if (idx >= 0) {
          /*
              CHECK LINE
           */
          checkLine(ongoingTouches[idx]);
          log("continuing touch " + idx);
          ctx.beginPath();
          log("ctx.moveTo(" + ongoingTouches[idx].clientX + ", " + ongoingTouches[idx].clientY + ");");
          ctx.moveTo(ongoingTouches[idx].clientX - offset.x, ongoingTouches[idx].clientY - offset.y);
          log("ctx.lineTo(" + touches[i].clientX + ", " + touches[i].clientY + ");");
          ctx.lineTo(touches[i].clientX - offset.x, touches[i].clientY - offset.y);
          ctx.lineWidth = 4;
          ctx.strokeStyle = lineColor;
          ctx.stroke();

          ongoingTouches.splice(idx, 1, copyTouch(touches[i])); // swap in the new touch record
          log(".");
        } else {
          log("can't figure out which touch to continue");
        }
      }
    }
  }

  function handleEnd(evt) {

    //  log("touchend/touchleave.");
    var el = document.getElementsByTagName("canvas")[0];
    var ctx = el.getContext("2d");
    var touches = evt.changedTouches;
    var offset = findPos(el);

    for (var i = 0; i < touches.length; i++) {
      if (touches[i].clientX - offset.x > 0 && touches[i].clientX - offset.x < parseFloat(el.width) && touches[i].clientY - offset.y > 0 && touches[i].clientY - offset.y < parseFloat(el.height)) {
        evt.preventDefault();
        var idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
          finishTouch();
          ctx.lineWidth = 4;
          ctx.fillStyle = lineColor;
          ctx.beginPath();
          ctx.moveTo(ongoingTouches[idx].clientX - offset.x, ongoingTouches[idx].clientY - offset.y);
          ctx.lineTo(touches[i].clientX - offset.x, touches[i].clientY - offset.y);
          ctx.fillRect(touches[i].clientX - 4 - offset.x, touches[i].clientY - 4 - offset.y, 8, 8); // and a square at the end
          ongoingTouches.splice(i, 1); // remove it; we're done
        } else {
          log("can't figure out which touch to end");
        }
      }
    }
  }

  function handleCancel(evt) {
    evt.preventDefault();
    log("touchcancel.");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
      ongoingTouches.splice(i, 1); // remove it; we're done
    }
  }

  function copyTouch(touch) {
    return { identifier: touch.identifier, clientX: touch.clientX, clientY: touch.clientY };
  }

  function ongoingTouchIndexById(idToFind) {
    for (var i = 0; i < ongoingTouches.length; i++) {
      var id = ongoingTouches[i].identifier;

      if (id == idToFind) {
        return i;
      }
    }
    return -1; // not found
  }

  function log(msg) {
    // var p = document.getElementById('log');
    // p.innerHTML = msg + "\n" + p.innerHTML;
  }

  function findPos(obj) {
    var curleft = 0,
      curtop = 0;

    if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);

      return { x: curleft - document.body.scrollLeft, y: curtop - document.body.scrollTop };
    }
  }

});
