// Episode 7 · 我想喝茶！ (Vorrei bere un tè!). Unit 8.
//
// Part 1, "Il chiosco del tè": noon, a hot sun. The Crab's tea stall has one precious cup (red, with a snowman). The
//   tadpole drags itself in: 你想喝什么？我想喝茶。你想吃什么？我想吃米饭。(The sleeping Turtle and, by phone, the Cat
//   repeat it in their sleep.) The Crab pours the tea… and the Dragonfly zooms in, drinks it in one go and flies off
//   with the cup. 杯子！ So: 下午你想做什么？下午我想去商店。 At the Duck's shop: 你好！你想买什么？ The tadpole asks the
//   price of the big mug (二十八块), has only 二十块, and the Crab asks the price of the little red cup… which is HIS
//   cup (the Dragonfly sold it to the Duck for ten). Question: 那个杯子多少钱？
// Part 2, "Comprare o vendere?": 十八块钱! The Crab can't pay, the tadpole can and says 我想卖那个杯子 (sell!) instead of
//   买. The Duck asks the price, the whole pond stampedes to buy the cup it doesn't have, and the Frog Teacher sets the
//   tones straight (买, you have money; 卖, you have the cup). The tadpole buys the cup and gives it back to the Crab,
//   who shares the first tea; the Turtle arrives last. Then the Cat on the phone slips into a giant teacup:
//   下集：小猫在哪儿？
import { createEpisode } from './episode-kit.js';
import { Actor, burst, flutter, hideTitleCard, makeHatchling, showTitleCard, sparkleAt, svg, wait, waddle } from './stage.js';

const $ = (sel) => document.querySelector(sel);
const actors = $('#actors');
const props = $('#props');
const front = $('#front');
const HAN = /\p{Script=Han}/u;

// Everyone who speaks stays within x 210-1390 (visible on a 4:3 projector).
const CALL = [820, 330]; // the video call window
const COUNTER_Y = 632; // the top of the Duck's counter
const CUP_X = { nut: 1186, snow: 1268, gold: 1350 }; // where the three cups stand on the counter
const TABLE_X = 620; // the tea table
const SNOW_START = TABLE_X + 65; // the Crab's red cup, on the table
const KANJI = 'font: 400 52px "Ma Shan Zheng","Kaiti SC",serif; fill:#3a2a18';
const SANS = 'font-family: "Atkinson Hyperlegible Next", sans-serif; font-weight: 700;';

const duck = new Actor(actors, 'ch-duck', { x: 1272, y: 705, w: 200, h: 218 });
const turtle = new Actor(actors, 'ch-turtle', { x: 290, y: 712, w: 260, h: 200 });
const crab = new Actor(actors, 'ch-crab', { x: 450, y: 716, w: 230, h: 186 });
const carp = new Actor(actors, 'ch-carp', { x: 900, y: 700, w: 300, h: 204, anchor: 'center' });
const tadpole = makeHatchling(actors, { x: 830, y: 651, w: 240 });
const fly = new Actor(actors, 'ch-dragonfly', { x: 1800, y: 120, w: 190, h: 139 });
const frog = new Actor(actors, 'ch-frog', { x: -200, y: 712, w: 200, h: 190 });
const cat = new Actor($('#phone-cat'), 'ch-cat', { x: 0, y: 66, w: 190, h: 150 });
$('#phone').setAttribute('transform', `translate(${CALL[0]} ${CALL[1]})`);
const ALL = [tadpole, duck, crab, carp, turtle, fly, cat];
const STACK = [duck, turtle, crab, carp, tadpole, fly, frog];

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
const hop = (a, height = 18) =>
  a.gesture([{ transform: 'translateY(0)' }, { transform: `translateY(-${height}px)` }, { transform: 'translateY(0)' }], { duration: 420, easing: 'ease-out' });
const puff = (a, k = 1.14) =>
  a.gesture([{ transform: 'scale(1)' }, { transform: `scale(${k}) rotate(-3deg)`, offset: 0.3 }, { transform: `scale(${k}) rotate(3deg)`, offset: 0.6 }, { transform: 'scale(1)' }], { duration: 700 });
const lean = (a, deg = -8) => a.gesture([{ transform: 'rotate(0)' }, { transform: `rotate(${deg}deg) translateY(4px)`, offset: 0.5 }, { transform: 'rotate(0)' }], { duration: 700, easing: 'ease-in-out' });
const shake = (a) => a.gesture([{ transform: 'rotate(0)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(7deg)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(0)' }], { duration: 800 });
const droop = (a) => a.gesture([{ transform: 'translateY(0) scale(1, 1)' }, { transform: 'translateY(12px) scale(1.04, 0.9)', offset: 0.5 }, { transform: 'translateY(0) scale(1, 1)' }], { duration: 1000, easing: 'ease-in-out' });
const at = (ms, fn) => wait(Math.max(0, ms)).then(fn);
// SVG groups that rotate or scale need their own centre (the default is the viewBox corner).
const centred = (el) => {
  el.style.transformBox = 'fill-box';
  el.style.transformOrigin = '50% 50%';
  return el;
};

const ep = await createEpisode({
  id: 'ep07',
  unitPage: '#',
  parts: { 1: partOne, 2: partTwo },
  reset,
  tagSpot: (who) => (who === 'cat' ? [CALL[0] + 190, CALL[1] - 100] : null),
  viewTop: 110,
  extraRoles: { frog: { role: 'frog', it: 'La Maestra Rana', zh: '李月老师' } },
  rewind: true, // ← goes back one line, as often as the class wants to hear it again
});
ep.stage = { duck, turtle, crab, carp, tadpole, dragonfly: fly, cat, frog };
const { sound, fx } = ep;

// Everyone stands close together, so whoever speaks steps to the front.
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

// ---- Small marks and effects --------------------------------------------------------------------

function above(actor, lift = 50) {
  if (actor === cat) return [CALL[0] + 150, CALL[1] - 70];
  const [x, y] = actor.top();
  return [Math.max(260, Math.min(1340, x)), Math.max(190, y - lift)];
}
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
// The video call: a window onto the Café Cat in Beijing, with its dotted line to `who`.
function showCall(on, who = carp) {
  const [cx, cy] = CALL;
  const px = who.x + (who.facing === -1 ? 0.12 : -0.12) * who.w * who.scale;
  const py = who.anchor === 'center' ? who.y : who.y - 0.5 * who.h * who.scale;
  $('#phone-signal').setAttribute('d', `M0 124C60 210 ${px - cx - 70} ${(py - cy) * 0.62} ${px - cx} ${py - cy - 20}`);
  return $('#phone').animate([{ opacity: on ? 0 : 1 }, { opacity: on ? 1 : 0 }], { duration: 450, fill: 'forwards' }).finished;
}
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
    // To a new spot, in an arc if asked (arc = how high it rises); `turn` is the rotation on arrival.
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
    async tilt(deg, ms = 350) {
      const from = pose.r;
      const b = inner.animate([{ transform: `rotate(${from}deg)` }, { transform: `rotate(${deg}deg)` }], { duration: ms, easing: 'ease-in-out', fill: 'forwards' });
      await b.finished.catch(() => {});
      pose.r = deg;
      apply();
      b.cancel();
    },
  };
}

// ---- The sun and the light: noon, afternoon, dusk -------------------------------------------------

const sky = svg('rect', { x: 0, y: 110, width: 1600, height: 900, fill: '#f4a259', opacity: 0 }, props);
const sun = (() => {
  const holder = svg('g', {}, props);
  const body = centred(svg('g', {}, holder));
  const rays = centred(svg('g', {}, body));
  for (let i = 0; i < 12; i++) svg('path', { d: 'M0 -92V-122', stroke: '#f2b84b', 'stroke-width': 8, 'stroke-linecap': 'round', transform: `rotate(${i * 30})` }, rays);
  const disc = svg('circle', { r: 70, fill: '#f6d365', stroke: '#e0a526', 'stroke-width': 4 }, body);
  const shimmer = svg('g', { opacity: 0 }, props);
  for (let k = 0; k < 4; k++) svg('path', { d: `M${170 + k * 110} 786q10 -14 20 0t20 0t20 0t20 0`, fill: 'none', stroke: '#e0a526', 'stroke-width': 3, 'stroke-linecap': 'round' }, shimmer);
  const phases = {
    noon: { x: 250, y: 215, fill: '#f6d365', tint: 0, heat: 1 },
    afternoon: { x: 330, y: 300, fill: '#f4a259', tint: 0.1, heat: 0 },
    dusk: { x: 460, y: 420, fill: '#e76f51', tint: 0.2, heat: 0 },
  };
  const state = { phase: 'noon' };
  const place = (p) => {
    holder.style.transform = `translate(${p.x}px, ${p.y}px)`;
    disc.style.fill = p.fill;
    sky.style.opacity = String(p.tint);
    shimmer.style.opacity = String(p.heat);
  };
  return {
    set(phase) {
      state.phase = phase;
      holder.getAnimations().forEach((a) => a.cancel());
      disc.getAnimations().forEach((a) => a.cancel());
      sky.getAnimations().forEach((a) => a.cancel());
      place(phases[phase]);
      rays.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 24000, iterations: Infinity });
      if (phases[phase].heat) shimmer.animate([{ transform: 'translateY(0)', opacity: 0.2 }, { transform: 'translateY(-12px)', opacity: 0.8 }], { duration: 900, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    },
    // The sun slides down the sky and the light turns warm.
    async to(phase, ms = 1600) {
      const from = phases[state.phase];
      const to = phases[phase];
      shimmer.getAnimations().forEach((a) => a.cancel());
      shimmer.style.opacity = '0';
      const a = holder.animate([{ transform: `translate(${from.x}px, ${from.y}px)` }, { transform: `translate(${to.x}px, ${to.y}px)` }], { duration: ms, easing: 'ease-in-out', fill: 'forwards' });
      disc.animate([{ fill: from.fill }, { fill: to.fill }], { duration: ms, fill: 'forwards' });
      sky.animate([{ opacity: from.tint }, { opacity: to.tint }], { duration: ms, fill: 'forwards' });
      await a.finished.catch(() => {});
      state.phase = phase;
    },
  };
})();

// ---- Cups: the Crab's red one with a snowman, the big mug with a nutcracker, the golden goblet ----

function drawCup(parent, kind) {
  const g = svg('g', {}, parent);
  const tea = (cx, cy, rx) => svg('ellipse', { cx, cy, rx, ry: 4.5, fill: '#b5651d', opacity: 0 }, g);
  if (kind === 'snow') {
    svg('path', { d: 'M26 -46Q48 -44 46 -26Q44 -12 22 -14', fill: 'none', stroke: '#5e2118', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
    svg('path', { d: 'M-27 -56H27L21 -4Q0 4 -21 -4Z', fill: '#c8453a', stroke: '#5e2118', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
    svg('ellipse', { cx: 0, cy: -56, rx: 27, ry: 6, fill: '#9c2f25', stroke: '#5e2118', 'stroke-width': 3 }, g);
    svg('circle', { cx: 0, cy: -20, r: 10, fill: '#fbf8f1' }, g);
    svg('circle', { cx: 0, cy: -35, r: 7, fill: '#fbf8f1' }, g);
    svg('rect', { x: -6, y: -46, width: 12, height: 7, rx: 2, fill: '#2b4c7e' }, g);
    svg('circle', { cx: -2.5, cy: -36, r: 1.2, fill: '#1c1b18' }, g);
    svg('circle', { cx: 2.5, cy: -36, r: 1.2, fill: '#1c1b18' }, g);
    svg('path', { d: 'M0 -34L6 -32L0 -31Z', fill: '#e07a3f' }, g);
    g.tea = tea(0, -55, 22);
  } else if (kind === 'nut') {
    svg('path', { d: 'M-30 -48Q-56 -46 -54 -26Q-52 -10 -26 -12', fill: 'none', stroke: '#8c8576', 'stroke-width': 8, 'stroke-linecap': 'round' }, g);
    svg('path', { d: 'M-31 -70H31L26 -4Q0 6 -26 -4Z', fill: '#f6f1e3', stroke: '#8c8576', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
    svg('ellipse', { cx: 0, cy: -70, rx: 31, ry: 7, fill: '#e3dcc9', stroke: '#8c8576', 'stroke-width': 3 }, g);
    svg('rect', { x: -11, y: -50, width: 22, height: 36, rx: 3, fill: '#b3392b', stroke: '#5e2118', 'stroke-width': 2 }, g);
    svg('rect', { x: -11, y: -30, width: 22, height: 4, fill: '#e9c46a' }, g);
    svg('circle', { cx: 0, cy: -57, r: 7, fill: '#f0c9a0', stroke: '#8a6a45', 'stroke-width': 1.5 }, g);
    svg('rect', { x: -8, y: -75, width: 16, height: 14, rx: 2, fill: '#e9c46a', stroke: '#a9812c', 'stroke-width': 2 }, g);
    g.tea = tea(0, -69, 26);
  } else {
    svg('path', { d: 'M-34 -62Q-52 -62 -50 -44Q-48 -30 -28 -30', fill: 'none', stroke: '#a9812c', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    svg('path', { d: 'M34 -62Q52 -62 50 -44Q48 -30 28 -30', fill: 'none', stroke: '#a9812c', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    svg('path', { d: 'M-34 -70H34Q32 -24 0 -20Q-32 -24 -34 -70Z', fill: '#e9c46a', stroke: '#a9812c', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
    svg('ellipse', { cx: 0, cy: -70, rx: 34, ry: 7, fill: '#f3d98b', stroke: '#a9812c', 'stroke-width': 3 }, g);
    svg('rect', { x: -5, y: -20, width: 10, height: 14, fill: '#d9b04c', stroke: '#a9812c', 'stroke-width': 2 }, g);
    svg('ellipse', { cx: 0, cy: -4, rx: 22, ry: 5, fill: '#e9c46a', stroke: '#a9812c', 'stroke-width': 3 }, g);
    svg('path', { d: 'M-18 -56Q-8 -50 -14 -34', fill: 'none', stroke: '#fbf0c4', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.8 }, g);
    g.tea = tea(0, -69, 28);
  }
  return g;
}
const cups = {
  snow: mover(front, (g) => (g.cup = drawCup(g, 'snow')), { x: SNOW_START, y: 690 }),
  nut: mover(front, (g) => (g.cup = drawCup(g, 'nut')), { x: CUP_X.nut, y: COUNTER_Y }),
  gold: mover(front, (g) => (g.cup = drawCup(g, 'gold')), { x: CUP_X.gold, y: COUNTER_Y }),
};
const fillCup = (kind, on = true) => (cups[kind].inner.cup.tea.style.opacity = on ? '0.95' : '0');

// The cup the Dragonfly carries off: a small copy that rides on her.
const flyCup = (() => {
  const outer = svg('g', { transform: 'translate(-34 -26) scale(0.55)' }, fly.pose);
  const g = centred(svg('g', {}, outer));
  drawCup(g, 'snow');
  outer.style.opacity = '0';
  return {
    show(on) {
      outer.style.opacity = on ? '1' : '0';
    },
    // She tips the cup back and drinks it all in one go.
    async gulp() {
      await g.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-80deg) translate(0, -16px)', offset: 0.4 }, { transform: 'rotate(-80deg) translate(0, -16px)', offset: 0.8 }, { transform: 'rotate(0deg)' }], { duration: 1500, easing: 'ease-in-out' }).finished.catch(() => {});
    },
  };
})();

// ---- The tea stall: a menu of two plaques (茶, 米饭), a table with a teapot -----------------------

const stall = (() => {
  const board = svg('g', { transform: 'translate(70 0)' }, props);
  svg('path', { d: 'M280 252H520', stroke: '#5e4630', 'stroke-width': 8, 'stroke-linecap': 'round' }, board);
  svg('path', { d: 'M322 252L338 296M478 252L462 296', stroke: '#8a7a64', 'stroke-width': 3 }, board);
  [[270, '茶', 'chá', false], [394, '米饭', 'mǐfàn', true]].forEach(([x, zh, py, bowl]) => {
    const g = svg('g', { transform: `translate(${x} 292)` }, board);
    svg('rect', { width: 116, height: 142, rx: 9, fill: '#d9b784', stroke: '#5e4630', 'stroke-width': 4 }, g);
    svg('text', { x: 58, y: 62, 'text-anchor': 'middle', style: `font: 400 ${bowl ? 44 : 62}px "Ma Shan Zheng","Kaiti SC",serif; fill:#3a2a18` }, g).textContent = zh;
    svg('text', { x: 58, y: 84, 'text-anchor': 'middle', style: `${SANS} font-size: 17px; fill:#5a4020` }, g).textContent = py;
    if (bowl) {
      svg('path', { d: 'M30 106Q58 138 86 106Z', fill: '#fbf8f1', stroke: '#5e4630', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
      svg('path', { d: 'M34 106Q58 88 82 106Z', fill: '#fff', stroke: '#b9ad96', 'stroke-width': 2 }, g);
    } else {
      svg('path', { d: 'M38 98H78L73 126Q58 132 43 126Z', fill: '#fbf8f1', stroke: '#5e4630', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
      svg('path', { d: 'M78 104Q92 104 90 114Q88 122 76 120', fill: 'none', stroke: '#5e4630', 'stroke-width': 3 }, g);
    }
  });
  // The table.
  const table = svg('g', {}, props);
  svg('rect', { x: TABLE_X - 80, y: 688, width: 160, height: 14, rx: 4, fill: '#d9b784', stroke: '#5e4630', 'stroke-width': 4 }, table);
  svg('path', { d: `M${TABLE_X - 62} 702V742M${TABLE_X + 62} 702V742`, stroke: '#5e4630', 'stroke-width': 7, 'stroke-linecap': 'round' }, table);
  // The teapot, which tips to pour.
  const pot = svg('g', { transform: `translate(${TABLE_X - 36} 688)` }, table);
  const potBody = centred(svg('g', {}, pot));
  svg('path', { d: 'M28 -30Q56 -42 58 -62', fill: 'none', stroke: '#3a3d3b', 'stroke-width': 9, 'stroke-linecap': 'round' }, potBody);
  svg('path', { d: 'M-28 -36Q-52 -36 -50 -18Q-48 -4 -26 -8', fill: 'none', stroke: '#3a3d3b', 'stroke-width': 8, 'stroke-linecap': 'round' }, potBody);
  svg('ellipse', { cx: 0, cy: -26, rx: 34, ry: 26, fill: '#4c6b5d', stroke: '#1c1b18', 'stroke-width': 3 }, potBody);
  svg('path', { d: 'M-16 -48Q0 -60 16 -48Z', fill: '#3d574b', stroke: '#1c1b18', 'stroke-width': 3, 'stroke-linejoin': 'round' }, potBody);
  svg('circle', { cx: 0, cy: -58, r: 5, fill: '#e9c46a', stroke: '#1c1b18', 'stroke-width': 2 }, potBody);
  const stream = svg('path', { d: 'M0 0V0', stroke: '#b5651d', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0 }, front);
  const spout = [TABLE_X + 22, 626];
  return {
    table,
    spout,
    board,
    // The Crab fills the red cup.
    async pour() {
      const cup = cups.snow.pose;
      await Promise.all([potBody.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(24deg)' }], { duration: 600, easing: 'ease-in-out', fill: 'forwards' }).finished.catch(() => {})]);
      const sx = TABLE_X + stall.shift;
      stream.setAttribute('d', `M${sx + 44} 640Q${sx + 56} 660 ${cup.x - 6} ${cup.y - 56}`);
      stream.style.opacity = '1';
      sound.sizzle(1.2);
      await wait(1200);
      fillCup('snow');
      stream.style.opacity = '0';
      await potBody.animate([{ transform: 'rotate(24deg)' }, { transform: 'rotate(0deg)' }], { duration: 500, easing: 'ease-in-out', fill: 'forwards' }).finished.catch(() => {});
    },
    // The Crab drags the whole stall to the shop for the party at the end.
    async carryTo(x) {
      const dx = x - TABLE_X;
      const a = table.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${dx}px)` }], { duration: 1400, easing: 'ease-in-out', fill: 'forwards' });
      await a.finished.catch(() => {});
      table.style.transform = `translateX(${dx}px)`;
      a.cancel();
      stall.shift = dx;
    },
    shift: 0,
    reset() {
      table.getAnimations().forEach((a) => a.cancel());
      table.style.transform = '';
      potBody.getAnimations().forEach((a) => a.cancel());
      potBody.style.transform = '';
      stream.style.opacity = '0';
      this.shift = 0;
    },
  };
})();

// ---- The Duck's shop: a sign, the counter with three cups and their price tags --------------------

const shopSign = (() => {
  const g = svg('g', { transform: 'translate(1272 332)' }, props);
  svg('path', { d: 'M-58 -4L-44 -48M58 -4L44 -48', stroke: '#8a7a64', 'stroke-width': 3 }, g);
  svg('rect', { x: -78, y: -4, width: 156, height: 78, rx: 9, fill: '#d9b784', stroke: '#5e4630', 'stroke-width': 4 }, g);
  svg('text', { x: 0, y: 50, 'text-anchor': 'middle', style: 'font: 400 56px "Ma Shan Zheng","Kaiti SC",serif; fill:#3a2a18' }, g).textContent = '商店';
  return g;
})();
const counter = svg('g', {}, front);
svg('rect', { x: 1150, y: COUNTER_Y, width: 262, height: 22, rx: 5, fill: '#d9b784', stroke: '#5e4630', 'stroke-width': 4 }, counter);
svg('rect', { x: 1162, y: COUNTER_Y + 22, width: 242, height: 66, fill: '#b98a56', stroke: '#5e4630', 'stroke-width': 4 }, counter);
svg('path', { d: `M1162 ${COUNTER_Y + 44}H1404M1162 ${COUNTER_Y + 66}H1404`, stroke: '#8a6238', 'stroke-width': 2 }, counter);
// The three price tags on the front of the counter.
const tags = Object.fromEntries(
  Object.entries(CUP_X).map(([kind, x]) => {
    const g = svg('g', {}, front);
    centred(g);
    const card = svg('rect', { x: x - 34, y: COUNTER_Y + 32, width: 68, height: 40, rx: 6, fill: '#fbf8f1', stroke: '#5e4630', 'stroke-width': 3 }, g);
    const text = svg('text', { x, y: COUNTER_Y + 63, 'text-anchor': 'middle', style: `${SANS} font-size: 30px; fill:#b3392b` }, g);
    const api = {
      g,
      text,
      set(t) {
        text.textContent = t;
      },
      show(on) {
        g.style.opacity = on ? '1' : '0';
      },
      async flip(t) {
        sound.tap();
        await g.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0.04)' }], { duration: 170, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {});
        text.textContent = t;
        await g.animate([{ transform: 'scaleX(0.04)' }, { transform: 'scaleX(1)' }], { duration: 220, easing: 'ease-out', fill: 'forwards' }).finished.catch(() => {});
        g.getAnimations().forEach((a) => a.cancel());
      },
      glow() {
        sound.chime();
        sparkleAt(fx, x, COUNTER_Y + 50);
        card.animate([{ fill: '#fbf8f1' }, { fill: '#ffe9a8', offset: 0.3 }, { fill: '#fbf8f1' }], { duration: 1400 });
      },
    };
    return [kind, api];
  }),
);

// ---- Money: coins, a ten-yuan note, the tadpole's two notes, the Crab's two coins -------------------

function drawCoin(parent, x = 0, y = 0, r = 15) {
  const g = svg('g', { transform: `translate(${x} ${y})` }, parent);
  svg('circle', { r, fill: '#e9c46a', stroke: '#a9812c', 'stroke-width': 3 }, g);
  svg('circle', { r: r - 5, fill: 'none', stroke: '#fbf0c4', 'stroke-width': 1.6 }, g);
  svg('text', { y: 5.5, 'text-anchor': 'middle', style: 'font: 400 16px "Ma Shan Zheng","Kaiti SC",serif; fill:#7a5a16' }, g).textContent = '块';
  return g;
}
function drawNote(parent, value) {
  const g = svg('g', {}, parent);
  svg('rect', { x: -40, y: -21, width: 80, height: 42, rx: 4, fill: '#8cc59a', stroke: '#3e6f4a', 'stroke-width': 3 }, g);
  svg('rect', { x: -33, y: -14, width: 66, height: 28, rx: 2, fill: 'none', stroke: '#e1f2e4', 'stroke-width': 1.6 }, g);
  svg('text', { x: -4, y: 9, 'text-anchor': 'middle', style: `${SANS} font-size: 26px; fill:#1f4a2c` }, g).textContent = String(value);
  svg('circle', { cx: 24, cy: 0, r: 8, fill: '#e1f2e4', stroke: '#3e6f4a', 'stroke-width': 1.6 }, g);
  return g;
}
// Coins raining down on the shop, as the pond stampedes to buy.
function coinRain(n = 26) {
  const done = [];
  for (let i = 0; i < n; i++) {
    const g = centred(svg('g', {}, fx));
    drawCoin(g, 0, 0, 14);
    const x = 560 + Math.random() * 640;
    done.push(
      g
        .animate(
          [
            { transform: `translate(${x}px, 180px) rotate(0deg)`, opacity: 0 },
            { transform: `translate(${x + (Math.random() - 0.5) * 80}px, 330px) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: 0.2 },
            { transform: `translate(${x + (Math.random() - 0.5) * 160}px, ${640 + Math.random() * 90}px) rotate(${Math.random() * 720 - 360}deg)`, opacity: 1, offset: 0.9 },
            { transform: `translate(${x + (Math.random() - 0.5) * 160}px, ${660 + Math.random() * 90}px) rotate(${Math.random() * 720 - 360}deg)`, opacity: 0 },
          ],
          { duration: 1700 + Math.random() * 900, delay: i * 70, easing: 'ease-in' },
        )
        .finished.then(() => g.remove(), () => g.remove()),
    );
  }
  [0, 250, 500, 800].forEach((ms) => at(ms, () => sound.pop()));
  return Promise.all(done);
}
// Floating money over somebody: the tadpole's two ten-yuan notes, or the Crab's two coins.
const wallet = (() => {
  const g = svg('g', {}, front);
  g.style.opacity = '0';
  const holder = svg('g', {}, g);
  return {
    async show(who, kind) {
      holder.replaceChildren();
      if (kind === 'notes') {
        const a = svg('g', { transform: 'translate(-34 0) rotate(-10)' }, holder);
        const b = svg('g', { transform: 'translate(34 -6) rotate(8)' }, holder);
        drawNote(a, 10);
        drawNote(b, 10);
      } else if (kind === 'two') {
        drawCoin(holder, -22, 0, 18);
        drawCoin(holder, 22, 0, 18);
      } else if (kind === 'ten') {
        drawNote(holder, 10);
      }
      const [x, y] = above(who, 60);
      g.style.transform = `translate(${x}px, ${y}px)`;
      sound.chime();
      g.style.opacity = '1';
      await g.animate([{ opacity: 0, transform: `translate(${x}px, ${y + 20}px)` }, { opacity: 1, transform: `translate(${x}px, ${y}px)` }], { duration: 400, easing: 'ease-out' }).finished.catch(() => {});
    },
    hide() {
      g.style.opacity = '0';
    },
  };
})();
// The note the Duck pays the Dragonfly (and, later, the one the tadpole pays the Duck).
const note = mover(front, (g) => drawNote(g, 10), { x: 1272, y: 600 });
note.show(false);

// ---- The Turtle's dream: a rice bowl in a thought bubble ---------------------------------------

const dream = (() => {
  const g = svg('g', {}, front);
  g.style.opacity = '0';
  const bubble = svg('g', {}, g);
  svg('circle', { cx: -28, cy: 40, r: 7, fill: '#fbf8f1', stroke: '#b9ad96', 'stroke-width': 2 }, bubble);
  svg('circle', { cx: -14, cy: 18, r: 11, fill: '#fbf8f1', stroke: '#b9ad96', 'stroke-width': 2 }, bubble);
  svg('ellipse', { cx: 20, cy: -34, rx: 82, ry: 58, fill: '#fbf8f1', stroke: '#b9ad96', 'stroke-width': 3 }, bubble);
  svg('path', { d: 'M-18 -34Q20 4 58 -34Z', fill: '#e8dfc9', stroke: '#5e4630', 'stroke-width': 3, 'stroke-linejoin': 'round' }, bubble);
  svg('path', { d: 'M-12 -34Q20 -64 52 -34Z', fill: '#fff', stroke: '#b9ad96', 'stroke-width': 2 }, bubble);
  svg('path', { d: 'M40 -52L74 -88M52 -48L84 -80', stroke: '#a9812c', 'stroke-width': 4, 'stroke-linecap': 'round' }, bubble);
  return {
    show(on) {
      const [x, y] = turtle.top();
      g.style.transform = `translate(${x + 30}px, ${y - 20}px)`;
      g.style.opacity = on ? '1' : '0';
      if (on) bubble.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }], { duration: 900, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      else bubble.getAnimations().forEach((a) => a.cancel());
    },
  };
})();

// ---- The Frog's lesson board: 买 mǎi (you have money) and 卖 mài (you have the cup) -----------------

const lesson = (() => {
  const g = svg('g', { transform: 'translate(800 236) scale(0.8)' }, props);
  const inner = centred(svg('g', {}, g));
  const panels = [-1, 1].map((s) => {
    const p = svg('g', { transform: `translate(${s * 150} 0)` }, inner);
    const box = svg('rect', { x: -140, y: -112, width: 280, height: 224, rx: 12, fill: '#fbf8f1', stroke: '#8c6b45', 'stroke-width': 4 }, p);
    svg('text', { x: 0, y: -34, 'text-anchor': 'middle', style: 'font: 400 108px "Ma Shan Zheng","Kaiti SC",serif; fill:#1c1b18' }, p).textContent = s < 0 ? '买' : '卖';
    svg('text', { x: 0, y: 4, 'text-anchor': 'middle', style: `${SANS} font-size: 30px; fill:#2f6a5a` }, p).textContent = s < 0 ? 'mǎi' : 'mài';
    // The tone, drawn: 买 dips and rises; 卖 falls.
    svg('path', { d: s < 0 ? 'M-34 18Q-18 50 2 50Q20 50 34 14' : 'M-30 14L30 52', fill: 'none', stroke: '#b3392b', 'stroke-width': 7, 'stroke-linecap': 'round' }, p);
    const item = svg('g', { transform: 'translate(0 90)' }, p);
    return { p, box, item, s };
  });
  const things = panels.map(({ item, s }) => {
    const coin = centred(svg('g', {}, svg('g', { transform: `translate(${s < 0 ? -50 : 50} 0)` }, item)));
    drawCoin(coin, 0, 0, 18);
    const cup = centred(svg('g', {}, svg('g', { transform: `translate(${s < 0 ? 50 : -50} 22) scale(0.5)` }, item)));
    drawCup(cup, 'snow');
    svg('path', { d: s < 0 ? 'M-26 -4H26M14 -14L26 -4L14 6' : 'M26 -4H-26M-14 -14L-26 -4L-14 6', fill: 'none', stroke: '#2f6a5a', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, item);
    coin.style.opacity = '0';
    cup.style.opacity = '0';
    return { coin, cup };
  });
  g.style.opacity = '0';
  return {
    async show() {
      g.style.opacity = '1';
      sound.whoosh();
      await inner.animate([{ transform: 'scale(0.3)', opacity: 0 }, { transform: 'scale(1.06)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 520, easing: 'ease-out', fill: 'forwards' }).finished.catch(() => {});
    },
    async hide() {
      await g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' }).finished.catch(() => {});
    },
    pulse(i) {
      sound.pluck(i ? 392 : 523.25, undefined, 0.5);
      panels[i].box.animate([{ fill: '#fbf8f1' }, { fill: '#ffe9a8', offset: 0.3 }, { fill: '#fbf8f1' }], { duration: 1400 });
    },
    reveal(i, what) {
      sound.pop();
      const el = things[i][what];
      el.animate([{ opacity: 0, transform: 'scale(0.3)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 300, fill: 'forwards' });
    },
    reset() {
      g.getAnimations().forEach((a) => a.cancel());
      inner.getAnimations().forEach((a) => a.cancel());
      g.style.opacity = '0';
      things.forEach(({ coin, cup }) => {
        coin.getAnimations().forEach((a) => a.cancel());
        cup.getAnimations().forEach((a) => a.cancel());
        coin.style.opacity = '0';
        cup.style.opacity = '0';
      });
    },
  };
})();

// ---- The Cat's giant teacup, in the video call ------------------------------------------------------

// Everything in the call window stays inside its circle.
const callClip = svg('clipPath', { id: 'call-clip' }, $('#phone'));
svg('circle', { r: 112 }, callClip);
$('#phone-cat').setAttribute('clip-path', 'url(#call-clip)');
$('#phone-marks').setAttribute('clip-path', 'url(#call-clip)');
const callCup = (() => {
  const g = svg('g', {}, $('#phone-marks'));
  const up = svg('g', { transform: 'translate(0 150)' }, g);
  svg('path', { d: 'M-70 -36Q-102 -34 -100 -6Q-98 18 -64 14', fill: 'none', stroke: '#2b4c7e', 'stroke-width': 10, 'stroke-linecap': 'round' }, up);
  svg('path', { d: 'M-72 -64H72L60 24Q0 38 -60 24Z', fill: '#f6f1e3', stroke: '#2b4c7e', 'stroke-width': 4, 'stroke-linejoin': 'round' }, up);
  svg('path', { d: 'M-66 -34H66M-62 -8H62', stroke: '#2b4c7e', 'stroke-width': 4, opacity: 0.7 }, up);
  svg('ellipse', { cx: 0, cy: -64, rx: 72, ry: 10, fill: '#e3dcc9', stroke: '#2b4c7e', 'stroke-width': 4 }, up);
  const tea = svg('ellipse', { cx: 0, cy: -63, rx: 60, ry: 6, fill: '#b5651d' }, up);
  tea.style.opacity = '0.9';
  return {
    async rise() {
      sound.whoosh();
      await up.animate([{ transform: 'translate(0, 150px)' }, { transform: 'translate(0, 62px)' }], { duration: 900, easing: 'ease-out', fill: 'forwards' }).finished.catch(() => {});
    },
    reset() {
      up.getAnimations().forEach((a) => a.cancel());
      up.style.transform = 'translate(0px, 150px)';
    },
  };
})();

function reset(part) {
  STACK.forEach((a) => actors.append(a.el));
  sun.set(part === 1 ? 'noon' : 'afternoon');
  stall.reset();
  lesson.reset();
  wallet.hide();
  dream.show(false);
  callCup.reset();
  flyCup.show(false);
  Object.values(cups).forEach((c) => {
    c.set({ r: 0 });
    c.show(true);
  });
  fillCup('snow', false);
  fillCup('nut', false);
  fillCup('gold', false);
  note.set({ x: 1272, y: 600, r: 0 });
  note.show(false);
  // Part 1 starts at the tea stall: the red cup is on the table and the shelf has no red cup yet.
  cups.snow.set(part === 1 ? { x: SNOW_START, y: 690 } : { x: CUP_X.snow, y: COUNTER_Y });
  cups.nut.show(true);
  cups.gold.show(true);
  cups.snow.show(true);
  tags.nut.set('28');
  tags.snow.set('？');
  tags.gold.set('100');
  Object.values(tags).forEach((t) => {
    t.g.getAnimations().forEach((a) => a.cancel());
    t.show(part === 2);
  });
  put(cat, [0, 66]);
  $('#phone').style.opacity = '0';
  tadpole.lids.forEach((l) => (l.style.transform = 'scaleY(0)'));
  put(fly, [1800, 120], { visible: false });
  put(frog, [-200, 712], { visible: false, facing: -1 });
  put(duck, [1272, 705], { facing: 1 });
  if (part === 1) {
    put(turtle, [290, 712], { facing: -1, scale: 0.95 });
    put(crab, [450, 716], { facing: -1 });
    put(carp, [1040, 700], { facing: 1 });
    put(tadpole, [1500, 651], { facing: 1, scale: 1.1, visible: false });
  } else {
    put(turtle, [-320, 712], { visible: false, facing: -1, scale: 0.95 });
    put(crab, [640, 716], { facing: -1 });
    put(carp, [830, 700], { facing: -1 });
    put(tadpole, [1010, 651], { facing: -1, scale: 1.1 });
  }
}

// ---- Part 1: the tea stall --------------------------------------------------------------------------

async function partOne() {
  sound.startAmbience();
  const titleEl = $('#title-card');
  await showTitleCard(titleEl, ep.EP.title);
  await say('a_title', null, { subtitles: false, keep: 500 });
  await hideTitleCard(titleEl);

  const stopSteam = steam(stall.spout[0], stall.spout[1]);
  const stopSnore = snoring(turtle);

  // Noon. The tadpole drags itself in, tongue out.
  put(tadpole, [1500, 651], { facing: 1, scale: 1.1 });
  await walkTo(tadpole, [830, 651, 1.1], 2600, { facing: 1 });
  await droop(tadpole);
  look(crab, tadpole.x);
  await say('a_crab_q1', crab);
  await say('a_tad_tea', tadpole);
  look(carp, tadpole.x);
  const poured = stall.pour();
  await say('a_crab_q2', crab);
  await poured;
  await droop(tadpole);
  await say('a_tad_rice', tadpole);

  // Three of them want rice: the Turtle in his sleep, and the Cat on the Carp's phone.
  dream.show(true);
  await say('a_turtle_dream', turtle);
  sound.ring();
  await showCall(true, carp);
  await say('a_cat_rice', cat);
  await showCall(false);
  dream.show(false);
  await hop(carp, 16);

  // The Crab slides the full cup to the tadpole… and in zooms the Dragonfly.
  look(crab, tadpole.x);
  await Promise.all([cups.snow.to({ x: SNOW_START + 36, y: 690 }, 600, { arc: 30 }), hop(crab, 14)]);
  stopSteam();
  await hop(tadpole, 22);
  put(fly, [1800, 110], { facing: 1 });
  sound.whoosh();
  const arrive = walkTo(fly, [SNOW_START + 40, 540, 1], 1200, { facing: 1, style: 'fly' });
  await Promise.all([arrive, say('a_fly_tea', fly)]);
  const hover = flutter(fly);
  // She snatches the cup and drinks the tea in one gulp.
  await cups.snow.to({ x: fly.x - 30, y: fly.y - 30 }, 350, { arc: 20 });
  cups.snow.show(false);
  flyCup.show(true);
  fillCup('snow', false);
  sound.plop();
  const drink = flyCup.gulp();
  burst(fx, fly.x, fly.y - 80, 8);
  puffs(fly.x, fly.y - 90, 6);
  await drink;
  await say('a_fly_bye', fly);
  hover();
  sound.whoosh();
  await fly.moveTo(1750, 100, 900, 'ease-in');
  fly.show(false);
  flyCup.show(false);

  // 杯子！ The whole pond cries over the cup.
  await Promise.all([hop(tadpole, 22), hop(crab, 22), hop(carp, 18), puff(turtle, 1.18), ep.sayAll('a_all_cup', [tadpole, duck, crab, carp, turtle], { keep: 400 })]);
  stopSnore();
  await droop(crab);
  await say('a_crab_cup', crab);

  // The book's second dialogue: what to do this afternoon.
  look(carp, tadpole.x);
  await say('a_carp_q1', carp);
  look(tadpole, carp.x);
  await say('a_tad_shop', tadpole);
  look(crab, 900);
  await say('a_crab_go', crab);

  // 下午: the afternoon sun; everyone walks to the Duck's shop. (Meanwhile, the Dragonfly has been there…)
  const afternoon = sun.to('afternoon', 1800);
  await showTitleCard(titleEl, { zh: '下午', py: 'xià wǔ', it: 'Il pomeriggio' });
  await wait(900);
  hideTitleCard(titleEl);
  await Promise.all([
    walkTo(crab, [640, 716], 2600, { facing: -1 }),
    walkTo(carp, [830, 700], 2600, { facing: -1 }),
    walkTo(tadpole, [1010, 651, 1.1], 2800, { facing: -1 }),
    afternoon,
    dragonflySells(),
  ]);

  // At the shop.
  look(carp, 1272);
  look(duck, tadpole.x);
  await say('a_duck_q', duck);
  look(tadpole, 1272);
  await say('a_tad_buy', tadpole);
  look(carp, CUP_X.nut);
  await hop(carp, 16);
  await say('a_carp_nice', carp);
  await say('a_tad_this', tadpole);
  tags.nut.show(true);
  await Promise.all([tags.nut.flip('28'), say('a_duck_28', duck)]);
  tags.nut.glow();
  await wallet.show(tadpole, 'notes');
  await say('a_tad_20', tadpole);
  await droop(tadpole);
  wallet.hide();
  // The Crab walks up to the counter, points at the little red cup… and goes pale.
  await walkTo(crab, [790, 716], 1300, { facing: -1 });
  tags.snow.show(true);
  tags.gold.show(true);
  await say('a_crab_that', crab);
  mark(crab.x, crab.top()[1] - 20, '！');
  await shake(crab);
  await wait(400);
  await say('a_ask', null, { keep: 300 });
  ep.showQuestion(); // stays up for the class to discuss: A, B or C?
  sound.stopAmbience(2);
  return [];
}

// While the others walk: the Dragonfly sells the Crab's cup to the Duck for ten (a silent scene, then she is gone).
async function dragonflySells() {
  put(fly, [1750, 110], { facing: 1 });
  flyCup.show(true);
  sound.whoosh();
  await walkTo(fly, [1190, 470, 1], 1100, { facing: 1, style: 'fly' });
  fly.face(-1);
  const hover = flutter(fly);
  look(duck, fly.x);
  flyCup.show(false);
  cups.snow.set({ x: fly.x - 30, y: fly.y - 30 });
  cups.snow.show(true);
  await cups.snow.to({ x: CUP_X.snow, y: COUNTER_Y }, 600, { arc: 40 });
  sound.bump();
  tags.snow.show(true);
  await hop(duck, 14);
  note.set({ x: 1272, y: 560 });
  note.show(true);
  sound.chime();
  await note.to({ x: fly.x, y: fly.y - 20 }, 700, { arc: 40 });
  note.show(false);
  hover();
  sound.whoosh();
  await fly.moveTo(1750, 90, 900, 'ease-in');
  fly.show(false);
  await puff(duck, 1.1);
}

// ---- Part 2: comprare o vendere? -------------------------------------------------------------------

async function partTwo() {
  sound.startAmbience();
  await ep.loadName();
  ep.prepareNameClips();
  await wait(900);

  // The Duck turns the tag of the little red cup: diciotto! (八, the lucky number)
  look(duck, tadpole.x);
  await Promise.all([tags.snow.flip('18'), say('b_duck_18', duck)]);
  tags.snow.glow();
  look(crab, CUP_X.snow);
  await shake(crab);
  await say('b_crab_mine', crab);

  // The Dragonfly is back, waving her ten yuan.
  put(fly, [1750, 110], { facing: 1 });
  sound.whoosh();
  await walkTo(fly, [1010, 480, 1], 1300, { facing: 1, style: 'fly' });
  const hover = flutter(fly);
  await Promise.all([wallet.show(fly, 'ten'), say('b_fly_money', fly)]);
  wallet.hide();
  await wallet.show(crab, 'two');
  await say('b_crab_two', crab);
  wallet.hide();
  look(duck, crab.x);
  await puff(duck, 1.12);
  await say('b_duck_price', duck);

  // The tadpole counts its money, takes a deep breath… and says the wrong verb.
  await wallet.show(tadpole, 'notes');
  await hop(tadpole, 30);
  await say('b_tad_sell', tadpole);
  wallet.hide();
  mark(tadpole.x, tadpole.top()[1] - 20, '？');
  look(duck, tadpole.x);
  await puff(duck, 1.2);
  const [dx, dy] = above(duck, 50);
  [dx - 24, dx + 24].forEach((x) => {
    const c = drawCoin(fx, x, dy, 16);
    at(2600, () => c.remove());
  });
  sound.chime();
  await say('b_duck_sell', duck);

  // Everybody wants to buy the cup the tadpole does not have.
  look(carp, tadpole.x);
  await Promise.all([hop(carp, 22), say('b_carp_buy', carp)]);
  await say('b_fly_buy', fly);
  put(turtle, [-320, 712], { facing: -1, scale: 0.95 });
  walkTo(turtle, [330, 712, 0.95], 3200, { facing: -1 });
  await wait(2200);
  await say('b_turtle_buy', turtle);
  const rain = coinRain(36);
  await Promise.all([hop(carp, 22), hop(crab, 22), hop(fly, 18), hop(turtle, 14), ep.sayAll('b_all_buy', [carp, crab, turtle, fly], { keep: 500 })]);
  await rain;
  mark(tadpole.x, tadpole.top()[1] - 20, '？！');

  // The Frog Teacher hops in from the left and sets the tones straight.
  put(frog, [-200, 712], { facing: -1 });
  sound.whoosh();
  await frog.moveTo(150, 560, 450, 'ease-out');
  await frog.moveTo(260, 712, 450, 'ease-in');
  ripple(260, 722);
  sound.plop();
  await frog.moveTo(360, 560, 400, 'ease-out');
  await frog.moveTo(450, 712, 400, 'ease-in');
  ripple(450, 722);
  sound.plop();
  look(frog, tadpole.x);
  await say('b_frog_no', frog);
  await lesson.show();
  const teach = syncWords([
    [0, () => lesson.pulse(0)],
    [3, () => lesson.reveal(0, 'coin')],
    [4, () => lesson.pulse(1)],
    [7, () => lesson.reveal(1, 'cup')],
  ]);
  if (ep.mode === 'live') teach.live();
  await say('b_frog_mm', frog, { onPlay: teach.onPlay });
  look(tadpole, frog.x);
  await hop(tadpole, 26);
  await say('b_tad_fix', tadpole);
  burst(fx, tadpole.x, tadpole.y - 60, 10);
  sound.sparkle();
  await Promise.all([hop(tadpole, 22), hop(duck, 16), hop(crab, 16), hop(carp, 16), hop(turtle, 14), hop(fly, 14), ep.sayAll('b_all_mm', [tadpole, duck, crab, carp, turtle, fly], { keep: 600 })]);
  await lesson.hide();
  // Off hops the Frog.
  frog.face(-1);
  await frog.moveTo(300, 560, 400, 'ease-out');
  await frog.moveTo(-200, 712, 700, 'ease-in');
  frog.show(false);

  // The purchase: 十八块. The tadpole pays twenty and gets two back.
  look(duck, tadpole.x);
  await say('b_duck_ok', duck);
  note.set({ x: tadpole.x, y: tadpole.top()[1] - 30 });
  note.show(true);
  const pay = note.to({ x: 1272, y: 596 }, 700, { arc: 60 });
  await Promise.all([pay, say('b_tad_pay', tadpole)]);
  note.show(false);
  await Promise.all([wallet.show(duck, 'two'), say('b_duck_back', duck)]);
  wallet.hide();
  tags.snow.show(false);
  await cups.snow.to({ x: tadpole.x - 30, y: tadpole.y - 40 }, 900, { arc: 80 });
  sound.chime();
  look(tadpole, crab.x);
  await cups.snow.to({ x: crab.x + 40, y: crab.y - 70 }, 800, { arc: 60 });
  await say('b_tad_give', tadpole);
  await Promise.all([puff(crab, 1.2), say('b_crab_thanks', crab)]);
  burst(fx, crab.x, crab.y - 100, 12);
  sound.sparkle();

  // The Crab brings his stall to the shop and pours: the first tea is for the tadpole. Dusk.
  const dusk = sun.to('dusk', 2600);
  const tableX = 900;
  await Promise.all([walkTo(carp, [560, 700], 1400, { facing: -1 }), stall.carryTo(tableX), walkTo(crab, [780, 716], 1400, { facing: -1 })]);
  const stopSteam = steam(tableX + 22 - 0, stall.spout[1]);
  await cups.snow.to({ x: tableX + 65, y: 690 }, 500, { arc: 20 });
  await stall.pour();
  await dusk;
  await say('b_crab_first', crab);
  await cups.snow.to({ x: tadpole.x - 40, y: tadpole.y - 50 }, 700, { arc: 40 });
  sound.plop();
  await say('b_tad_good', tadpole);
  burst(fx, tadpole.x, tadpole.y - 80, 8);

  // The Turtle arrives last, as always. The tadpole shares its cup.
  await walkTo(turtle, [670, 712, 0.95], 2600, { facing: -1 });
  look(tadpole, turtle.x);
  await say('b_turtle_late', turtle);
  await cups.snow.to({ x: turtle.x + 60, y: turtle.y - 70 }, 800, { arc: 50 });
  await say('b_tad_share', tadpole);
  await Promise.all([lean(turtle), say('b_turtle_thanks', turtle)]);
  stopSteam();
  await Promise.all([hop(tadpole, 22), hop(crab, 22), hop(carp, 20), hop(turtle, 16), hop(duck, 18), ep.sayAll('b_all_cha', [tadpole, duck, crab, carp, turtle, fly], { keep: 600 })]);
  burst(fx, 800, 520, 16);
  sound.sparkle();
  hover();

  // The Cat calls from Beijing… and disappears into a giant cup.
  sound.ring();
  await showCall(true, carp);
  await say('b_cat_hi', cat);
  await say('b_carp_q3', carp);
  await say('b_cat_tea', cat);
  await Promise.all([callCup.rise(), cat.moveTo(0, 122, 900, 'ease-in-out')]);
  await wait(500);
  mark(CALL[0], CALL[1] - 120, '？');
  await say('b_carp_where', carp);
  await wait(500);
  await showCall(false);

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
