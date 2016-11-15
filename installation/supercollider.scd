Server.local.boot;
s.meter
s.quit;
/*(
SynthDef(\bpfsaw, {
	arg atk=2, sus=0, rel=3, c1=1, c2=(-1),
	freq=500, cf=1500, rq=0.2, amp=1, out=0;
	var sig, env;
	env = EnvGen.kr(Env([0,1,1,0],[atk, sus, rel], [c1,0,c2]), doneAction:2);
	sig = Saw.ar(freq);
	sig = BPF.ar(sig, cf, rq);
	sig = sig * env * amp;
	Out.ar(out, sig);
}).add;
)*/

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
		{LFNoise1.kr(0.1).e xprange(rqmin, rqmax)}!2
	);
	sig = BLowShelf.ar(sig, lsf, 0.5, ldb);
	sig = Balance2.ar(sig[0], sig[1], pan);
	sig = sig * env * amp;
	Out.ar(out, sig);
}).add;
)

10.do{Synth(\bpfsaw, [\amp, 0.2])};

Scale.major;
Scale.directory

/*(
[58, 65, 68, 73].midicps.do{
	arg f;
	Synth(
		\bpfsaw,
		[
			\freq, f,
			\amp, 0.25,
			\cg, f * exprand(1,12),
			\rq, exprand(0.01, 05),
		]
	);
}
)*/

// spacializing to more than 2 speakers
/*s.options.numOutputBusChannels_(8);
s.reboot;
s.meter;*/

(
(1..6).choose.midicps.do{
	arg f;
	Synth(
		\bpfsaw,
		[
			// add 60 to start at middle C
			\freq, (Scale.minor.degrees + 60 ).midicps.choose,
			\amp, 0.25,
			\cg, f * exprand(1,12),
			\rq, exprand(0.01, 05),
		]
	);
}
)

(
10.do{
	Synth(
		\bpfsaw,
		[
			\freq, 50,
			\amp, 0.5,
			\cfmin, 50*2,
			\cfmax, 50*50,
			\rqmin, 0.005,
			\rqmax, 0.03,
		],
	);
};
)

// more techniques to create more things

/*(
Pbind(
	\instrument, \bpfsaw,
	\dur, 2,
	\midinote, Pseq([54,61,56],1),
	\detune, 0.08,
	\cfmin, 100,
	\cfmax, 1500,
	\atk, 1,
	\ldb, 6,
	\amp, 0.5,
	\out, 0,
).play;
)*/

s.outDevices



// singing chords
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

~chords.stop;

// cf = center frequency

(
Synth.new(
	\bpfsaw,
	[
		\freq, 2,
		\atk, 0,
		\rqmin, 0.005,
		\rqmax, 0.008,
		\cfmin, 880,
		\cfmax, 880,
	]
);
)

(
~marimba = Pbind(
	\instrument, \bpfsaw,
	\