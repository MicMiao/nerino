// Sound for the class app: voice clips, plus music and effects generated in code.
// Nothing here needs a sound file except the voice clips themselves.

const PENTATONIC = [146.83, 164.81, 185.0, 220.0, 246.94, 293.66, 329.63, 369.99, 440.0]; // D major pentatonic, D3–A4

export class Sound {
  constructor() {
    this.ctx = null;
    this.cache = new Map();
    this.plucks = new Map();
    this.ambience = null;
  }

  // Browsers only allow sound after a click or key press, so call this from one.
  async unlock() {
    if (!this.ctx) this.#init();
    if (this.ctx.state !== 'running') await this.ctx.resume();
  }

  #init() {
    const ctx = (this.ctx = new AudioContext());
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(ctx.destination);
    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0.32;
    this.musicBus.connect(this.master);
    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0.55;
    this.sfxBus.connect(this.master);
    this.voiceBus = ctx.createGain();
    this.voiceBus.gain.value = 1;
    this.voiceBus.connect(this.master);
    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noise = noise;
  }

  async load(url) {
    if (!this.cache.has(url)) {
      this.cache.set(
        url,
        fetch(url)
          .then((r) => {
            if (!r.ok) throw new Error(`missing sound ${url}`);
            return r.arrayBuffer();
          })
          .then((b) => this.ctx.decodeAudioData(b)),
      );
    }
    return this.cache.get(url);
  }

  async decodeBlob(blob) {
    return this.ctx.decodeAudioData(await blob.arrayBuffer());
  }

  // Plays a voice clip and reports its loudness each frame so a character can move with it.
  playVoice(buffer, { onLevel } = {}) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    src.connect(analyser);
    analyser.connect(this.voiceBus);
    this.#duckMusic(true);
    const data = new Float32Array(analyser.fftSize);
    let raf = 0;
    const tick = () => {
      analyser.getFloatTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
      onLevel(Math.sqrt(sum / data.length));
      raf = requestAnimationFrame(tick);
    };
    if (onLevel) tick();
    const startedAt = ctx.currentTime;
    const done = new Promise((resolve) => {
      src.onended = () => {
        cancelAnimationFrame(raf);
        onLevel?.(0);
        this.#duckMusic(false);
        resolve();
      };
    });
    src.start();
    return {
      done,
      startedAt,
      duration: buffer.duration,
      stop: () => {
        try {
          src.stop();
        } catch {
          /* already stopped */
        }
      },
    };
  }

  // Lower the music while someone speaks (also used when students speak live).
  duck(on) {
    if (this.ctx) this.#duckMusic(on);
  }

  #duckMusic(on) {
    const t = this.ctx.currentTime;
    this.musicBus.gain.cancelScheduledValues(t);
    this.musicBus.gain.setTargetAtTime(on ? 0.1 : 0.32, t, 0.18);
  }

  // ---- Effects -------------------------------------------------------------------

  #tone(type, f0, f1, dur, peak, bus = this.sfxBus, when = this.ctx.currentTime) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, when);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, when + dur);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(peak, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g).connect(bus);
    o.start(when);
    o.stop(when + dur + 0.05);
  }

  #noiseBurst(dur, freq, q, peak, when = this.ctx.currentTime) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(peak, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    src.connect(filter).connect(g).connect(this.sfxBus);
    src.start(when, Math.random() * 0.5, dur + 0.05);
  }

  plop() {
    this.#tone('sine', 720, 150, 0.2, 0.7);
  }

  pop() {
    this.#tone('sine', 520, 1500, 0.07, 0.35);
  }

  bump() {
    this.#tone('sine', 180, 70, 0.25, 0.8);
    this.#noiseBurst(0.08, 900, 1.2, 0.3);
  }

  stamp() {
    this.#tone('sine', 150, 55, 0.16, 0.9);
    this.#noiseBurst(0.03, 1800, 1.5, 0.5);
  }

  tap() {
    this.#tone('square', 900, 700, 0.04, 0.12);
  }

  crack() {
    const t = this.ctx.currentTime;
    for (let i = 0; i < 6; i++) this.#noiseBurst(0.04, 2600 + Math.random() * 1500, 3, 0.45, t + i * 0.06 + Math.random() * 0.03);
  }

  whoosh() {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.8;
    const t = this.ctx.currentTime;
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(2400, t + 0.5);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    src.connect(filter).connect(g).connect(this.sfxBus);
    src.start(t, 0, 0.7);
  }

  snore() {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    const t = this.ctx.currentTime;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.25, t + 0.55);
    g.gain.linearRampToValueAtTime(0.0001, t + 1.3);
    src.connect(filter).connect(g).connect(this.sfxBus);
    src.start(t, 0, 1.35);
  }

  // A tired sigh: breathy noise sliding down.
  sigh() {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.4;
    const t = this.ctx.currentTime;
    filter.frequency.setValueAtTime(1500, t);
    filter.frequency.exponentialRampToValueAtTime(360, t + 0.9);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.32, t + 0.18);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);
    src.connect(filter).connect(g).connect(this.sfxBus);
    src.start(t, Math.random() * 0.5, 1);
  }

  ring() {
    const t = this.ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      this.#tone('sine', 440, 440, 0.35, 0.12, this.sfxBus, t + i * 0.5);
      this.#tone('sine', 480, 480, 0.35, 0.12, this.sfxBus, t + i * 0.5);
    }
  }

  chime() {
    const t = this.ctx.currentTime;
    [PENTATONIC[5], PENTATONIC[7], PENTATONIC[8] * 2].forEach((f, i) => this.#bell(f, t + i * 0.09));
  }

  sparkle() {
    const t = this.ctx.currentTime;
    [4, 5, 6, 7, 8].forEach((n, i) => this.#bell(PENTATONIC[n] * 2, t + i * 0.07, 0.18));
  }

  #bell(freq, when, peak = 0.25) {
    [1, 2.01, 3.02].forEach((mult, k) => this.#tone('sine', freq * mult, freq * mult, 1.1 / (k + 1), peak / (k + 1.5), this.sfxBus, when));
  }

  // ---- Music: soft plucked pentatonic notes over quiet water ------------------------

  // A plucked string made the classic way (Karplus–Strong), cached per note.
  #pluckBuffer(freq) {
    const key = Math.round(freq * 100);
    if (this.plucks.has(key)) return this.plucks.get(key);
    const sr = this.ctx.sampleRate;
    const len = Math.floor(sr * 2.4);
    const period = Math.round(sr / freq);
    const buffer = this.ctx.createBuffer(1, len, sr);
    const y = buffer.getChannelData(0);
    for (let i = 0; i < period; i++) y[i] = Math.random() * 2 - 1;
    for (let i = 1; i < period; i++) y[i] = 0.55 * y[i] + 0.45 * y[i - 1];
    for (let i = period; i < len; i++) {
      const prev = i - period - 1 >= 0 ? y[i - period - 1] : 0;
      y[i] = 0.996 * 0.5 * (y[i - period] + prev);
    }
    for (let i = len - 2000; i < len; i++) y[i] *= (len - i) / 2000;
    this.plucks.set(key, buffer);
    return buffer;
  }

  pluck(freq, when = this.ctx.currentTime, peak = 0.5) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.#pluckBuffer(freq);
    const g = this.ctx.createGain();
    g.gain.value = peak;
    const tone = this.ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 2600;
    src.connect(tone).connect(g).connect(this.musicBus);
    src.start(when);
  }

  startAmbience() {
    if (this.ambience) return;
    const ctx = this.ctx;
    const water = ctx.createBufferSource();
    water.buffer = this.noise;
    water.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 380;
    const wg = ctx.createGain();
    wg.gain.value = 0.0001;
    wg.gain.setTargetAtTime(0.06, ctx.currentTime, 1.2);
    water.connect(lp).connect(wg).connect(this.musicBus);
    water.start();

    let timer = 0;
    const schedule = () => {
      if (ctx.state === 'running') {
        const t = ctx.currentTime + 0.05;
        const i = Math.floor(Math.random() * PENTATONIC.length);
        this.pluck(PENTATONIC[i], t, 0.42);
        if (Math.random() < 0.35) this.pluck(PENTATONIC[Math.max(0, i - 2)], t + 0.28, 0.3);
        if (Math.random() < 0.2) this.pluck(PENTATONIC[Math.min(PENTATONIC.length - 1, i + 1)], t + 0.56, 0.26);
      }
      timer = setTimeout(schedule, 1100 + Math.random() * 1700);
    };
    schedule();
    this.ambience = { water, wg, stop: () => clearTimeout(timer) };
  }

  stopAmbience(fade = 1.2) {
    if (!this.ambience) return;
    const { water, wg, stop } = this.ambience;
    stop();
    wg.gain.setTargetAtTime(0.0001, this.ctx.currentTime, fade / 3);
    setTimeout(() => water.stop(), fade * 1000 + 200);
    this.ambience = null;
  }

  async suspend() {
    if (this.ctx?.state === 'running') await this.ctx.suspend();
  }

  async resume() {
    if (this.ctx?.state === 'suspended') await this.ctx.resume();
  }
}
