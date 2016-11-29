Server.local.boot;
s.meter
s.quit;

~b = NetAddr.new("127.0.0.1", 57121);

(
SynthDef(\bpfsaw, {
	arg atk=2, sus=0, rel=3, c1=1, c2=(-1),
	freq=500, detune=0.2, pan=0, cfhzmin=0.1, cfhzmax=0.3,
	cfmin=500, cfmax=2000, rqmin=0.1, rqmax=0.2,
	lsf=200, ldb=0, amp=1, out=0;
	var sig, env;
	env = EnvGen.kr(Env([0,1,1,0],[atk, sus, rel], [c1,0,c2]), doneAction:2);
	sig = Saw.ar(freq * {LFNoise1.kr(0.5, detune).midiratio}!2);
	sig = BPF.ar(
		sig,
		{LFNoise1.kr(
			LFNoise1.kr(4).exprange(cfhzmin, cfhzmax)
		).exprange(cfmin, cfmax)}!2,
		{LFNoise1.kr(0.1).exprange(rqmin, rqmax)}!2
	);
	sig = BLowShelf.ar(sig, lsf, 0.5, ldb);
	sig = Balance2.ar(sig[0], sig[1], pan);
	sig = sig * env * amp;
	Out.ar(out, sig);
}).add;
)

// singing chords

/*
Good scales:

Major
Mixolydian
Locrian Major
Locrian
Harmonic Minor

Interesting scales:
Romanian Minor


*/

(
~chords = Pbind(
	\instrument, \bpfsaw,
	\dur, Pwhite(4.5,7.0,inf),
	\midinote, Pseq([
		[54,61,56],
		[23,35,54,59,61,64],
		[42,52,57,61,63],
		[28,40,47,56,59,63],
	],inf),
	\detune, Pexprand(0.05,0.2,inf),
	\cfmin, 100,
	\cfmax, 1500,
	\rqmin, Pexprand(0.01,0.15,inf),
	\atk, Pwhite(2.0,2.5,inf),
	\rel, Pwhite(6.5,10.0,inf),
	\ldb, 6,
	\amp, 0.5,
	\out, 0,
).play;
)

a = Scale.major;
~b = NetAddr.new("127.0.0.1", 57121);
n = 42;
c = 0;

Scale.mixolydian
Scale.directory
(
~chords = Pbind(
	\instrument, \bpfsaw,
	\dur, Pwhite(4.5, 7.0 ,inf),
	\degree, Pseq([
		[8, 12, 10],
		// [8, 12, 10],
		[-10, -3, 8, 11, 12, 14],
		[1, 7, 10, 12, 13],
		[-7, 0, 2, 4, 5, 7],
	], inf),
	\scale, Pfunc({ a }, inf),
	\root, Pfunc({ n - 60}, inf),
	\prevFreq, Pfunc({|evt|
		a.name.postln;
		evt[\degree].postln;
		c = c + 1;
		if (c % 4 == 0) {
			a = Scale.choose(7, 12);
			if (c % 8 == 0) {
				n = rrand(32,46);
			}
		};
 		c.postln;
		~b.sendMsg("/notes", *evt[\midinote]);
	}),
	\detune, Pexprand(0.05,0.2,inf),
	\cfmin, 100,
	\cfmax, 1500,
	\rqmin, Pexprand(0.01,0.15,inf),
	\atk, Pwhite(2.0,2.5,inf),
	\rel, Pwhite(6.5,10.0,inf),
	\ldb, 6,
	\amp, 1.4,
	\out, 0,
).play;
)

~chords.stop;
