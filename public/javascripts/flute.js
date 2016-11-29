var CANVAS_TOP = 225; // get this from the css file from .note

var TEST_SONG = [7,11,9,11,7,11,9,11,7,12,10,12,7,12,10,12];

var MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];

var BASE_NOTE = 48;
var SONG_RATE = 1000;

var NOTE_DURATION = 200; // 0.2 second delay set in SuperCollider

var STEPS = 16;

var notes = [];

Player = function (sendNote) {
  this.leftHand = null;
  this.rightHand = null;
  this.meter = null;
  this.sendNote = sendNote;
  this.songIndex = 0;
  this.noteCount = 0;
  console.log('this.sendNote',this.sendNote);
}

Player.prototype.start = function() {
  console.log('this',this);
  var that = this;
  function nextNote() {
    // TODO subtract one from each note in TEST_SONG and don't hardcode the octave shift
    var midiNote = 12 + BASE_NOTE + MAJOR_SCALE[(TEST_SONG[that.songIndex]) % 7];

    // get actual note mappings
    var current = TEST_SONG[that.songIndex];

    var nextIndex = (that.songIndex + 1) % TEST_SONG.length;
    var next = TEST_SONG[nextIndex];

    // if neither hand is setup
    if (!that.rightHand && !that.leftHand) {
      if (current < next) {
        that.leftHand = notes[current];
        that.rightHand = notes[next];
      } else {
        that.leftHand = notes[next];
        that.rightHand = notes[current];
      }
    } else {
      // reassign notes
      if (next > current) {
        that.leftHand = notes[current];
        that.rightHand = notes[next];
      } else  {
        that.leftHand = notes[next];
        that.rightHand = notes[current];
      }
    }

    that.render();
    // play note
    console.log('midiNote',midiNote);
    that.sendNote(midiNote);
    animateNote(midiNote);

    // recursive call at SONG_RATE
    that.meter = setTimeout(nextNote, SONG_RATE);

    that.noteCount++;
    that.songIndex++;
    if (that.songIndex === TEST_SONG.length) that.songIndex = 0;
  }

  nextNote();
}

Player.prototype.render = function() {
  $('#player span').css('-webkit-transform', 'rotate(' + (this.noteCount + 1)* 180 + 'deg)');
  $('#player span').css('transform:','rotate(' + (this.noteCount + 1) * 180 + 'deg)');

  var diameter = this.rightHand.center - this.leftHand.center;
  var top = CANVAS_TOP + this.leftHand.width/2 - diameter/2;
  var left = this.leftHand.center;
  $('#player span').css('top', top);
  $('#player span').css('left', left);
  $('#player span').css('height', diameter);
  $('#player span').css('width', diameter);
}

Player.prototype.stop = function() {
  clearTimeout(this.meter);
}


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

function initializeSettings() {
  $('.note').css('top', CANVAS_TOP);
  $('#player span').css('-webkit-transition', 'all ' + SONG_RATE + 'ms linear');
  $('#player span').css('transition', 'all ' + SONG_RATE + 'ms linear');
}


function animateNote(note) {
  // note transition
  var activeNote = $('#'+note);
  activeNote.addClass('active');
  setTimeout(function() {
    activeNote.removeClass('active');
  }, NOTE_DURATION);
}

$(document).ready(function() {
  /*
      SOCKET OPERATIONS
   */
  var socket = new WebSocket('ws://0.0.0.0:8081/');

  socket.onmessage = function(evt) {
      var result = JSON.parse(evt.data);
  };

  function sendNote (note) {
    socket.send(note);
  }

  /*
    INITIALIZE
   */
  createNotes(BASE_NOTE, renderNotes);
  initializeSettings();

  // create sequencer
  var mozart = new Player(sendNote);

  $('#start').on('click', function() {
    mozart.start();
  });

  $('#stop').on('click', function() {
    mozart.stop();
  });

  /*
    USER INPUT
   */
  $('.note').on('click', function(evt) {
      var note = $(this).attr("id")
      sendNote(note);
  });

  $('.note').on('mouseenter', function(evt) {
      var note = $(this).attr("id")
      sendNote(note);
  });
});
