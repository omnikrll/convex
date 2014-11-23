var Lfo = (function(c) {
	var Lfo = function() {
		this.context = c;

		this.osc = this.context.createOscillator();
		this.amp = this.context.createGain();

		this.osc.connect(this.amp);
	}

	Lfo.prototype.constructor = Lfo;

	Lfo.prototype.setFrequency = function(f) {
		this.osc.frequency.value = f;
	}

	Lfo.prototype.setLevel = function(l) {
		this.amp.gain.value = l;
	}

	Lfo.prototype.connect = function(node) {
		this.amp.connect(node);
	}

	return Lfo;
})();

var lfo = new Lfo();

lfo.connect(node);
lfo.setFrequency(number);
lfo.setLevel(number);