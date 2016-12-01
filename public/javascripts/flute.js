'use strict';

var DEFAULT_BASE_NOTE = 48;
var DEFAULT_SONG_RATE = 450;

// var TEST_SONG = [7,11,9,11,7,11,9,11,7,12,10,12,7,12,10,12];
var TEST_SONG = [7,11,9,11,7,12,10,12];
// var TEST_SONG_HARMONY = [0, 2, 4, 2, 0, 2, 4, 2, 0, 3, 5, 3, 0, 3, 5, 3];
var TEST_SONG_HARMONY = [4, 0, 2, 0, 4, 0, 2, 0, 5, 3, 4, 3, 5, 3, 4, 3];
var CLIMBING_SONG_1 = [0,2,1,3,2,4,3,5,4,6,5,7,6,8,7,9,8,10,9,11,10,12,11,13,12,14];
// var CLIMBING_SONG_2 = [1,3,2,4,3,5,4,6,5,7,6,8,7,9,8,10,9,11,10,12,11,13,12,14,13,15];
var CLIMBING_SONG_2 = [0,2,4,6,7,9,11,13,14];

var MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
var MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];

var CANVAS_TOP = 225; // get this from the css file from .note
var CURSOR_WIDTH = 26;
var CW = 1;
var CCW = -1;
var CURSOR_LEFT = 0;
var CURSOR_RIGHT = 1;
var STEPS = 16;
var NOTE_DURATION = 200; // 0.2 second delay set in SuperCollider

var notes = [];

var Player = function (id, options, sendNote) {
  this.id = id;
  this.leftHand = null;
  this.rightHand = null;
  this.song = options.song || TEST_SONG;
  this.playing = false;
  this.baseNote = options.baseNote || DEFAULT_BASE_NOTE;
  this.songRate = options.songRate || DEFAULT_SONG_RATE;
  this.meter = null;
  this.toFlip = false;
  this.sendNote = sendNote;
  this.songIndex = 0;
  this.rotationCount = 0;
  this.states = {
    1: {
      rotation: CW,
      orientation: CURSOR_RIGHT
    },
    2: {
      rotation: CCW,
      orientation: CURSOR_LEFT
    }
  }
  // create player span
  $('.players').append(
    '<div class="player" id="'+this.id+'"><span><div class="cursor-wrapper"><div class="cursor"></div><div class="cursor-right"></div></div></span></div>'
  );
  this.jQuery = $('#'+this.id+' span');
  this.cursorRight = this.jQuery.find('.cursor-right');
  this.cursorLeft = this.jQuery.find('.cursor');


  // this.jQuery.css('-webkit-transition', 'all ' + this.songRate + 'ms linear');
  // this.jQuery.css('transition', 'all ' + this.songRate + 'ms linear');
  this.jQuery.css('-webkit-transition', '-webkit-transform ' + this.songRate + 'ms linear');
  this.jQuery.css('transition', 'transform ' + this.songRate + 'ms linear');
  this.cursorRight.css('background-color', options.color);
  this.cursorLeft.css('background-color', options.color);
}
Player.prototype.start = function() {
  var self = this;
  function nextNote() {
    // get actual note mappings
    var current = self.song[self.songIndex];

    // TODO subtract one from each note in TEST_SONG and don't hardcode the octave shift
    var midiNote = (current < 7 ? 0 : (current > 13 ? 24 : 12)) + self.baseNote + MINOR_SCALE[(current) % 7];

    var next = self.song[(self.songIndex + 1) % self.song.length];
    var next_2 = self.song[(self.songIndex + 2) % self.song.length];

    // if neither hand is setup
    // initial setup

    if (!self.leftHand && !self.rightHand) {
      if (current < next) {
        self.state = 1;
      } else if (current > next) {
        self.state = 2;
      }
    } else {
      switch(self.state) {
        case 1:
          self.state = (self.toFlip ? 2 : 1);
          break;
        case 2:
          self.state = (self.toFlip ? 1 : 2);
          break;
        default:
          console.error('invalid state reached');
          break;
      }
      self.toFlip = false;
    }

    if (current < next) {
      if (next <= next_2) {
        self.toFlip = true;
      }
      self.leftHand = notes[current];
      self.rightHand = notes[next];
    } else if (current > next) {
      if (next >= next_2) {
        self.toFlip = true;
      }
      self.leftHand = notes[next];
      self.rightHand = notes[current];
    }

    // play and animate note
    self.sendNote(midiNote);
    animateNote(midiNote);

    // render cursor
    self.render();

    // recursive call at SONG_RATE
    self.meter = setTimeout(nextNote, self.songRate);

    self.songIndex++;
    if (self.songIndex === self.song.length) self.songIndex = 0;
  }

  if (!this.playing) {
    nextNote();
    this.playing = true;
  }
}
Player.prototype.render = function() {
  var params = this.states[this.state];
  this.rotationCount += params.rotation;
  this.jQuery.css('-webkit-transform', 'rotate(' + (this.rotationCount)*180 + 'deg)');
  this.jQuery.css('transform:','rotate(' + (this.rotationCount)*180 + 'deg)');

  if (params.orientation === CURSOR_LEFT) {
    this.cursorRight.css('display','initial')
    this.cursorLeft.css('display','none')
  } else {
    this.cursorRight.css('display','none')
    this.cursorLeft.css('display','initial')
  }
  var diameter = this.rightHand.center - this.leftHand.center;
  var top = CANVAS_TOP + this.leftHand.width/4 - diameter/2;
  var left = this.leftHand.center;
  this.jQuery.css('top', top);
  this.jQuery.css('left', left);
  this.jQuery.css('height', diameter);
  this.jQuery.css('width', diameter);
}
Player.prototype.stop = function() {
  clearTimeout(this.meter);
  this.playing = false;
}

// var Conductor = function() {
//   this.baseTempo = 300;
//   this.players = [];
// }
// Conductor.prototype.createPlayer() {

// }

// create the note objects
function createNotes(baseNote, cb) {
  var maxWidth = window.innerWidth;
  for (var i = 0; i < STEPS; i++) {
    var noteWidth = maxWidth / STEPS;
    notes[i] = {
      id: i,
      midi: DEFAULT_BASE_NOTE + (i < 7 ? 0 : (i > 13 ? 24 : 12)) + MINOR_SCALE[(i % MINOR_SCALE.length)],
      left: noteWidth*i,
      width: noteWidth,
      height: noteWidth / 2,
      top: noteWidth/4,
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
              'top:' + note.top + 'px;' +
              'width:' + note.width + 'px;' +
              'height:' + note.height + 'px;' +
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

  /**
   * create Player class with
   * (id, options = {baseNote, songRate, song}, sendNote);
   */
  var bach = new Player('bach', {songRate: 600, song:TEST_SONG, color:'#57AA83'}, sendNote);

  $('#start-bach').hover(function() {
    bach.start();
  });
  $('#stop-bach').hover(function() {
    bach.stop();
  });

  var mozart = new Player('mozart', {songRate: 300, song:CLIMBING_SONG_1, color:'#7A3126'}, sendNote);

  $('#start-mozart').hover(function() {
    mozart.start();
  });
  $('#stop-mozart').hover(function() {
    mozart.stop();
  });

  var dvorak = new Player('dvorak', {songRate: 300, song:CLIMBING_SONG_2, color:'#7A2675'}, sendNote);

  $('#start-dvorak').hover(function() {
    dvorak.start();
  });
  $('#stop-dvorak').hover(function() {
    dvorak.stop();
  });


  // $('#start').on('click', function() {
  //   bach.start();
  //   mozart.start();
  //   setTimeout(function() {dvorak.start()}, 1200);

  // });

  // $('#stop').on('click', function() {
  //   mozart.stop();
  //   bach.stop();
  //   dvorak.stop();
  // });

  var circles = false;
  $('#circles').hover(function() {
    $('.player span').css('background-color', (circles ? 'rgba(0,0,0,0)' : '#57AA83'));
    circles = !circles;
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
