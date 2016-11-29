var DEFAULT_BASE_NOTE = 48;
var DEFAULT_SONG_RATE = 450;

var TEST_SONG = [7,11,9,11,7,11,9,11,7,12,10,12,7,12,10,12];
var MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];

var CANVAS_TOP = 225; // get this from the css file from .note
var STEPS = 16;
var NOTE_DURATION = 200; // 0.2 second delay set in SuperCollider

var notes = [];

Player = function (id, baseNote, songRate, sendNote) {
  this.id = id;
  this.leftHand = null;
  this.rightHand = null;
  this.baseNote = baseNote || DEFAULT_BASE_NOTE;
  this.songRate = songRate || DEFAULT_SONG_RATE;
  this.meter = null;
  this.sendNote = sendNote;
  this.songIndex = 0;
  this.noteCount = 0;

  // create player span
  $('.players').append(
    '<div class="player" id="'+this.id+'"><span><div class="cursor-wrapper"><div class="cursor"></div></div></span></div>'
  );

  this.self = $('#'+this.id+' span');

  this.self.css('-webkit-transition', 'all ' + this.songRate + 'ms linear');
  this.self.css('transition', 'all ' + this.songRate + 'ms linear');

  console.log('this.songRate',this.songRate);
}

Player.prototype.start = function() {
  console.log('this',this);
  var that = this;
  function nextNote() {
    // TODO subtract one from each note in TEST_SONG and don't hardcode the octave shift
    var midiNote = 12 + that.baseNote + MAJOR_SCALE[(TEST_SONG[that.songIndex]) % 7];

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
    that.sendNote(midiNote);
    animateNote(midiNote);

    console.log('this.songRate',that.songRate);
    // recursive call at SONG_RATE
    that.meter = setTimeout(nextNote, that.songRate);

    that.noteCount++;
    that.songIndex++;
    if (that.songIndex === TEST_SONG.length) that.songIndex = 0;
  }

  nextNote();
}

Player.prototype.render = function() {
  this.self.css('-webkit-transform', 'rotate(' + (this.noteCount + 1)* 180 + 'deg)');
  this.self.css('transform:','rotate(' + (this.noteCount + 1) * 180 + 'deg)');

  var diameter = this.rightHand.center - this.leftHand.center;
  var top = CANVAS_TOP + this.leftHand.width/2 - diameter/2;
  var left = this.leftHand.center;
  this.self.css('top', top);
  this.self.css('left', left);
  this.self.css('height', diameter);
  this.self.css('width', diameter);
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
      midi: DEFAULT_BASE_NOTE + (i < 7 ? 0 : (i > 13 ? 24 : 12)) + MAJOR_SCALE[(i % MAJOR_SCALE.length)],
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
}


function animateNote(note) {
  // note transition
  var activeNote = $('#'+note);
  console.log('activeNote',activeNote);
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
  createNotes(DEFAULT_BASE_NOTE, renderNotes);
  initializeSettings();

  // create sequencer
  var mozart = new Player('mozart', 48, 500, sendNote);

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
