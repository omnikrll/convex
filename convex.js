// context defined on window load
var context;

//do all buffers in one list.
var buffers = [];

//sample select dropdowns
var carrierMenu = document.getElementById('carrierMenu');
var modulatorMenu = document.getElementById('modulatorMenu');

//samples to be loaded
var samples = [
  {
    'name': 'Boy Voice',
    'path': '../convex/sounds/bruno.wav'
  },
  { 
    'name': 'Fripp Guitar',
    'path': '../convex/sounds/frippguitar.wav'
  },
  { 
    'name': 'Teapot',
    'path': '../convex/sounds/teapot.wav'
  },
  {
    'name': 'Cello',
    'path': '../convex/sounds/cello.wav'
  },
  {
    'name': 'Tape Choir 1',
    'path': '../convex/sounds/tape-choir.wav'
  },
  {
    'name': 'Tape Choir 2',
    'path': '../convex/sounds/tape-choir-2.wav'
  },
  {
    'name': 'Cheapo Synth',
    'path': '../convex/sounds/cheapo-synth.wav'
  },
  {
    'name': 'Processed Image Wave',
    'path': '../convex/sounds/andrews-img.wav'
  },
  {
    'name': 'Tape Flute',
    'path': '../convex/sounds/tape-flute.wav'
  },
  {
    'name': 'Tape Female Voice',
    'path': '../convex/sounds/tape-femvoice.wav'
  },
  {
    'name': 'Brain Massage',
    'path': '../convex/sounds/brain-massage.wav'
  },
  { 
    'name': 'Dot Matrix Printer',
    'path': '../convex/sounds/printer.wav'
  },
  { 
    'name': 'Transporter Beam',
    'path': '../convex/sounds/transporter.wav'
  },
  {
    'name': 'Tricorder Glitch',
    'path': '../convex/sounds/denybeep.wav'
  },
  {
    'name': 'Van der Pol (Driven)',
    'path': '../convex/sounds/vanderpoldriven.wav'
  },
  {
    'name': 'Van der Pol (Sweep)',
    'path': '../convex/sounds/vanderpolsweep.wav'
  },
  {
    'name': 'Dishwasher',
    'path': '../convex/sounds/dishwasher.wav'
  },
  {
    'name': 'Circuit Bent Noise 1',
    'path': '../convex/sounds/circuitbend-1.wav'
  },
  {
    'name': 'Circuit Bent Noise 2',
    'path': '../convex/sounds/circuitbend-2.wav'
  },
  {
    'name': 'Circuit Bent Noise 3',
    'path': '../convex/sounds/circuitbend-3.wav'
  },
  {
    'name': 'Circuit Bent Noise 4',
    'path': '../convex/sounds/circuitbend-4.wav'
  },
  {
    'name': 'Ray Gun 1',
    'path': '../convex/sounds/raygun1.wav'
  },
  {
    'name': 'Ray Gun 2',
    'path': '../convex/sounds/raygun2.wav'
  },
  {
    'name': 'Ray Gun 3',
    'path': '../convex/sounds/raygun3.wav'
  },
  {
    'name': 'Ray Gun 4',
    'path': '../convex/sounds/raygun4.wav'
  }
];

// define uncasted matrix node names:
var carrier; // bufferSource for sample playback
var carrierGain; // gain stage for bufferSource
var carrierIndex; // pointer to source buffer
var modIndex; // pointer to convolver buffer
var convolver; // convolver node
var filter; // filter node
var compressor; // compressor node
var aaFilter; // dedicated lowpass sitting at nyquist frequency (not a true anti-aliasing filter)
var masterVolume; // gain stage at final output
var semitoneRatio = Math.pow(2, 1/12); // multiplier for chromatic scaling
var root = 69; // root key is A440 by default
var rampMin = 0.00001; // ensure fine scaling for ramping functions
var rampMax = 1 - rampMin;

//==== INIT ====//
window.addEventListener('load', init, false);
function init() {
  try {
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();
    // alert('Please wait for ' + samples.length + ' .wav samples to load.');
    setupEnv(samples, function() {
      if (buffers.length == samples.length) {
        document.getElementById("loading").remove();
        createMatrix(buffers);
      }
    });
  } catch(e) {
    alert("Whoops! Something's wrong-- " + e.name + ": " + e.message + "\nAre you viewing this page in Chrome or Safari? Is your browser up to date?");
  }
}

//==== SETUP ENVIRONMENT ====//
function setupEnv(samples, callback) {
  var last_sample = samples.length;
  for (i = 0; i < last_sample; i++) {
    loadSounds(samples[i], function(buffer, option) {      
      var clone = option.cloneNode(true);
      buffers.push(buffer);
      carrierMenu.add(option, null);
      modulatorMenu.add(clone, null);
      if (i === last_sample) {
        if (typeof callback === 'function') {
          return callback();
        }
      }
    });
  }
}

//==== LOAD SOUNDS ====/
function loadSounds(sampleInfo, callback) {
  var option = document.createElement('option');
  option.text = sampleInfo.name;

  var request = new XMLHttpRequest();
  request.open('GET', sampleInfo.path, true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      if (typeof callback === 'function') {
        return callback(buffer, option);
      }
    });
  }

  request.error = function(e) {
    console.log(e);
  }

  request.send();
}

//==== CREATE MATRIX ====//
function createMatrix(buffers) {

  console.log('you are now entering the matrix...');

  // bind keyboard event handlers
  var keys = document.getElementsByClassName('key');
  var numKeys = keys.length;
  for (var i = 0; i < numKeys; i++) {
    keys[i].addEventListener('mousedown', playSound, false);
    keys[i].addEventListener('mouseup', stopSound, false);
  }

  carrierIndex = 0;
  modIndex = 0;

  // cast nodes
  carrier = context.createBufferSource();
  carrierGain = context.createGain();
  convolver = context.createConvolver();
  filter = context.createBiquadFilter();
  aaFilter = context.createBiquadFilter();
  compressor = context.createDynamicsCompressor();
  masterVolume = context.createGain();


  // set up carrier node
  carrier.buffer = buffers[carrierIndex];
  carrier.loop = true;
  carrier.isPlaying = false;
  carrier.connect(aaFilter);
  aaFilter.type = 'lowpass';
  aaFilter.frequency.value = 22050;
  aaFilter.connect(carrierGain);


  // set up convolver node
  convolver.buffer = buffers[modIndex];
  convolver.connect(filter);

  // connect sourceGain to filter
  carrierGain.gain.value = rampMax;
  carrierGain.connect(filter);

  // set up filter
  filter.type = 'lowpass';
  filter.frequency.value = 22050;
  filter.connect(compressor);

  // compressor => masterVolume => output
  compressor.connect(masterVolume);
  masterVolume.connect(context.destination);
}

//==== EVENT HANDLERS ====//
// set pointer to playback buffer - buffer itself changed in midiToPitch()
function toggleCarrier(element) {
  carrierIndex = element.selectedIndex;
}

// set convolver sample
function toggleConvolver(element) {
  var i = element.selectedIndex - 1;
  carrierGain.disconnect(0);
 if (element.selectedIndex > 0) {
    convolver.buffer = buffers[i];
    carrierGain.connect(convolver);
 } else {
   carrierGain.connect(filter);
 }
}

// change filter frequency
function filterFrequency(element) {
  // Clamp the frequency between the minimum value (40 Hz) and half of the sampling rate.
  var minValue = 40;
  var maxValue = context.sampleRate / 2;
  // Logarithm (base 2) to compute how many octaves fall in the range.
  var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
  // Compute a multiplier from 0 to 1 based on an exponential scale.
  var multiplier = Math.pow(2, numberOfOctaves * (element.value - 1.0));
  // Get back to the frequency value between min and max.
  filter.frequency.value = maxValue * multiplier;
}

// change filter Q
function filterQ(element) {
  filter.Q.value = element.value * 30;
}

// change filter type
function filterType(element) {
  filter.type = element.value;
}

// master volume fader
function masterVolumeLvl(element) {
  var fraction = parseInt(element.value) / parseInt(element.max);
  // Let's use an x*x curve (x-squared) since simple linear (x) does not sound as good.
  masterVolume.gain.value = fraction * fraction;
};

function playSound(note) {
  if (carrier.isPlaying) stopSound();
  carrier.buffer = buffers[carrierIndex];
  if (typeof note == 'number') {
    carrier.playbackRate.value = midiToPitch(note);
  } else {
    carrier.playbackRate.value = noteToMidi(note[0], note[1]);
  }
  carrier.start(0);
  carrier.isPlaying = true;
}

function fadeIn(note, time) {
  time = (time === undefined) ? 0 : parseInt(document.getElementById("fadeInLevel").value);

  var level = masterVolume.gain.value = 0;
  playSound(note);

  var timer;
//  var level = masterVolume.gain.value;
  var change = 1 / (time/10);
  if (level == 1) return;
  timer = setInterval(function() {
    if (level >= 1) {
      clearInterval(timer);
      return;
    }
    level += change;
    if (level >= 1) level = 1;
    masterVolume.gain.value = Math.round(level * 10) / 10;
  });
}

function fadeOut(time) {
  time = (time === undefined) ? 0 : parseInt(document.getElementById("fadeOutLevel").value);
  var timer;
  var level = masterVolume.gain.value;
  var change = level / (time/10);
  if (level == 0) return;
  timer = setInterval(function() {
    if (level <= 0) {
      clearInterval(timer);
      stopSound();
      return;
    }
    level -= change;
    if (level <= 0) level = 0;
    masterVolume.gain.value = Math.round(level * 10) / 10;
  });
}

function stopSound() {
  carrier.isPlaying = false;
  carrier.stop(0);
  carrier = context.createBufferSource();
  carrier.loop = true;
  carrier.connect(carrierGain);
}

// set carrier buffer, compute correct pitch, and initiate playback
function midiToPitch(note) {
  var semitone = parseInt(note) - root;
  return Math.pow(semitoneRatio, semitone);
  // ^ for an oscillator, multiply by 440 to do midi-to-frequency
}

// int: scale degree (0 - 11), int: octave (-1 - 9)
function noteToMidi(note, octave) {
  midiToPitch((note + 60) + ((octave-4) * 12));
}

var pressedKey = -1;
var octave = 0;
window.addEventListener('keydown', function(e) {
  asciiHandler(e);
}, true);

var noteKeys = [65, 87, 83, 69, 68, 70, 84, 71, 89, 72, 85, 74, 75];
var sysKeys = [16, 17, 18, 91] // exclude keys pressed when holding shift, ctrl, opt, or command keys 

var prevCode;
function asciiHandler(e) {
  document.getElementById('carrierMenu').blur();
  document.getElementById('modulatorMenu').blur();
  document.getElementById('filterTypePicker').blur();

  var code = e.keyCode || e.which;
  var oldKey = document.getElementsByClassName('pressed');
  console.log(code, prevCode);

  if (noteKeys.indexOf(code) != -1 && sysKeys.indexOf(prevCode) == -1) {

    if (oldKey.length) {
      oldKey[0].classList.remove('pressed');
    }

    thisKey = document.getElementById('ascii_' + code);

    if (pressedKey != code) {
      pressedKey = code;
      var note = 69 + noteKeys.indexOf(code) + octave;
      fadeIn(note, 800)
      thisKey.classList.add('pressed');
    } else if (pressedKey == code) {
      pressedKey = -1;
      fadeOut(800);
    }
  } else if (code == 188 || code == 190) {
      var inc = (code == 188) ? -12 : 12;
      var dir = (inc == -12) ? 'down' : 'up';
      octave += inc;
      document.getElementById('octave-val').innerHTML = octave/12 + 4;
  } else if (code == 32) {
    if (pressedKey != -1) {
      if (oldKey.length) {
        oldKey[0].classList.remove('pressed');
      }

      pressedKey = -1;
      fadeOut(800);
    }
  } 
  prevCode = code;
}
