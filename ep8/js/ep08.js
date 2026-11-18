// Episode 8 · 小猫在哪儿？ (Dov'è il gattino?). Unit 9.
//
// Part 1, "Il pacco che miagola": last week the Café Cat fell into a giant teacup in Beijing. The Carp's phone still
//   shows the cup, and nobody in it: 小猫？小猫？ 小猫在哪儿？ (the Turtle, asleep: 小猫在北京……). The Dragonfly
//   delivers a parcel for the tadpole (这是你的！): the giant teacup under a red cloth. The Duck grabs it (是我的！),
//   it meows, she drops it (不是我的！). Something shoots out into the reeds and a tail sticks out: 小猫在那儿！
//   The Duck pulls… 汪汪！ 不是小猫，是小狗！ The puppy hides: 小狗在哪儿？小狗在椅子下面。 And the Cat? While everyone
//   watched the reeds, it tiptoed off and fell asleep on the Turtle's shell (the class sees it): 小猫在那儿！
//   你是谁？我是小猫！ Who works where: 你在哪儿工作？我在北京工作。你呢？ 我在学校工作，我是老师。 我在商店工作！
//   我卖茶！ Then the puppy creeps up to sniff the Cat, and the Cat sneezes the pond apart. 医生！医生在哪儿？
//   Question: 医生在哪儿工作？
// Part 2, "Il dottor Carpa": 我儿子是医生！ 你儿子在哪儿工作？ 我儿子在医院工作，他是医生。 The Carp calls home and
//   her grandson answers (你爸爸在家吗？不在家。他在哪儿呢？他在医院。). The Dragonfly flies the Cat to hospital in
//   the teacup (医院在那儿！). The doctor listens to its heart: 小猫很好！ Another sneeze, and everyone looks at the
//   Duck (不是我！). The doctor finds a dog hair: 小狗在哪儿？小狗在椅子下面！ 是小狗，不是我！ The puppy is sad, until
//   the tadpole says 小狗，你好！ 小狗是我们的朋友！ 没关系！ 我们是朋友！ The Turtle arrives last, wants the only
//   chair, and the puppy says no: 下集：我能坐这儿吗？

import { createEpisode } from './episode-kit.js';
import { Actor, burst, flutter, hideTitleCard, makeHatchling, showTitleCard, sparkleAt, svg, wait, waddle } from './stage.js';

const $ = (sel) => document.querySelector(sel);
const scene = $('.scene');
const actors = $('#actors');
const props = $('#props');
const front = $('#front');
const HAN = /\p{Script=Han}/u;

// Everyone who speaks stays within x 210-1390 (visible on a 4:3 projector).
const CALL = [820, 330]; // the video call window
const GROUND = 716;
const PARCEL = 950; // where the Dragonfly sets the parcel down
const REEDS = 1450; // the clump of reeds on the right, where a tail sticks out
const CHAIR = { pond: 480, hospital: 560 };
const DOOR = [1290, 680]; // where the doctor stands, in front of the hospital door
const SHELL = [271, 614]; // the top of the sleeping Turtle's shell
const ROOF = [1330, 436]; // where the teacup is parked at the hospital
const CARRY = 250; // how far below the Dragonfly the parcel hangs
const PUP = 0.85; // the puppy's size, and smaller to fit under the chair
const PUP_HIDE = 0.62;
const SEATED = 0.85; // the Cat's size on the chair
const IN_CUP = 84; // how far above the cup's bottom the Cat sits when it rides in it (its face peeks over the rim)
const KANJI = 'font: 400 52px "Ma Shan Zheng","Kaiti SC",serif; fill:#3a2a18';

const turtle = new Actor(actors, 'ch-turtle', { x: 290, y: 712, w: 260, h: 200 });
const duck = new Actor(actors, 'ch-duck', { x: 1290, y: 705, w: 200, h: 218 });
const crab = new Actor(actors, 'ch-crab', { x: 640, y: GROUND, w: 230, h: 186 });
const carp = new Actor(actors, 'ch-carp', { x: 1140, y: 700, w: 300, h: 204, anchor: 'center' });
const tadpole = makeHatchling(actors, { x: 790, y: 651, w: 240 });
const dog = new Actor(actors, 'ch-dog', { x: -300, y: GROUND, w: 150, h: 128 });
const cat = new Actor(actors, 'ch-cat', { x: -300, y: 712, w: 190, h: 150 });
const doctor = new Actor(actors, 'ch-doctor', { x: 1800, y: 690, w: 280, h: 190, anchor: 'center' });
const fly = new Actor(actors, 'ch-dragonfly', { x: 1800, y: 120, w: 190, h: 139 });
const kid = new Actor($('#phone-cat'), 'carp-baby', { x: 0, y: 30, w: 176, h: 96, anchor: 'center' });
$('#phone').setAttribute('transform', `translate(${CALL[0]} ${CALL[1]})`);
const STACK = [turtle, duck, crab, carp, tadpole, dog, cat, doctor, fly];

// The tadpole has its back legs since Episode 4.
tadpole.setSymbol('tp-legs2');
tadpole.use.setAttribute('height', String((tadpole.w * 150) / 220));

function put(a, [x, y], { visible = true, facing = 1, scale = 1 } = {}) {
  a.x = x;
  a.y = y;
  a.scale = scale;
  a.place();
  a.face(facing);
  a.show(visible);
  a.pose.style.transform = '';
  a.talkG.style.transform = '';
}
// A spot for this actor: [x, bottom, scale], whatever its anchor.
function spot(a, [x, bottom, scale = 1]) {
  return [x, a.anchor === 'center' ? bottom - (a.h * scale) / 2 : bottom, scale];
}
async function walkTo(a, where, ms = 1200, { facing = a.facing ?? 1, style = 'walk' } = {}) {
  const [x, y, scale] = spot(a, where);
  a.face(facing);
  const stop = style === 'fly' ? flutter(a) : style === 'swim' ? a.loop([{ transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }], { duration: 320, direction: 'alternate' }) : waddle(a, 4, 300);
  await a.moveTo(x, y, ms, 'ease-in-out', scale);
  stop();
}
// The drawings look left (facing 1); -1 turns them to look right.
const look = (a, x) => a.face(x < a.x ? 1 : -1);
const lookAll = (x, who = [tadpole, crab, carp, duck]) => who.forEach((a) => look(a, x));
const hop = (a, height = 18) =>
  a.gesture([{ transform: 'translateY(0)' }, { transform: `translateY(-${height}px)` }, { transform: 'translateY(0)' }], { duration: 420, easing: 'ease-out' });
const puff = (a, k = 1.14) =>
  a.gesture([{ transform: 'scale(1)' }, { transform: `scale(${k}) rotate(-3deg)`, offset: 0.3 }, { transform: `scale(${k}) rotate(3deg)`, offset: 0.6 }, { transform: 'scale(1)' }], { duration: 700 });
const lean = (a, deg = -8) => a.gesture([{ transform: 'rotate(0)' }, { transform: `rotate(${deg}deg) translateY(4px)`, offset: 0.5 }, { transform: 'rotate(0)' }], { duration: 700, easing: 'ease-in-out' });
const shake = (a) => a.gesture([{ transform: 'rotate(0)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(7deg)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(0)' }], { duration: 800 });
const droop = (a) => a.gesture([{ transform: 'translateY(0) scale(1, 1)' }, { transform: 'translateY(12px) scale(1.04, 0.9)', offset: 0.5 }, { transform: 'translateY(0) scale(1, 1)' }], { duration: 1000, easing: 'ease-in-out' });
// A happy wiggle (the puppy's tail is part of the drawing, so the whole puppy wags).
const wiggle = (a, times = 3) =>
  a.gesture([{ transform: 'rotate(0)' }, ...Array.from({ length: times }, (_, i) => ({ transform: `rotate(${i % 2 ? 6 : -6}deg)` })), { transform: 'rotate(0)' }], { duration: 160 * (times + 1) });
// Sniff sniff: the nose twitches before a sneeze.
const twitch = (a) =>
  a.gesture([{ transform: 'translateY(0) scaleY(1)' }, { transform: 'translateY(-3px) scaleY(1.04)' }, { transform: 'translateY(0) scaleY(0.98)' }, { transform: 'translateY(-4px) scaleY(1.05)' }, { transform: 'translateY(0) scaleY(1)' }], { duration: 900 });
const at = (ms, fn) => wait(Math.max(0, ms)).then(fn);
// The fish (the Carp, the doctor) are placed by their centre, not their feet.
async function swimTo(a, x, y, ms = 1200, facing = a.facing) {
  a.face(facing);
  const stop = a.loop([{ transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }], { duration: 320, direction: 'alternate' });
  await a.moveTo(x, y, ms, 'ease-in-out', a.scale);
  stop();
}
// SVG groups that rotate or scale need their own centre (the default is the viewBox corner).
const centred = (el) => {
  el.style.transformBox = 'fill-box';
  el.style.transformOrigin = '50% 50%';
  return el;
};

const ep = await createEpisode({
  id: 'ep08',
  unitPage: '#',
  parts: { 1: partOne, 2: partTwo },
  reset,
  viewTop: 110,
  extraRoles: {
    doctor: { role: 'doctor', it: 'Il dottor Carpa', zh: '医生' },
    kid: { role: 'kid', it: 'Il nipotino Carpa', zh: '小鲤鱼' },
    dog: { role: 'dog', it: 'Il cagnolino', zh: '小狗' },
  },
  rewind: true, // ← goes back one line, as often as the class wants to hear it again
});
ep.stage = { duck, turtle, crab, carp, tadpole, dragonfly: fly, cat, dog, doctor, kid };
const { sound, fx } = ep;

// Everyone stands close together, so whoever speaks steps to the front (the Cat stays on top of the Turtle).
let catOnShell = false;
let stopCatSnore = () => {};
const say = (id, who, opts) => {
  if (who && who !== kid) actors.append(who.el);
  if (catOnShell) actors.append(cat.el);
  return ep.say(id, who, opts);
};
// Something that happens at the last word of a line: by the word timings when the voice plays. In live mode
// (no voice) call fire() after the line.
function atLastWord(fn, fallback = 1600) {
  let fired = false;
  const fire = () => {
    if (fired) return;
    fired = true;
    fn();
  };
  return {
    onPlay: ({ startedAt, timings, ctx }) => {
      const words = (timings?.words || []).filter((w) => HAN.test(w.text));
      const last = words[words.length - 1];
      at(last ? (startedAt + last.start - ctx.currentTime) * 1000 : fallback, fire);
    },
    fire,
  };
}

// ---- Small marks and effects --------------------------------------------------------------------

function above(actor, lift = 50) {
  if (actor === kid) return [CALL[0] + 150, CALL[1] - 70];
  const [x, y] = actor.top();
  return [Math.max(260, Math.min(1340, x)), Math.max(190, y - lift)];
}
function pop(x, y, text, { size = 64, color = '#1c1b18', ms = 1800 } = {}) {
  const holder = svg('g', { transform: `translate(${x} ${y})` }, fx);
  const q = svg('text', { class: 'bubble-q', 'text-anchor': 'middle', style: `font-size:${size}px; fill:${color}` }, holder);
  q.textContent = text;
  q.animate(
    [
      { transform: 'translateY(10px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1, offset: 0.2 },
      { transform: 'translateY(-6px)', opacity: 1, offset: 0.8 },
      { transform: 'translateY(-14px)', opacity: 0 },
    ],
    { duration: ms, easing: 'ease-out' },
  ).finished.then(() => holder.remove(), () => holder.remove());
}
const mark = (x, y, text = '？') => pop(x, y, text);
const markOver = (a, text = '？', lift = 20) => mark(...above(a, lift), text);
// Little red hearts rising from (x, y).
function hearts(x, y, n = 4) {
  for (let i = 0; i < n; i++) at(i * 220, () => pop(x + (Math.random() - 0.5) * 90, y - Math.random() * 30, '♥', { size: 34 + Math.random() * 20, color: '#c8453a', ms: 1600 }));
}
// The video call: a window onto Beijing (or the Carp's home), with its dotted line to `who`.
function showCall(on, who = carp) {
  const [cx, cy] = CALL;
  const px = who.x + (who.facing === -1 ? 0.12 : -0.12) * who.w * who.scale;
  const py = who.anchor === 'center' ? who.y : who.y - 0.5 * who.h * who.scale;
  $('#phone-signal').setAttribute('d', `M0 124C60 210 ${px - cx - 70} ${(py - cy) * 0.62} ${px - cx} ${py - cy - 20}`);
  return $('#phone').animate([{ opacity: on ? 0 : 1 }, { opacity: on ? 1 : 0 }], { duration: 450, fill: 'forwards' }).finished;
}
const callLabel = (text) => ($('#phone-label').textContent = text);
function ripple(x, y) {
  for (let i = 0; i < 2; i++) {
    const r = svg('ellipse', { cx: x, cy: y, rx: 20, ry: 6, fill: 'none', stroke: '#8fa89b', 'stroke-width': 4 }, fx);
    centred(r);
    r.animate([{ transform: 'scale(0.4)', opacity: 0.8 }, { transform: 'scale(5)', opacity: 0 }], { duration: 1300, delay: i * 260, easing: 'ease-out' }).finished.then(
      () => r.remove(),
      () => r.remove(),
    );
  }
}
function puffs(x, y, n = 4) {
  for (let i = 0; i < n; i++) {
    const c = centred(svg('circle', { cx: x + (Math.random() - 0.5) * 50, cy: y, r: 7 + Math.random() * 6, fill: '#e9e2d0', opacity: 0.9 }, fx));
    c.animate([{ transform: 'translate(0, 0) scale(0.6)', opacity: 0.9 }, { transform: `translate(${(Math.random() - 0.5) * 50}px, -40px) scale(1.8)`, opacity: 0 }], { duration: 700, delay: i * 60, easing: 'ease-out' }).finished.then(
      () => c.remove(),
      () => c.remove(),
    );
  }
}
// Zzz over a sleeper, until the returned function is called.
function snoring(actor, { quiet = false } = {}) {
  let on = true;
  (async () => {
    while (on) {
      if (!quiet) sound.snore();
      for (let i = 0; i < 2 && on; i++) {
        const [x, y] = above(actor, 30);
        const z = svg('text', { class: 'bubble-q', 'text-anchor': 'middle', style: 'font-size: 46px' }, fx);
        z.setAttribute('x', String(x + 40 + i * 24));
        z.setAttribute('y', String(y));
        z.textContent = 'Z';
        z.animate([{ transform: 'translateY(0)', opacity: 0 }, { transform: 'translateY(-14px)', opacity: 1, offset: 0.3 }, { transform: 'translateY(-70px)', opacity: 0 }], { duration: 1700, easing: 'ease-out' }).finished.then(
          () => z.remove(),
          () => z.remove(),
        );
        await wait(900);
      }
      await wait(700);
    }
  })();
  return () => (on = false);
}
// Wisps of steam rising from (x, y), until the returned function is called.
function steam(x, y, { drift = 0 } = {}) {
  let on = true;
  (async () => {
    while (on) {
      const c = centred(svg('circle', { cx: x + (Math.random() - 0.5) * 10, cy: y, r: 6 + Math.random() * 4, fill: '#fbf8f1', opacity: 0.85 }, fx));
      c.animate([{ transform: 'translate(0, 0) scale(0.6)', opacity: 0.85 }, { transform: `translate(${drift + (Math.random() - 0.5) * 26}px, -70px) scale(1.9)`, opacity: 0 }], { duration: 1500, easing: 'ease-out' }).finished.then(
        () => c.remove(),
        () => c.remove(),
      );
      await wait(420);
    }
  })();
  return () => (on = false);
}
// Duck feathers flying up and fluttering down.
function feathers(x, y, n = 12) {
  for (let i = 0; i < n; i++) {
    const g = svg('g', { transform: `translate(${x + (Math.random() - 0.5) * 60} ${y + (Math.random() - 0.5) * 40})` }, fx);
    const f = centred(svg('g', {}, g));
    svg('path', { d: 'M0 -15C8 -8 8 8 0 15C-8 8 -8 -8 0 -15Z', fill: i % 3 ? '#a58763' : '#8c6f4e', stroke: '#5e4a33', 'stroke-width': 1.2 }, f);
    svg('path', { d: 'M0 -13V20', stroke: '#5e4a33', 'stroke-width': 1.4 }, f);
    const dx = (Math.random() - 0.5) * 380;
    const up = 70 + Math.random() * 130;
    const fall = 90 + Math.random() * 140;
    const rot = (Math.random() - 0.5) * 900;
    f.animate(
      [
        { transform: 'translate(0px, 0px) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${-up}px) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.25 },
        { transform: `translate(${dx * 0.8}px, ${-up / 2}px) rotate(${rot * 0.7}deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${dx}px, ${fall}px) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: 2800 + Math.random() * 1400, easing: 'ease-out' },
    ).finished.then(() => g.remove(), () => g.remove());
  }
}
// A group that moves by translate (positioned outside) and turns by rotate (inside), so neither disturbs the other.
function mover(parent, draw, { x = 0, y = 0 } = {}) {
  const outer = svg('g', {}, parent);
  const inner = centred(svg('g', {}, outer));
  draw(inner);
  const pose = { x, y, r: 0 };
  const apply = () => {
    outer.style.transform = `translate(${pose.x}px, ${pose.y}px)`;
    inner.style.transform = `rotate(${pose.r}deg)`;
  };
  apply();
  return {
    outer,
    inner,
    pose,
    set(p) {
      outer.getAnimations().forEach((a) => a.cancel());
      inner.getAnimations().forEach((a) => a.cancel());
      Object.assign(pose, p);
      apply();
    },
    show(on) {
      outer.style.opacity = on ? '1' : '0';
    },
    // To a new spot, in an arc if asked (arc = how high it rises); `r` is the rotation on arrival.
    async to(p, ms = 700, { arc = 0, easing = 'ease-in-out' } = {}) {
      const from = { ...pose };
      const end = { ...pose, ...p };
      const f = (q) => `translate(${q.x}px, ${q.y}px)`;
      const frames = [{ transform: f(from) }];
      if (arc) frames.push({ transform: f({ x: (from.x + end.x) / 2, y: Math.min(from.y, end.y) - arc }), offset: 0.5 });
      frames.push({ transform: f(end) });
      const a = outer.animate(frames, { duration: ms, easing, fill: 'forwards' });
      const b = inner.animate([{ transform: `rotate(${from.r}deg)` }, { transform: `rotate(${end.r}deg)` }], { duration: ms, easing, fill: 'forwards' });
      await Promise.all([a.finished.catch(() => {}), b.finished.catch(() => {})]);
      Object.assign(pose, end);
      apply();
      a.cancel();
      b.cancel();
    },
  };
}

// ---- Sounds made here: a meow, a sneeze, a siren, a heartbeat ---------------------------------------
// (Always through sound.sfxBus at the time of playing: going back with ← swaps it for a silent one.)

function meow() {
  const ctx = sound.ctx;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(520, t);
  o.frequency.exponentialRampToValueAtTime(840, t + 0.18);
  o.frequency.exponentialRampToValueAtTime(420, t + 0.62);
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 2.5;
  f.frequency.setValueAtTime(900, t);
  f.frequency.exponentialRampToValueAtTime(1700, t + 0.2);
  f.frequency.exponentialRampToValueAtTime(700, t + 0.62);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.4, t + 0.06);
  g.gain.setValueAtTime(0.32, t + 0.42);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
  o.connect(f).connect(g).connect(sound.sfxBus);
  o.start(t);
  o.stop(t + 0.75);
}
function sneezeSound(big = true) {
  const ctx = sound.ctx;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = sound.noise;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 1.1;
  f.frequency.setValueAtTime(1800, t);
  f.frequency.exponentialRampToValueAtTime(5200, t + 0.06);
  f.frequency.exponentialRampToValueAtTime(800, t + 0.5);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(big ? 0.9 : 0.4, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
  src.connect(f).connect(g).connect(sound.sfxBus);
  src.start(t, Math.random() * 0.3, 0.6);
}
// Nee-naw: the teacup ambulance.
function siren(seconds = 2.4) {
  const ctx = sound.ctx;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = 'triangle';
  for (let k = 0; k < seconds / 0.4; k++) o.frequency.setValueAtTime(k % 2 ? 660 : 880, t + k * 0.4);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.14, t + 0.1);
  g.gain.setValueAtTime(0.14, t + seconds - 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  o.connect(g).connect(sound.sfxBus);
  o.start(t);
  o.stop(t + seconds + 0.05);
}
function heartbeat() {
  sound.bump();
  at(170, () => sound.bump());
}

// ---- Props ------------------------------------------------------------------------------------------

// A chair seen from the front: its back stands behind the actors, its seat and front legs in front of them,
// so the puppy can hide underneath and the Cat can sit on it. Wood at the pond, white at the hospital.
const chair = (() => {
  const back = svg('g', {}, props);
  const fore = svg('g', {}, front);
  const parts = [];
  const part = (parent, tag, attrs, tone = 'main') => parts.push([svg(tag, { 'stroke-width': 2.5, 'stroke-linejoin': 'round', ...attrs }, parent), tone]);
  part(back, 'rect', { x: -58, y: -104, width: 10, height: 96, rx: 3 });
  part(back, 'rect', { x: 48, y: -104, width: 10, height: 96, rx: 3 });
  part(back, 'rect', { x: -62, y: -262, width: 14, height: 162, rx: 4 });
  part(back, 'rect', { x: 48, y: -262, width: 14, height: 162, rx: 4 });
  [-30, -4, 22].forEach((x) => part(back, 'rect', { x, y: -242, width: 8, height: 132, rx: 3 }));
  part(back, 'rect', { x: -68, y: -270, width: 136, height: 30, rx: 8 });
  const cross = svg('g', { transform: 'translate(0 -255)' }, back);
  svg('path', { d: 'M-4 -10H4V-4H10V4H4V10H-4V4H-10V-4H-4Z', fill: '#c8453a' }, cross);
  part(fore, 'path', { d: 'M-70 -112H70L80 -96H-80Z' }, 'top');
  part(fore, 'rect', { x: -80, y: -96, width: 160, height: 12, rx: 3 });
  part(fore, 'rect', { x: -78, y: -84, width: 12, height: 84, rx: 3 });
  part(fore, 'rect', { x: 66, y: -84, width: 12, height: 84, rx: 3 });
  const LOOK = {
    wood: { main: '#b07a45', top: '#c99560', stroke: '#6b4422' },
    white: { main: '#e3e8e4', top: '#f6f8f5', stroke: '#7d8a82' },
  };
  return {
    set(x, kind = 'wood') {
      back.setAttribute('transform', `translate(${x} ${GROUND})`);
      fore.setAttribute('transform', `translate(${x} ${GROUND})`);
      const c = LOOK[kind];
      parts.forEach(([el, tone]) => {
        el.setAttribute('fill', c[tone]);
        el.setAttribute('stroke', c.stroke);
      });
      cross.style.opacity = kind === 'white' ? '1' : '0';
    },
  };
})();
// Where the Cat sits on the chair.
const seat = (x) => [x, GROUND - 100];

// The giant teacup from Beijing, first under a red cloth with a label, hanging from the Dragonfly on a string.
const parcel = (() => {
  let cloth;
  let strings;
  const m = mover(
    front,
    (g) => {
      strings = {
        bow: svg('path', { d: 'M0 -158V-250', stroke: '#5c4526', 'stroke-width': 2.5, fill: 'none' }, g),
        basket: svg('path', { d: 'M-70 -98L0 -250L70 -98', stroke: '#5c4526', 'stroke-width': 2.5, fill: 'none' }, g),
      };
      svg('path', { d: 'M-70 -68Q-102 -66 -100 -38Q-98 -14 -64 -18', fill: 'none', stroke: '#2b4c7e', 'stroke-width': 10, 'stroke-linecap': 'round' }, g);
      svg('path', { d: 'M-72 -96H72L60 -8Q0 6 -60 -8Z', fill: '#f6f1e3', stroke: '#2b4c7e', 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
      svg('path', { d: 'M-68 -66H68M-64 -40H64', stroke: '#2b4c7e', 'stroke-width': 4, opacity: 0.7 }, g);
      svg('ellipse', { cx: 0, cy: -96, rx: 72, ry: 10, fill: '#e3dcc9', stroke: '#2b4c7e', 'stroke-width': 4 }, g);
      cloth = centred(svg('g', {}, g));
      svg('path', { d: 'M-84 -94Q-78 -152 0 -158Q78 -152 84 -94Q40 -82 0 -85Q-40 -82 -84 -94Z', fill: '#c8453a', stroke: '#7a2618', 'stroke-width': 3, 'stroke-linejoin': 'round' }, cloth);
      [[-50, -110], [-20, -130], [14, -112], [44, -128], [58, -102], [-62, -98], [-8, -96]].forEach(([cx, cy]) => svg('circle', { cx, cy, r: 4, fill: '#e9c46a' }, cloth));
      svg('path', { d: 'M0 -156C-26 -190 -46 -160 -8 -150Z M0 -156C26 -190 46 -160 8 -150Z', fill: '#c8453a', stroke: '#7a2618', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, cloth);
      svg('circle', { cx: 0, cy: -155, r: 7, fill: '#b3392b', stroke: '#7a2618', 'stroke-width': 2 }, cloth);
      const tag = svg('g', { transform: 'rotate(10 60 -120)' }, cloth);
      svg('path', { d: 'M4 -152Q40 -150 50 -132', fill: 'none', stroke: '#5c4526', 'stroke-width': 1.6 }, tag);
      svg('rect', { x: 40, y: -134, width: 62, height: 38, rx: 5, fill: '#fbf8f1', stroke: '#8a7a64', 'stroke-width': 2 }, tag);
      const label = svg('text', { x: 71, y: -104, 'text-anchor': 'middle', style: 'font: 400 30px "Ma Shan Zheng","Kaiti SC",serif; fill:#b3392b' }, tag);
      label.textContent = '北京';
    },
    { x: 1800, y: 200 },
  );
  return {
    ...m,
    cover(on) {
      cloth.getAnimations().forEach((a) => a.cancel());
      cloth.style.opacity = on ? '1' : '0';
    },
    hang(kind) {
      strings.bow.style.opacity = kind === 'bow' ? '1' : '0';
      strings.basket.style.opacity = kind === 'basket' ? '1' : '0';
    },
    async wobble(times = 4) {
      const frames = [{ transform: 'rotate(0deg)' }];
      for (let i = 0; i < times; i++) frames.push({ transform: `rotate(${i % 2 ? 7 : -7}deg) translateY(-6px)` });
      frames.push({ transform: 'rotate(0deg)' });
      await m.inner.animate(frames, { duration: 130 * (times + 1) }).finished.catch(() => {});
    },
    // The cloth flies off.
    async uncover() {
      await cloth.animate([{ transform: 'translate(0, 0) rotate(0deg)', opacity: 1 }, { transform: 'translate(60px, -260px) rotate(200deg)', opacity: 0 }], { duration: 900, easing: 'ease-out', fill: 'forwards' }).finished.catch(() => {});
      cloth.getAnimations().forEach((a) => a.cancel());
      cloth.style.opacity = '0';
    },
  };
})();
// The Dragonfly carries the parcel (and the Cat in it, if `withCat`) to (x, y), the parcel's bottom.
async function carry(x, y, ms = 1200, { withCat = false, easing = 'ease-in-out' } = {}) {
  const moves = [fly.moveTo(x, y - CARRY, ms, easing), parcel.to({ x, y }, ms, { easing })];
  if (withCat) moves.push(cat.moveTo(x, y - IN_CUP, ms, easing, cat.scale));
  await Promise.all(moves);
}

// A clump of reeds on the right, and a tail sticking out of it.
const tail = (() => {
  const g = svg('g', { transform: `translate(${REEDS - 30} 704)` }, front);
  const wag = svg('g', {}, g);
  wag.style.transformBox = 'fill-box';
  wag.style.transformOrigin = '100% 100%';
  svg('path', { d: 'M0 0C-30 -6 -74 -14 -96 -52', fill: 'none', stroke: '#a8844f', 'stroke-width': 17, 'stroke-linecap': 'round' }, wag);
  svg('path', { d: 'M0 0C-30 -6 -74 -14 -96 -52', fill: 'none', stroke: '#f3e2bf', 'stroke-width': 11, 'stroke-linecap': 'round' }, wag);
  let stop = null;
  return {
    show(on) {
      stop?.cancel();
      stop = null;
      g.style.opacity = on ? '1' : '0';
      if (on) stop = wag.animate([{ transform: 'rotate(-10deg)' }, { transform: 'rotate(12deg)' }], { duration: 260, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    },
    // The Duck tugs: the tail stretches toward her and snaps back.
    async tug() {
      await g.animate([{ transform: `translate(${REEDS - 30}px, 704px)` }, { transform: `translate(${REEDS - 58}px, 704px)`, offset: 0.4 }, { transform: `translate(${REEDS - 30}px, 704px)` }], { duration: 500, easing: 'ease-in-out' }).finished.catch(() => {});
    },
  };
})();
const reeds = (() => {
  const g = svg('g', { transform: `translate(${REEDS} ${GROUND + 14})` }, front);
  svg('ellipse', { cx: 0, cy: 0, rx: 82, ry: 14, fill: '#3e4b45', opacity: 0.35 }, g);
  const blades = [
    ['M-60 0C-62 -60 -76 -120 -92 -170', 6],
    ['M-40 0C-38 -80 -46 -160 -40 -230', 7],
    ['M-18 0C-20 -70 -6 -140 10 -200', 6],
    ['M2 0C6 -90 0 -180 6 -260', 7],
    ['M22 0C24 -60 40 -120 62 -168', 6],
    ['M40 0C44 -70 38 -140 46 -214', 6],
    ['M60 0C62 -50 74 -100 94 -140', 5],
  ];
  blades.forEach(([d, w], i) => svg('path', { d, fill: 'none', stroke: i % 2 ? '#4a5a4c' : '#5f7260', 'stroke-width': w, 'stroke-linecap': 'round' }, g));
  [[-40, -230], [6, -260], [46, -214]].forEach(([x, y]) => svg('rect', { x: x - 7, y: y - 4, width: 14, height: 44, rx: 7, fill: '#7a5230', stroke: '#4d331d', 'stroke-width': 2 }, g));
  const leaves = ['M-70 0Q-110 -50 -120 -100Q-90 -60 -58 -6Z', 'M70 0Q112 -40 126 -92Q96 -56 60 -6Z', 'M-24 0Q-50 -60 -44 -120Q-30 -60 -12 -4Z'];
  leaves.forEach((d) => svg('path', { d, fill: '#6f8a6a', stroke: '#4a5a4c', 'stroke-width': 2 }, g));
  return { show: (on) => (g.style.opacity = on ? '1' : '0') };
})();

// The Crab's teapot, which he holds up when he says what he does.
const teapot = (() => {
  const m = mover(front, (g) => {
    svg('path', { d: 'M24 -26Q46 -34 50 -52', fill: 'none', stroke: '#2f6a5a', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
    svg('path', { d: 'M-26 -40Q-48 -36 -44 -18Q-40 -6 -24 -12', fill: 'none', stroke: '#2f6a5a', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    svg('path', { d: 'M-30 -40Q-32 -2 0 0Q32 -2 30 -40Q0 -50 -30 -40Z', fill: '#4f8f7a', stroke: '#2f6a5a', 'stroke-width': 3 }, g);
    svg('ellipse', { cx: 0, cy: -44, rx: 16, ry: 5, fill: '#6aa893', stroke: '#2f6a5a', 'stroke-width': 2.5 }, g);
    svg('circle', { cx: 0, cy: -52, r: 5, fill: '#e9c46a', stroke: '#2f6a5a', 'stroke-width': 2 }, g);
  });
  return m;
})();
// A cup of tea for the doctor (the cup from the cast drawings).
const teaCup = mover(front, (g) => svg('use', { href: '#cup', x: -24, y: -38, width: 48, height: 38 }, g));

// The Cat's red nose (after the first sneeze), on the drawing itself so it moves and turns with it.
const nose = svg('circle', { cx: -31, cy: -60, r: 8, fill: '#e0503a', opacity: 0 }, cat.talkG);
const redNose = (on) => nose.setAttribute('opacity', on ? '0.85' : '0');
// Where the Cat's nose is, in the scene.
const catNose = () => [cat.x - 0.17 * cat.w * cat.scale * cat.facing, cat.y - 0.4 * cat.h * cat.scale];

// ---- The hospital, by the pond: a white house with a sign, a red cross and a door ----------------------

const hospital = (() => {
  const g = svg('g', {}, props);
  svg('rect', { x: 1170, y: 440, width: 300, height: GROUND - 440 + 6, fill: '#f6f1e3', stroke: '#8a8f88', 'stroke-width': 3 }, g);
  svg('rect', { x: 1156, y: 426, width: 328, height: 20, rx: 4, fill: '#c9d6cf', stroke: '#6f7f77', 'stroke-width': 3 }, g);
  svg('rect', { x: 1196, y: 460, width: 190, height: 64, rx: 6, fill: '#fbf8f1', stroke: '#b3392b', 'stroke-width': 3 }, g);
  const sign = svg('text', { x: 1291, y: 508, 'text-anchor': 'middle', style: KANJI.replace('#3a2a18', '#b3392b') }, g);
  sign.textContent = '医院';
  svg('path', { d: 'M1414 466h16v16h16v16h-16v16h-16v-16h-16v-16h16Z', fill: '#c8453a', stroke: '#8a2a20', 'stroke-width': 2 }, g);
  [[1192, 556], [1392, 556]].forEach(([x, y]) => {
    svg('rect', { x, y, width: 50, height: 46, rx: 4, fill: '#cfe1e6', stroke: '#8a8f88', 'stroke-width': 3 }, g);
    svg('path', { d: `M${x + 25} ${y}V${y + 46}M${x} ${y + 23}H${x + 50}`, stroke: '#8a8f88', 'stroke-width': 2 }, g);
  });
  svg('rect', { x: 1258, y: 586, width: 82, height: GROUND - 586, fill: '#3e4b45' }, g);
  const door = svg('g', {}, g);
  door.style.transformBox = 'fill-box';
  door.style.transformOrigin = '0% 50%';
  svg('rect', { x: 1258, y: 586, width: 82, height: GROUND - 586, fill: '#c9d6cf', stroke: '#6f7f77', 'stroke-width': 3 }, door);
  svg('rect', { x: 1272, y: 600, width: 54, height: 34, rx: 3, fill: '#e6eef0', stroke: '#6f7f77', 'stroke-width': 2 }, door);
  svg('circle', { cx: 1328, cy: 656, r: 4, fill: '#6f7f77' }, door);
  return {
    show(on) {
      g.style.opacity = on ? '1' : '0';
    },
    async door(open) {
      door.getAnimations().forEach((a) => a.cancel());
      const a = door.animate([{ transform: `scaleX(${open ? 1 : 0.15})` }, { transform: `scaleX(${open ? 0.15 : 1})` }], { duration: 450, easing: 'ease-in-out', fill: 'forwards' });
      await a.finished.catch(() => {});
    },
    reset() {
      door.getAnimations().forEach((a) => a.cancel());
      door.style.transform = '';
    },
  };
})();

// The stethoscope: a tube from the doctor to the Cat's chest, and a beating heart.
function listen() {
  const g = svg('g', {}, fx);
  const [dx, dy] = [doctor.x - 5 * doctor.scale * doctor.facing, doctor.y + 33 * doctor.scale];
  const [cx, cy] = [cat.x - 0.08 * cat.w * cat.scale * cat.facing, cat.y - 0.32 * cat.h * cat.scale];
  svg('path', { d: `M${dx} ${dy}Q${(dx + cx) / 2} ${Math.max(dy, cy) + 70} ${cx} ${cy}`, fill: 'none', stroke: '#3e4b45', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g);
  svg('circle', { cx, cy, r: 8, fill: '#b9c4c8', stroke: '#3e4b45', 'stroke-width': 2.5 }, g);
  return () => g.remove();
}
async function beats(n = 3) {
  const [x, y] = above(cat, 30);
  for (let i = 0; i < n; i++) {
    heartbeat();
    pop(x, y + 20, '♥', { size: 70, color: '#c8453a', ms: 700 });
    await wait(750);
  }
}

// ---- The call window: last week's teacup in Beijing, or the Carp's grandson at home -----------------

const callClip = svg('clipPath', { id: 'call-clip' }, $('#phone'));
svg('circle', { r: 112 }, callClip);
$('#phone-cat').setAttribute('clip-path', 'url(#call-clip)');
$('#phone-marks').setAttribute('clip-path', 'url(#call-clip)');
const callCup = (() => {
  const g = svg('g', {}, $('#phone-marks'));
  const up = svg('g', { transform: 'translate(0 62)' }, g);
  svg('path', { d: 'M-70 -36Q-102 -34 -100 -6Q-98 18 -64 14', fill: 'none', stroke: '#2b4c7e', 'stroke-width': 10, 'stroke-linecap': 'round' }, up);
  svg('path', { d: 'M-72 -64H72L60 24Q0 38 -60 24Z', fill: '#f6f1e3', stroke: '#2b4c7e', 'stroke-width': 4, 'stroke-linejoin': 'round' }, up);
  svg('path', { d: 'M-66 -34H66M-62 -8H62', stroke: '#2b4c7e', 'stroke-width': 4, opacity: 0.7 }, up);
  svg('ellipse', { cx: 0, cy: -64, rx: 72, ry: 10, fill: '#e3dcc9', stroke: '#2b4c7e', 'stroke-width': 4 }, up);
  svg('ellipse', { cx: 0, cy: -63, rx: 60, ry: 6, fill: '#b5651d', opacity: 0.9 }, up);
  const fuzz = svg('g', {}, $('#phone-marks'));
  return {
    show(on) {
      g.style.opacity = on ? '1' : '0';
      fuzz.innerHTML = '';
    },
    // Bubbles rise from the tea… but nobody comes up.
    bubbles() {
      let on = true;
      (async () => {
        while (on) {
          const b = centred(svg('circle', { cx: (Math.random() - 0.5) * 80, cy: -2, r: 4 + Math.random() * 4, fill: 'none', stroke: '#fbf8f1', 'stroke-width': 2 }, g));
          b.animate([{ transform: 'translateY(0) scale(0.6)', opacity: 1 }, { transform: 'translateY(-40px) scale(1.2)', opacity: 0 }], { duration: 900, easing: 'ease-out' }).finished.then(
            () => b.remove(),
            () => b.remove(),
          );
          await wait(380);
        }
      })();
      return () => (on = false);
    },
    // The signal goes: grey lines flicker across the window.
    async lost() {
      sound.crack();
      for (let k = 0; k < 6; k++) {
        fuzz.innerHTML = '';
        for (let i = 0; i < 9; i++) {
          const y = -110 + Math.random() * 220;
          svg('rect', { x: -120, y, width: 240, height: 3 + Math.random() * 9, fill: i % 2 ? '#8f897b' : '#d6cebb', opacity: 0.85 }, fuzz);
        }
        await wait(120);
      }
      svg('rect', { x: -120, y: -120, width: 240, height: 240, fill: '#8f897b', opacity: 0.6 }, fuzz);
    },
  };
})();

// ---- The two places: the pond, and the hospital by the pond ----------------------------------------

function setScene(where) {
  const pond = where === 'pond';
  reeds.show(pond);
  hospital.show(!pond);
  hospital.reset();
  chair.set(pond ? CHAIR.pond : CHAIR.hospital, pond ? 'wood' : 'white');
}

function reset(part) {
  STACK.forEach((a) => actors.append(a.el));
  scene.getAnimations().forEach((a) => a.cancel());
  catOnShell = false;
  setScene('pond');
  tail.show(false);
  teapot.show(false);
  teaCup.show(false);
  redNose(part === 2);
  callCup.show(true);
  callLabel('北京 · Pechino');
  kid.show(false);
  put(kid, [0, 30]);
  $('#phone').getAnimations().forEach((a) => a.cancel());
  $('#phone').style.opacity = '0';
  tadpole.lids.forEach((l) => (l.style.transform = 'scaleY(0)'));
  put(doctor, [1800, 690], { visible: false, scale: 0.9 });
  put(turtle, [290, 712], { facing: -1, scale: 0.95 });
  put(crab, [640, GROUND], { facing: -1 });
  put(tadpole, [790, 651], { facing: -1, scale: 1.1 });
  put(carp, [1140, 700], { facing: 1 });
  put(duck, [1290, 705], { facing: 1 });
  if (part === 1) {
    parcel.set({ x: 1800, y: 200, r: 0 });
    parcel.show(false);
    parcel.cover(true);
    parcel.hang('bow');
    put(fly, [1800, 110], { visible: false });
    put(cat, [-300, 712], { visible: false, scale: 0.5 });
    put(dog, [-300, GROUND], { visible: false, scale: PUP });
  } else {
    parcel.set({ x: PARCEL, y: GROUND - 4, r: 0 });
    parcel.show(true);
    parcel.cover(false);
    parcel.hang(null);
    put(fly, [1120, 430], { facing: 1 });
    put(cat, seat(CHAIR.pond), { facing: -1, scale: SEATED });
    put(dog, [CHAIR.pond, GROUND], { facing: -1, scale: PUP_HIDE });
  }
}

// ---- Part 1: the parcel that meows --------------------------------------------------------------------

async function partOne() {
  sound.startAmbience();
  await ep.loadName();
  ep.prepareNameClips();
  const titleEl = $('#title-card');
  await showTitleCard(titleEl, ep.EP.title);
  await say('a_title', null, { subtitles: false, keep: 500 });
  await hideTitleCard(titleEl);

  const stopSnore = snoring(turtle);

  // Last week's call is still on: the giant teacup in Beijing… and nobody in it.
  sound.ring();
  await showCall(true, carp);
  const stopBubbles = callCup.bubbles();
  await say('a_carp_call', carp);
  look(tadpole, carp.x);
  await say('a_tad_where', tadpole);
  lookAll(turtle.x, [tadpole, crab]);
  await say('a_turtle_bj', turtle);
  markOver(tadpole, '？');
  stopBubbles();
  await callCup.lost();
  await showCall(false);

  // A delivery: the Dragonfly brings a parcel under a red cloth, with a label from Beijing.
  parcel.show(true);
  parcel.hang('bow');
  put(fly, [1750, 100], { facing: 1 });
  parcel.set({ x: 1750, y: 100 + CARRY });
  sound.whoosh();
  lookAll(1400);
  const hover = flutter(fly);
  await carry(PARCEL, GROUND - 4, 2000);
  sound.bump();
  ripple(PARCEL, GROUND + 8);
  parcel.hang(null);
  await fly.moveTo(PARCEL + 70, 440, 600, 'ease-out');
  lookAll(PARCEL);
  look(fly, tadpole.x);
  await say('a_fly_cup', fly);
  await hop(tadpole, 24);

  // The Duck gets there first.
  await walkTo(duck, [1080, 705], 800, { facing: 1 });
  await say('a_duck_mine', duck);
  await parcel.to({ x: PARCEL + 20 }, 300);
  // It meows. It shakes.
  meow();
  await parcel.wobble();
  mark(PARCEL, GROUND - 200, '？！');
  await Promise.all([shake(duck), parcel.to({ x: PARCEL }, 200)]);
  await say('a_duck_notmine', duck);
  await walkTo(duck, [1290, 705], 700, { facing: 1 }); // backing away, still staring at it

  // The tadpole creeps up to it…
  await walkTo(tadpole, [830, 651, 1.1], 700, { facing: -1 });
  await say('a_tad_cat', tadpole);
  meow();
  await parcel.wobble(6);
  // …the cloth flies off and something shoots out, into the reeds.
  sound.pop();
  const off = parcel.uncover();
  put(dog, [PARCEL, GROUND - 20], { facing: -1, scale: PUP });
  actors.append(dog.el);
  sound.whoosh();
  await dog.moveTo(PARCEL + 60, GROUND - 170, 260, 'ease-out');
  puffs(PARCEL + 60, GROUND - 120, 5);
  await dog.moveTo(REEDS - 10, GROUND, 520, 'ease-in');
  dog.show(false);
  await off;
  tail.show(true);
  lookAll(REEDS);
  look(fly, REEDS);
  hop(tadpole, 14);
  await say('a_crab_where', crab);

  // While everyone stares at the reeds, the Cat climbs out of the cup and tiptoes off to the Turtle.
  const sneaking = catSneaks();
  await walkTo(duck, [1250, 705], 700, { facing: -1 });
  await say('a_duck_there', duck);
  // She pulls the tail… once… twice…
  await Promise.all([tail.tug(), lean(duck, 10)]);
  await Promise.all([tail.tug(), lean(duck, 14)]);
  // …and out pops a puppy.
  tail.show(false);
  put(dog, [REEDS - 80, GROUND], { facing: -1, scale: PUP });
  actors.append(dog.el);
  sound.pop();
  await dog.moveTo(REEDS - 130, GROUND - 110, 240, 'ease-out');
  await dog.moveTo(REEDS - 160, GROUND, 240, 'ease-in');
  look(dog, duck.x);
  await Promise.all([shake(duck), say('g_dog_wang', dog)]);
  feathers(duck.x, duck.y - 120, 5);
  await sneaking;
  look(carp, dog.x);
  await say('a_carp_dog', carp);

  // The puppy zooms round the pond, everyone spinning to follow it, and dives under the chair.
  for (const [x, y, scale] of [[1050, GROUND + 6, PUP], [700, GROUND + 14, PUP], [980, GROUND + 18, PUP], [CHAIR.pond, GROUND, PUP_HIDE]]) {
    sound.whoosh();
    look(dog, x);
    lookAll(x);
    await dog.moveTo(x, y, 430, 'ease-in-out', scale);
    puffs(x, y - 12, 3);
  }
  look(dog, 900);
  await shake(crab);
  await say('a_crab_dog', crab);
  look(tadpole, CHAIR.pond);
  await hop(tadpole, 20);
  await say('a_tad_chair', tadpole);
  lookAll(CHAIR.pond);
  // It peeks out, and back in.
  await dog.moveTo(CHAIR.pond + 40, GROUND, 300, 'ease-out');
  await wait(400);
  await dog.moveTo(CHAIR.pond, GROUND, 300, 'ease-in');

  // And the Cat? The tadpole looks into the cup: empty.
  look(tadpole, PARCEL);
  await lean(tadpole, 10);
  mark(PARCEL, GROUND - 170, '？');
  await wait(700);
  await fly.moveTo(650, 360, 900, 'ease-in-out');
  look(fly, SHELL[0]);
  await say('a_fly_there', fly);
  lookAll(SHELL[0]);
  mark(SHELL[0] + 40, SHELL[1] - 110, '！');
  await wait(600);

  // The Turtle wakes up with a cat on his back.
  stopSnore();
  stopCatSnore();
  await shake(turtle);
  await say('a_turtle_who', turtle);
  await twitch(cat);
  await say('a_cat_me', cat);
  // It jumps onto the chair (with the puppy hiding underneath).
  catOnShell = false;
  actors.append(cat.el);
  await cat.moveTo(390, 470, 380, 'ease-out', 0.7);
  await cat.moveTo(...seat(CHAIR.pond), 380, 'ease-in', SEATED);
  sound.plop();
  look(cat, tadpole.x);
  await say('a_cat_hi', cat);
  await hop(tadpole, 26);
  await Promise.all([hop(tadpole, 22), hop(crab, 18), hop(carp, 16), hop(duck, 18), puff(turtle, 1.1), ep.sayAll('a_all_cat', [tadpole, duck, crab, carp, turtle, fly], { keep: 400 })]);
  burst(fx, cat.x, cat.y - 130, 10);
  sound.sparkle();

  // Who works where?
  look(fly, cat.x);
  await say('a_fly_work', fly);
  look(cat, turtle.x);
  await say('a_cat_bj', cat);
  look(turtle, cat.x);
  await lean(turtle, -6);
  await say('a_turtle_school', turtle);
  look(duck, cat.x);
  await puff(duck, 1.14);
  await say('a_duck_shop', duck);
  // The Crab holds up his teapot.
  teapot.set({ x: crab.x - 40, y: crab.y - 120, r: 0 });
  teapot.show(true);
  const stopSteam = steam(crab.x - 40, crab.y - 175);
  await Promise.all([teapot.to({ y: crab.y - 175, r: -10 }, 400), hop(crab, 16)]);
  await say('a_crab_tea', crab);
  stopSteam();
  await teapot.to({ y: crab.y - 120, r: 0 }, 300);
  teapot.show(false);

  // The puppy creeps out from under the chair to sniff the Cat… The Cat's nose twitches…
  look(cat, tadpole.x);
  look(dog, CHAIR.pond + 200);
  actors.append(dog.el);
  await dog.moveTo(CHAIR.pond + 110, GROUND, 1200, 'ease-in-out', PUP);
  look(dog, cat.x);
  await wiggle(dog);
  await twitch(cat);
  await twitch(cat);
  // …阿……阿……阿嚏！
  const boom = atLastWord(() => sneeze(true), 2400);
  await say('a_cat_achoo', cat, { onPlay: boom.onPlay });
  boom.fire();
  await wait(300);
  redNose(true);
  // The puppy scurries back under the chair. Nobody sees it.
  look(dog, CHAIR.pond);
  await dog.moveTo(CHAIR.pond, GROUND, 260, 'ease-in', PUP_HIDE);
  look(dog, 900);
  await wait(900);
  lookAll(cat.x);
  look(fly, cat.x);
  await say('a_cat_doctor', cat);
  await wait(400);
  await say('a_ask', null, { keep: 300 });
  ep.showQuestion(); // stays up for the class to discuss: A, B or C?
  hover();
  sound.stopAmbience(2);
  return [];
}

// While the others look at the reeds: up over the rim, off along the far bank behind everyone (small, so the
// class can see it go), and down onto the Turtle's shell.
async function catSneaks() {
  put(cat, [PARCEL, 700], { facing: 1, scale: 0.5 });
  actors.prepend(cat.el);
  await cat.moveTo(PARCEL, 656, 500, 'ease-out');
  await wait(500);
  await cat.moveTo(PARCEL - 70, 470, 450, 'ease-out', 0.4);
  const stop = waddle(cat, 3, 260);
  await cat.moveTo(340, 470, 4200, 'linear');
  stop();
  actors.append(cat.el);
  catOnShell = true;
  await cat.moveTo(SHELL[0], SHELL[1], 600, 'ease-in', 0.55);
  stopCatSnore = snoring(cat, { quiet: true });
}

// The Cat's sneeze: 阿嚏！ in big letters, the scene shakes, everyone in front is blown back, the Duck loses feathers.
async function sneeze(big = true) {
  sneezeSound(big);
  const [nx, ny] = catNose();
  const dir = cat.facing === 1 ? -1 : 1; // the way the Cat looks
  pop(nx + dir * 80, ny - 40, '阿嚏！', { size: big ? 110 : 60, color: '#b3392b', ms: 1400 });
  for (let i = 0; i < (big ? 7 : 4); i++) {
    const a = (i - 3) * 0.16;
    const len = big ? 300 : 160;
    const line = svg('path', { d: `M${nx + dir * 30} ${ny}L${nx + dir * (30 + len * Math.cos(a))} ${ny + len * Math.sin(a)}`, stroke: '#8f897b', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-dasharray': '60 400', fill: 'none' }, fx);
    line.animate([{ strokeDashoffset: 60, opacity: 1 }, { strokeDashoffset: -len, opacity: 0 }], { duration: 600, easing: 'ease-out' }).finished.then(
      () => line.remove(),
      () => line.remove(),
    );
  }
  if (big) scene.animate([{ transform: 'translate(0, 0)' }, { transform: 'translate(-8px, 4px)' }, { transform: 'translate(7px, -5px)' }, { transform: 'translate(-4px, 3px)' }, { transform: 'translate(0, 0)' }], { duration: 420 });
  const push = big ? 34 : 14;
  const blown = [tadpole, crab, carp, duck, turtle, doctor, fly].filter((a) => a.el.style.opacity !== '0' && Math.sign(a.x - cat.x) === dir);
  blown.forEach((a) => {
    const k = dir * a.facing; // the pose group is mirrored with the drawing
    a.gesture([{ transform: 'translateX(0) rotate(0)' }, { transform: `translateX(${-k * push}px) rotate(${-k * (big ? 10 : 4)}deg)`, offset: 0.25 }, { transform: 'translateX(0) rotate(0)' }], { duration: 1000, easing: 'ease-out' });
  });
  if (duck.el.style.opacity !== '0') feathers(duck.x, duck.y - 120, big ? 18 : 8);
}

// ---- Part 2: the doctor ---------------------------------------------------------------------------------

async function partTwo() {
  sound.startAmbience();
  await ep.loadName();
  ep.prepareNameClips();
  let hover = flutter(fly);
  await wait(900);

  // The Carp has an idea.
  look(carp, cat.x);
  await hop(carp, 24);
  sparkleAt(fx, ...above(carp, 10));
  sound.chime();
  await say('b_carp_son', carp);
  look(cat, carp.x);
  await twitch(cat);
  await say('b_cat_where', cat);
  await puff(carp, 1.12);
  await say('b_carp_hosp', carp);

  // She calls home: her grandson answers.
  callLabel('家 · A casa');
  callCup.show(false);
  kid.show(true);
  sound.ring();
  await showCall(true, carp);
  const bob = kid.loop([{ transform: 'translateY(0) rotate(-3deg)' }, { transform: 'translateY(-8px) rotate(3deg)' }], { duration: 700, direction: 'alternate', easing: 'ease-in-out' });
  await say('b_carp_baba', carp);
  await say('g_kid_no', kid);
  look(tadpole, CALL[0]);
  await lean(tadpole, -10);
  await say('b_tad_ne', tadpole);
  await say('g_kid_hosp', kid);
  bob();
  await showCall(false);

  // To the hospital! The Cat jumps into the teacup and the Dragonfly lifts it.
  look(fly, cat.x);
  await say('b_fly_go', fly);
  actors.append(cat.el);
  look(cat, PARCEL);
  await cat.moveTo(700, 470, 450, 'ease-out', 0.6);
  await cat.moveTo(PARCEL, GROUND - 4 - IN_CUP, 450, 'ease-in', 0.5);
  sound.plop();
  hover();
  parcel.hang('basket');
  await fly.moveTo(PARCEL, GROUND - 4 - CARRY, 600, 'ease-in-out');
  hover = flutter(fly);
  siren(3.2);
  lookAll(1600);
  await carry(PARCEL, 400, 1000, { withCat: true });
  // Everyone hurries after it (the Turtle too, slowly… very slowly). And who sneaks out from under the chair?
  await Promise.all([
    carry(1850, 260, 1500, { withCat: true, easing: 'ease-in' }),
    walkTo(tadpole, [1750, 651, 1.1], 2200, { facing: -1 }),
    walkTo(crab, [1800, GROUND], 2400, { facing: -1 }),
    swimTo(carp, 1850, 700, 2200, -1),
    walkTo(duck, [1800, 705], 2000, { facing: -1 }),
    walkTo(turtle, [380, 712, 0.95], 2400, { facing: -1 }),
    at(1200, () => walkTo(dog, [900, GROUND, PUP], 1400, { facing: -1 })),
  ]);
  await walkTo(dog, [1750, GROUND, PUP], 900, { facing: -1 });

  // 医院: the hospital, by the pond.
  const cardEl = $('#title-card');
  await Promise.all([showTitleCard(cardEl, { zh: '医院', py: 'yī yuàn', it: 'L’ospedale' }), scene.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }).finished]);
  setScene('hospital');
  parcel.set({ x: -300, y: 300 + CARRY });
  put(fly, [-300, 300], { facing: -1 });
  put(cat, [-300, 300 + CARRY - IN_CUP], { facing: -1, scale: 0.5 });
  put(turtle, [-400, 712], { visible: false, facing: -1, scale: 0.95 });
  put(dog, [-300, GROUND], { visible: false, facing: -1, scale: PUP });
  put(duck, [-250, 705], { facing: -1 });
  put(crab, [-450, GROUND], { facing: -1 });
  put(tadpole, [-650, 651], { facing: -1, scale: 1.1 });
  put(carp, [-850, 700], { facing: -1 });
  await wait(700);
  await Promise.all([hideTitleCard(cardEl), scene.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, fill: 'forwards' }).finished]);
  scene.getAnimations().forEach((a) => a.cancel());
  siren(2.4);
  const walking = Promise.all([
    walkTo(duck, [280, 705], 2600, { facing: -1 }),
    walkTo(crab, [1090, GROUND], 3600, { facing: -1 }),
    walkTo(tadpole, [760, 651, 1.1], 3400, { facing: -1 }),
    swimTo(carp, 920, 700, 3600, -1),
  ]);
  await carry(CHAIR.hospital + 160, 470, 1500, { withCat: true });
  await say('b_fly_hosp', fly);
  await walking;
  // The Cat is let down onto the chair, and the cup is parked on the roof.
  await carry(CHAIR.hospital, 470, 600, { withCat: true });
  await cat.moveTo(...seat(CHAIR.hospital), 450, 'ease-in', SEATED);
  sound.plop();
  look(cat, 1300);
  await carry(ROOF[0], ROOF[1], 1200);
  sound.bump();
  parcel.hang(null);
  await fly.moveTo(1040, 380, 700, 'ease-in-out');
  look(fly, 1300);

  // The door opens: it's the Carp's son, the doctor.
  lookAll(1300, [tadpole, crab, carp, duck]);
  await hospital.door(true);
  put(doctor, [1300, 660], { facing: 1, scale: 0.6 });
  doctor.show(false);
  await doctor.fade(1, 300);
  await doctor.moveTo(...DOOR, 700, 'ease-out', 0.9);
  hospital.door(false);
  await say('g_doc_hi', doctor);
  look(carp, doctor.x);
  await hop(carp, 20);
  hearts(carp.x, carp.top()[1], 3);
  // The Crab is a good host, even at the hospital.
  look(crab, doctor.x);
  teaCup.set({ x: crab.x - 60, y: crab.y - 120, r: 0 });
  teaCup.show(true);
  const offer = teaCup.to({ x: doctor.x - 40, y: doctor.y - 30 }, 900, { arc: 60 });
  await Promise.all([offer, say('b_crab_tea', crab)]);
  sound.plop();
  await lean(doctor, 8);
  teaCup.show(false);

  // The doctor listens to the Cat's heart.
  await walkTo(tadpole, [850, 651, 1.1], 500, { facing: 1 });
  await swimTo(doctor, 720, 640, 1400, 1);
  const unhook = listen();
  await beats(3);
  await say('g_doc_ok', doctor);
  unhook();
  await hop(doctor, 14);
  burst(fx, cat.x, cat.y - 120, 8);
  sound.sparkle();
  await swimTo(doctor, ...DOOR, 1200, -1);
  doctor.face(1);

  // Meanwhile, the puppy has followed them, and hides under the chair again. The Cat's nose twitches…
  put(dog, [-200, GROUND], { facing: -1, scale: PUP });
  actors.prepend(dog.el);
  await walkTo(dog, [CHAIR.hospital, GROUND, PUP_HIDE], 2200, { facing: -1 });
  look(dog, 900);
  look(cat, 200); // the sneeze goes the Duck's way
  await twitch(cat);
  const boom = atLastWord(() => sneeze(true), 900);
  await say('b_cat_achoo', cat, { onPlay: boom.onPlay });
  boom.fire();
  await wait(900);
  // Feathers everywhere. Everyone looks at the Duck.
  lookAll(duck.x, [tadpole, crab, carp, doctor]);
  look(cat, duck.x);
  look(fly, duck.x);
  await wait(500);
  await shake(duck);
  await say('b_duck_notme', duck);

  // During the check-up the doctor found a hair on the Cat: a dog's hair.
  look(doctor, cat.x);
  const hair = svg('path', { d: 'M0 0c6 -10 14 -2 10 6c-4 8 6 12 12 4', fill: 'none', stroke: '#c98f4e', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, fx);
  hair.setAttribute('transform', `translate(${doctor.x - 110} ${doctor.y - 110}) scale(2)`);
  sparkleAt(fx, doctor.x - 90, doctor.y - 110);
  sound.chime();
  await say('g_doc_dog', doctor);
  hair.remove();
  look(tadpole, CHAIR.hospital);
  await hop(tadpole, 24);
  await say('b_tad_chair', tadpole);
  lookAll(CHAIR.hospital, [crab, carp, duck, doctor]);
  await dog.moveTo(CHAIR.hospital + 30, GROUND, 300, 'ease-out');
  look(duck, dog.x);
  await puff(duck, 1.18);
  await say('b_duck_dog', duck);

  // The puppy creeps out, head down. It was only trying to make friends.
  actors.append(dog.el);
  await walkTo(dog, [670, GROUND, PUP], 1400, { facing: -1 });
  look(dog, 300);
  sound.sigh();
  await droop(dog);
  await droop(dog);
  look(tadpole, dog.x);
  await walkTo(tadpole, [790, 651, 1.1], 600, { facing: 1 });
  await say('b_tad_dog', tadpole);
  look(dog, tadpole.x);
  await Promise.all([wiggle(dog, 5), say('g_dog_happy', dog)]);
  hearts(dog.x, dog.top()[1] - 10, 4);
  look(crab, dog.x);
  await hop(crab, 20);
  await say('b_crab_friend', crab);
  // The Cat climbs down and hugs it. A little sneeze. Everyone laughs.
  look(cat, dog.x);
  await cat.moveTo(610, 630, 350, 'ease-out', 0.8);
  await cat.moveTo(600, GROUND - 4, 300, 'ease-in', 0.8);
  hearts(635, 540, 5);
  await say('b_cat_fine', cat);
  await sneeze(false);
  await Promise.all([hop(tadpole, 22), hop(crab, 18), hop(carp, 16), hop(duck, 18), hop(doctor, 14), hop(dog, 16), hop(cat, 12), ep.sayAll('b_all_friends', [tadpole, duck, crab, carp, fly, cat], { keep: 600 })]);
  burst(fx, 620, 520, 16);
  sound.sparkle();

  // The Turtle arrives, last as always. The Cat is back on the chair, the puppy at its feet.
  await cat.moveTo(...seat(CHAIR.hospital), 450, 'ease-in-out', SEATED);
  await walkTo(dog, [CHAIR.hospital - 120, GROUND, PUP], 500, { facing: -1 });
  await walkTo(duck, [140, 705], 700, { facing: -1 }); // the Duck steps back to let the Turtle through
  put(turtle, [-300, 712], { facing: -1, scale: 0.95 });
  actors.prepend(turtle.el);
  await walkTo(turtle, [250, 712, 0.95], 3600, { facing: -1 });
  sound.sigh();
  lookAll(turtle.x, [tadpole, crab, carp, duck]);
  await say('b_turtle_late', turtle);
  look(cat, turtle.x);
  await Promise.all([hop(tadpole, 18), hop(crab, 16), hop(carp, 14), ep.sayAll('b_all_there', [tadpole, duck, crab, carp, fly], { keep: 500 })]);
  // So tired… and there is only one chair.
  await droop(turtle);
  await say('b_turtle_chair', turtle);
  await walkTo(turtle, [330, 712, 0.95], 1200, { facing: -1 });
  look(dog, turtle.x);
  await Promise.all([hop(dog, 30), say('g_dog_no', dog)]);
  await shake(turtle);
  markOver(turtle, '！');
  await wait(900);

  const nextEl = $('#title-card');
  await showTitleCard(nextEl, ep.EP.next);
  await say('b_next', null, { subtitles: false, keep: 1500 });
  hover();
  sound.stopAmbience(2.5);
  return [];
}

// ---- The start screen: has the class chosen the name yet? -----------------------------------

async function nameStatus() {
  const el = $('#name-status');
  const n = await ep.loadName();
  if (!n) return;
  const show = (ready, total) => {
    el.innerHTML = '';
    const strong = document.createElement('strong');
    strong.textContent = `${n.zh} ${n.display}`;
    el.append('Il nome: ', strong, ready === total ? ' · voci pronte ✓' : ` · preparo le voci ${ready}/${total}… (se non sono pronte, quelle battute restano mute)`);
  };
  show(0, Object.values(ep.EP.lines).filter((l) => l.name).length);
  ep.prepareNameClips(show);
}
