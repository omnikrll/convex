var Voice = (function(matrix) {
	var Voice = function(matrix) {
		this.matrix = matrix;
		this.context = matrix.context;
		this.sourceNode = this.context.createBufferSource();
		this.aaFilter = this.context.createBiquadFilter();
		this.sourceGain = this.context.createGain();
		this.convolver = this.context.createConvolver();
		this.filter = this.context.createBiquadFilter();
		this.output = this.context.createGain();

		this.init();
	}

	Voice.prototype.constructor = Voice;

	Voice.prototype.init = function() {
		var self = this,
			context = self.matrix.context,
			now = context.currentTime;

		self.sourceNode.loop = true;
		self.sourceNode.connect(self.aaFilter);

		self.aaFilter.type = 'lowpass';
		self.aaFilter.frequency.value = 22050; // we can set it this way since it will never change. otherwise we'd want to use setValueAtTime(22050, context.currentTime)
		self.aaFilter.connect(self.sourceGain);

		self.sourceGain.gain.setValueAtTime(1, now);
		self.sourceGain.connect(self.filter);

		self.filter.type = 'lowpass';
		self.filter.frequency.setValueAtTime(22050, now);
		self.filter.connect(self.output);

		self.output.gain.setValueAtTime(0.25, now);
		self.output.connect(self.matrix.compressor);
	}

	Voice.prototype.play = function() {
		var self = this;
		// start playback... 
	}

	Voice.prototype.stop = function() {
		var self = this;
		// stop playback...
	}

	return Voice;
})();