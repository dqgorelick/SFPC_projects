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

(
SynthDef(\sfpc, {
	arg amp=0.8, freq = 440.0;
	var sig, env;
	sig = Saw.ar(freq);
	sig = BLowShelf.ar(sig, 200, 0.5, 0);
	// sig = Balance2.ar(sig[0],sig[1], pan);
	sig = sig * amp;
	Out.ar(0, sig);
}).add;
)

(
~test = Pbind(
	\instrument, \sfpc,
).play;
)

s.plotTree;
p = /*Pbind*/(\degree, Pwhite(0, 7, inf), \dur, 0.25, \legato, 1).play;
p.stop;


~b = NetAddr.new("127.0.0.1", 57121);
(
~chords = Pbind(
	\instrument, \bpfsaw,
	\dur, Pwhite(2.4,5,inf),
	\midinote, Pxrand([
		[54,61,56],
		[23,35,54,59,61,64],
		[28,40,47,56,59,63],
		[42,52,57,61,63],
	],inf),
	\detune, Pexprand(0.05,0.2,inf),
	\cfmin, 100,
	\cfmax, 1500,
	\rqmin, Pexprand(0.01,0.15,inf),
	\atk, Pwhite(1.0,1.5,inf),
	\rel, Pwhite(6.5,10.0,inf),
	\ldb, 6,
	\amp, 0.5,
	\out, 0,
	\prevFreq, Pfunc({|evt|
		evt[\midinote].postln;
		~b.sendMsg("/notes", *evt[\midinote]);
	})

).play;
)

~chords.stop;
