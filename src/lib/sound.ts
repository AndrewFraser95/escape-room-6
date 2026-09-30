/** Tiny Web Audio helper for stings, drones and a ringtone. No assets needed. */

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function sting(freq = 180, duration = 0.5, type: OscillatorType = "sawtooth") {
  const a = ac();
  if (!a) return;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, a.currentTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq / 3), a.currentTime + duration);
  gain.gain.setValueAtTime(0.0001, a.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, a.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + duration);
  osc.connect(gain).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + duration + 0.05);
}

export function click() {
  sting(520, 0.08, "square");
}

export function whoosh() {
  const a = ac();
  if (!a) return;
  const buffer = a.createBuffer(1, a.sampleRate * 1.2, a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
  }
  const src = a.createBufferSource();
  src.buffer = buffer;
  const filter = a.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(900, a.currentTime);
  filter.frequency.exponentialRampToValueAtTime(180, a.currentTime + 1.1);
  const gain = a.createGain();
  gain.gain.value = 0.25;
  src.connect(filter).connect(gain).connect(a.destination);
  src.start();
}

/** Returns a stop function. */
export function ringtone(): () => void {
  const a = ac();
  if (!a) return () => {};
  let stopped = false;
  const timers: number[] = [];

  const ring = () => {
    if (stopped) return;
    [0, 0.45].forEach((offset) => {
      const osc = a.createOscillator();
      const gain = a.createGain();
      osc.type = "sine";
      osc.frequency.value = 440;
      const t = a.currentTime + offset;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.14, t + 0.03);
      gain.gain.setValueAtTime(0.14, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
      osc.connect(gain).connect(a.destination);
      osc.start(t);
      osc.stop(t + 0.42);
    });
  };

  ring();
  const id = window.setInterval(ring, 2600);
  timers.push(id);
  return () => {
    stopped = true;
    timers.forEach((t) => window.clearInterval(t));
  };
}

export function speak(text: string, opts: { pitch?: number; rate?: number } = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.pitch = opts.pitch ?? 0.4;
  u.rate = opts.rate ?? 0.75;
  u.volume = 1;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
