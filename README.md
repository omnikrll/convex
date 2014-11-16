convex
======

JavaScript sampling instrument built with the Web Audio API.

The architecture of the instrument is relatively simple. A looping, pitch-controlled audio buffer controlled by the keyboard is routed through a convolver node, a multimode filter, and a compressor.

This was my first experiment in using the Web Audio API, so the code is a little rough around the edges; the instrument is monophonic and the enveloping is glitchy. I have begun work on a thorough refactoring of the code, but the current live build works as a proof-of-concept and is still capable of making some real weird sounds.

ヽ(*￣o￣*)ノ♩♫♪