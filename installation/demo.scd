s.quit;
s.boot;

(
SynthDef(\bpfsaw2, {
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

a = Scale.major;

~b = NetAddr.new("127.0.0.1", 57121);
n = 48;



(
a = Scale.major;
n = 42;
)

(
a = Scale.minor;
n = 46;
)


(
a = Scale.mixolydian;
n = 38;
)

(
a = Scale.minor;
n = 50;
)

(
~chords = Pbind(
	\instrument, \bpfsaw2,
	\dur, Pwhite(5.2,7,inf),
	\degree, Pxrand([
		[8, 12, 10],
		[-10, -3, 8, 11, 12, 14],
		[1, 7, 10, 12, 13],
		[0, 7, 9, 11, 12, 14],
	], inf),
	\scale, Pfunc({ a }, inf),
	\root, Pfunc({ n - 60}, inf),
	\detune, Pexprand(0.1,0.2,inf),
	// \detune, 0.05,
	\cfmin, 100,
	\cfmax, 400,
	\rqmin, Pexprand(0.003,0.1,inf),
    \rqmax, Pexprand(0.2,0.25,inf),
	// \rqmin, Pexprand(0.01,0.15,inf),
	// \rqmin, Pexprand(0.01,0.15,inf),
	\atk, Pwhite(1.0,1.5,inf),
	\rel, Pwhite(6.5,10.0,inf),
	\ldb, 6,
	\amp, 1,
	\out, 0,
	\pan, 0,
	\prevFreq, Pfunc({|evt|
		evt[\degree].postln;
		~b.sendMsg("/notes", *evt[\degree]);
	})

).play;
// )

~chords.stop;
