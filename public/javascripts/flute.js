var TEST_SONG = [8,12,10,12,8,12,10,12,8,13,11,13,8,13,11,13];

var MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];

var BASE_NOTE = 48;
var STEPS = 16;

var notes = [];

function createNotes(baseNote, cb) {
  var maxWidth = window.innerWidth;
  for (var i = 0; i < STEPS; i++) {
    var noteWidth = maxWidth / STEPS;
    notes[i] = {
      midi: BASE_NOTE + (i < 7 ? 0 : (i > 13 ? 24 : 12)) + MAJOR_SCALE[(i % MAJOR_SCALE.length)],
      left: noteWidth*i,
      width: noteWidth,
      height: noteWidth,
      center: noteWidth*i + noteWidth/2
    }
  }
  cb();
}

function renderNotes() {
  $('#canvas').html(
    (function() {
      var notesHTML = '';
      notes.forEach(function(note, iter) {
        notesHTML+=(
          '<div ' +
            'class="note" '+
            'id="' + note.midi + '" ' +
            'style="' +
              'left:' + note.left + 'px;' +
              'width:' + note.width + 'px;' +
              'height:' + note.height + 'px;' +
              // create hex background color
              'background-color:#' + parseInt((230*(iter/STEPS) + 16)).toString(16) + 'AAAA;' +
            '" ' +
          '></div>'
        );
      });
      return notesHTML;
    })());
}

var meter;


$(document).ready(function() {
  /*
      Incoming data on socket
   */
  var socket = new WebSocket('ws://0.0.0.0:8081/');

  socket.onmessage = function(evt) {
      var result = JSON.parse(evt.data);
  };

  // render notes
  createNotes(BASE_NOTE, renderNotes);

  $('#start').on('click', function() {
    console.log('start');
    playSong();
  });

  $('#stop').on('click', function() {
    console.log('stop');
    clearTimeout(meter);
  });

  function playSong() {
    var songIndex = 0;
    function nextNote() {
      console.log('songIndex',songIndex);
      console.log(12 + BASE_NOTE + MAJOR_SCALE[(TEST_SONG[songIndex] - 1) % 7]);
      // TODO subtract one from each note in TEST_SONG and don't hardcode the octave shift
      sendNote(12 + BASE_NOTE + MAJOR_SCALE[(TEST_SONG[songIndex] - 1) % 7]);
      songIndex++;
      if (songIndex === TEST_SONG.length) songIndex = 0;
      meter = setTimeout(nextNote, 500);
    }

    nextNote();
  }

  $('.note').on('click', function(evt) {
      var note = $(this).attr("id")
      sendNote(note);
  });

  $('.note').on('mouseenter', function(evt) {
      var note = $(this).attr("id")
      sendNote(note);
  });

  function sendNote (note) {
    console.log('note',note);
    socket.send(note);
  }
})
