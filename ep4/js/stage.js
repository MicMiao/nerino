// Stage toolkit shared by every episode: art, characters, subtitles, a pausable clock and keys.

export const SVG_NS = 'http://www.w3.org/2000/svg';

export function svg(tag, attrs = {}, parent) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  parent?.append(el);
  return el;
}

// The cast drawings live in one file; putting them in the page lets every scene reuse them.
export async function loadArt(url = 'art/cast.svg') {
  const text = await (await fetch(url)).text();
  const holder = document.createElement('div');
  holder.innerHTML = text;
  document.body.prepend(holder.firstElementChild);
}

// ---- A clock that stops when the teacher pauses ------------------------------------------

export const clock = { paused: false, skipping: false };

export function wait(ms) {
  return new Promise((resolve) => {
    let left = ms;
    let last = performance.now();
    const tick = (now) => {
      const dt = now - last;
      last = now;
      if (clock.skipping) return resolve();
      if (!clock.paused) left -= dt;
      if (left <= 0) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

export function finishRunningAnimations() {
  for (const a of document.getAnimations()) {
    const timing = a.effect?.getComputedTiming?.();
    if (timing && timing.iterations !== Infinity) a.finish();
  }
}

// ---- Characters ------------------------------------------------------------------

// An actor is a drawing placed at (x, y). Nested groups keep moving, facing, gestures and
// talking independent, so they can all happen at once.
export class Actor {
  constructor(layer, symbolId, { x = 0, y = 0, w = 200, h = 200, anchor = 'bottom', facing = 1 } = {}) {
    this.el = svg('g', { class: 'actor' }, layer);
    this.flip = svg('g', { class: 'actor-part' }, this.el);
    this.pose = svg('g', { class: 'actor-part' }, this.flip);
    this.talkG = svg('g', { class: 'actor-part' }, this.pose);
    this.use = svg('use', { href: `#${symbolId}`, x: -w / 2, y: anchor === 'bottom' ? -h : -h / 2, width: w, height: h }, this.talkG);
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.anchor = anchor;
    this.scale = 1;
    this.face(facing);
    this.place();
  }

  // Top centre of the drawing in scene coordinates, e.g. for a name tag above the head.
  top() {
    const h = this.h * this.scale;
    return [this.x, this.anchor === 'bottom' ? this.y - h : this.y - h / 2];
  }

  place() {
    this.el.style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
  }

  // 1 = as drawn (the cast drawings look left), -1 = mirrored.
  face(dir) {
    this.facing = dir;
    this.flip.style.transform = `scaleX(${dir})`;
  }

  setSymbol(id) {
    this.use.setAttribute('href', `#${id}`);
  }

  show(visible = true) {
    this.el.style.opacity = visible ? '1' : '0';
  }

  // Pass a scale to grow or shrink on the way, e.g. coming closer from the far bank.
  async moveTo(x, y, duration = 1000, easing = 'ease-in-out', scale = this.scale) {
    const from = `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
    this.x = x;
    this.y = y;
    this.scale = scale;
    const to = `translate(${x}px, ${y}px) scale(${scale})`;
    const anim = this.el.animate([{ transform: from }, { transform: to }], { duration, easing, fill: 'forwards' });
    await anim.finished.catch(() => {});
    this.place();
    anim.cancel();
  }

  async scaleTo(scale, duration = 400, easing = 'ease-out') {
    const from = `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
    this.scale = scale;
    const anim = this.el.animate([{ transform: from }, { transform: `translate(${this.x}px, ${this.y}px) scale(${scale})` }], {
      duration,
      easing,
      fill: 'forwards',
    });
    await anim.finished.catch(() => {});
    this.place();
    anim.cancel();
  }

  async fade(to, duration = 400) {
    const from = getComputedStyle(this.el).opacity;
    const anim = this.el.animate([{ opacity: from }, { opacity: to }], { duration, fill: 'forwards' });
    await anim.finished.catch(() => {});
    this.el.style.opacity = String(to);
    anim.cancel();
  }

  // A repeating gesture (waddle, bob, breathe). Returns a function that stops it.
  loop(keyframes, options) {
    const anim = this.pose.animate(keyframes, { iterations: Infinity, ...options });
    return () => anim.cancel();
  }

  // A one-off gesture (hop, lean, shake).
  async gesture(keyframes, options) {
    const anim = this.pose.animate(keyframes, options);
    await anim.finished.catch(() => {});
    anim.cancel();
  }

  // Squash and stretch with the loudness of the voice, so it looks like the character speaks.
  talkLevel(level) {
    const k = Math.min(1, level * 9);
    this.talkG.style.transform = `scale(${1 + k * 0.03}, ${1 + k * 0.07})`;
  }
}

// ---- Subtitles: characters with pinyin above, Italian below ---------------------------------

const HAN = /\p{Script=Han}/u;

// Chinese text with each syllable of pinyin above its character. `py` has one syllable per
// character, separated by spaces. Fills `el` and returns the ruby elements, one per character.
export function fillRuby(el, zh, py) {
  const syllables = (py || '').split(/\s+/).filter(Boolean);
  const chars = [];
  let s = 0;
  for (const ch of zh) {
    if (HAN.test(ch)) {
      const ruby = document.createElement('ruby');
      ruby.textContent = ch;
      const rt = document.createElement('rt');
      rt.textContent = syllables[s++] || '';
      ruby.append(rt);
      el.append(ruby);
      chars.push(ruby);
    } else {
      const span = document.createElement('span');
      span.textContent = ch;
      el.append(span);
    }
  }
  return chars;
}

export class Subtitles {
  constructor(root) {
    this.root = root;
    this.showPinyin = true;
    this.showItalian = true;
    this.raf = 0;
  }

  // `speaker` (optional) names who is talking, above the line.
  render(line, { speaker } = {}) {
    cancelAnimationFrame(this.raf);
    const zh = document.createElement('div');
    zh.className = 'sub-zh';
    this.chars = fillRuby(zh, line.zh, line.py);
    const it = document.createElement('div');
    it.className = 'sub-it';
    it.textContent = line.it || '';
    this.root.replaceChildren(zh, it);
    if (speaker) {
      const who = document.createElement('div');
      who.className = 'sub-who';
      who.textContent = speaker;
      this.root.prepend(who);
    }
    this.root.classList.toggle('no-pinyin', !this.showPinyin);
    this.root.classList.toggle('no-italian', !this.showItalian);
    this.root.hidden = false;
  }

  // Light up each character as the voice reaches it, using the timing file made with the audio:
  // the syllable being said is "now" (red), the ones before it "said".
  follow(timings, startedAt, ctx) {
    const words = (timings?.words || []).filter((w) => HAN.test(w.text));
    if (!words.length) {
      this.chars.forEach((c) => c.classList.add('said'));
      return;
    }
    const tick = () => {
      const elapsed = ctx.currentTime - startedAt;
      let current = -1;
      this.chars.forEach((c, i) => {
        const w = words[Math.min(i, words.length - 1)];
        const reached = i < words.length ? elapsed >= w.start - 0.05 : elapsed > 0;
        c.classList.toggle('said', reached);
        if (reached) current = i;
      });
      const last = words[Math.min(current, words.length - 1)];
      this.chars.forEach((c, i) => c.classList.toggle('now', i === current && elapsed <= last.end + 0.12));
      const done = current === this.chars.length - 1 && elapsed > last.end + 0.12;
      if (!done) this.raf = requestAnimationFrame(tick);
    };
    tick();
  }

  clear() {
    cancelAnimationFrame(this.raf);
    this.root.hidden = true;
    this.root.replaceChildren();
  }

  togglePinyin() {
    this.showPinyin = !this.showPinyin;
    this.root.classList.toggle('no-pinyin', !this.showPinyin);
  }

  toggleItalian() {
    this.showItalian = !this.showItalian;
    this.root.classList.toggle('no-italian', !this.showItalian);
  }
}

// ---- Teacher controls ------------------------------------------------------------------

export function setupControls({ sound, subs, onKey, hud }) {
  const setHud = (text) => {
    if (!hud) return;
    hud.textContent = text;
    hud.hidden = !text;
  };

  const togglePause = async () => {
    clock.paused = !clock.paused;
    if (clock.paused) {
      document.getAnimations().forEach((a) => a.pause());
      await sound.suspend();
      setHud('⏸ In pausa · premi Spazio');
    } else {
      document.getAnimations().forEach((a) => a.play());
      await sound.resume();
      setHud('');
    }
  };

  document.addEventListener('keydown', async (e) => {
    if (e.target.closest?.('input, select, textarea')) return;
    if (onKey && (await onKey(e))) return;
    if (e.code === 'Space') {
      e.preventDefault();
      await togglePause();
    } else if (e.key === 'ArrowRight') {
      clock.skipping = true;
      finishRunningAnimations();
      setTimeout(() => (clock.skipping = false), 60);
    } else if (e.key === 'p' || e.key === 'P') {
      subs?.togglePinyin();
    } else if (e.key === 'i' || e.key === 'I') {
      subs?.toggleItalian();
    } else if (e.key === 'f' || e.key === 'F') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => {});
    } else if (e.key === '?' || e.key === 'h' && e.shiftKey) {
      const help = document.getElementById('help');
      if (help) help.hidden = !help.hidden;
    }
  });

  return { togglePause, setHud };
}

// ---- Pieces shared by the episodes ------------------------------------------------------

// The tadpole as a hatchling, with eyelids so it can open its eyes and blink.
export function makeHatchling(layer, { x = 0, y = 0, w = 260, eyesOpen = true } = {}) {
  const h = w * (140 / 220);
  const a = new Actor(layer, 'tp-hatch', { x, y, w, h, anchor: 'center' });
  const k = w / 220;
  const toLocal = (sx, sy) => [-w / 2 + sx * k, -h / 2 + sy * k];
  a.lids = [];
  for (const [sx, sy, r] of [[54, 62, 11.5], [80, 57, 10.5]]) {
    const [cx, cy] = toLocal(sx, sy);
    const R = (r + 1.6) * k;
    const lid = svg('g', {}, a.talkG);
    lid.style.transformBox = 'fill-box';
    lid.style.transformOrigin = '50% 0%';
    lid.style.transform = eyesOpen ? 'scaleY(0)' : 'scaleY(1)';
    svg('ellipse', { cx, cy, rx: R, ry: R, fill: '#1c1b18' }, lid);
    svg('path', { d: `M${cx - R * 0.65} ${cy + 1}q${R * 0.65} ${R * 0.5} ${R * 1.3} 0`, fill: 'none', stroke: '#f1ecdf', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, lid);
    a.lids.push(lid);
  }
  a.bow = toLocal(106, 72);
  const lidAnim = (frames, duration) => Promise.all(a.lids.map((l) => l.animate(frames, { duration, fill: 'forwards' }).finished.catch(() => {})));
  a.openEyes = () => lidAnim([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], 380);
  a.blink = () => lidAnim([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)', offset: 0.5 }, { transform: 'scaleY(0)' }], 260);
  return a;
}

export const waddle = (actor, degrees = 5, ms = 340) =>
  actor.loop([{ transform: `rotate(-${degrees}deg)` }, { transform: `rotate(${degrees}deg)` }], { duration: ms, direction: 'alternate', easing: 'ease-in-out' });

export const flutter = (actor) =>
  actor.loop([{ transform: 'translateY(0) rotate(-2deg)' }, { transform: 'translateY(-7px) rotate(2deg)' }], { duration: 160, direction: 'alternate', easing: 'ease-in-out' });

export function burst(fx, x, y, count = 10) {
  for (let i = 0; i < count; i++) {
    const size = 16 + Math.random() * 16;
    const b = svg('use', { href: '#bubble', x: x - size / 2, y: y - size / 2, width: size, height: size }, fx);
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 120 + Math.random() * 140;
    b.animate(
      [
        { transform: 'translate(0, 0)', opacity: 1 },
        { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 60}px)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 500, easing: 'ease-out' },
    ).finished.then(() => b.remove(), () => b.remove());
  }
}

export function sparkleAt(fx, x, y) {
  const holder = svg('g', { transform: `translate(${x} ${y})` }, fx);
  const star = svg('path', { d: 'M0-16L3.5-3.5L16 0L3.5 3.5L0 16L-3.5 3.5L-16 0L-3.5-3.5Z', fill: '#fff6d6', stroke: '#e9c46a', 'stroke-width': 2 }, holder);
  star.style.transformBox = 'fill-box';
  star.style.transformOrigin = '50% 50%';
  star.animate(
    [
      { transform: 'scale(0) rotate(0deg)', opacity: 1 },
      { transform: 'scale(1.3) rotate(45deg)', opacity: 1, offset: 0.4 },
      { transform: 'scale(0) rotate(90deg)', opacity: 0 },
    ],
    { duration: 900, easing: 'ease-out' },
  ).finished.then(() => holder.remove(), () => holder.remove());
}

// A seal stamped onto the scene at (x, y), e.g. 好 or 不.
export function stampSeal(fx, symbol, x, y, size = 46) {
  const holder = svg('g', { transform: `translate(${x - size / 2} ${y - size / 2})` }, fx);
  const seal = svg('use', { href: `#${symbol}`, width: size, height: size }, holder);
  seal.style.transformBox = 'fill-box';
  seal.style.transformOrigin = '50% 50%';
  seal.animate([{ transform: 'scale(1.8) rotate(-20deg)', opacity: 0 }, { transform: 'scale(1) rotate(-8deg)', opacity: 1 }], {
    duration: 220,
    easing: 'ease-out',
    fill: 'forwards',
  });
  return holder;
}

// Title and end cards: big brush characters, pinyin and Italian.
export async function showTitleCard(el, { zh, py, it }) {
  el.querySelector('.zh').textContent = zh;
  el.querySelector('.py').textContent = py;
  el.querySelector('.it').textContent = it;
  el.hidden = false;
  await el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, fill: 'forwards' }).finished;
}

export async function hideTitleCard(el) {
  await el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, fill: 'forwards' }).finished;
  el.hidden = true;
}
