// Episode 5 · 我会说汉语！ (So parlare cinese!). Unit 6.
//
// Part 1, "Il biglietto": the Duck sells one golden ferry ticket to Beijing, to whoever can speak Chinese, cook
//   Chinese food and write characters (the three plaques on her board: 说 · 做 · 写). The friends in the queue act
//   out the book's three dialogues first: the Crab and Auntie Carp ("your mother?" "she can't": a very old carp
//   surfaces behind her), the Crab's dish that wakes the Turtle, and the Café Cat on the phone, who can read the
//   tadpole's name but not write it. Then the Duck asks the tadpole the same three questions: 会 ✓ 不会 ✗ 不会 ✗.
// Part 2, "La seconda possibilità": the friends cheer it up and coach it. The Crab (and the Cat on video) teach
//   cooking, with a burnt dish and then a golden one. The Frog Teacher counts the 12 strokes of 黑 while the tadpole,
//   swimming through the ink like a brush, writes its name. The Duck repeats the test: three green seals, and the
//   golden ticket is the tadpole's. The ticket carries a date: next week's lesson.
import { createEpisode } from './episode-kit.js';
import { Actor, burst, clock, flutter, hideTitleCard, makeHatchling, showTitleCard, sparkleAt, svg, wait, waddle } from './stage.js';

const $ = (sel) => document.querySelector(sel);
const actors = $('#actors');
const props = $('#props');
const front = $('#front');
const HAN = /\p{Script=Han}/u;
const [XIAO, HEI] = await Promise.all(['xiao', 'hei'].map((c) => fetch(`data/hanzi/${c}.json`).then((r) => r.json())));

// Everyone who speaks stays within x 210-1390 (visible on a 4:3 projector). The page shows the scene from
// y 110 down, so the pond sits above the subtitle panel at the bottom of the screen.
const CALL = [420, 340]; // the video call window
const BOARD = { x: 1215, y: 150, plaques: [-122, 0, 122] }; // the Duck's board: top centre, then three plaques

const duck = new Actor(actors, 'ch-duck', { x: 1272, y: 705, w: 200, h: 218 });
const turtle = new Actor(actors, 'ch-turtle', { x: 790, y: 712, w: 260, h: 200 });
const crab = new Actor(actors, 'ch-crab', { x: 335, y: 716, w: 230, h: 186 });
const carp = new Actor(actors, 'ch-carp', { x: 570, y: 700, w: 300, h: 204, anchor: 'center' });
const tadpole = makeHatchling(actors, { x: 1010, y: 651, w: 240 });
const fly = new Actor(actors, 'ch-dragonfly', { x: 1800, y: 120, w: 190, h: 139 });
const frog = new Actor(actors, 'ch-frog', { x: 1750, y: 712, w: 200, h: 190 });
const cat = new Actor($('#phone-cat'), 'ch-cat', { x: 0, y: 66, w: 190, h: 150 });
$('#phone').setAttribute('transform', `translate(${CALL[0]} ${CALL[1]})`);
const ALL = [tadpole, duck, crab, carp, turtle, fly, cat];
const STACK = [duck, turtle, crab, carp, tadpole, fly, frog];

// Since last week the tadpole has back legs, and it stays that way.
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
function placeAt(a, where, facing = 1) {
  const [x, y, scale] = spot(a, where);
  put(a, [x, y], { facing, scale });
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
const hop = (a, height = 18) =>
  a.gesture([{ transform: 'translateY(0)' }, { transform: `translateY(-${height}px)` }, { transform: 'translateY(0)' }], { duration: 420, easing: 'ease-out' });
const lean = (a, deg = -8) => a.gesture([{ transform: 'rotate(0)' }, { transform: `rotate(${deg}deg) translateY(4px)`, offset: 0.5 }, { transform: 'rotate(0)' }], { duration: 700, easing: 'ease-in-out' });
const puff = (a, k = 1.14) =>
  a.gesture([{ transform: 'scale(1)' }, { transform: `scale(${k}) rotate(-3deg)`, offset: 0.3 }, { transform: `scale(${k}) rotate(3deg)`, offset: 0.6 }, { transform: 'scale(1)' }], { duration: 700 });
const shake = (a) => a.gesture([{ transform: 'rotate(0)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(7deg)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(0)' }], { duration: 800 });
const droop = (a) => a.gesture([{ transform: 'translateY(0) scale(1, 1)' }, { transform: 'translateY(12px) scale(1.04, 0.9)', offset: 0.5 }, { transform: 'translateY(0) scale(1, 1)' }], { duration: 1000, easing: 'ease-in-out' });
const at = (ms, fn) => wait(Math.max(0, ms)).then(fn);

const ep = await createEpisode({
  id: 'ep05',
  unitPage: '#',
  parts: { 1: partOne, 2: partTwo },
  reset,
  // The Cat talks from the video call: its tag goes beside the call window.
  tagSpot: (who) => (who === 'cat' ? [CALL[0] + 190, CALL[1] - 100] : null),
  viewTop: 110,
  extraRoles: { frog: { role: 'frog', it: 'La Maestra Rana', zh: '李月老师' } },
});
ep.stage = { duck, turtle, crab, carp, tadpole, dragonfly: fly, cat, frog };
const { sound, fx } = ep;

// Everyone stands close together, so whoever speaks steps to the front: nobody talks from behind a neighbour.
const say = (id, who, opts) => {
  if (who && who !== cat) actors.append(who.el);
  return ep.say(id, who, opts);
};

// Things that happen at certain words of a line: by the word timings when the voice plays, by a slow beat otherwise.
function syncWords(steps) {
  return {
    onPlay: ({ startedAt, timings, ctx }) => {
      const words = (timings?.words || []).filter((w) => HAN.test(w.text));
      steps.forEach(([k, fn], i) => at(words[k] ? (startedAt + words[k].start - ctx.currentTime) * 1000 : i * 900, fn));
    },
    live: () => steps.forEach(([, fn], i) => at(1300 + i * 1700, fn)),
  };
}

// ---- Seals and little marks --------------------------------------------------------------------

function sealAt(x, y, good, size = 62) {
  sound.stamp();
  const g = svg('g', { transform: `translate(${x - size / 2} ${y - size / 2})` }, fx);
  const u = svg('use', { href: good ? '#seal-hui' : '#seal-buhui', width: size, height: size }, g);
  u.style.transformBox = 'fill-box';
  u.style.transformOrigin = '50% 50%';
  u.animate([{ transform: 'scale(1.8) rotate(-20deg)', opacity: 0 }, { transform: 'scale(1) rotate(-8deg)', opacity: 1 }], { duration: 220, easing: 'ease-out', fill: 'forwards' });
  g.animate([{ opacity: 1 }, { opacity: 1, offset: 0.78 }, { opacity: 0 }], { duration: 4600, fill: 'forwards' }).finished.then(
    () => g.remove(),
    () => g.remove(),
  );
  return g;
}
// Where something floats above this actor (the Cat floats above its call window).
function above(actor, lift = 50) {
  if (actor === cat) return [CALL[0] + 150, CALL[1] - 70];
  const [x, y] = actor.top();
  return [Math.max(260, Math.min(1340, x)), Math.max(190, y - lift)];
}
// "I can" (green 会) or "I can't" (red 不会) over someone's head.
function ability(actor, good, lift = 56) {
  const [x, y] = above(actor, lift);
  return sealAt(x, y, good);
}
// A "？" or "！" floating up over someone's head.
function mark(x, y, text = '？') {
  const holder = svg('g', { transform: `translate(${x} ${y})` }, fx);
  const q = svg('text', { class: 'bubble-q', 'text-anchor': 'middle' }, holder);
  q.textContent = text;
  q.animate(
    [
      { transform: 'translateY(10px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1, offset: 0.2 },
      { transform: 'translateY(-6px)', opacity: 1, offset: 0.8 },
      { transform: 'translateY(-14px)', opacity: 0 },
    ],
    { duration: 1800, easing: 'ease-out' },
  ).finished.then(() => holder.remove(), () => holder.remove());
}
// Puffs of steam (white) or smoke (dark) rising from a point.
function puffs(x, y, { n = 6, dark = false, spread = 50 } = {}) {
  for (let i = 0; i < n; i++) {
    const c = svg('circle', { cx: x + (Math.random() - 0.5) * spread, cy: y, r: 10 + Math.random() * 10, fill: dark ? '#3f3c37' : '#f8f5ec', opacity: dark ? 0.8 : 0.9 }, fx);
    c.style.transformBox = 'fill-box';
    c.style.transformOrigin = '50% 50%';
    c.animate(
      [
        { transform: 'translate(0, 0) scale(0.6)', opacity: 0.9 },
        { transform: `translate(${(Math.random() - 0.5) * 70}px, -${90 + Math.random() * 70}px) scale(2.3)`, opacity: 0 },
      ],
      { duration: 1400 + Math.random() * 700, delay: i * 110, easing: 'ease-out' },
    ).finished.then(() => c.remove(), () => c.remove());
  }
}
// The video call: a window onto the Café Cat in Beijing, linked to Auntie Carp's phone.
function showCall(on) {
  const [cx, cy] = CALL;
  const px = carp.x + (carp.facing === -1 ? 0.16 : -0.16) * carp.w * carp.scale;
  const py = carp.y - 0.14 * carp.h * carp.scale;
  $('#phone-signal').setAttribute('d', `M0 124C60 210 ${px - cx - 70} ${(py - cy) * 0.62} ${px - cx} ${py - cy - 20}`);
  return $('#phone').animate([{ opacity: on ? 0 : 1 }, { opacity: on ? 1 : 0 }], { duration: 450, fill: 'forwards' }).finished;
}
// Water rings where the Frog lands.
function ripple(x, y) {
  for (let i = 0; i < 2; i++) {
    const r = svg('ellipse', { cx: x, cy: y, rx: 20, ry: 6, fill: 'none', stroke: '#8fa89b', 'stroke-width': 4 }, fx);
    r.style.transformBox = 'fill-box';
    r.style.transformOrigin = '50% 50%';
    r.animate([{ transform: 'scale(0.4)', opacity: 0.8 }, { transform: 'scale(5)', opacity: 0 }], { duration: 1300, delay: i * 260, easing: 'ease-out' }).finished.then(
      () => r.remove(),
      () => r.remove(),
    );
  }
}
// Zzz over a sleeper, until the returned function is called.
function snoring(actor) {
  let on = true;
  (async () => {
    while (on) {
      sound.snore();
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

// ---- The ticket window: counter, board with three plaques, the golden ticket -----------------

const board = (() => {
  const holder = svg('g', {}, props);
  holder.style.transformBox = 'view-box';
  holder.style.transformOrigin = '0 0';
  holder.style.transform = `translate(${BOARD.x}px, ${BOARD.y}px)`;
  svg('path', { d: 'M-150 4L-118 -44M150 4L118 -44', stroke: '#8a7a64', 'stroke-width': 4, 'stroke-linecap': 'round' }, holder);
  svg('rect', { x: -184, y: 0, width: 368, height: 208, rx: 14, fill: '#d9b784', stroke: '#5e4630', 'stroke-width': 5 }, holder);
  const speech = (g) => {
    svg('path', { d: 'M-36 -26H36Q44 -26 44 -18V14Q44 22 36 22H8L-10 40V22H-36Q-44 22 -44 14V-18Q-44 -26 -36 -26Z', fill: '#fff', stroke: '#1c1b18', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
    [-18, 0, 18].forEach((x) => svg('circle', { cx: x, cy: -2, r: 5, fill: '#1c1b18' }, g));
  };
  const pot = (g) => {
    svg('path', { d: 'M-34 -4H34Q34 30 12 30H-12Q-34 30 -34 -4Z', fill: '#55594f', stroke: '#1c1b18', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
    svg('path', { d: 'M-40 -6H40M-34 6H-46M34 6H46', stroke: '#1c1b18', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    svg('path', { d: 'M-16 -14q-8 -10 0 -20M0 -14q-8 -10 0 -20M16 -14q-8 -10 0 -20', fill: 'none', stroke: '#9aa39c', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g);
  };
  const brush = (g) => {
    svg('path', { d: 'M30 -34L-8 12', stroke: '#8c6b45', 'stroke-width': 9, 'stroke-linecap': 'round' }, g);
    svg('path', { d: 'M-8 12L-16 22Q-30 40 -36 36Q-30 24 -22 12Z', fill: '#1c1b18' }, g);
    svg('circle', { cx: -32, cy: 42, r: 4, fill: '#1c1b18' }, g);
  };
  const frames = [];
  const slots = [];
  [['说', speech], ['做', pot], ['写', brush]].forEach(([label, icon], i) => {
    const g = svg('g', { transform: `translate(${BOARD.plaques[i]} 0)` }, holder);
    frames.push(svg('rect', { x: -52, y: 14, width: 104, height: 182, rx: 10, fill: '#fbf3dc', stroke: '#8c6b45', 'stroke-width': 3 }, g));
    icon(svg('g', { transform: 'translate(0 66)' }, g));
    svg('text', { x: 0, y: 126, 'text-anchor': 'middle', style: 'font: 400 46px "Ma Shan Zheng","Kaiti SC",serif; fill:#3a2a18' }, g).textContent = label;
    svg('circle', { cx: 0, cy: 164, r: 27, fill: 'none', stroke: '#8c6b45', 'stroke-width': 2.5, 'stroke-dasharray': '5 5' }, g);
    slots.push(g);
  });
  const seals = [null, null, null];
  const slotAt = (i) => [BOARD.x + BOARD.plaques[i], BOARD.y + 164];
  function show(i, good, animate) {
    seals[i]?.remove();
    const u = svg('use', { href: good ? '#seal-hui' : '#seal-buhui', x: -27, y: 137, width: 54, height: 54 }, slots[i]);
    u.style.transformBox = 'fill-box';
    u.style.transformOrigin = '50% 50%';
    if (animate) u.animate([{ transform: 'scale(1.9) rotate(-20deg)', opacity: 0 }, { transform: 'scale(1) rotate(-6deg)', opacity: 1 }], { duration: 240, easing: 'ease-out', fill: 'forwards' });
    else u.style.transform = 'rotate(-6deg)';
    seals[i] = u;
  }
  return {
    // The plaque lights up while the Duck talks about it.
    pulse(i) {
      sound.pluck([440, 523.25, 659.25][i], undefined, 0.5);
      frames[i].animate([{ stroke: '#8c6b45', strokeWidth: 3 }, { stroke: '#e0a526', strokeWidth: 9 }, { stroke: '#8c6b45', strokeWidth: 3 }], { duration: 1500 });
    },
    stamp(i, good) {
      sound.stamp();
      show(i, good, true);
      if (good) sparkleAt(fx, ...slotAt(i));
    },
    // The seals as they stood at the end of Part 1 (no stamping noise).
    setAll(states) {
      states.forEach((s, i) => (s === null ? (seals[i]?.remove(), (seals[i] = null)) : show(i, s, false)));
    },
    // All three green: the plaques shine.
    shine() {
      frames.forEach((f, i) => f.animate([{ stroke: '#8c6b45', strokeWidth: 3 }, { stroke: '#e0a526', strokeWidth: 9 }, { stroke: '#e0a526', strokeWidth: 9, offset: 0.7 }, { stroke: '#8c6b45', strokeWidth: 3 }], { duration: 2400, delay: i * 200 }));
    },
  };
})();

// The counter is in front of the actors, so the Duck stands behind it.
const counter = svg('g', {}, front);
svg('rect', { x: 1150, y: 632, width: 262, height: 22, rx: 5, fill: '#d9b784', stroke: '#5e4630', 'stroke-width': 4 }, counter);
svg('rect', { x: 1162, y: 654, width: 242, height: 66, fill: '#b98a56', stroke: '#5e4630', 'stroke-width': 4 }, counter);
svg('path', { d: 'M1162 676H1404M1162 698H1404', stroke: '#8a6238', 'stroke-width': 2 }, counter);

// A transformable group in the front layer.
function frontGroup(x, y) {
  const g = svg('g', {}, front);
  g.style.transformBox = 'fill-box'; // turn and grow around its own middle
  g.style.transformOrigin = '50% 50%';
  g.style.transform = `translate(${x}px, ${y}px)`;
  return g;
}

// The Crab's dish: under a cover, on the counter.
const dish = (() => {
  const X = 1212;
  const Y = 626;
  const holder = frontGroup(X, Y);
  holder.style.opacity = '0';
  svg('ellipse', { cx: 0, cy: 0, rx: 58, ry: 13, fill: '#fbf8f1', stroke: '#b9ad96', 'stroke-width': 3 }, holder);
  const bits = [[-24, -8, 14, '#e07a3f'], [-4, -14, 15, '#4f8a58'], [18, -8, 14, '#e9c46a'], [-14, -22, 12, '#b3392b'], [10, -24, 12, '#4f8a58'], [28, -14, 10, '#e07a3f'], [-36, -12, 10, '#e9c46a']];
  bits.forEach(([x, y, r, c]) => svg('ellipse', { cx: x, cy: y, rx: r, ry: r * 0.8, fill: c, stroke: '#1c1b18', 'stroke-opacity': 0.3, 'stroke-width': 1.5 }, holder));
  const lid = svg('g', {}, holder);
  svg('path', { d: 'M-54 -2Q-54 -52 0 -52Q54 -52 54 -2Z', fill: '#cfd4d1', stroke: '#8c9490', 'stroke-width': 3 }, lid);
  svg('circle', { cx: 0, cy: -57, r: 6, fill: '#8c9490' }, lid);
  lid.style.transformBox = 'fill-box';
  lid.style.transformOrigin = '100% 100%';
  return {
    x: X,
    y: Y,
    show(on, covered = true) {
      holder.style.opacity = on ? '1' : '0';
      lid.style.opacity = covered ? '1' : '0';
      lid.getAnimations().forEach((a) => a.cancel());
    },
    // The lid pops open on a gust of steam.
    async liftLid() {
      sound.pop();
      puffs(X, Y - 40, { n: 8, spread: 80 });
      sparkleAt(fx, X, Y - 50);
      await lid.animate([{ transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(-70px) rotate(-24deg)', opacity: 0 }], { duration: 650, easing: 'ease-out', fill: 'forwards' }).finished.catch(() => {});
    },
  };
})();

// The golden ferry ticket to Beijing.
const ticket = (() => {
  const holder = frontGroup(0, 0);
  const pose = { x: 1348, y: 612, r: -6, s: 1 };
  const apply = (p = {}) => {
    Object.assign(pose, p);
    holder.style.transform = `translate(${pose.x}px, ${pose.y}px) rotate(${pose.r}deg) scale(${pose.s})`;
  };
  svg('rect', { x: -66, y: -40, width: 132, height: 80, rx: 9, fill: '#e9c46a', stroke: '#a9812c', 'stroke-width': 3 }, holder);
  svg('rect', { x: -58, y: -32, width: 116, height: 64, rx: 5, fill: 'none', stroke: '#fbf0c4', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, holder);
  svg('text', { x: -22, y: 6, 'text-anchor': 'middle', style: 'font: 400 32px "Ma Shan Zheng","Kaiti SC",serif; fill:#6b4310' }, holder).textContent = '北京';
  const boat = svg('g', { transform: 'translate(34 -4)' }, holder);
  svg('path', { d: 'M-16 6H16L9 17H-9Z', fill: '#7a4b12' }, boat);
  svg('path', { d: 'M0 -18V4L13 4Z', fill: '#fbf0c4', stroke: '#7a4b12', 'stroke-width': 2, 'stroke-linejoin': 'round' }, boat);
  const date = svg('g', { opacity: 0 }, holder);
  date.style.transformBox = 'fill-box';
  date.style.transformOrigin = '50% 50%';
  svg('rect', { x: -56, y: 14, width: 64, height: 20, rx: 4, fill: '#b3392b' }, date);
  svg('text', { x: -24, y: 29, 'text-anchor': 'middle', style: 'font: 700 15px "Atkinson Hyperlegible Next",sans-serif; fill:#f6e3dc' }, date).textContent = '12 · 2';
  apply();
  return {
    get x() {
      return pose.x;
    },
    get y() {
      return pose.y;
    },
    reset(on = true) {
      holder.getAnimations().forEach((a) => a.cancel());
      date.style.opacity = '0';
      apply({ x: 1348, y: 612, r: -6, s: 1 });
      holder.style.opacity = on ? '1' : '0';
    },
    show(on) {
      holder.style.opacity = on ? '1' : '0';
    },
    shine() {
      sound.chime();
      sparkleAt(fx, pose.x, pose.y - 20);
      holder.animate([{ transform: `translate(${pose.x}px, ${pose.y}px) rotate(${pose.r}deg) scale(1)` }, { transform: `translate(${pose.x}px, ${pose.y - 14}px) rotate(${pose.r}deg) scale(1.22)`, offset: 0.4 }, { transform: `translate(${pose.x}px, ${pose.y}px) rotate(${pose.r}deg) scale(1)` }], { duration: 900, easing: 'ease-out' });
    },
    async glide(x, y, { r = 0, s = 1 } = {}, ms = 900) {
      const from = `translate(${pose.x}px, ${pose.y}px) rotate(${pose.r}deg) scale(${pose.s})`;
      const to = `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`;
      const a = holder.animate([{ transform: from }, { transform: to }], { duration: ms, easing: 'ease-in-out', fill: 'forwards' });
      await a.finished.catch(() => {});
      apply({ x, y, r, s });
      a.cancel();
    },
    showDate() {
      date.animate([{ opacity: 0, transform: 'scale(1.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 400, fill: 'forwards' });
    },
  };
})();

// The sign with 黑 on it, held up by Auntie Carp.
const sign = (() => {
  const holder = frontGroup(0, 0);
  const pose = { x: 520, y: 500 };
  const apply = (p = {}) => {
    Object.assign(pose, p);
    holder.style.transform = `translate(${pose.x}px, ${pose.y}px)`;
  };
  svg('path', { d: 'M0 44V132', stroke: '#8c6b45', 'stroke-width': 8, 'stroke-linecap': 'round' }, holder);
  svg('rect', { x: -62, y: -86, width: 124, height: 130, rx: 8, fill: '#fbf8f1', stroke: '#8c6b45', 'stroke-width': 4 }, holder);
  svg('text', { x: 0, y: 14, 'text-anchor': 'middle', style: 'font: 400 108px "Ma Shan Zheng","Kaiti SC",serif; fill:#1c1b18' }, holder).textContent = '黑';
  apply();
  holder.style.opacity = '0';
  return {
    get x() {
      return pose.x;
    },
    get y() {
      return pose.y;
    },
    reset() {
      holder.getAnimations().forEach((a) => a.cancel());
      apply({ x: 520, y: 500 });
      holder.style.opacity = '0';
    },
    show(on) {
      holder.style.opacity = on ? '1' : '0';
    },
    async glide(x, y, ms = 900) {
      const a = holder.animate([{ transform: `translate(${pose.x}px, ${pose.y}px)` }, { transform: `translate(${x}px, ${y}px)` }], { duration: ms, easing: 'ease-in-out', fill: 'forwards' });
      await a.finished.catch(() => {});
      apply({ x, y });
      a.cancel();
    },
    pulse() {
      holder.animate([{ transform: `translate(${pose.x}px, ${pose.y}px) scale(1)` }, { transform: `translate(${pose.x}px, ${pose.y - 10}px) scale(1.18)`, offset: 0.4 }, { transform: `translate(${pose.x}px, ${pose.y}px) scale(1)` }], { duration: 800, easing: 'ease-out' });
    },
  };
})();

// Auntie Carp's mother: a very large, very old carp that surfaces behind her, blows a bubble and sinks again.
const grandma = (() => {
  const X = 560;
  const Y = 540;
  const holder = svg('g', {}, props);
  holder.style.transformBox = 'view-box';
  holder.style.transformOrigin = '0 0';
  holder.style.transform = `translate(${X}px, ${Y}px)`;
  holder.style.opacity = '0';
  svg('use', { href: '#ch-carp', x: -280, y: -190, width: 560, height: 381, filter: 'url(#old-grey)' }, holder);
  return {
    top: [X, Y - 200],
    async rise() {
      holder.style.opacity = '1';
      sound.whoosh();
      await holder.animate([{ transform: `translate(${X}px, ${Y + 320}px)`, opacity: 0 }, { transform: `translate(${X}px, ${Y}px)`, opacity: 1 }], { duration: 1200, easing: 'ease-out', fill: 'forwards' }).finished.catch(() => {});
    },
    // One big, slow bubble: that is all she says.
    async bubble() {
      const b = svg('circle', { cx: X - 245, cy: Y + 22, r: 30, fill: '#f4f1e8', 'fill-opacity': 0.7, stroke: '#8fa89b', 'stroke-width': 4 }, fx);
      b.style.transformBox = 'fill-box';
      b.style.transformOrigin = '50% 50%';
      sound.plop();
      await b.animate([{ transform: 'translate(0, 0) scale(0.3)' }, { transform: 'translate(-10px, -190px) scale(1.5)' }], { duration: 1800, easing: 'ease-out' }).finished.catch(() => {});
      sound.pop();
      burst(fx, X - 255, Y - 168, 6);
      b.remove();
    },
    async sink() {
      await holder.animate([{ transform: `translate(${X}px, ${Y}px)`, opacity: 1 }, { transform: `translate(${X}px, ${Y + 320}px)`, opacity: 0 }], { duration: 1200, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {});
    },
    reset() {
      holder.getAnimations().forEach((a) => a.cancel());
      holder.style.transform = `translate(${X}px, ${Y}px)`;
      holder.style.opacity = '0';
    },
  };
})();

// ---- Part 2 props: the stove with the wok, and the writing paper -------------------------------

const stove = (() => {
  const X = 690;
  const Y = 716;
  const holder = svg('g', {}, props);
  holder.style.transform = `translate(${X}px, ${Y}px)`;
  holder.style.transformBox = 'view-box';
  holder.style.transformOrigin = '0 0';
  holder.style.opacity = '0';
  svg('rect', { x: -88, y: -84, width: 176, height: 84, rx: 8, fill: '#9a9486', stroke: '#4a4639', 'stroke-width': 4 }, holder);
  svg('path', { d: 'M-88 -56H88M-30 -84V-56M30 -84V-56M-60 -56V-30M60 -56V-30', stroke: '#6f6a5c', 'stroke-width': 2 }, holder);
  svg('path', { d: 'M-34 0V-26Q-34 -46 0 -46Q34 -46 34 -26V0Z', fill: '#2b2926' }, holder);
  const fire = svg('g', { opacity: 0 }, holder);
  const flames = [svg('path', { d: 'M-20 0C-28 -14 -12 -24 -14 -42C0 -32 6 -16 -2 0Z', fill: '#f4a259' }, fire), svg('path', { d: 'M4 0C-2 -10 10 -18 8 -34C20 -24 22 -10 16 0Z', fill: '#e9c46a' }, fire)];
  flames.forEach((f) => {
    f.style.transformBox = 'fill-box';
    f.style.transformOrigin = '50% 100%';
  });
  svg('path', { d: 'M96 -84L152 -108', stroke: '#3a3d3b', 'stroke-width': 11, 'stroke-linecap': 'round' }, holder);
  svg('ellipse', { cx: 0, cy: -88, rx: 100, ry: 15, fill: '#2b2926' }, holder);
  const food = [[-52, -92, 13, '#4f8a58'], [-26, -100, 15, '#e07a3f'], [0, -96, 14, '#e9c46a'], [26, -102, 14, '#b3392b'], [50, -94, 13, '#4f8a58'], [-8, -108, 12, '#e07a3f']].map(([x, y, r, c]) =>
    svg('ellipse', { cx: x, cy: y, rx: r, ry: r * 0.75, fill: c, stroke: '#1c1b18', 'stroke-opacity': 0.3, 'stroke-width': 1.5 }, holder),
  );
  const raw = food.map((f) => f.getAttribute('fill'));
  svg('path', { d: 'M-100 -88Q-96 -32 0 -32Q96 -32 100 -88Q0 -68 -100 -88Z', fill: '#3a3d3b', stroke: '#1c1b18', 'stroke-width': 3, 'stroke-linejoin': 'round' }, holder);
  svg('ellipse', { cx: 0, cy: -88, rx: 100, ry: 15, fill: 'none', stroke: '#1c1b18', 'stroke-width': 3 }, holder);
  return {
    x: X,
    show(on) {
      holder.style.opacity = on ? '1' : '0';
    },
    // A first try burns, a second one comes out golden.
    async cook(good, ms = 2600) {
      fire.style.opacity = '1';
      flames.forEach((f, i) => f.animate([{ transform: 'scale(1, 1)' }, { transform: 'scale(1.15, 1.35)' }], { duration: 230 + i * 70, iterations: Math.ceil(ms / 260), direction: 'alternate' }));
      sound.sizzle(ms / 1000);
      for (let t = 0; t < ms; t += 330) {
        puffs(X + 10, Y - 120, { n: 2, dark: !good && t > ms * 0.4, spread: 60 });
        if (good && t > ms * 0.5) sparkleAt(fx, X + (Math.random() - 0.5) * 120, Y - 140);
        await wait(330);
      }
      fire.style.opacity = '0';
      food.forEach((f, i) => f.setAttribute('fill', good ? ['#6fb36a', '#f08a3c', '#f3d067', '#d3483a', '#6fb36a', '#f08a3c'][i] : '#242220'));
      if (!good) puffs(X, Y - 120, { n: 6, dark: true, spread: 90 });
    },
    reset() {
      holder.style.opacity = '0';
      fire.style.opacity = '0';
      food.forEach((f, i) => f.setAttribute('fill', raw[i]));
    },
  };
})();

// The paper where characters are written: two squares, the model in pale grey, and ink that appears stroke by stroke
// while a "brush" (the Frog's brush, or the tadpole itself) follows the strokes.
const paper = (() => {
  const S = 280 / 1024;
  const CELLS = [[520, 152], [820, 152]];
  const holder = svg('g', {}, props);
  holder.style.transformBox = 'view-box';
  holder.style.transformOrigin = '0 0';
  holder.style.opacity = '0';
  svg('path', { d: 'M540 124V92M1060 124V92', stroke: '#8a7a64', 'stroke-width': 4 }, holder);
  svg('rect', { x: 488, y: 118, width: 624, height: 16, rx: 6, fill: '#8c6b45', stroke: '#5e4630', 'stroke-width': 3 }, holder);
  svg('rect', { x: 500, y: 134, width: 600, height: 326, fill: '#fbf8f1', stroke: '#cfc4ad', 'stroke-width': 3 }, holder);
  svg('rect', { x: 488, y: 452, width: 624, height: 16, rx: 6, fill: '#8c6b45', stroke: '#5e4630', 'stroke-width': 3 }, holder);
  for (const [cx, cy] of CELLS) {
    svg('rect', { x: cx, y: cy, width: 280, height: 280, fill: 'none', stroke: '#b9ad96', 'stroke-width': 2 }, holder);
    svg('path', { d: `M${cx} ${cy + 140}H${cx + 280}M${cx + 140} ${cy}V${cy + 280}M${cx} ${cy}L${cx + 280} ${cy + 280}M${cx + 280} ${cy}L${cx} ${cy + 280}`, stroke: '#d6cebb', 'stroke-width': 1.5, 'stroke-dasharray': '6 6' }, holder);
  }
  const defs = svg('defs', {}, holder);
  const guide = svg('g', {}, holder);
  const ink = svg('g', {}, holder);
  const glyph = (cell) => `translate(${cell[0]} ${cell[1]}) scale(${S}) translate(0 900) scale(1 -1)`;
  [[XIAO, CELLS[0]], [HEI, CELLS[1]]].forEach(([d, cell]) => d.strokes.forEach((p) => svg('path', { d: p, fill: '#e8e1cf', transform: glyph(cell) }, guide)));

  const sprite = (draw) => {
    const g = svg('g', { opacity: 0 }, holder);
    g.style.transformBox = 'fill-box'; // the tadpole turns around its own middle as it follows a stroke
    g.style.transformOrigin = '50% 50%';
    draw(g);
    return g;
  };
  // the tadpole as a brush: head first along the stroke
  const tadSprite = sprite((g) => svg('use', { href: '#tp-legs2', x: -48, y: -33, width: 96, height: 65 }, g));
  // the Frog's calligraphy brush: the tip is at the origin
  const brushSprite = sprite((g) => {
    svg('path', { d: 'M0 0L9 -34L16 -86', stroke: '#8c6b45', 'stroke-width': 8, 'stroke-linecap': 'round', fill: 'none' }, g);
    svg('path', { d: 'M0 0Q-5 -12 5 -26L11 -24Q10 -9 0 0Z', fill: '#1c1b18' }, g);
  });

  const geometry = (data, i, cell) => {
    const pts = data.medians[i].map(([x, y]) => [cell[0] + x * S, cell[1] + (900 - y) * S]);
    const extend = (a, b, d) => {
      const dx = a[0] - b[0];
      const dy = a[1] - b[1];
      const l = Math.hypot(dx, dy) || 1;
      return [a[0] + (dx / l) * d, a[1] + (dy / l) * d];
    };
    pts.unshift(extend(pts[0], pts[1], 26 * S));
    pts.push(extend(pts.at(-1), pts.at(-2), 26 * S));
    return pts;
  };
  // The brush's whole journey as one animation, so pausing and skipping treat it like everything else.
  function follow(el, tracks, rotate) {
    const total = tracks.at(-1).start + tracks.at(-1).dur + 350;
    const frames = [];
    let prev = 0;
    const push = (t, [x, y], rot) => {
      const offset = Math.min(1, Math.max(0, t / total));
      const transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
      if (frames.length && offset <= frames.at(-1).offset) frames.at(-1).transform = transform;
      else frames.push({ offset, transform });
    };
    for (const { pts, len, start, dur } of tracks) {
      let run = 0;
      pts.forEach((p, i) => {
        if (i) run += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
        let rot = 0;
        if (rotate) {
          const a = pts[Math.max(i - 1, 0)];
          const b = pts[Math.min(i + 1, pts.length - 1)];
          rot = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI - 180;
          while (rot - prev > 180) rot -= 360;
          while (rot - prev < -180) rot += 360;
          prev = rot;
        }
        push(start + dur * (run / (len || 1)), p, rot);
      });
    }
    if (frames[0].offset > 0) frames.unshift({ ...frames[0], offset: 0 });
    frames.push({ ...frames.at(-1), offset: 1 });
    el.animate(frames, { duration: total, easing: 'linear', fill: 'both' });
    const first = tracks[0].start;
    el.animate(
      [
        { offset: 0, opacity: 0 },
        { offset: Math.max(0, (first - 150) / total), opacity: 0 },
        { offset: Math.min(1, (first + 80) / total), opacity: 1 },
        { offset: Math.max(0, (total - 300) / total), opacity: 1 },
        { offset: 1, opacity: 0 },
      ],
      { duration: total, easing: 'linear', fill: 'both' },
    );
    return total;
  }
  let uid = 0;
  return {
    // One character, one {start, dur} in ms for each stroke, counted from now. Returns when the last stroke ends.
    write(data, cellIndex, times, who = 'tadpole') {
      const cell = CELLS[cellIndex];
      const tracks = data.strokes.map((outline, i) => {
        const pts = geometry(data, i, cell);
        const len = pts.slice(1).reduce((s, p, k) => s + Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]), 0);
        const id = `ink-clip-${++uid}`;
        svg('path', { d: outline, transform: glyph(cell) }, svg('clipPath', { id }, defs));
        const line = svg(
          'path',
          { d: `M${pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join('L')}`, fill: 'none', stroke: '#1c1b18', 'stroke-width': 150 * S, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'clip-path': `url(#${id})`, 'stroke-dasharray': len + 2, 'stroke-dashoffset': len + 2 },
          ink,
        );
        line.animate([{ strokeDashoffset: len + 2 }, { strokeDashoffset: 0 }], { duration: times[i].dur, delay: times[i].start, easing: 'linear', fill: 'both' });
        at(times[i].start, () => !clock.skipping && sound.brush(times[i].dur / 1000));
        return { pts, len, ...times[i] };
      });
      return follow(who === 'tadpole' ? tadSprite : brushSprite, tracks, who === 'tadpole');
    },
    clearInk() {
      ink.replaceChildren();
      defs.replaceChildren();
      [tadSprite, brushSprite].forEach((s) => {
        s.getAnimations().forEach((a) => a.cancel());
        s.style.opacity = '0';
      });
    },
    async show(on) {
      if (on) {
        holder.style.opacity = '1';
        sound.whoosh();
        await holder.animate([{ transform: 'translateY(-460px)' }, { transform: 'translateY(0)' }], { duration: 900, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'forwards' }).finished.catch(() => {});
      } else {
        await holder.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-460px)' }], { duration: 650, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {});
        holder.style.opacity = '0';
      }
    },
    reset() {
      holder.getAnimations().forEach((a) => a.cancel());
      holder.style.opacity = '0';
      this.clearInk();
    },
    // The pale model blinks while someone reads it.
    pulseGuide() {
      guide.animate([{ opacity: 1 }, { opacity: 0.2, offset: 0.5 }, { opacity: 1 }], { duration: 1100 });
    },
    // Sparkles around the finished name.
    celebrate() {
      sound.sparkle();
      for (let i = 0; i < 6; i++) sparkleAt(fx, 560 + Math.random() * 480, 190 + Math.random() * 230);
    },
    centre: [800, 300],
  };
})();

function reset(part) {
  STACK.forEach((a) => actors.append(a.el));
  board.setAll(part === 2 ? [true, false, false] : [null, null, null]);
  ticket.reset(part === 1);
  dish.show(part === 1, true);
  sign.reset();
  grandma.reset();
  stove.reset();
  stove.show(part === 2);
  paper.reset();
  put(cat, [0, 66]);
  $('#phone').style.opacity = '0';
  tadpole.lids.forEach((l) => (l.style.transform = 'scaleY(0)'));
  put(fly, [1800, 120], { visible: false });
  put(frog, [1750, 712], { visible: false, facing: 1 });
  if (part === 1) {
    put(crab, [335, 716], { facing: -1 });
    put(carp, [570, 700], { facing: 1 });
    put(turtle, [790, 712], { facing: -1, scale: 0.95 });
    put(tadpole, [1010, 651], { facing: -1, scale: 1.1 });
    put(duck, [1272, 705], { facing: 1 });
  } else {
    placeAt(carp, [335, 790, 0.9], -1);
    put(crab, [500, 716], { facing: -1 });
    placeAt(tadpole, [830, 735, 1.1], 1);
    put(turtle, [975, 712], { facing: -1, scale: 0.92 });
    put(duck, [1272, 705], { facing: 1 });
    sign.show(true);
    sign.glide(335 + 70, 540, 1);
  }
}

// ---- Part 1: the ticket window ----------------------------------------------------------------

async function partOne() {
  sound.startAmbience();
  await ep.loadName();
  ep.prepareNameClips();
  const titleEl = $('#title-card');
  await showTitleCard(titleEl, ep.EP.title);
  await say('a_title', null, { subtitles: false, keep: 500 });
  await hideTitleCard(titleEl);
  const stopSnore = snoring(turtle);

  // The Duck reads the three conditions off her board; the ticket glints.
  const rule = syncWords([[0, () => board.pulse(0)], [4, () => board.pulse(1)], [9, () => board.pulse(2)]]);
  if (ep.mode === 'live') rule.live();
  await say('a_duck_rule', duck, { onPlay: rule.onPlay });
  ticket.shine();
  await say('a_duck_ticket', duck);
  await hop(tadpole, 28);
  mark(tadpole.x, tadpole.y - 130, '！');
  await say('a_tad_wow', tadpole);

  // The queue chats while it waits: the Crab and Auntie Carp do the first dialogue.
  look(crab, carp.x);
  look(carp, crab.x);
  await say('a_crab_q1', crab);
  await say('a_carp_a1', carp);
  ability(carp, true);
  await say('a_crab_q2', crab);
  grandma.rise();
  await wait(900);
  await say('a_carp_a2', carp);
  grandma.bubble();
  sealAt(grandma.top[0] - 120, grandma.top[1] + 40, false);
  await wait(1500);
  await grandma.sink();

  // The Dragonfly arrives in a hurry, and boasts.
  put(fly, [1800, 110], { facing: 1 });
  sound.whoosh();
  await walkTo(fly, [840, 400, 1], 1500, { facing: 1, style: 'fly' });
  const hover = flutter(fly);
  await say('a_fly_all', fly);
  ability(fly, true, 40);
  hover();

  // Second dialogue: she asks the Crab, whose dish is on the Duck's counter; the smell wakes the Turtle.
  await walkTo(fly, [420, 430, 1], 1400, { facing: 1, style: 'fly' });
  const hover2 = flutter(fly);
  await say('a_fly_q', fly);
  look(crab, dish.x);
  dish.liftLid();
  await say('a_crab_can', crab);
  ability(crab, true);
  stopSnore();
  await hop(turtle, 20);
  mark(turtle.x, turtle.y - 230, '？');
  await say('a_turtle_q', turtle);
  look(duck, turtle.x);
  await lean(duck, 6);
  await say('a_duck_taste', duck);
  hover2();
  await walkTo(fly, [790, 400, 1], 1200, { facing: 1, style: 'fly' });
  const hover3 = flutter(fly);
  await say('a_fly_q', fly);
  await say('a_turtle_no', turtle);
  ability(turtle, false);
  await ep.sayAll('a_all_no', ALL, { keep: 600 });
  await shake(turtle);
  hover3();
  await fly.moveTo(1500, 90, 900, 'ease-in');
  fly.show(false);

  // Third dialogue: Auntie Carp phones the Café Cat in Beijing and shows it a character.
  sound.ring();
  await carp.gesture([{ transform: 'rotate(0)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(0)' }], { duration: 600 });
  await say('a_carp_call', carp, { keep: 150 });
  await showCall(true);
  await say('a_cat_a', cat);
  ability(cat, true);
  sign.show(true);
  await sign.glide(carp.x - 55, carp.y - 150, 700);
  await say('a_carp_q', carp);
  await say('a_cat_sorry', cat);
  ability(cat, false);
  await showCall(false);
  look(tadpole, sign.x);
  sign.pulse();
  sparkleAt(fx, sign.x, sign.y - 30);
  await hop(tadpole, 30);
  await say('a_tad_name', tadpole);

  // Now the Duck asks the tadpole the same three questions.
  await walkTo(tadpole, [1040, 735, 1.1], 1500, { facing: -1, style: 'swim' });
  board.pulse(0);
  await say('a_duck_q1', duck);
  await say('a_tad_can', tadpole);
  board.stamp(0, true);
  await hop(tadpole, 24);
  board.pulse(1);
  await say('a_duck_q2', duck);
  await say('a_tad_no1', tadpole);
  board.stamp(1, false);
  await droop(tadpole);
  board.pulse(2);
  await say('a_duck_q3', duck);
  await say('a_tad_no2', tadpole);
  board.stamp(2, false);
  await wait(500);
  await say('a_duck_verdict', duck);
  const away = ticket.glide(1290, 700, { r: 0, s: 0.6 }, 800);
  await say('a_duck_sorry', duck);
  await away;
  ticket.show(false);

  mark(tadpole.x, tadpole.y - 130, '…');
  await wait(500);
  await say('a_ask', null, { keep: 300 });
  ep.showQuestion(); // stays up for the class to discuss: A, B or C?
  sound.stopAmbience(2);
  return [];
}

// ---- Part 2: the second chance ------------------------------------------------------------------

async function partTwo() {
  sound.startAmbience();
  await ep.loadName();
  ep.prepareNameClips();
  await wait(1000);

  // The tadpole is down. Everyone cheers it up.
  await droop(tadpole);
  await say('b_tad_sad', tadpole);
  await Promise.all([hop(crab, 16), hop(carp, 14), hop(turtle, 14), ep.sayAll('b_all_ok', ALL, { keep: 500 })]);

  // Cooking lesson: the Crab at the stove, the Café Cat on the video call.
  look(crab, stove.x);
  stove.show(true);
  await say('b_crab_ok', crab);
  await walkTo(tadpole, [790, 735, 1.1], 1100, { facing: 1, style: 'swim' });
  await shake(tadpole);
  await stove.cook(false);
  look(crab, tadpole.x);
  await lean(crab, 10);
  await say('b_crab_bad', crab);
  await droop(tadpole);
  await say('b_tad_sorry', tadpole);
  await showCall(true);
  await say('b_cat_tip', cat);
  await showCall(false);
  await shake(tadpole);
  await stove.cook(true);
  sound.chime();
  await walkTo(turtle, [880, 712, 0.92], 1000, { facing: 1 });
  await puff(turtle, 1.2);
  await say('b_turtle_good', turtle);
  await showCall(true);
  await say('b_cat_good', cat);
  await showCall(false);
  burst(fx, tadpole.x, tadpole.y - 20, 10);
  await hop(tadpole, 30);
  await say('b_tad_cook', tadpole);
  await walkTo(turtle, [975, 712, 0.92], 900, { facing: -1 });

  // Writing lesson: the sign with 黑, the Frog Teacher, the paper.
  await sign.glide(tadpole.x - 30, tadpole.y - 210, 900);
  await say('b_carp_give', carp);
  put(frog, [1750, 712], { facing: 1 });
  sound.whoosh();
  await frog.moveTo(1450, 560, 450, 'ease-out');
  await frog.moveTo(1300, 712, 450, 'ease-in');
  ripple(1300, 722);
  sound.plop();
  await frog.moveTo(1180, 560, 400, 'ease-out');
  await frog.moveTo(1100, 712, 400, 'ease-in');
  ripple(1100, 722);
  sound.plop();
  look(frog, tadpole.x);
  await say('b_frog_come', frog);
  paper.show(true);
  sign.show(false);
  await wait(700);
  look(tadpole, paper.centre[0]);
  await hop(tadpole, 22);
  await say('b_tad_how', tadpole);
  // The Frog shows 小 first, three quick strokes with her brush.
  const total = paper.write(XIAO, 0, [{ start: 250, dur: 480 }, { start: 950, dur: 480 }, { start: 1650, dur: 480 }], 'brush');
  await say('b_frog_demo', frog);
  await wait(Math.max(0, total - 2200));
  look(fly, 800);
  put(fly, [1800, 110], { facing: 1 });
  sound.whoosh();
  await walkTo(fly, [390, 440, 1], 1200, { facing: -1, style: 'fly' });
  const hover = flutter(fly);
  paper.pulseGuide();
  await say('b_fly_read', fly);
  hover();
  // The Turtle has a go, too.
  puff(turtle, 1.15);
  const blotX = turtle.x - 60;
  const blot = svg('g', {}, fx);
  svg('rect', { x: blotX - 44, y: 470, width: 88, height: 70, rx: 5, fill: '#fbf8f1', stroke: '#b9ad96', 'stroke-width': 3 }, blot);
  [[0, 0, 22], [-16, 8, 10], [18, -8, 9], [14, 16, 7], [-20, -14, 6]].forEach(([x, y, r]) => svg('circle', { cx: blotX + x, cy: 505 + y, r, fill: '#1c1b18' }, blot));
  blot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' });
  await say('b_turtle_now', turtle);
  blot.remove();
  await Promise.all([fly.moveTo(1550, 90, 800, 'ease-in'), paper.show(false)]);
  fly.show(false);
  paper.clearInk();

  // The test again, at the Duck's counter.
  await walkTo(tadpole, [1050, 735, 1.1], 1300, { facing: -1, style: 'swim' });
  board.pulse(1);
  await say('a_duck_q2', duck);
  await say('b_tad_yes', tadpole);
  dish.show(true, false);
  sound.chime();
  sparkleAt(fx, dish.x, dish.y - 40);
  puffs(dish.x, dish.y - 30, { n: 5 });
  look(duck, dish.x);
  await say('a_duck_taste', duck);
  board.stamp(1, true);
  await hop(tadpole, 22);
  board.pulse(2);
  await say('a_duck_q3', duck);
  look(tadpole, paper.centre[0]);
  await say('b_tad_write', tadpole);

  // The tadpole dives into the paper and becomes the brush: first 小, then 黑 while the Frog counts the strokes.
  await paper.show(true);
  await hop(tadpole, 70);
  tadpole.show(false);
  burst(fx, tadpole.x, tadpole.y - 40, 10);
  const small = paper.write(XIAO, 0, [{ start: 200, dur: 460 }, { start: 860, dur: 460 }, { start: 1520, dur: 460 }], 'tadpole');
  await wait(small + 300);
  await say('b_frog_count', frog, {
    onPlay: ({ startedAt, timings, ctx }) => {
      const words = (timings?.words || []).filter((w) => HAN.test(w.text));
      const first = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]; // 一 二 … 十 十一 十二: where each number begins
      const now = ctx.currentTime;
      const starts = first.map((k, i) => Math.max(0, words[k] ? (startedAt + words[k].start - now) * 1000 : i * 700));
      paper.write(
        HEI,
        1,
        starts.map((s, i) => ({ start: s, dur: Math.max(260, Math.min(640, (starts[i + 1] ?? s + 700) - s - 80)) })),
        'tadpole',
      );
    },
  });
  await wait(900);
  paper.celebrate();
  tadpole.show(true);
  burst(fx, tadpole.x, tadpole.y - 40, 12);
  await hop(tadpole, 36);
  await say('b_frog_good', frog);
  await shake(carp);
  await say('b_carp_2000', carp);
  await paper.show(false);

  // Three green seals: the ticket is the tadpole's.
  board.stamp(2, true);
  board.shine();
  look(duck, tadpole.x);
  ticket.show(true);
  await say('b_duck_sorry', duck);
  await ticket.glide(tadpole.x, tadpole.y - 150, { r: 0, s: 1.35 }, 1000);
  sound.chime();
  sparkleAt(fx, tadpole.x, tadpole.y - 150);
  await hop(tadpole, 30);
  await say('b_tad_thanks', tadpole);
  ticket.showDate();
  put(fly, [1800, 110], { facing: 1 });
  sound.whoosh();
  await walkTo(fly, [tadpole.x - 150, 470, 1], 1100, { facing: -1, style: 'fly' });
  const hover4 = flutter(fly);
  await say('b_fly_date', fly);
  hover4();
  await Promise.all([hop(crab, 20), hop(turtle, 20), hop(carp, 20), ep.sayAll('b_all_can', ALL, { keep: 600 })]);
  burst(fx, 800, 500, 14);
  await wait(500);

  const cardEl = $('#title-card');
  await showTitleCard(cardEl, ep.EP.next);
  await say('b_next', null, { subtitles: false, keep: 1500 });
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
