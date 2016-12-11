$(document).ready(function() {
  /*
      SOCKETS
   */
  // home
  // var socket = new WebSocket("ws://192.168.0.4:8088/");
  // sfpc
  // var socket = new WebSocket("ws://192.168.1.237:8088/");
  // sfpc ngrok
  var socket = new WebSocket("ws://sfpc_view.ngrok.io/");
  // localhost
  // var socket = new WebSocket("ws://127.0.0.1:8088/");
  // var socket = new WebSocket("ws://192.168.1.237:8088/");
  // catberry
  // var socket = new WebSocket("ws://10.0.1.31:8088/");
  socket.onmessage = function(evt) {};

  socket.onclose = function(evt) {
    $('.instructions').css('display', 'none');
    $('.reconnect').css('display', 'initial');
    setTimeout(function() { $('.modal-wrapper').css('opacity', '1');}, 250);
    $('.modal-wrapper').css('display', 'initial')

    // }
  };
  /*
      TEMPO LOGIC
   */
  // auto assign quarter note or half note
  var tempo = Math.floor(Math.random() * 3);
  $('.tempo ul #' + tempo).addClass('active');

  $('.tempo ul li').on('touchstart', function(evt) {
    $('.tempo ul li').removeClass('active');
    $(this).addClass('active');
    tempo = this.id;
    socket.send(JSON.stringify({ type: 'tempo', tempo: tempo }));
  });

  $('#play').on('touchstart', function(evt) {
    $('#pause').removeClass('active');
    $(this).addClass('active');
    socket.send(JSON.stringify({ type: 'stop' }));
  });

  $('#pause').on('touchstart', function(evt) {
    $('#play').removeClass('active');
    $(this).addClass('active');
    socket.send(JSON.stringify({ type: 'start' }));
  });

  /*
      LINE LOGIC
   */
  function drawLine() {
    var el = document.getElementsByTagName("canvas")[0];
    var ctx = el.getContext("2d");
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.beginPath();
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "black";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, ctx.canvas.height / 2);
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineTo(ctx.canvas.width, ctx.canvas.height / 2);
    ctx.strokeStyle = "#FFFFFF";
    ctx.stroke();
    lineCenter = ctx.canvas.height / 2;
  }

  drawLine();

  var color = goldenColors.getHsvGolden(0.5, 0.95);
  var lineColorRGB = { r: color.r, g: color.g, b: color.b };
  var lineColor = colorToHex(color.r, color.g, color.b);

  if (window.innerHeight > window.innerWidth) {
    $('.landscape').css('display', 'initial');
  }
  $('.url').css('display', (window.innerWidth > 800 ? 'initial':'none'));
  $('.color').css('background-color', lineColor);
  $('.modal-wrapper').css('display','initial');

  var complement = '#' + ('000000' + (('0xffffff' ^ ('0x' + lineColor.split('#')[1])).toString(16))).slice(-6);
  var lineCenter = null;
  var lastTouch = null;
  var lastPoint = null;
  var playing = false;
  var timeout = 0;
  var finalTouches = [];
  var crosses = [];

  function drawDot(x, primary) {
    var el = document.getElementsByTagName("canvas")[0];
    var ctx = el.getContext("2d");

    ctx.beginPath();
    ctx.arc(x, ctx.canvas.height / 2, 12, 0, 2 * Math.PI, false);
    ctx.fillStyle = lineColor;
    ctx.fill();
    ctx.strokeStyle = lineColor;
    ctx.stroke();

    // ctx.beginPath();
    // ctx.rect(x - 9, ctx.canvas.height / 2 - 9, 18, 18);
    // ctx.fillStyle = 'white';
    // ctx.fill();
    // ctx.beginPath();
    // ctx.rect(x - 5, ctx.canvas.height / 2 - 5, 10, 10);
    // ctx.fillStyle = (primary ? lineColor : complement);
    // ctx.fill();
  }

  function addNode(x, direction) {
    var el = document.getElementsByTagName("canvas")[0];
    var ctx = el.getContext("2d");
    var midi = Math.floor((x / ctx.canvas.width) * 16);
    crosses.push({ x: x, direction: direction, midi: midi });
    drawDot(x, false);
  }

  function checkLine(touch) {
    if (!lastTouch) {
      lastTouch = touch;
    } else {
      if (touch.clientY >= lineCenter && lastTouch.clientY < lineCenter) {
        var m = (lastTouch.clientY - touch.clientY) / (lastTouch.clientX - touch.clientX);
        if (m !== -Infinity || m!== Infinity) {
          var el = document.getElementsByTagName("canvas")[0];
          var ctx = el.getContext("2d");
          var dy =  lastTouch.clientY - ctx.canvas.height/2;
          var x_tar = (m*lastTouch.clientX - dy) / m;
          console.log('x_tar',x_tar);
          if (!!x_tar) {
            addNode(x_tar, 'down');
          } else {
            addNode((touch.clientX + lastTouch.clientX) / 2, 'down');
          }
        } else {
          addNode((touch.clientX + lastTouch.clientX) / 2, 'down');
        }
      } else if (touch.clientY <= lineCenter && lastTouch.clientY > lineCenter) {
        var m = (lastTouch.clientY - touch.clientY) / (lastTouch.clientX - touch.clientX);
        if (m !== -Infinity || m!== Infinity) {
          var el = document.getElementsByTagName("canvas")[0];
          var ctx = el.getContext("2d");
          var dy =  lastTouch.clientY - ctx.canvas.height/2;
          var x_tar = (m*lastTouch.clientX - dy) / m;
          console.log('x_tar',x_tar);
          if (!!x_tar) {
            addNode(x_tar, 'up');
          } else {
            addNode((touch.clientX + lastTouch.clientX) / 2, 'up');
          }
        } else {
          addNode((touch.clientX + lastTouch.clientX) / 2, 'up');
        }
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
    drawLine();
    var el = document.getElementsByTagName("canvas")[0];
    var ctx = el.getContext("2d");
    var offset = findPos(el);
    for (var i = 0; i < finalTouches.length-1; i++) {
    // redraw lines in ~~~color~~~
      ctx.beginPath();
      ctx.strokeStyle = "#FFFFFF";
      ctx.globalAlpha = 1;
      ctx.moveTo(finalTouches[i].x, finalTouches[i].y);
      ctx.lineTo(finalTouches[i+1].x, finalTouches[i+1].y);
      ctx.stroke();
      ctx.moveTo(finalTouches[i].x - 4, finalTouches[i].y - 4);
      ctx.lineTo(finalTouches[i+1].x - 4, finalTouches[i+1].y - 4);
      ctx.stroke();
      ctx.moveTo(finalTouches[i].x - 2, finalTouches[i].y - 2);
      ctx.lineTo(finalTouches[i+1].x - 2, finalTouches[i+1].y - 2);
      ctx.stroke();
      ctx.moveTo(finalTouches[i].x + 2, finalTouches[i].y + 2);
      ctx.lineTo(finalTouches[i+1].x + 2, finalTouches[i+1].y + 2);
      ctx.stroke();
      ctx.moveTo(finalTouches[i].x + 4, finalTouches[i].y + 4);
      ctx.lineTo(finalTouches[i+1].x + 4, finalTouches[i+1].y + 4);
      ctx.stroke();
    }

    var toSend = [];
    crosses.forEach(function(cross, iter) {
      // redraw dots
      drawDot(cross.x, true);
      toSend.push({ midi: cross.midi, dir: cross.direction });
    });
    socket.send(JSON.stringify({ type: 'notes', tempo: tempo, data: toSend, color: { hex: lineColor, rgb: lineColorRGB } }));
    lastNote = null;
    timeout = 0;
    playing = true;
    crosses = [];
  }

  var timeout = function() {
    if (playing) {
      timeout += 1;
      // 30 seconds before being removed from the screen
      if (timeout >= 45) {
        playing = false;
        timeout = 0;
        drawLine();
      }
    }
  }

  // watch for timeout every second
  setInterval(timeout, 1000);

  /*
      RESIZE LOGIC
   */
  window.onresize = function(event) {
    if (window.innerHeight > window.innerWidth) {
      $('.landscape').css('display', 'initial');
    } else {
      $('.landscape').css('display', 'none');
    }
    drawLine();
  };

  /*
      TOUCH EVENTS
   */
  window.startup = function() {
    // hide modal
    $('.modal-wrapper').css('opacity', '0');
    setTimeout(function() { $('.modal-wrapper').css('display', 'none') }, 250);

    var el = document.getElementsByTagName("canvas")[0];
    el.addEventListener("touchstart", handleStart, false);
    el.addEventListener("touchend", handleEnd, false);
    el.addEventListener("touchcancel", handleCancel, false);
    el.addEventListener("touchleave", handleEnd, false);
    el.addEventListener("touchmove", handleMove, false);
  }
  var ongoingTouches = new Array;
  var firstTouch = null;

  function handleStart(evt) {
    crosses = [];
    lastTouch = null;
    finalTouches = [];
    var el = document.getElementsByTagName("canvas")[0];
    var touches = evt.changedTouches;
    var offset = findPos(el);
    for (var i = 0; i < touches.length; i++) {
      if (touches[i].clientX - offset.x > 0 && touches[i].clientX - offset.x < parseFloat(el.width) && touches[i].clientY - offset.y > 0 && touches[i].clientY - offset.y < parseFloat(el.height)) {
        evt.preventDefault();
        if (!ongoingTouches.length) {
          ongoingTouches.push(copyTouch(touches[i]));
        }
        lastPoint = {x:touches[i].clientX - offset.x, y: touches[i].clientY - offset.y};
        finalTouches.push({x:touches[i].clientX - offset.x, y: touches[i].clientY - offset.y});
        drawLine();
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
          finalTouches.push({x:touches[i].clientX - offset.x, y: touches[i].clientY - offset.y});
          checkLine(ongoingTouches[idx]);
          // ctx.beginPath();
          // ctx.moveTo(ongoingTouches[idx].clientX - offset.x, ongoingTouches[idx].clientY - offset.y);
          // ctx.lineTo(touches[i].clientX - offset.x, touches[i].clientY - offset.y);
          // ctx.lineWidth = 4;
          // ctx.stroke();
          //
          ctx.strokeStyle = lineColor;
          ctx.beginPath();

          ctx.globalAlpha = 1;
          ctx.moveTo(lastPoint.x, lastPoint.y);
          ctx.lineTo(touches[i].clientX, touches[i].clientY);
          ctx.stroke();

          ctx.moveTo(lastPoint.x - 4, lastPoint.y - 4);
          ctx.lineTo(touches[i].clientX - 4, touches[i].clientY - 4);
          ctx.stroke();

          ctx.moveTo(lastPoint.x - 2, lastPoint.y - 2);
          ctx.lineTo(touches[i].clientX - 2, touches[i].clientY - 2);
          ctx.stroke();

          ctx.moveTo(lastPoint.x + 2, lastPoint.y + 2);
          ctx.lineTo(touches[i].clientX + 2, touches[i].clientY + 2);
          ctx.stroke();

          ctx.moveTo(lastPoint.x + 4, lastPoint.y + 4);
          ctx.lineTo(touches[i].clientX + 4, touches[i].clientY + 4);
          ctx.stroke();

          lastPoint = { x: touches[i].clientX, y: touches[i].clientY };

          ongoingTouches.splice(idx, 1, copyTouch(touches[i])); // swap in the new touch record
        }
      }
    }
  }

  function handleEnd(evt) {
    var el = document.getElementsByTagName("canvas")[0];
    var ctx = el.getContext("2d");
    var touches = evt.changedTouches;
    var offset = findPos(el);
    for (var i = 0; i < touches.length; i++) {
      evt.preventDefault();
      var idx = ongoingTouchIndexById(touches[i].identifier);
      finalTouches.push({x:touches[i].clientX - offset.x, y: touches[i].clientY - offset.y});
      if (idx >= 0) {
        finishTouch();
        ctx.lineWidth = 4;
        ctx.fillStyle = lineColor;
        ctx.beginPath();
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.moveTo(ongoingTouches[idx].clientX - offset.x, ongoingTouches[idx].clientY - offset.y);
        ctx.lineTo(touches[i].clientX - offset.x, touches[i].clientY - offset.y);
        ongoingTouches.splice(i, 1);
      }
    }
  }

  function handleCancel(evt) {
    finishTouch();
    evt.preventDefault();
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
      ongoingTouches.splice(i, 1);
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
    return -1;
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
