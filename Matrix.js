var Matrix = (function(context, buffers) {

	var Matrix = function(context) {
		this.context = context;
		this.buffers = buffers;
		this.voices = [];
		this.sourceIndex = 0;
		this.impulseIndex = 0;
		this.semitoneRatio = Math.pow(2, 1/12); // multiplier for chromatic scaling
		this.root = 69; // root key is A440 by default
		this.compressor = context.createDynamicsCompressor();
		this.

		this.init();
	}

	Matrix.prototype.constructor = Matrix;

	Matrix.prototype.init = function() {
		var self = this;

		// init function
	}

	Matrix.prototype.bindEventHandlers = function() {
		// bind dom handlers here
	}

	return Matrix;
	
})();