var KeyboardController = (function() {
	var KeyboardController = function() {
		this.pressedKey = -1;
		this.octave = 0;
		this.noteKeys = [65, 87, 83, 69, 68, 70, 84, 71, 89, 72, 85, 74, 75];
		this.sysKeys = [16, 17, 18, 91];
		this.prevCode = -1;
	}

	KeyboardController.prototype.constructor = KeyboardController;

	KeyboardController.prototype.baseKeystrokeHandler = function(e) {
		var self = this,
			pressedKey = self.pressedKey,
			code = e.keyCode || e.which,
			oldKey = document.getElementsByClassName('pressed');

		if (self.noteKeys.indexOf(code) == -1 || self.sysKeys.indexOf(code) == -1) return;

		if (pressedKey == code || code == 32) {
			if (code == 32 && pressedKey != -1 && oldKey.length) oldKey[0].classList.remove('pressed');

			pressedKey = -1;
			self.noteOffHandler();
			return;
		}

		if (code == 188 || code == 190) {
			var inc = (code == 188) ? -12 : 12,
      			dir = (inc == -12) ? 'down' : 'up';

		    octave += inc;
		    document.getElementById('octave-val').innerHTML = octave/12 + 4;
		    return;
		}

		pressedKey == code;
		self.noteOnHandler(code);
		document.getElementById('ascii_' + code).classList.add('pressed');

		self.prevCode = code;
    }

    // these would probably be different in different applications-
    // should they just get defined within that application, like after the object has been instantiated?
	KeyboardController.prototype.noteOnHandler = function(code) {
		// handle note on action
	}

	KeyboardController.prototype.noteOffHandler = function() {
		// handle note off action
	}
	
})();