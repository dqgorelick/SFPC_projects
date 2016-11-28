var CANVAS_TOP = 150; // get this from the css file from .note

var TEST_SONG = [7,11,9,11,7,11,9,11,7,12,10,12,7,12,10,12];

var MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];

var BASE_NOTE = 48;
var NOTE_DURATION = 200; // 0.2 second delay set in SuperCollider
var STEPS = 16;

var rotationAngle = 0;
var notes = [];

var player = {
  leftHand: null,
  rightHand: null,
};

// used for setTimeout
var meter;

// create the note objects
function createNotes(baseNote, cb) {
  var maxWidth = window.innerWidth;
  for (var i = 0; i < STEPS; i++) {
    var noteWidth = maxWidth / STEPS;
    notes[i] = {
      id: i,
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

function rotatePlayer() {
  rotationAngle += 180;
  $('#player span').css('-webkit-transform', 'rotate(' + rotationAngle + 'deg)');
  // $('#player span').css('-moz-transform', 'rotate(' + rotationAngle + 'deg)');
  // $('#player span').css('-o-transform', 'rotate(' + rotationAngle + 'deg)');
  // $('#player span').css('-ms-transform', 'rotate(' + rotationAngle + 'deg)');
  $('#player span').css('transform:','rotate(' + rotationAngle + 'deg)');
}

function updatePlayer(songIndex, cb) {
  // get next song index =
  var nextIndex = (songIndex + 1) % TEST_SONG.length;

  // get actual note mappings
  var current = TEST_SONG[songIndex];
  var next = TEST_SONG[nextIndex];

  console.log('current',current);
  console.log('next',next);
  // if neither hand is setup
  if (!player.rightHand && !player.leftHand) {
    player.rightHand = notes[current];
    player.leftHand = notes[current];
  }

  // decide which hand to move
  // defaults to move right hand for higher notes
  // moves left hand for lower notes
  if (next > current) {
    player.rightHand = notes[next];
  } else if (next < current) {
    player.leftHand = notes[next];
  }

  console.log('player',player);
  cb();
}

function renderPlayer() {
    var diameter = player.rightHand.center - player.leftHand.center;
    var top = CANVAS_TOP + player.leftHand.width/2 - diameter/2;
    var left = player.leftHand.center;
    $('#player span').css('top', top);
    $('#player span').css('left', left);
    $('#player span').css('height', diameter);
    $('#player span').css('width', diameter);
}

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

  $('#rotate').on('click', function() {
    console.log('rotate');
    // $('#player span').addClass('rotate');
    rotatePlayer()
  });

  $('#rotate2').on('click', function() {
    console.log('rotate2');
    $('#player span').removeClass('rotate');
  });

  function playSong() {
    var songIndex = 0;
    function nextNote() {
      // TODO subtract one from each note in TEST_SONG and don't hardcode the octave shift
      var midiNote = 12 + BASE_NOTE + MAJOR_SCALE[(TEST_SONG[songIndex]) % 7];
      sendNote(midiNote);
      songIndex++;

      // note transition
      var activeNote = $('#'+midiNote);
      activeNote.addClass('active');
      setTimeout(function() {
        activeNote.removeClass('active');
      }, NOTE_DURATION);

      // player logic
      rotatePlayer();
      setTimeout(updatePlayer(songIndex, renderPlayer), 250);

      if (songIndex === TEST_SONG.length) songIndex = 0;
      meter = setTimeout(nextNote, 250);
    }

    nextNote();
  }

  // event listeners for the user
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
