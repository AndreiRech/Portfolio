/**
 * Tiny synthesized sound effects for the games. Everything is generated with
 * Web Audio, so there are no audio files to load, and nothing plays until the
 * visitor interacts (browsers keep the context suspended before a gesture).
 */
let context: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Context =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Context) return null;
    // Safari mutes Web Audio with the ringer switch unless the page asks
    // for media playback, which is what these game sounds are.
    const session = (
      navigator as unknown as { audioSession?: { type: string } }
    ).audioSession;
    if (session) session.type = "playback";
    try {
      context = new Context();
    } catch {
      return null;
    }
    master = context.createGain();
    master.gain.value = 0.55;
    master.connect(context.destination);
  }
  if (context.state === "suspended") void context.resume().catch(() => {});
  return context;
}

/**
 * Browsers only start audio inside a user gesture, and iOS also wants a
 * sound played in it. The first tap or key press anywhere unlocks the
 * context, so sounds fired later from timers and animations are heard.
 */
export function unlockAudioOnGesture() {
  if (typeof window === "undefined") return () => {};
  const events = ["pointerdown", "touchend", "keydown"] as const;
  const unlock = () => {
    const ctx = audio();
    if (!ctx || !master) return;
    try {
      const silence = ctx.createBufferSource();
      silence.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
      silence.connect(master);
      silence.start();
    } catch {
      /* Unlocking is best effort. */
    }
    if (ctx.state === "running") remove();
  };
  const remove = () =>
    events.forEach((name) => window.removeEventListener(name, unlock, true));
  events.forEach((name) =>
    window.addEventListener(name, unlock, { capture: true, passive: true }),
  );
  return remove;
}

function noiseBuffer(ctx: AudioContext) {
  if (noise) return noise;
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let index = 0; index < data.length; index++)
    data[index] = Math.random() * 2 - 1;
  return noise;
}

type Tone = {
  frequency: number;
  to?: number;
  type?: OscillatorType;
  start?: number;
  duration: number;
  volume?: number;
  attack?: number;
  detune?: number;
};

function tone(ctx: AudioContext, options: Tone) {
  const {
    frequency,
    to,
    type = "square",
    start = 0,
    duration,
    volume = 0.5,
    attack = 0.005,
    detune = 0,
  } = options;
  const at = ctx.currentTime + start;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.detune.value = detune;
  oscillator.frequency.setValueAtTime(frequency, at);
  if (to) oscillator.frequency.exponentialRampToValueAtTime(to, at + duration);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  oscillator.connect(gain).connect(master!);
  oscillator.start(at);
  oscillator.stop(at + duration + 0.05);
}

type Hiss = {
  start?: number;
  duration: number;
  volume?: number;
  filter: BiquadFilterType;
  frequency: number;
  to?: number;
  q?: number;
};

function hiss(ctx: AudioContext, options: Hiss) {
  const { start = 0, duration, volume = 0.5, filter, frequency, to } = options;
  const at = ctx.currentTime + start;
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx);
  source.loop = true;
  const shape = ctx.createBiquadFilter();
  shape.type = filter;
  shape.Q.value = options.q ?? 1;
  shape.frequency.setValueAtTime(frequency, at);
  if (to) shape.frequency.exponentialRampToValueAtTime(to, at + duration);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  source.connect(shape).connect(gain).connect(master!);
  source.start(at);
  source.stop(at + duration + 0.05);
}

function play(effect: (ctx: AudioContext) => void) {
  const ctx = audio();
  if (!ctx || !master) return;
  try {
    effect(ctx);
  } catch {
    /* Sound is decoration; a failure never interrupts the game. */
  }
}

export type SignSound = "aard" | "igni" | "yrden" | "quen" | "axii";

const SIGN_SOUNDS: Record<SignSound, (ctx: AudioContext) => void> = {
  // Telekinetic blast: a falling whoosh with a thump.
  aard: (ctx) => {
    hiss(ctx, {
      duration: 0.42,
      volume: 0.7,
      filter: "bandpass",
      frequency: 2400,
      to: 220,
      q: 0.8,
    });
    tone(ctx, { frequency: 160, to: 55, type: "sine", duration: 0.3 });
  },
  // Flame burst: crackling noise over a low roar.
  igni: (ctx) => {
    hiss(ctx, {
      duration: 0.5,
      volume: 0.55,
      filter: "lowpass",
      frequency: 900,
      to: 3800,
    });
    for (let index = 0; index < 5; index++)
      hiss(ctx, {
        start: 0.05 + Math.random() * 0.32,
        duration: 0.04,
        volume: 0.45,
        filter: "highpass",
        frequency: 3000,
      });
    tone(ctx, {
      frequency: 110,
      to: 70,
      type: "sawtooth",
      duration: 0.4,
      volume: 0.18,
    });
  },
  // Magic trap: two detuned chimes that wobble.
  yrden: (ctx) => {
    tone(ctx, {
      frequency: 523,
      type: "triangle",
      duration: 0.7,
      volume: 0.35,
    });
    tone(ctx, {
      frequency: 784,
      type: "triangle",
      duration: 0.7,
      volume: 0.25,
      detune: 14,
      start: 0.06,
    });
    tone(ctx, {
      frequency: 1046,
      type: "sine",
      duration: 0.5,
      volume: 0.15,
      start: 0.12,
    });
  },
  // Protective shield: a bright bell that rings out.
  quen: (ctx) => {
    tone(ctx, { frequency: 660, type: "sine", duration: 0.9, volume: 0.4 });
    tone(ctx, { frequency: 990, type: "sine", duration: 0.7, volume: 0.22 });
    tone(ctx, {
      frequency: 1320,
      type: "triangle",
      duration: 0.4,
      volume: 0.1,
      start: 0.03,
    });
  },
  // Mind trick: a hypnotic downward glide.
  axii: (ctx) => {
    tone(ctx, {
      frequency: 880,
      to: 330,
      type: "sine",
      duration: 0.6,
      volume: 0.35,
    });
    tone(ctx, {
      frequency: 886,
      to: 335,
      type: "sine",
      duration: 0.6,
      volume: 0.25,
      start: 0.04,
    });
  },
};

export const sfx = {
  sign: (id: SignSound) => play(SIGN_SOUNDS[id]),
  wrong: () =>
    play((ctx) => {
      tone(ctx, {
        frequency: 180,
        to: 90,
        type: "square",
        duration: 0.35,
        volume: 0.3,
      });
      tone(ctx, {
        frequency: 186,
        to: 92,
        type: "sawtooth",
        duration: 0.35,
        volume: 0.18,
      });
    }),
  roundClear: () =>
    play((ctx) =>
      [523, 659, 784, 1046].forEach((frequency, index) =>
        tone(ctx, {
          frequency,
          start: index * 0.08,
          duration: 0.18,
          volume: 0.22,
        }),
      ),
    ),
  /** One reel tile passing the marker: a short woody click. */
  tick: () =>
    play((ctx) => {
      tone(ctx, {
        frequency: 1400,
        to: 700,
        type: "triangle",
        duration: 0.045,
        volume: 0.7,
        attack: 0.001,
      });
      hiss(ctx, {
        duration: 0.03,
        volume: 0.45,
        filter: "bandpass",
        frequency: 3200,
        q: 2,
      });
    }),
  caseOpen: () =>
    play((ctx) => {
      hiss(ctx, {
        duration: 0.25,
        volume: 0.7,
        filter: "bandpass",
        frequency: 600,
        to: 2400,
      });
      tone(ctx, {
        frequency: 220,
        to: 440,
        type: "triangle",
        duration: 0.25,
        volume: 0.5,
      });
    }),
  /** Reward reveal; rarer drops get a longer fanfare. */
  reveal: (tier: number) =>
    play((ctx) => {
      const notes = [392, 523, 659, 784, 1046, 1318].slice(0, 2 + tier);
      notes.forEach((frequency, index) =>
        tone(ctx, {
          frequency,
          type: index % 2 ? "triangle" : "square",
          start: index * 0.09,
          duration: 0.3 + (index === notes.length - 1 ? 0.5 : 0),
          volume: 0.42,
        }),
      );
      if (tier >= 3)
        hiss(ctx, {
          start: notes.length * 0.09,
          duration: 0.8,
          volume: 0.25,
          filter: "highpass",
          frequency: 6000,
        });
    }),
  /** A soft UI blip for choosing something. */
  pop: () =>
    play((ctx) =>
      tone(ctx, {
        frequency: 660,
        to: 990,
        type: "sine",
        duration: 0.08,
        volume: 0.35,
      }),
    ),
  /** A throw: air rushing past. */
  whoosh: () =>
    play((ctx) =>
      hiss(ctx, {
        duration: 0.35,
        volume: 0.45,
        filter: "bandpass",
        frequency: 500,
        to: 2600,
        q: 0.7,
      }),
    ),
  /** A die settling on the table. */
  land: () =>
    play((ctx) => {
      tone(ctx, {
        frequency: 220,
        to: 90,
        type: "triangle",
        duration: 0.12,
        volume: 0.55,
        attack: 0.001,
      });
      hiss(ctx, {
        duration: 0.06,
        volume: 0.35,
        filter: "bandpass",
        frequency: 1800,
        q: 1.5,
      });
    }),
  /** A pixel or coin collected. */
  coin: () =>
    play((ctx) => {
      tone(ctx, {
        frequency: 988,
        type: "square",
        duration: 0.08,
        volume: 0.25,
      });
      tone(ctx, {
        frequency: 1319,
        type: "square",
        start: 0.07,
        duration: 0.22,
        volume: 0.25,
      });
    }),
  /** The chicken clucks. */
  cluck: () =>
    play((ctx) => {
      tone(ctx, {
        frequency: 700,
        to: 420,
        type: "sawtooth",
        duration: 0.09,
        volume: 0.22,
      });
      tone(ctx, {
        frequency: 760,
        to: 460,
        type: "sawtooth",
        start: 0.12,
        duration: 0.1,
        volume: 0.2,
      });
    }),
  /** A sparkle for polishing or equipping. */
  sparkle: () =>
    play((ctx) =>
      [1568, 2093, 2637].forEach((frequency, index) =>
        tone(ctx, {
          frequency,
          type: "sine",
          start: index * 0.06,
          duration: 0.25,
          volume: 0.18,
        }),
      ),
    ),
  /** An achievement toast. */
  achievement: () =>
    play((ctx) =>
      [523, 659, 784, 1046, 1318].forEach((frequency, index) =>
        tone(ctx, {
          frequency,
          type: index === 4 ? "triangle" : "square",
          start: index * 0.07,
          duration: index === 4 ? 0.6 : 0.14,
          volume: 0.24,
        }),
      ),
    ),
};
