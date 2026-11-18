// Episode 9 · 我能坐这儿吗？ (Posso sedermi qui?). Unit 10.
//
// Part 1, "Il traghetto per Pechino": 十二月二号，星期三, the date on the tadpole's golden ticket. The ferry to Beijing
//   is at the pier, and the Duck checks passengers in at a desk on its deck. The tadpole has never seen a computer:
//   桌子上有什么？ 桌子上有一个电脑和一本书。 请写你的名字。 (it writes its name in the passenger book with its tail)
//   你能去北京！ The Crab wants to pour a farewell tea: 杯子在哪儿？ 杯子在桌子里。 请喝茶！ Then the friends ask:
//   我能去北京吗？ 我呢？ 我家在北京…… 汪？ 不能！不能！不能！不能！ (one ticket, one passenger). 他们是我的朋友……
//   The Turtle is late, as always (on the phone: 我在家……). While the Duck is away, the class watches the plan: the
//   Dragonfly reads the passenger book (王方, 谢朋), the Carp and the Crab put on disguises, the puppy hides under a
//   seat and the Cat in the desk's open drawer. 前面那个人叫什么名字？她叫王方，在医院工作。 后面那个人呢？
//   他叫什么名字？他叫谢朋，在商店工作。 Question: 王方是谁？
// Part 2, "I clandestini": 这儿有人吗？没有。我能坐这儿吗？请坐。 The Duck inspects: 椅子下面有什么？ 椅子下面有一只
//   小狗！ 桌子里有什么？ 桌子里没有小猫！ The Cat sneezes the disguises off. 对不起…… 你们不能坐这儿！ The tadpole:
//   你们不去，我不去！ The Duck melts and prints tickets: 好！你们能去北京！ 我们能去北京！ and the tadpole's front
//   legs pop. 乌龟老师呢？ 他在那儿！ 我在这儿…… The Dragonfly lands on his head: 我能坐这儿吗？ 不能！ And the
//   ferry sails without them: 再见…… 我的电脑！ 下集：现在几点？

import { createEpisode } from './episode-kit.js';
import { Actor, burst, flutter, hideTitleCard, makeHatchling, showTitleCard, sparkleAt, stampSeal, svg, wait, waddle } from './stage.js';

const $ = (sel) => document.querySelector(sel);
const scene = $('.scene');
const actors = $('#actors');
const props = $('#props');
const front = $('#front');
const HAN = /\p{Script=Han}/u;

// Everyone who speaks stays within x 210-1390 (visible on a 4:3 projector).
const GROUND = 716; // the pier and the ferry's deck
const DESK = 885; // the Duck's desk, on the deck by the gangway (x 787-983)
const DUCK_AT = [935, 705]; // the Duck behind her desk
const SEATS = { back: 1080, mid: 1215, front: 1350 }; // three seats on deck, for three passengers
const SEAT_K = 0.8;
const SEAT_TOP = GROUND - 112 * SEAT_K;
const CALL = [1180, 320]; // the video call window (right of the live-mode banner)
const BOOK = [800, 330]; // the passenger book, close up
const FUNNEL = [1462, 344];
const AWAY = 1350; // how far the ferry sails off
const PUP = 0.85; // the puppy, and smaller to fit under a seat
const PUP_HIDE = 0.6;
const BRUSH = 'font: 400 46px "Ma Shan Zheng","Kaiti SC",serif; fill:#1c1b18';

const turtle = new Actor(actors, 'ch-turtle', { x: -300, y: 712, w: 260, h: 200 });
const dog = new Actor(actors, 'ch-dog', { x: 250, y: GROUND, w: 150, h: 128 });
const duck = new Actor(actors, 'ch-duck', { x: DUCK_AT[0], y: DUCK_AT[1], w: 200, h: 218 });
const carp = new Actor(actors, 'ch-carp', { x: 380, y: 690, w: 300, h: 204, anchor: 'center' });
const crab = new Actor(actors, 'ch-crab', { x: 520, y: GROUND, w: 230, h: 186 });
const cat = new Actor(actors, 'ch-cat', { x: 635, y: GROUND, w: 190, h: 150 });
const tadpole = makeHatchling(actors, { x: 715, y: 661, w: 240 });
const fly = new Actor(actors, 'ch-dragonfly', { x: 700, y: 430, w: 190, h: 139 });
const phoneTurtle = new Actor($('#phone-cat'), 'ch-turtle', { x: 14, y: 72, w: 210, h: 162 });
$('#phone').setAttribute('transform', `translate(${CALL[0]} ${CALL[1]})`);
// The call window shows the Turtle at home, still in bed: a nightcap and a blanket.
const callClip = svg('clipPath', { id: 'call-clip' }, $('#phone'));
svg('circle', { r: 112 }, callClip);
$('#phone-cat').setAttribute('clip-path', 'url(#call-clip)');
$('#phone-marks').setAttribute('clip-path', 'url(#call-clip)');
svg('rect', { x: -120, y: -120, width: 240, height: 240, fill: '#e8e1f0', opacity: 0.55 }, $('#phone-cat'));
$('#phone-cat').append(phoneTurtle.el);
svg('path', { d: 'M-86 -98L-40 -106Q-58 -142 -100 -128Q-84 -118 -86 -98Z', fill: '#c8453a', stroke: '#7a2618', 'stroke-width': 2, 'stroke-linejoin': 'round' }, phoneTurtle.talkG);
svg('circle', { cx: -100, cy: -128, r: 7, fill: '#fbf8f1', stroke: '#8a7a64', 'stroke-width': 1.5 }, phoneTurtle.talkG);
svg('path', { d: 'M-120 30Q-40 4 40 26Q90 36 120 20V120H-120Z', fill: '#9fb8c4', stroke: '#5d6f78', 'stroke-width': 3 }, $('#phone-marks'));
svg('path', { d: 'M-90 50Q-30 34 30 48M-60 80Q0 66 70 78', fill: 'none', stroke: '#cfe1e6', 'stroke-width': 3 }, $('#phone-marks'));
const STACK = [turtle, dog, duck, carp, crab, cat, tadpole, fly];

// The tadpole has its back legs since Episode 4, and its front legs from the end of this one.
let legs = 2;
function setLegs(n) {
  legs = n;
  tadpole.setSymbol(n === 4 ? 'tp-legs4' : 'tp-legs2');
  tadpole.use.setAttribute('height', String((tadpole.w * (n === 4 ? 160 : 150)) / 220));
}
// The tadpole is placed by its centre: where it stands with its feet on the planks, and where it sits on a seat.
const tadY = (s = tadpole.scale) => GROUND - (legs === 4 ? 67 : 55) * s;
const tadSit = (s = 0.9) => SEAT_TOP + 6 - 43 * s;
// Where the Carp and the Crab sit (as 王方 and 谢朋).
const CARP_SEAT = [SEATS.front, SEAT_TOP + 8 - 35, 0.72];
const CRAB_SEAT = [SEATS.back, SEAT_TOP + 29, 0.72];

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
// Bottom-anchored actors walk with their feet at y.
async function walkTo(a, [x, y, scale = a.scale], ms = 1200, { facing = a.facing ?? 1 } = {}) {
  a.face(facing);
  const stop = waddle(a, 4, 300);
  await a.moveTo(x, y, ms, 'ease-in-out', scale);
  stop();
}
async function tadWalk(x, ms = 1000, facing = tadpole.facing, s = tadpole.scale) {
  tadpole.face(facing);
  const stop = waddle(tadpole, 5, 280);
  await tadpole.moveTo(x, tadY(s), ms, 'ease-in-out', s);
  stop();
}
// The fish (the Carp) are placed by their centre.
async function swimTo(a, x, y, ms = 1200, facing = a.facing, scale = a.scale) {
  a.face(facing);
  const stop = a.loop([{ transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }], { duration: 320, direction: 'alternate' });
  await a.moveTo(x, y, ms, 'ease-in-out', scale);
  stop();
}
// The drawings look left (facing 1); -1 turns them to look right.
const look = (a, x) => a.face(x < a.x ? 1 : -1);
const lookAll = (x, who = [tadpole, crab, carp, cat, dog]) => who.forEach((a) => look(a, x));
const hop = (a, height = 18) =>
  a.gesture([{ transform: 'translateY(0)' }, { transform: `translateY(-${height}px)` }, { transform: 'translateY(0)' }], { duration: 420, easing: 'ease-out' });
const puff = (a, k = 1.14) =>
  a.gesture([{ transform: 'scale(1)' }, { transform: `scale(${k}) rotate(-3deg)`, offset: 0.3 }, { transform: `scale(${k}) rotate(3deg)`, offset: 0.6 }, { transform: 'scale(1)' }], { duration: 700 });
const lean = (a, deg = -8) => a.gesture([{ transform: 'rotate(0)' }, { transform: `rotate(${deg}deg) translateY(4px)`, offset: 0.5 }, { transform: 'rotate(0)' }], { duration: 700, easing: 'ease-in-out' });
const shake = (a) => a.gesture([{ transform: 'rotate(0)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(7deg)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(0)' }], { duration: 800 });
const droop = (a) => a.gesture([{ transform: 'translateY(0) scale(1, 1)' }, { transform: 'translateY(12px) scale(1.04, 0.9)', offset: 0.5 }, { transform: 'translateY(0) scale(1, 1)' }], { duration: 1000, easing: 'ease-in-out' });
const wiggle = (a, times = 3) =>
  a.gesture([{ transform: 'rotate(0)' }, ...Array.from({ length: times }, (_, i) => ({ transform: `rotate(${i % 2 ? 6 : -6}deg)` })), { transform: 'rotate(0)' }], { duration: 160 * (times + 1) });
const twitch = (a) =>
  a.gesture([{ transform: 'translateY(0) scaleY(1)' }, { transform: 'translateY(-3px) scaleY(1.04)' }, { transform: 'translateY(0) scaleY(0.98)' }, { transform: 'translateY(-4px) scaleY(1.05)' }, { transform: 'translateY(0) scaleY(1)' }], { duration: 900 });
const at = (ms, fn) => wait(Math.max(0, ms)).then(fn);
const centred = (el) => {
  el.style.transformBox = 'fill-box';
  el.style.transformOrigin = '50% 50%';
  return el;
};
// Someone steps in front of the desk and the seats (to walk past them), or back among the others.
const toFront = (...who) => who.forEach((a) => front.append(a.el));
const toBack = (...who) => who.forEach((a) => actors.append(a.el));

let turtleOnPhone = false;
const ep = await createEpisode({
  id: 'ep09',
  unitPage: '#',
  parts: { 1: partOne, 2: partTwo },
  reset,
  viewTop: 110,
  tagSpot: (who) => (who === 'turtle' && turtleOnPhone ? [CALL[0] + 190, CALL[1] - 100] : null),
  extraRoles: { dog: { role: 'dog', it: 'Il cagnolino', zh: '小狗' } },
  rewind: true, // ← goes back one line, as often as the class wants to hear it again
});
ep.stage = { duck, turtle, crab, carp, tadpole, dragonfly: fly, cat, dog };
const { sound, fx } = ep;

// Whoever speaks steps to the front of the crowd (unless they are hiding in the drawer or walking past the desk).
const say = (id, who, opts) => {
  if (who && who.el.parentNode === actors) actors.append(who.el);
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
// Something on each word containing `char` (the four 不 of 不能！不能！…). In live mode fire(n) does them one by one.
function onEach(char, fn, gap = 650) {
  let done = false;
  return {
    onPlay: ({ startedAt, timings, ctx }) => {
      const hits = (timings?.words || []).filter((w) => w.text.includes(char));
      if (!hits.length) return;
      done = true;
      hits.forEach((w, i) => at((startedAt + w.start - ctx.currentTime) * 1000, () => fn(i)));
    },
    fire(n) {
      if (done) return;
      done = true;
      for (let i = 0; i < n; i++) at(i * gap, () => fn(i));
    },
  };
}

// ---- Small marks and effects --------------------------------------------------------------------

function above(actor, lift = 50) {
  if (actor === phoneTurtle) return [CALL[0] + 150, CALL[1] - 70];
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
function hearts(x, y, n = 4) {
  for (let i = 0; i < n; i++) at(i * 220, () => pop(x + (Math.random() - 0.5) * 90, y - Math.random() * 30, '♥', { size: 34 + Math.random() * 20, color: '#c8453a', ms: 1600 }));
}
// The video call: a window onto the Turtle's bedroom, with its dotted line to the Carp's phone.
function showCall(on, who = carp) {
  const [cx, cy] = CALL;
  const px = who.x + (who.facing === -1 ? 0.12 : -0.12) * who.w * who.scale;
  const py = who.anchor === 'center' ? who.y : who.y - 0.5 * who.h * who.scale;
  $('#phone-signal').setAttribute('d', `M0 124C60 210 ${px - cx - 70} ${(py - cy) * 0.62} ${px - cx} ${py - cy - 20}`);
  return $('#phone').animate([{ opacity: on ? 0 : 1 }, { opacity: on ? 1 : 0 }], { duration: 450, fill: 'forwards' }).finished;
}
function ripple(x, y) {
  for (let i = 0; i < 2; i++) {
    const r = centred(svg('ellipse', { cx: x, cy: y, rx: 20, ry: 6, fill: 'none', stroke: '#8fa89b', 'stroke-width': 4 }, fx));
    r.animate([{ transform: 'scale(0.4)', opacity: 0.8 }, { transform: 'scale(5)', opacity: 0 }], { duration: 1300, delay: i * 260, easing: 'ease-out' }).finished.then(
      () => r.remove(),
      () => r.remove(),
    );
  }
}
function puffs(x, y, n = 4, spread = 50) {
  for (let i = 0; i < n; i++) {
    const c = centred(svg('circle', { cx: x + (Math.random() - 0.5) * spread, cy: y + (Math.random() - 0.5) * spread * 0.6, r: 9 + Math.random() * 8, fill: '#e9e2d0', opacity: 0.95 }, fx));
    c.animate([{ transform: 'translate(0, 0) scale(0.6)', opacity: 0.95 }, { transform: `translate(${(Math.random() - 0.5) * 60}px, -40px) scale(2)`, opacity: 0 }], { duration: 800, delay: i * 50, easing: 'ease-out' }).finished.then(
      () => c.remove(),
      () => c.remove(),
    );
  }
}
// Zzz over the Turtle in his bed (in the call window), until the returned function is called.
function snoringOnPhone() {
  let on = true;
  (async () => {
    while (on) {
      sound.snore();
      for (let i = 0; i < 2 && on; i++) {
        pop(CALL[0] + 70 + i * 26, CALL[1] - 40 - i * 20, 'Z', { size: 40, color: '#8f897b', ms: 1500 });
        await wait(800);
      }
      await wait(700);
    }
  })();
  return () => (on = false);
}
// Smoke from the ferry's funnel, until the returned function is called.
function smoke() {
  let on = true;
  (async () => {
    while (on) {
      const x = FUNNEL[0] + ferryBack.pose.x;
      const c = centred(svg('circle', { cx: x + (Math.random() - 0.5) * 16, cy: FUNNEL[1], r: 12 + Math.random() * 6, fill: '#d6d2c6', opacity: 0.8 }, fx));
      c.animate([{ transform: 'translate(0, 0) scale(0.6)', opacity: 0.8 }, { transform: `translate(${-40 - Math.random() * 40}px, -110px) scale(2.4)`, opacity: 0 }], { duration: 2200, easing: 'ease-out' }).finished.then(
        () => c.remove(),
        () => c.remove(),
      );
      await wait(650);
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
// A tear rolling down the Duck's cheek.
function tear() {
  const x = duck.x - 22 * duck.facing * duck.scale;
  const y = duck.y - 140 * duck.scale;
  const d = svg('path', { d: 'M0 -9C5 -2 6 4 0 7C-6 4 -5 -2 0 -9Z', fill: '#9fc3d6', stroke: '#5b8aa3', 'stroke-width': 1.5 }, fx);
  d.animate([{ transform: `translate(${x}px, ${y}px)`, opacity: 0 }, { transform: `translate(${x}px, ${y + 8}px)`, opacity: 1, offset: 0.2 }, { transform: `translate(${x - 4 * duck.facing}px, ${y + 60}px)`, opacity: 0 }], { duration: 1600, easing: 'ease-in' }).finished.then(
    () => d.remove(),
    () => d.remove(),
  );
}
// A prop that moves by translate (outside) and turns or grows (inside), so neither disturbs the other.
function mover(parent, draw, { x = 0, y = 0 } = {}) {
  const outer = svg('g', {}, parent);
  const inner = centred(svg('g', {}, outer));
  draw(inner);
  const pose = { x, y, r: 0, s: 1 };
  const inside = (q) => `rotate(${q.r}deg) scale(${q.s})`;
  const apply = () => {
    outer.style.transform = `translate(${pose.x}px, ${pose.y}px)`;
    inner.style.transform = inside(pose);
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
    // To a new spot, in an arc if asked (arc = how high it rises).
    async to(p, ms = 700, { arc = 0, easing = 'ease-in-out' } = {}) {
      const from = { ...pose };
      const end = { ...pose, ...p };
      const f = (q) => `translate(${q.x}px, ${q.y}px)`;
      const frames = [{ transform: f(from) }];
      if (arc) frames.push({ transform: f({ x: (from.x + end.x) / 2, y: Math.min(from.y, end.y) - arc }), offset: 0.5 });
      frames.push({ transform: f(end) });
      const a = outer.animate(frames, { duration: ms, easing, fill: 'forwards' });
      const b = inner.animate([{ transform: inside(from) }, { transform: inside(end) }], { duration: ms, easing, fill: 'forwards' });
      await Promise.all([a.finished.catch(() => {}), b.finished.catch(() => {})]);
      Object.assign(pose, end);
      apply();
      a.cancel();
      b.cancel();
    },
  };
}

// ---- Sounds made here: the ferry's horn, typing, the printer, a sneeze -------------------------------
// (Always through sound.sfxBus at the time of playing: going back with ← swaps it for a silent one.)

function horn(seconds = 1.6) {
  const ctx = sound.ctx;
  const t = ctx.currentTime;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.2, t + 0.12);
  g.gain.setValueAtTime(0.2, t + seconds - 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 650;
  for (const freq of [116, 174, 233]) {
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(freq * 0.96, t);
    o.frequency.linearRampToValueAtTime(freq, t + 0.15);
    o.connect(f);
    o.start(t);
    o.stop(t + seconds + 0.05);
  }
  f.connect(g).connect(sound.sfxBus);
}
async function typing(n = 6) {
  for (let i = 0; i < n; i++) {
    sound.tap();
    await wait(90 + Math.random() * 70);
  }
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

// ---- The ferry: hull, cabin and seats behind the actors; seat fronts and the Duck's desk in front of them --------

function seatAt(backParent, foreParent, x) {
  const C = { main: '#4f7fa8', top: '#7aa3c8', stroke: '#2b4c7e' };
  const place = `translate(${x} ${GROUND}) scale(${SEAT_K})`;
  const back = svg('g', { transform: place }, backParent);
  const fore = svg('g', { transform: place }, foreParent);
  const part = (parent, tag, attrs, tone = 'main') => svg(tag, { fill: C[tone], stroke: C.stroke, 'stroke-width': 2.5, 'stroke-linejoin': 'round', ...attrs }, parent);
  part(back, 'rect', { x: -58, y: -104, width: 10, height: 96, rx: 3 });
  part(back, 'rect', { x: 48, y: -104, width: 10, height: 96, rx: 3 });
  part(back, 'rect', { x: -62, y: -252, width: 14, height: 152, rx: 4 });
  part(back, 'rect', { x: 48, y: -252, width: 14, height: 152, rx: 4 });
  part(back, 'rect', { x: -60, y: -250, width: 120, height: 124, rx: 16 }, 'top');
  part(fore, 'path', { d: 'M-70 -112H70L80 -96H-80Z' }, 'top');
  part(fore, 'rect', { x: -80, y: -96, width: 160, height: 12, rx: 3 });
  part(fore, 'rect', { x: -78, y: -84, width: 12, height: 84, rx: 3 });
  part(fore, 'rect', { x: 66, y: -84, width: 12, height: 84, rx: 3 });
}

let flag;
const ferryBack = mover(props, (g) => {
  // Hull, with a rounded stern at the pier's end.
  svg('path', { d: 'M770 712H1760V812H860Q800 806 778 760Z', fill: '#7a3b2e', stroke: '#4d241b', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
  svg('path', { d: 'M782 740H1760', stroke: '#f1ecdf', 'stroke-width': 8 }, g);
  [920, 1040, 1160, 1280, 1400, 1520].forEach((cx) => svg('circle', { cx, cy: 776, r: 11, fill: '#cfe1e6', stroke: '#f1ecdf', 'stroke-width': 4 }, g));
  const name = svg('text', { x: 1640, y: 790, 'text-anchor': 'middle', style: 'font: 400 34px "Ma Shan Zheng","Kaiti SC",serif; fill:#f1ecdf' }, g);
  name.textContent = '北京';
  svg('rect', { x: 766, y: 704, width: 1000, height: 12, rx: 3, fill: '#c99560', stroke: '#6b4422', 'stroke-width': 2.5 }, g);
  // The far rail.
  svg('path', { d: 'M790 640H1010M1580 640H1760', stroke: '#6b4422', 'stroke-width': 4, fill: 'none' }, g);
  [800, 860, 920, 980, 1600, 1680].forEach((x) => svg('path', { d: `M${x} 640V706`, stroke: '#6b4422', 'stroke-width': 3 }, g));
  // Cabin, funnel, mast and flag.
  svg('rect', { x: 1010, y: 476, width: 570, height: 230, fill: '#f6f1e3', stroke: '#8a8f88', 'stroke-width': 3 }, g);
  svg('rect', { x: 1010, y: 476, width: 570, height: 16, fill: '#c8453a' }, g);
  [1040, 1150, 1260, 1370, 1480].forEach((x) => svg('rect', { x, y: 510, width: 70, height: 50, rx: 8, fill: '#cfe1e6', stroke: '#8a8f88', 'stroke-width': 3 }, g));
  svg('rect', { x: 990, y: 458, width: 610, height: 22, rx: 6, fill: '#3e4b45' }, g);
  svg('rect', { x: 1430, y: 356, width: 64, height: 104, fill: '#c8453a', stroke: '#7a2618', 'stroke-width': 3 }, g);
  svg('rect', { x: 1426, y: 346, width: 72, height: 18, rx: 3, fill: '#1c1b18' }, g);
  svg('circle', { cx: 1530, cy: 640, r: 24, fill: 'none', stroke: '#f1ecdf', 'stroke-width': 12 }, g);
  svg('circle', { cx: 1530, cy: 640, r: 24, fill: 'none', stroke: '#c8453a', 'stroke-width': 12, 'stroke-dasharray': '18.85 18.85' }, g);
  svg('path', { d: 'M1560 460V286', stroke: '#6b4422', 'stroke-width': 5 }, g);
  flag = svg('g', {}, g);
  flag.style.transformBox = 'fill-box';
  flag.style.transformOrigin = '0% 50%';
  svg('path', { d: 'M1562 290H1672L1662 320L1672 350H1562Z', fill: '#c8453a', stroke: '#7a2618', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, flag);
  const fl = svg('text', { x: 1610, y: 333, 'text-anchor': 'middle', style: 'font: 400 34px "Ma Shan Zheng","Kaiti SC",serif; fill:#f1ecdf' }, flag);
  fl.textContent = '北京';
});
const ferryFront = mover(front, () => {});
Object.values(SEATS).forEach((x) => seatAt(ferryBack.inner, ferryFront.inner, x));

// The Duck's desk: a computer and a book on top, a drawer in front (the Crab's cup is in it, and later the Cat).
const desk = (() => {
  const g = ferryFront.inner;
  svg('rect', { x: DESK - 88, y: 624, width: 176, height: GROUND - 624, fill: '#b07a45', stroke: '#6b4422', 'stroke-width': 3 }, g);
  svg('rect', { x: DESK - 98, y: 610, width: 196, height: 16, rx: 4, fill: '#c99560', stroke: '#6b4422', 'stroke-width': 3 }, g);
  svg('path', { d: `M${DESK - 76} 700H${DESK + 76}`, stroke: '#6b4422', 'stroke-width': 2, opacity: 0.5 }, g);
  const gap = svg('rect', { x: DESK - 46, y: 634, width: 92, height: 16, fill: '#3a2a18', opacity: 0 }, g);
  const slot = svg('g', {}, g); // whatever is in the open drawer, between its dark inside and its front
  const cup = svg('use', { href: '#cup', x: DESK - 26, y: 612, width: 52, height: 42 }, slot);
  const drawer = svg('g', {}, g);
  svg('rect', { x: DESK - 50, y: 640, width: 100, height: 44, rx: 4, fill: '#c99560', stroke: '#6b4422', 'stroke-width': 3 }, drawer);
  svg('circle', { cx: DESK, cy: 662, r: 6, fill: '#e9c46a', stroke: '#8a6420', 'stroke-width': 2 }, drawer);
  // The computer, on the left of the desk.
  svg('rect', { x: 822, y: 588, width: 14, height: 22, fill: '#3e4b45' }, g);
  svg('rect', { x: 808, y: 605, width: 42, height: 6, rx: 2, fill: '#3e4b45' }, g);
  svg('rect', { x: 794, y: 536, width: 72, height: 54, rx: 6, fill: '#3e4b45', stroke: '#1c1b18', 'stroke-width': 2 }, g);
  const screen = svg('rect', { x: 800, y: 542, width: 60, height: 42, rx: 3, fill: '#5d6f78' }, g);
  const screenText = svg('text', { x: 830, y: 573, 'text-anchor': 'middle', style: 'font: 700 26px "Noto Serif SC", serif; fill: #2f6a5a' }, g);
  svg('rect', { x: 868, y: 603, width: 44, height: 7, rx: 2, fill: '#d6cebb', stroke: '#8a7a64', 'stroke-width': 1.5 }, g);
  // The book (本), on the right.
  svg('rect', { x: 924, y: 592, width: 52, height: 18, rx: 3, fill: '#b3392b', stroke: '#7a2618', 'stroke-width': 2 }, g);
  svg('path', { d: 'M928 597H972M928 602H972', stroke: '#f1ecdf', 'stroke-width': 1.6 }, g);
  return {
    slot,
    reset() {
      drawer.getAnimations().forEach((a) => a.cancel());
      drawer.style.transform = '';
      gap.setAttribute('opacity', '0');
      cup.style.opacity = '0';
      this.screen('off');
    },
    cup(on) {
      cup.style.opacity = on ? '1' : '0';
    },
    async open(on) {
      gap.setAttribute('opacity', on ? '1' : '0');
      const a = drawer.animate([{ transform: `translateY(${on ? 0 : 14}px)` }, { transform: `translateY(${on ? 14 : 0}px)` }], { duration: 260, easing: 'ease-out', fill: 'forwards' });
      await a.finished.catch(() => {});
      drawer.style.transform = on ? 'translateY(14px)' : '';
      a.cancel();
    },
    // Something inside wants to come out.
    async rattle(times = 4) {
      const y = drawer.style.transform || 'translateY(0px)';
      const frames = [{ transform: y }];
      for (let i = 0; i < times; i++) frames.push({ transform: `${y} translateX(${i % 2 ? 4 : -4}px) rotate(${i % 2 ? 1.5 : -1.5}deg)` });
      frames.push({ transform: y });
      await drawer.animate(frames, { duration: 110 * (times + 1) }).finished.catch(() => {});
    },
    screen(state) {
      screen.setAttribute('fill', state === 'off' ? '#5d6f78' : '#dfeee6');
      screenText.textContent = state === 'ok' ? '✓' : '';
    },
  };
})();

// The passenger book, close up: 王方, 谢朋, and an empty line for the tadpole.
const page = (() => {
  const g = svg('g', { transform: `translate(${BOOK[0]} ${BOOK[1]})` }, front);
  const inner = centred(svg('g', {}, g));
  svg('rect', { x: -180, y: -132, width: 360, height: 252, rx: 12, fill: '#fbf8f1', stroke: '#8a7a64', 'stroke-width': 3 }, inner);
  svg('rect', { x: -168, y: -120, width: 336, height: 228, rx: 6, fill: 'none', stroke: '#e3dcc9', 'stroke-width': 2 }, inner);
  const head = svg('text', { x: 0, y: -70, 'text-anchor': 'middle', style: BRUSH.replace('#1c1b18', '#b3392b') }, inner);
  head.textContent = '去北京';
  const rows = [-10, 44, 98];
  const rings = [];
  const ticks = [];
  ['一', '二', '三'].forEach((n, i) => {
    const t = svg('text', { x: -128, y: rows[i], 'text-anchor': 'middle', style: BRUSH.replace('46px', '34px').replace('#1c1b18', '#8a7a64') }, inner);
    t.textContent = n;
    const ring = svg('ellipse', { cx: 6, cy: rows[i] - 15, rx: 64, ry: 30, fill: 'none', stroke: '#e9c46a', 'stroke-width': 5, opacity: 0 }, inner);
    rings.push(ring);
    const tick = svg('text', { x: 118, y: rows[i], 'text-anchor': 'middle', style: BRUSH.replace('#1c1b18', '#2f6a5a'), opacity: 0 }, inner);
    tick.textContent = '✓';
    ticks.push(tick);
  });
  const names = ['王方', '谢朋', ''].map((n, i) => {
    const t = svg('text', { x: 6, y: rows[i], 'text-anchor': 'middle', style: BRUSH }, inner);
    t.textContent = n;
    return t;
  });
  svg('path', { d: 'M-80 108H90', stroke: '#cfc4ad', 'stroke-width': 2.5 }, inner);
  return {
    setName(n) {
      names[2].textContent = n;
    },
    reset() {
      inner.getAnimations().forEach((a) => a.cancel());
      g.style.opacity = '0';
      names[2].style.opacity = '0';
      rings.forEach((r) => r.setAttribute('opacity', '0'));
      ticks.forEach((t) => t.setAttribute('opacity', '0'));
    },
    async show(on) {
      const a = inner.animate([{ transform: `scale(${on ? 0.3 : 1})`, opacity: on ? 0 : 1 }, { transform: `scale(${on ? 1 : 0.3})`, opacity: on ? 1 : 0 }], { duration: 350, easing: 'ease-out' });
      g.style.opacity = '1';
      await a.finished.catch(() => {});
      g.style.opacity = on ? '1' : '0';
    },
    // The tadpole writes its name with its tail.
    async write() {
      sound.brush(1.2);
      await names[2].animate([{ opacity: 0, transform: 'translateX(-14px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 1200, easing: 'ease-out', fill: 'forwards' }).finished.catch(() => {});
      names[2].getAnimations().forEach((a) => a.cancel());
      names[2].style.opacity = '1';
    },
    tick(i) {
      ticks[i].setAttribute('opacity', '1');
      sound.stamp();
    },
    ring(on) {
      rings.slice(0, 2).forEach((r) => r.setAttribute('opacity', on ? '1' : '0'));
    },
  };
})();

// The golden ticket, close up and then held up over the tadpole's head, with room for the Duck's seal.
const ticket = (() => {
  let seal;
  const m = mover(front, (g) => {
    svg('rect', { x: -66, y: -42, width: 132, height: 84, rx: 9, fill: '#e9c46a', stroke: '#b5862a', 'stroke-width': 3 }, g);
    svg('rect', { x: -58, y: -34, width: 116, height: 68, rx: 5, fill: 'none', stroke: '#fbf1cf', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, g);
    const t = svg('text', { x: -8, y: 4, 'text-anchor': 'middle', style: 'font: 400 38px "Ma Shan Zheng","Kaiti SC",serif; fill:#7a2618' }, g);
    t.textContent = '北京';
    const d = svg('text', { x: -8, y: 30, 'text-anchor': 'middle', style: 'font: 700 18px "Atkinson Hyperlegible Next","Atkinson Hyperlegible",sans-serif; fill:#6b4422' }, g);
    d.textContent = '12 · 2';
    seal = svg('g', { transform: 'translate(42 -16) rotate(-10)' }, g);
    svg('rect', { x: -16, y: -16, width: 32, height: 32, rx: 4, fill: '#b3392b' }, seal);
    const s = svg('text', { x: 0, y: 9, 'text-anchor': 'middle', style: 'font: 400 24px "Ma Shan Zheng","Kaiti SC",serif; fill:#f6e3dc' }, seal);
    s.textContent = '能';
  });
  return {
    ...m,
    stamp(on = true) {
      seal.style.opacity = on ? '1' : '0';
      if (on) sound.stamp();
    },
  };
})();
// Over the tadpole's head.
const ticketSpot = () => ({ x: tadpole.x + 10, y: tadpole.top()[1] - 30 });
const tadHop = (h = 20) => {
  const base = `rotate(${ticket.pose.r}deg) scale(${ticket.pose.s})`;
  const bob = ticket.outer.style.opacity === '0' ? null : ticket.inner.animate([{ transform: base }, { transform: `translateY(-${h}px) ${base}` }, { transform: base }], { duration: 420, easing: 'ease-out' }).finished.catch(() => {});
  return Promise.all([hop(tadpole, h), bob]);
};

// The Crab's teapot and cup.
const teapot = mover(front, (g) => {
  svg('path', { d: 'M24 -26Q46 -34 50 -52', fill: 'none', stroke: '#2f6a5a', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
  svg('path', { d: 'M-26 -40Q-48 -36 -44 -18Q-40 -6 -24 -12', fill: 'none', stroke: '#2f6a5a', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
  svg('path', { d: 'M-30 -40Q-32 -2 0 0Q32 -2 30 -40Q0 -50 -30 -40Z', fill: '#4f8f7a', stroke: '#2f6a5a', 'stroke-width': 3 }, g);
  svg('ellipse', { cx: 0, cy: -44, rx: 16, ry: 5, fill: '#6aa893', stroke: '#2f6a5a', 'stroke-width': 2.5 }, g);
  svg('circle', { cx: 0, cy: -52, r: 5, fill: '#e9c46a', stroke: '#2f6a5a', 'stroke-width': 2 }, g);
});
const teaCup = mover(front, (g) => svg('use', { href: '#cup', x: -26, y: -42, width: 52, height: 42 }, g));
function pourTea(x, y) {
  const s = svg('path', { d: `M${x + 30} ${y - 70}Q${x + 10} ${y - 60} ${x + 2} ${y - 34}`, fill: 'none', stroke: '#b5651d', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.85 }, fx);
  at(1300, () => s.remove());
}

// Disguises for two "passengers": a straw hat and dark glasses for the Carp (王方), a bowler hat and a moustache
// for the Crab (谢朋). They sit on the drawings themselves, so they move and turn with them.
const disguise = (() => {
  const pieces = [];
  const add = (who, [x, y, r = 0], draw) => {
    const outer = svg('g', { transform: `translate(${x} ${y}) rotate(${r})` }, who.talkG);
    const inner = centred(svg('g', {}, outer));
    draw(inner);
    pieces.push({ who, inner });
  };
  // The Carp (300 x 204, by its centre): her eye is at (-84, -10).
  add(carp, [-66, -58, -10], (g) => {
    svg('ellipse', { cx: 0, cy: 0, rx: 60, ry: 11, fill: '#ead9a0', stroke: '#b5862a', 'stroke-width': 2.5 }, g);
    svg('path', { d: 'M-32 -2Q-30 -40 0 -42Q30 -40 32 -2Z', fill: '#ead9a0', stroke: '#b5862a', 'stroke-width': 2.5 }, g);
    svg('path', { d: 'M-31 -12Q0 -19 31 -12L32 -3Q0 -10 -32 -3Z', fill: '#c8453a' }, g);
    svg('circle', { cx: 22, cy: -12, r: 8, fill: '#f2c2cd', stroke: '#d9788f', 'stroke-width': 2 }, g);
  });
  add(carp, [-84, -10], (g) => {
    svg('path', { d: 'M14 -3L64 -12M-15 1L-26 4', stroke: '#1c1b18', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    svg('circle', { cx: 0, cy: 0, r: 15, fill: '#1c1b18' }, g);
    svg('path', { d: 'M-8 -6q4 -5 10 -3', fill: 'none', stroke: '#fff', 'stroke-width': 2.5, opacity: 0.6, 'stroke-linecap': 'round' }, g);
  });
  // The Crab (230 x 186, by its feet): eyes on stalks at (±23, -129), mouth at (0, -59).
  add(crab, [0, -144], (g) => {
    svg('ellipse', { cx: 0, cy: 0, rx: 52, ry: 8, fill: '#3e4b45', stroke: '#1c1b18', 'stroke-width': 2 }, g);
    svg('path', { d: 'M-30 -2Q-32 -42 0 -44Q32 -42 30 -2Z', fill: '#3e4b45', stroke: '#1c1b18', 'stroke-width': 2 }, g);
    svg('path', { d: 'M-30 -11H30V-4H-30Z', fill: '#b3392b' }, g);
  });
  add(crab, [0, -76], (g) => {
    svg('path', { d: 'M0 0C-6 -9 -24 -12 -40 2C-28 -3 -14 5 0 4C14 5 28 -3 40 2C24 -12 6 -9 0 0Z', fill: '#1c1b18' }, g);
  });
  return {
    on(v) {
      pieces.forEach(({ inner }) => {
        inner.getAnimations().forEach((a) => a.cancel());
        inner.style.transform = '';
        inner.style.opacity = v ? '1' : '0';
      });
    },
    // The moustache slips, and is pushed back.
    async slip() {
      const { inner } = pieces[3];
      await inner.animate([{ transform: 'translate(0, 0) rotate(0)' }, { transform: 'translate(-6px, 10px) rotate(-18deg)', offset: 0.4 }, { transform: 'translate(-6px, 10px) rotate(-18deg)', offset: 0.7 }, { transform: 'translate(0, 0) rotate(0)' }], { duration: 1300 }).finished.catch(() => {});
    },
    // Blown away by a sneeze coming from the left: everything flies right, up and round.
    async blowAway() {
      const runs = pieces.map(({ who, inner }, i) => {
        const k = who.facing / who.scale; // scene → drawing
        const dx = (260 + i * 70) * k;
        return inner
          .animate([{ transform: 'translate(0, 0) rotate(0deg)', opacity: 1 }, { transform: `translate(${dx * 0.6}px, ${-160 / who.scale}px) rotate(${300 * who.facing}deg)`, opacity: 1, offset: 0.5 }, { transform: `translate(${dx}px, ${-40 / who.scale}px) rotate(${600 * who.facing}deg)`, opacity: 0 }], { duration: 1100 + i * 120, easing: 'ease-out', fill: 'forwards' })
          .finished.catch(() => {});
      });
      await Promise.all(runs);
      this.on(false);
    },
  };
})();

// The Cat's sneeze: 阿嚏！ in big letters, the scene shakes, whoever is in front of it is blown back, the
// disguises fly off and the Duck loses feathers.
const catNose = () => [cat.x - 0.17 * cat.w * cat.scale * cat.facing, cat.y - 0.4 * cat.h * cat.scale];
async function sneeze() {
  sneezeSound(true);
  const [nx, ny] = catNose();
  const dir = cat.facing === 1 ? -1 : 1; // the way the Cat looks
  pop(nx + dir * 120, ny - 60, '阿嚏！', { size: 110, color: '#b3392b', ms: 1400 });
  for (let i = 0; i < 7; i++) {
    const a = (i - 3) * 0.16;
    const len = 340;
    const line = svg('path', { d: `M${nx + dir * 30} ${ny}L${nx + dir * (30 + len * Math.cos(a))} ${ny + len * Math.sin(a)}`, stroke: '#8f897b', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-dasharray': '60 400', fill: 'none' }, fx);
    line.animate([{ strokeDashoffset: 60, opacity: 1 }, { strokeDashoffset: -len, opacity: 0 }], { duration: 600, easing: 'ease-out' }).finished.then(
      () => line.remove(),
      () => line.remove(),
    );
  }
  scene.animate([{ transform: 'translate(0, 0)' }, { transform: 'translate(-8px, 4px)' }, { transform: 'translate(7px, -5px)' }, { transform: 'translate(-4px, 3px)' }, { transform: 'translate(0, 0)' }], { duration: 420 });
  [tadpole, crab, carp, duck, dog, fly]
    .filter((a) => a.el.style.opacity !== '0' && Math.sign(a.x - cat.x) === dir)
    .forEach((a) => {
      const k = dir * a.facing;
      a.gesture([{ transform: 'translateX(0) rotate(0)' }, { transform: `translateX(${-k * 34}px) rotate(${-k * 10}deg)`, offset: 0.25 }, { transform: 'translateX(0) rotate(0)' }], { duration: 1000, easing: 'ease-out' });
    });
  feathers(duck.x, duck.y - 150, 14);
  await disguise.blowAway();
}

// Golden tickets fly out of the desk, one to each friend.
function ticketsTo(who) {
  who.forEach((a, i) =>
    at(i * 200, () => {
      sound.tap();
      const g = svg('g', {}, fx);
      svg('rect', { x: -24, y: -15, width: 48, height: 30, rx: 4, fill: '#e9c46a', stroke: '#b5862a', 'stroke-width': 2 }, g);
      const t = svg('text', { x: 0, y: 7, 'text-anchor': 'middle', style: 'font: 400 18px "Ma Shan Zheng","Kaiti SC",serif; fill:#7a2618' }, g);
      t.textContent = '北京';
      const [x0, y0] = [830, 560];
      const [x1, y1] = above(a, 6);
      g.animate(
        [
          { transform: `translate(${x0}px, ${y0}px) rotate(0deg) scale(0.4)` },
          { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 170}px) rotate(200deg) scale(1)`, offset: 0.5 },
          { transform: `translate(${x1}px, ${y1}px) rotate(360deg) scale(1)` },
        ],
        { duration: 1100, easing: 'ease-out', fill: 'forwards' },
      );
      at(2600, () => g.remove());
    }),
  );
}

// The big jump: at the top, a flash, and the tadpole lands with four legs.
async function frontLegs() {
  actors.append(tadpole.el); // in front of everyone
  const x = tadpole.x;
  await tadpole.moveTo(x, tadpole.y - 170, 480, 'ease-out');
  burst(fx, x, tadpole.y, 18);
  sparkleAt(fx, x - 50, tadpole.y - 30);
  sparkleAt(fx, x + 50, tadpole.y + 20);
  sound.pop();
  sound.sparkle();
  setLegs(4);
  await wait(250);
  await tadpole.moveTo(x, tadY(1.12), 420, 'ease-in', 1.12); // a little bigger, too
  sound.plop();
  ripple(x, GROUND + 30);
}

// ---- Resetting the scene ------------------------------------------------------------------------------

function reset(part) {
  STACK.forEach((a) => actors.append(a.el));
  scene.getAnimations().forEach((a) => a.cancel());
  turtleOnPhone = false;
  setLegs(2);
  ferryBack.set({ x: 0, y: 0, r: 0, s: 1 });
  ferryFront.set({ x: 0, y: 0, r: 0, s: 1 });
  flag.animate([{ transform: 'skewY(0deg) scaleX(1)' }, { transform: 'skewY(5deg) scaleX(0.94)' }], { duration: 900, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
  desk.reset();
  page.reset();
  page.setName(ep.name?.zh || '小黑');
  ticket.set({ x: 800, y: 340, r: 0, s: 1 });
  ticket.show(false);
  ticket.stamp(false);
  teapot.show(false);
  teaCup.show(false);
  disguise.on(part === 2);
  $('#phone').getAnimations().forEach((a) => a.cancel());
  $('#phone').style.opacity = '0';
  tadpole.lids.forEach((l) => (l.style.transform = 'scaleY(0)'));
  put(turtle, [-300, 712], { visible: false, facing: -1, scale: 0.95 });
  put(duck, DUCK_AT, { facing: 1 });
  if (part === 1) {
    put(dog, [250, GROUND], { facing: -1, scale: PUP });
    put(carp, [380, 690], { facing: -1, scale: 0.9 });
    put(crab, [520, GROUND], { facing: -1, scale: 0.9 });
    put(cat, [635, GROUND], { facing: -1, scale: 0.8 });
    put(tadpole, [715, tadY(1)], { facing: -1, scale: 1 });
    put(fly, [700, 430], { facing: -1 });
  } else {
    put(dog, [SEATS.mid, GROUND], { facing: -1, scale: PUP_HIDE });
    actors.prepend(dog.el);
    put(carp, CARP_SEAT, { facing: 1, scale: CARP_SEAT[2] });
    put(crab, CRAB_SEAT, { facing: -1, scale: CRAB_SEAT[2] });
    put(tadpole, [1150, tadY(1)], { facing: -1, scale: 1 });
    put(fly, [700, 400], { facing: -1 });
    put(cat, [DESK, 700], { visible: false, facing: -1, scale: 0.45 });
    desk.slot.append(cat.el);
  }
}

// ---- Part 1: the ferry to Beijing -----------------------------------------------------------------------

async function partOne() {
  sound.startAmbience();
  await ep.loadName();
  ep.prepareNameClips();
  page.setName(ep.name?.zh || '小黑');
  const titleEl = $('#title-card');
  await showTitleCard(titleEl, ep.EP.title);
  await say('a_title', null, { subtitles: false, keep: 500 });
  await hideTitleCard(titleEl);
  let hover = flutter(fly);
  const stopSmoke = smoke();

  // The ferry to Beijing sounds its horn. Today is the day on the golden ticket.
  horn(1.8);
  lookAll(1300);
  await wait(1200);
  ticket.set({ x: 800, y: 330, r: 0, s: 0.2 });
  ticket.show(true);
  await ticket.to({ s: 2.3, r: -4 }, 500, { easing: 'ease-out' });
  sound.chime();
  await say('a_date', null);
  await ticket.to({ ...ticketSpot(), s: 0.8, r: 6 }, 700);
  look(tadpole, 1300);
  await tadHop(30);
  await say('a_tad_bj', tadpole);
  await Promise.all([tadHop(24), hop(crab, 14), hop(cat, 12), hop(dog, 16)]);

  // The tadpole has never seen a computer.
  look(tadpole, DESK);
  await tadHop(28);
  mark(tadpole.x - 40, tadpole.top()[1] - 70, '？');
  await say('a_tad_desk', tadpole);
  hover();
  await fly.moveTo(DESK + 10, 500, 800, 'ease-in-out');
  hover = flutter(fly);
  look(fly, tadpole.x);
  desk.screen('on');
  sparkleAt(fx, 830, 560);
  at(2600, () => sparkleAt(fx, 950, 596));
  await say('a_fly_desk', fly);
  hover();
  await fly.moveTo(600, 470, 700, 'ease-in-out');
  hover = flutter(fly);

  // Check-in: the passenger book. Two names already, and an empty line.
  look(duck, tadpole.x);
  await page.show(true);
  await say('a_duck_write', duck);
  await Promise.all([wiggle(tadpole, 6), page.write()]);
  page.tick(2);
  await wait(700);
  await page.show(false);
  await typing(7);
  desk.screen('ok');
  sound.chime();
  await wait(300);
  ticket.stamp(true);
  await say('a_duck_can', duck);
  await tadHop(34);
  burst(fx, tadpole.x, tadpole.top()[1] - 20, 10);
  sound.sparkle();
  await ticket.to({ x: tadpole.x, y: tadpole.y, s: 0, r: 30 }, 450, { easing: 'ease-in' }); // into its pocket
  ticket.show(false);

  // A farewell tea. But where is the Crab's cup?
  teapot.set({ x: crab.x - 70, y: crab.y - 110, r: 0, s: 1 });
  teapot.show(true);
  look(crab, 200);
  await shake(crab);
  look(crab, DESK);
  await say('a_crab_cup', crab);
  look(duck, crab.x);
  await desk.open(true);
  desk.cup(true);
  await say('a_duck_in', duck);
  desk.cup(false);
  teaCup.set({ x: DESK, y: 640, r: 0, s: 1 });
  teaCup.show(true);
  await teaCup.to({ x: crab.x - 120, y: crab.y - 70 }, 800, { arc: 90 });
  sound.plop();
  await teapot.to({ x: crab.x - 100, y: crab.y - 150, r: -35 }, 400);
  pourTea(crab.x - 120, crab.y - 70);
  await wait(1000);
  await teapot.to({ x: crab.x - 70, y: crab.y - 110, r: 0 }, 300);
  const offering = teaCup.to({ x: tadpole.x - 70, y: tadpole.y + 10 }, 900, { arc: 50 });
  look(crab, tadpole.x);
  look(tadpole, crab.x);
  await Promise.all([offering, say('a_crab_tea', crab)]);
  await lean(tadpole, 12);
  hearts(tadpole.x - 30, tadpole.top()[1], 3);
  await wait(500);
  teaCup.show(false);
  teapot.show(false);

  // Can we come too?
  lookAll(DUCK_AT[0], [crab, carp, cat, dog]);
  await hop(crab, 16);
  await say('a_crab_can', crab);
  await swimTo(carp, 410, 680, 400, -1);
  await say('a_carp_me', carp);
  await lean(cat, 8);
  await say('a_cat_home', cat);
  await wiggle(dog, 4);
  await say('g_dog_q', dog);
  // The Duck, one by one, louder and louder: a 不 seal over each of them.
  look(duck, 500);
  const targets = [crab, carp, cat, dog];
  const nos = onEach('不', (i) => {
    const a = targets[i];
    if (!a) return;
    const [x, y] = above(a, 10);
    const s = stampSeal(fx, 'seal-bu', x, y, 48 + i * 10);
    sound.stamp();
    at(2600, () => s.remove());
  });
  await Promise.all([puff(duck, 1.16), say('a_duck_no', duck, { onPlay: nos.onPlay })]);
  nos.fire(4);
  feathers(duck.x, duck.y - 150, 6);
  sound.sigh();
  await Promise.all([droop(crab), droop(carp), droop(cat), droop(dog)]);
  look(tadpole, crab.x);
  await droop(tadpole);
  await say('a_tad_friends', tadpole);

  // And the Turtle? Late, as always. The Carp calls him.
  look(carp, CALL[0]);
  sound.ring();
  turtleOnPhone = true;
  await showCall(true, carp);
  await say('a_carp_call', carp);
  const stopZ = snoringOnPhone();
  await say('a_turtle_home', phoneTurtle);
  await wait(400);
  stopZ();
  await showCall(false);
  turtleOnPhone = false;
  await shake(carp);

  // The Duck goes to tell the captain: one passenger. The tadpole boards, alone, and looks out to sea.
  look(duck, 1700);
  const duckGoes = walkTo(duck, [1760, 705], 2600, { facing: -1 });
  toFront(tadpole);
  await tadWalk(1000, 1200, -1);
  toBack(tadpole);
  await tadWalk(1150, 600, -1);
  await duckGoes;
  sound.sigh();
  await droop(tadpole);

  // Behind its back, a plan. The Dragonfly reads the passenger book…
  lookAll(450, [crab, cat, dog]);
  look(carp, crab.x);
  mark(470, 520, '…');
  hover();
  await fly.moveTo(960, 520, 900, 'ease-in-out');
  hover = flutter(fly);
  await page.show(true);
  page.ring(true);
  sparkleAt(fx, BOOK[0] - 60, BOOK[1] - 40);
  sparkleAt(fx, BOOK[0] + 60, BOOK[1] + 20);
  sound.chime();
  await wait(2200);
  await page.show(false);
  page.ring(false);
  hover();
  await fly.moveTo(560, 470, 900, 'ease-in-out');
  hover = flutter(fly);
  look(fly, carp.x);
  await hop(fly, 14);
  // …and two strangers appear in a puff of smoke.
  markOver(crab, '！');
  sound.whoosh();
  puffs(carp.x - 30, carp.y - 40, 8, 120);
  puffs(crab.x, crab.y - 100, 8, 110);
  await wait(250);
  disguise.on(true);
  await wait(700);
  // Meanwhile the puppy sneaks behind the desk and under a seat, and the Cat into the open drawer.
  actors.prepend(dog.el);
  const pup = (async () => {
    await walkTo(dog, [900, GROUND, PUP], 1600, { facing: -1 });
    await walkTo(dog, [SEATS.mid, GROUND, PUP_HIDE], 1200, { facing: -1 });
    look(dog, 600);
  })();
  toFront(cat);
  await walkTo(cat, [DESK - 70, GROUND, 0.7], 1300, { facing: -1 });
  await cat.moveTo(DESK, 600, 300, 'ease-out', 0.45);
  desk.slot.append(cat.el);
  await cat.moveTo(DESK, 700, 350, 'ease-in', 0.45);
  cat.show(false);
  sound.plop();
  await desk.open(false);
  await pup;

  // The Duck comes back. Two new passengers in the queue: in front, a lady in a hat; behind, a gentleman.
  const back = walkTo(duck, DUCK_AT, 2200, { facing: 1 });
  await Promise.all([back, swimTo(carp, 690, 680, 1600, -1, 0.85), walkTo(crab, [540, GROUND, 0.85], 1700, { facing: -1 })]);
  look(duck, carp.x);
  look(tadpole, carp.x);
  markOver(duck, '？');
  await wait(500);
  await say('a_tad_front', tadpole);
  look(fly, tadpole.x);
  await page.show(true);
  await say('a_fly_wang', fly);
  page.tick(0);
  await hop(carp, 10);
  await say('a_tad_back', tadpole);
  await say('a_fly_xie', fly);
  page.tick(1);
  await disguise.slip();
  await wait(500);
  await page.show(false);

  // The Duck lets them on: the lady to the front seat, the gentleman to the back one.
  look(duck, 1200);
  toFront(carp);
  await swimTo(carp, 1000, 640, 1100, -1);
  toBack(carp);
  await swimTo(carp, CARP_SEAT[0], CARP_SEAT[1], 900, -1, CARP_SEAT[2]);
  carp.face(1);
  sound.plop();
  toFront(crab);
  await walkTo(crab, [1000, GROUND], 1200, { facing: -1 });
  toBack(crab);
  await crab.moveTo(CRAB_SEAT[0], CRAB_SEAT[1], 500, 'ease-out', CRAB_SEAT[2]);
  sound.plop();
  look(tadpole, carp.x);
  await wait(600);
  look(tadpole, crab.x);
  await disguise.slip();
  await say('a_ask', null, { keep: 300 });
  ep.showQuestion(); // stays up for the class to discuss: A, B or C?
  hover();
  stopSmoke();
  sound.stopAmbience(2);
  return [];
}

// ---- Part 2: the stowaways -------------------------------------------------------------------------------

async function partTwo() {
  sound.startAmbience();
  await ep.loadName();
  ep.prepareNameClips();
  page.setName(ep.name?.zh || '小黑');
  let hover = flutter(fly);
  let stopSmoke = smoke();
  horn(1.4);
  await wait(1000);

  // A seat for the tadpole, between the two strangers.
  look(tadpole, SEATS.front);
  await say('b_tad_here', tadpole);
  await say('b_carp_none', carp);
  await say('b_tad_can', tadpole);
  await say('b_carp_sit', carp);
  await tadpole.moveTo(SEATS.mid, tadSit(0.9) - 60, 300, 'ease-out', 0.9);
  await tadpole.moveTo(SEATS.mid, tadSit(0.9), 260, 'ease-in', 0.9);
  sound.plop();
  await wait(400);
  look(tadpole, crab.x);
  await disguise.slip();
  look(tadpole, carp.x);
  await wait(500);

  // The Duck checks her passengers. Something wags under a seat.
  look(duck, 1300);
  await walkTo(duck, [1010, 705], 900, { facing: -1 });
  await wiggle(dog, 6);
  mark(SEATS.mid - 60, 600, '？');
  await say('b_duck_under', duck);
  await lean(tadpole, 16);
  await say('b_tad_dog', tadpole);
  actors.append(dog.el);
  await dog.moveTo(SEATS.mid - 50, GROUND - 100, 260, 'ease-out', PUP);
  await dog.moveTo(SEATS.mid - 90, GROUND, 260, 'ease-in', PUP);
  look(dog, duck.x);
  await Promise.all([wiggle(dog, 5), shake(duck), say('g_dog_wang', dog)]);
  feathers(duck.x, duck.y - 150, 5);

  // It runs round the Duck… and sniffs at the drawer. Something in there is ticklish.
  look(duck, DESK);
  const duckBack = walkTo(duck, DUCK_AT, 800, { facing: 1 });
  await walkTo(dog, [1000, GROUND], 500, { facing: 1 });
  toFront(dog);
  await walkTo(dog, [DESK + 105, GROUND], 500, { facing: 1 });
  await duckBack;
  await wiggle(dog, 4);
  await desk.rattle(6);
  look(duck, DESK - 40);
  mark(DESK, 600, '？');
  await say('b_duck_desk', duck);
  const rattling = desk.rattle(10);
  await say('b_cat_none', cat);
  await rattling;
  await wait(500);
  // She opens the drawer: the Cat.
  await desk.open(true);
  sound.pop();
  put(cat, [DESK, 700], { facing: -1, scale: 0.45 });
  await cat.moveTo(DESK - 6, 652, 300, 'ease-out', 0.56);
  await say('b_cat_hi', cat);
  // Nose to nose with the puppy…
  look(dog, cat.x);
  await wiggle(dog, 4);
  await twitch(cat);
  await twitch(cat);
  look(cat, 1300);
  const boom = atLastWord(() => sneeze(), 2400);
  await say('b_cat_achoo', cat, { onPlay: boom.onPlay });
  boom.fire();
  await wait(1400);

  // No hat, no glasses, no moustache.
  look(duck, crab.x);
  look(tadpole, carp.x);
  markOver(carp, '！');
  await wait(300);
  look(tadpole, crab.x);
  markOver(crab, '！');
  await wait(700);
  await droop(crab);
  await say('b_crab_sorry', crab);
  await puff(duck, 1.2);
  await say('b_duck_out', duck);

  // Off the ferry, heads down.
  const off = [
    (async () => {
      await crab.moveTo(1000, GROUND, 500, 'ease-in', 0.9);
      toFront(crab);
      await walkTo(crab, [575, GROUND, 0.9], 1800, { facing: 1 });
      toBack(crab);
    })(),
    (async () => {
      await wait(300);
      await swimTo(carp, 1010, 650, 1100, 1, 0.9);
      toFront(carp);
      await swimTo(carp, 380, 690, 1700, 1);
      toBack(carp);
    })(),
    (async () => {
      await wait(600);
      await walkTo(dog, [285, GROUND], 2400, { facing: 1 });
      toBack(dog);
    })(),
    (async () => {
      await wait(400);
      toFront(cat);
      await cat.moveTo(760, GROUND, 500, 'ease-out', 0.8);
      await desk.open(false);
      await walkTo(cat, [480, GROUND, 0.8], 1200, { facing: 1 });
      toBack(cat);
    })(),
    (async () => {
      hover();
      await fly.moveTo(700, 430, 1200, 'ease-in-out');
      hover = flutter(fly);
    })(),
  ];
  await Promise.all(off);
  sound.sigh();
  await Promise.all([droop(crab), droop(carp), droop(cat), droop(dog)]);
  [crab, carp, cat, dog].forEach((a) => a.face(1));

  // The tadpole, alone on the ferry.
  look(tadpole, 400);
  await wait(1200);
  await tadpole.moveTo(SEATS.mid - 70, tadY(1), 380, 'ease-in-out', 1);
  toFront(tadpole);
  await tadWalk(800, 1300, 1);
  await say('b_tad_nogo', tadpole);
  await tadWalk(720, 500, 1);
  toBack(tadpole);
  lookAll(tadpole.x, [crab, carp, cat, dog]);
  await Promise.all([hop(crab, 14), hop(cat, 12), wiggle(dog, 5)]);
  hearts(tadpole.x - 60, tadpole.top()[1], 5);

  // The Duck sniffs. A tear. She types, the computer prints… tickets for everyone!
  look(duck, tadpole.x);
  sound.sigh();
  tear();
  await wait(1400);
  await typing(9);
  desk.screen('ok');
  sound.chime();
  ticketsTo([crab, carp, cat, dog, fly, tadpole]);
  await wait(1500);
  await say('b_duck_ok', duck);
  await Promise.all([
    hop(tadpole, 24),
    hop(crab, 18),
    hop(carp, 16),
    hop(cat, 14),
    hop(dog, 16),
    hop(duck, 12),
    ep.sayAll('b_all_can', [tadpole, duck, crab, carp, fly, cat], { keep: 500 }),
  ]);
  burst(fx, 520, 520, 16);
  sound.sparkle();

  // The tadpole jumps so high that… its front legs pop!
  await wait(300);
  await frontLegs();
  lookAll(tadpole.x, [crab, carp, cat, dog]);
  look(duck, tadpole.x);
  markOver(crab, '！');
  markOver(cat, '！');
  await wait(600);
  await ep.say('b_crab_look', crab); // the Crab stays behind the tadpole
  look(tadpole, 300);
  await lean(tadpole, 14);
  await wiggle(tadpole, 6);
  sparkleAt(fx, tadpole.x - 30, tadpole.y + 40);
  sparkleAt(fx, tadpole.x + 20, tadpole.y + 50);
  sound.sparkle();

  // But where is the Turtle?
  look(carp, 100);
  await say('b_carp_turtle', carp);
  hover();
  await fly.moveTo(560, 330, 700, 'ease-in-out');
  hover = flutter(fly);
  look(fly, 0);
  await say('b_fly_there', fly);
  lookAll(0, [tadpole, crab, carp, cat, dog]);
  look(duck, 0);
  // He comes slowly… very slowly. The ferry sounds its horn: nobody turns round.
  put(turtle, [-260, 712], { facing: -1, scale: 0.95 });
  actors.prepend(turtle.el);
  at(1600, () => horn(1.2));
  await walkTo(turtle, [235, 712, 0.95], 4400, { facing: -1 });
  sound.sigh();
  await say('b_turtle_here', turtle);
  // The Dragonfly is tired too…
  hover();
  look(fly, 400);
  await fly.moveTo(turtle.x + 70, turtle.y - 120, 900, 'ease-in-out', 0.7);
  sound.plop();
  await say('b_fly_sit', fly);
  await Promise.all([shake(turtle), say('b_turtle_no', turtle)]);
  await fly.moveTo(420, 380, 450, 'ease-out', 1);
  hover = flutter(fly);

  // The horn, loud. The ferry is leaving!
  stopSmoke();
  horn(2.6);
  puffs(FUNNEL[0], FUNNEL[1] - 20, 10, 60);
  lookAll(1300, [tadpole, crab, carp, cat, dog, duck]);
  look(fly, 1300);
  look(turtle, 1300);
  markOver(tadpole, '！');
  markOver(duck, '！');
  ripple(820, 820);
  const sailing = Promise.all([ferryBack.to({ x: AWAY }, 7500, { easing: 'ease-in' }), ferryFront.to({ x: AWAY }, 7500, { easing: 'ease-in' })]);
  at(1500, () => ripple(900, 830));
  at(3000, () => ripple(1100, 830));
  // The Duck is still on board! She leaps onto the pier.
  await duck.moveTo(DUCK_AT[0] + 30, 705, 1000, 'ease-in');
  look(duck, 400);
  await duck.moveTo(880, 540, 330, 'ease-out');
  await duck.moveTo(770, 705, 330, 'ease-in');
  sound.plop();
  feathers(duck.x, duck.y - 120, 6);
  await Promise.all([tadHop(30), hop(crab, 20)]);
  look(duck, 1300);
  await say('b_turtle_bye', turtle);
  await lean(turtle, -8);
  feathers(duck.x, duck.y - 150, 10);
  await Promise.all([puff(duck, 1.2), say('b_duck_pc', duck)]);
  await sailing;
  await wait(700);

  const nextEl = $('#title-card');
  await showTitleCard(nextEl, ep.EP.next);
  await say('b_next', null, { subtitles: false, keep: 1500 });
  hover();
  sound.stopAmbience(2.5);
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

// Behind the start screen: the pier as Part 1 begins (the book, the ticket and the disguises hidden).
reset(1);
