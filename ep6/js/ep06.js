// Episode 6 · 今天几号？ (Che giorno è oggi?). Unit 7.
//
// Part 1, "Che giorno è?": it is 11.11 and the Dragonfly arrives under a mountain of parcels (and picks up where
//   Episode 5 ended: 几号？). She asks the Duck 请问，今天几号？ The Duck reads her calendar, stuck on the first of
//   September since September; the Dragonfly sets her straight and the Duck tears off pages in a blizzard. Then the
//   book's second dialogue with the new calendar (昨天…明天呢？), the ticket's date (十二月二号, 星期三), and the late
//   Turtle asking 今天星期几？ Question: today's date.
// Part 2, "La lettera": a letter from the Café Cat in Beijing repeats the dates. 几个星期？ The Frog Teacher: a week
//   has seven days, the class chants them, and the count is three weeks (three Wednesdays). Then the calendar flips
//   back for birthdays (the Frog's, the two thousand baby carp's, the Turtle's "tomorrow", the tadpole's party) and
//   the third dialogue (去学校看书) at the tea stall. A chorus: 十二月二号，我们去北京！
import { createEpisode } from './episode-kit.js';
import { Actor, burst, flutter, hideTitleCard, makeHatchling, showTitleCard, sparkleAt, svg, wait, waddle } from './stage.js';

const $ = (sel) => document.querySelector(sel);
const actors = $('#actors');
const props = $('#props');
const front = $('#front');
const HAN = /\p{Script=Han}/u;

// Everyone who speaks stays within x 210-1390 (visible on a 4:3 projector).
const CALL = [420, 340]; // the video call window
const CAL = { x: 1215, y: 150 }; // the wall calendar: top centre of its page

const duck = new Actor(actors, 'ch-duck', { x: 1272, y: 705, w: 200, h: 218 });
const turtle = new Actor(actors, 'ch-turtle', { x: -320, y: 712, w: 260, h: 200 });
const crab = new Actor(actors, 'ch-crab', { x: 335, y: 716, w: 230, h: 186 });
const carp = new Actor(actors, 'ch-carp', { x: 570, y: 700, w: 300, h: 204, anchor: 'center' });
const tadpole = makeHatchling(actors, { x: 1010, y: 651, w: 240 });
const fly = new Actor(actors, 'ch-dragonfly', { x: 1800, y: 120, w: 190, h: 139 });
const frog = new Actor(actors, 'ch-frog', { x: 1750, y: 712, w: 200, h: 190 });
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
const lean = (a, deg = -8) => a.gesture([{ transform: 'rotate(0)' }, { transform: `rotate(${deg}deg) translateY(4px)`, offset: 0.5 }, { transform: 'rotate(0)' }], { duration: 700, easing: 'ease-in-out' });
const puff = (a, k = 1.14) =>
  a.gesture([{ transform: 'scale(1)' }, { transform: `scale(${k}) rotate(-3deg)`, offset: 0.3 }, { transform: `scale(${k}) rotate(3deg)`, offset: 0.6 }, { transform: 'scale(1)' }], { duration: 700 });
const shake = (a) => a.gesture([{ transform: 'rotate(0)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(7deg)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(0)' }], { duration: 800 });
const droop = (a) => a.gesture([{ transform: 'translateY(0) scale(1, 1)' }, { transform: 'translateY(12px) scale(1.04, 0.9)', offset: 0.5 }, { transform: 'translateY(0) scale(1, 1)' }], { duration: 1000, easing: 'ease-in-out' });
const at = (ms, fn) => wait(Math.max(0, ms)).then(fn);

const ep = await createEpisode({
  id: 'ep06',
  unitPage: '#',
  parts: { 1: partOne, 2: partTwo },
  reset,
  tagSpot: (who) => (who === 'cat' ? [CALL[0] + 190, CALL[1] - 100] : null),
  viewTop: 110,
  extraRoles: { frog: { role: 'frog', it: 'La Maestra Rana', zh: '李月老师' } },
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
    live: () => steps.forEach(([, fn], i) => at(1300 + i * 900, fn)),
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
    r.style.transformBox = 'fill-box';
    r.style.transformOrigin = '50% 50%';
    r.animate([{ transform: 'scale(0.4)', opacity: 0.8 }, { transform: 'scale(5)', opacity: 0 }], { duration: 1300, delay: i * 260, easing: 'ease-out' }).finished.then(
      () => r.remove(),
      () => r.remove(),
    );
  }
}
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
// Two thousand baby carp swim across the whole screen (well, quite a few of them).
function swarm(count = 34) {
  const done = [];
  for (let i = 0; i < count; i++) {
    const g = svg('g', {}, fx);
    svg('use', { href: '#carp-baby', x: -22, y: -12, width: 44, height: 24, transform: 'scale(-1 1)' }, g);
    const s = 1.1 + Math.random() * 1.3;
    const y = 260 + Math.random() * 560;
    const wave = 30 + Math.random() * 40;
    const frames = [];
    for (let k = 0; k <= 6; k++) frames.push({ transform: `translate(${-120 + k * 310}px, ${y + Math.sin(k * 1.3 + i) * wave}px) scale(${s})` });
    done.push(g.animate(frames, { duration: 3400 + Math.random() * 1400, delay: Math.random() * 900, easing: 'linear', fill: 'both' }).finished.then(() => g.remove(), () => g.remove()));
  }
  return Promise.all(done);
}

// ---- The wall calendar: a page with the month, a big day number and the day of the week ---------

const WEEK = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
const calendar = (() => {
  const holder = svg('g', {}, props);
  holder.style.transformBox = 'view-box';
  holder.style.transformOrigin = '0 0';
  holder.style.transform = `translate(${CAL.x}px, ${CAL.y}px)`;
  svg('path', { d: 'M-70 6L0 -44L70 6', stroke: '#8a7a64', 'stroke-width': 4, fill: 'none', 'stroke-linejoin': 'round' }, holder);
  svg('rect', { x: -114, y: 14, width: 236, height: 290, rx: 6, fill: '#e6dec9', stroke: '#b9ad96', 'stroke-width': 2 }, holder);
  svg('rect', { x: -118, y: 8, width: 236, height: 290, rx: 6, fill: '#efe8d6', stroke: '#b9ad96', 'stroke-width': 2 }, holder);
  const page = svg('g', {}, holder);
  page.style.transformBox = 'fill-box';
  page.style.transformOrigin = '50% 0%';
  svg('rect', { x: -120, y: 0, width: 240, height: 290, rx: 6, fill: '#fbf8f1', stroke: '#8c6b45', 'stroke-width': 3 }, page);
  svg('path', { d: 'M-120 6Q-120 0 -114 0H114Q120 0 120 6V72H-120Z', fill: '#b3392b' }, page);
  const font = 'font-family: "Atkinson Hyperlegible Next", sans-serif; font-weight: 700;';
  const month = svg('text', { x: 0, y: 54, 'text-anchor': 'middle', style: `${font} font-size: 48px; fill: #f6e3dc` }, page);
  const day = svg('text', { x: -14, y: 206, 'text-anchor': 'middle', style: `${font} font-size: 130px; fill: #1c1b18` }, page);
  svg('text', { x: 98, y: 206, 'text-anchor': 'middle', style: 'font: 400 38px "Ma Shan Zheng","Kaiti SC",serif; fill: #3a2a18' }, page).textContent = '号';
  const week = svg('text', { x: 0, y: 268, 'text-anchor': 'middle', style: 'font: 400 42px "Ma Shan Zheng","Kaiti SC",serif; fill: #3a2a18' }, page);
  const state = { m: 9, d: 1, w: 3 };
  const draw = ({ m, d, w }) => {
    Object.assign(state, { m, d, w });
    month.textContent = `${m}月`;
    day.textContent = String(d);
    week.textContent = WEEK[w - 1];
  };
  draw(state);
  return {
    get state() {
      return state;
    },
    set(m, d, w) {
      holder.getAnimations().forEach((a) => a.cancel());
      page.getAnimations().forEach((a) => a.cancel());
      draw({ m, d, w });
    },
    // The page squashes flat and comes back with new numbers (a quick flip).
    async flipTo(m, d, w) {
      sound.tap();
      await page.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.03)' }], { duration: 170, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {});
      draw({ m, d, w });
      await page.animate([{ transform: 'scaleY(0.03)' }, { transform: 'scaleY(1)' }], { duration: 220, easing: 'ease-out', fill: 'forwards' }).finished.catch(() => {});
    },
    // Months of pages torn off in a blizzard, the numbers racing to today.
    async tearTo(m, d, w) {
      const n = 46;
      for (let i = 0; i < n; i++) {
        const sheet = svg('rect', { x: CAL.x - 60, y: CAL.y + 10 + Math.random() * 120, width: 60 + Math.random() * 30, height: 70 + Math.random() * 30, fill: '#fbf8f1', stroke: '#b9ad96', 'stroke-width': 2 }, fx);
        sheet.style.transformBox = 'fill-box';
        sheet.style.transformOrigin = '50% 50%';
        const dx = -(160 + Math.random() * 760);
        sheet
          .animate(
            [
              { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
              { transform: `translate(${dx * 0.5}px, ${-120 - Math.random() * 120}px) rotate(${Math.random() * 360 - 180}deg)`, opacity: 1, offset: 0.4 },
              { transform: `translate(${dx}px, ${220 + Math.random() * 360}px) rotate(${Math.random() * 720 - 360}deg)`, opacity: 0 },
            ],
            { duration: 1500 + Math.random() * 900, delay: i * 38, easing: 'ease-out' },
          )
          .finished.then(() => sheet.remove(), () => sheet.remove());
      }
      sound.whoosh();
      const steps = 9;
      for (let k = 1; k <= steps; k++) {
        const t = k / steps;
        draw({ m: Math.round(9 + (m - 9) * t), d: 1 + Math.round(((d - 1) * t) % 28), w: ((k * 3) % 7) + 1 });
        await wait(110);
      }
      draw({ m, d, w });
      sound.chime();
      sparkleAt(fx, CAL.x, CAL.y + 150);
    },
    centre: [CAL.x, CAL.y + 150],
  };
})();

// ---- The counter (the Duck stands behind it), the ticket, parcels, the letter -----------------------

const counter = svg('g', {}, front);
svg('rect', { x: 1150, y: 632, width: 262, height: 22, rx: 5, fill: '#d9b784', stroke: '#5e4630', 'stroke-width': 4 }, counter);
svg('rect', { x: 1162, y: 654, width: 242, height: 66, fill: '#b98a56', stroke: '#5e4630', 'stroke-width': 4 }, counter);
svg('path', { d: 'M1162 676H1404M1162 698H1404', stroke: '#8a6238', 'stroke-width': 2 }, counter);

function frontGroup(x, y) {
  const g = svg('g', {}, front);
  g.style.transformBox = 'fill-box';
  g.style.transformOrigin = '50% 50%';
  g.style.transform = `translate(${x}px, ${y}px)`;
  return g;
}
// One brown parcel with tape and a red 11·11 stamp.
function drawParcel(parent, w = 64, h = 50) {
  svg('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 4, fill: '#c8a06a', stroke: '#7a5a2e', 'stroke-width': 3 }, parent);
  svg('rect', { x: -6, y: -h, width: 12, height: h, fill: '#ead9ad', opacity: 0.9 }, parent);
  svg('rect', { x: w / 2 - 28, y: -h + 8, width: 22, height: 13, rx: 2, fill: '#b3392b' }, parent);
  svg('text', { x: w / 2 - 17, y: -h + 18, 'text-anchor': 'middle', style: 'font: 700 9px "Atkinson Hyperlegible Next",sans-serif; fill:#f6e3dc' }, parent).textContent = '11·11';
}
const parcels = [];
// A parcel flies in an arc from the Dragonfly to the feet of `who`.
async function dropParcel(who) {
  const holder = svg('g', {}, front);
  holder.style.opacity = '0';
  drawParcel(holder);
  parcels.push(holder);
  const [sx, sy] = [fly.x, fly.y - 40];
  const tx = who.x + 62;
  const ty = who === carp ? 765 : 742;
  sound.whoosh();
  holder.style.opacity = '1';
  const a = holder.animate(
    [
      { transform: `translate(${sx}px, ${sy}px) rotate(-20deg)` },
      { transform: `translate(${(sx + tx) / 2}px, ${Math.min(sy, ty) - 130}px) rotate(120deg)`, offset: 0.5 },
      { transform: `translate(${tx}px, ${ty}px) rotate(0deg)` },
    ],
    { duration: 800, easing: 'ease-in', fill: 'forwards' },
  );
  await a.finished.catch(() => {});
  holder.style.transform = `translate(${tx}px, ${ty}px)`;
  a.cancel();
  sound.bump();
  puffs(tx, ty - 20);
}
function puffs(x, y) {
  for (let i = 0; i < 4; i++) {
    const c = svg('circle', { cx: x + (Math.random() - 0.5) * 50, cy: y, r: 7 + Math.random() * 6, fill: '#e9e2d0', opacity: 0.9 }, fx);
    c.style.transformBox = 'fill-box';
    c.style.transformOrigin = '50% 50%';
    c.animate([{ transform: 'translate(0, 0) scale(0.6)', opacity: 0.9 }, { transform: `translate(${(Math.random() - 0.5) * 50}px, -40px) scale(1.8)`, opacity: 0 }], { duration: 700, delay: i * 60, easing: 'ease-out' }).finished.then(
      () => c.remove(),
      () => c.remove(),
    );
  }
}
// The pile on the Dragonfly's back.
const pile = (() => {
  const g = svg('g', {}, fly.pose);
  const boxes = [
    [10, -150, 70, 54, 0],
    [-14, -200, 62, 48, -10],
    [22, -246, 56, 44, 9],
  ].map(([x, y, w, h, r]) => {
    const b = svg('g', { transform: `translate(${x} ${y}) rotate(${r})` }, g);
    drawParcel(b, w, h);
    return b;
  });
  return {
    show(on) {
      g.style.opacity = on ? '1' : '0';
    },
    shrink() {
      boxes.forEach((b, i) => (b.style.opacity = i === 0 ? '1' : '0.0'));
    },
  };
})();

// The tadpole's golden ticket, with its date: 12 · 2.
const ticket = (() => {
  const holder = frontGroup(0, 0);
  const pose = { x: 1010, y: 520, s: 1 };
  const apply = (p = {}) => {
    Object.assign(pose, p);
    holder.style.transform = `translate(${pose.x}px, ${pose.y}px) scale(${pose.s})`;
  };
  svg('rect', { x: -66, y: -40, width: 132, height: 80, rx: 9, fill: '#e9c46a', stroke: '#a9812c', 'stroke-width': 3 }, holder);
  svg('rect', { x: -58, y: -32, width: 116, height: 64, rx: 5, fill: 'none', stroke: '#fbf0c4', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, holder);
  svg('text', { x: -22, y: 6, 'text-anchor': 'middle', style: 'font: 400 32px "Ma Shan Zheng","Kaiti SC",serif; fill:#6b4310' }, holder).textContent = '北京';
  const boat = svg('g', { transform: 'translate(34 -4)' }, holder);
  svg('path', { d: 'M-16 6H16L9 17H-9Z', fill: '#7a4b12' }, boat);
  svg('path', { d: 'M0 -18V4L13 4Z', fill: '#fbf0c4', stroke: '#7a4b12', 'stroke-width': 2, 'stroke-linejoin': 'round' }, boat);
  svg('rect', { x: -56, y: 14, width: 64, height: 20, rx: 4, fill: '#b3392b' }, holder);
  svg('text', { x: -24, y: 29, 'text-anchor': 'middle', style: 'font: 700 15px "Atkinson Hyperlegible Next",sans-serif; fill:#f6e3dc' }, holder).textContent = '12 · 2';
  holder.style.opacity = '0';
  apply();
  return {
    reset() {
      holder.getAnimations().forEach((a) => a.cancel());
      holder.style.opacity = '0';
    },
    show(on) {
      holder.style.opacity = on ? '1' : '0';
    },
    over(who, ms = 600) {
      const x = who.x;
      const y = who.top()[1] - 70;
      holder.style.opacity = '1';
      const a = holder.animate([{ transform: `translate(${pose.x}px, ${pose.y}px) scale(0.2)` }, { transform: `translate(${x}px, ${y}px) scale(1.15)` }], { duration: ms, easing: 'ease-out', fill: 'forwards' });
      a.finished.then(() => {
        apply({ x, y, s: 1.15 });
        a.cancel();
      }, () => {});
      return a.finished.catch(() => {});
    },
    shine() {
      sound.chime();
      sparkleAt(fx, pose.x, pose.y);
    },
  };
})();

// The letter from Beijing: an airmail envelope that flies from the Dragonfly to the tadpole.
const letter = (() => {
  const holder = frontGroup(0, 0);
  holder.style.opacity = '0';
  svg('rect', { x: -48, y: -32, width: 96, height: 64, rx: 4, fill: '#fbf8f1', stroke: '#8c6b45', 'stroke-width': 3 }, holder);
  svg('path', { d: 'M-48 -32L0 6L48 -32', fill: 'none', stroke: '#8c6b45', 'stroke-width': 3, 'stroke-linejoin': 'round' }, holder);
  svg('path', { d: 'M-48 26H-10M-40 14H-22', stroke: '#b3392b', 'stroke-width': 4 }, holder);
  svg('rect', { x: 24, y: 8, width: 18, height: 20, fill: '#2f6a5a' }, holder);
  svg('text', { x: 6, y: 22, 'text-anchor': 'middle', style: 'font: 400 15px "Ma Shan Zheng","Kaiti SC",serif; fill:#3a2a18' }, holder).textContent = '北京';
  return {
    async fly(from, to) {
      holder.style.opacity = '1';
      const a = holder.animate(
        [
          { transform: `translate(${from[0]}px, ${from[1]}px) rotate(-14deg)` },
          { transform: `translate(${(from[0] + to[0]) / 2}px, ${Math.min(from[1], to[1]) - 100}px) rotate(10deg)`, offset: 0.5 },
          { transform: `translate(${to[0]}px, ${to[1]}px) rotate(0deg)` },
        ],
        { duration: 1300, easing: 'ease-in-out', fill: 'forwards' },
      );
      await a.finished.catch(() => {});
    },
    away() {
      holder.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' });
    },
    reset() {
      holder.getAnimations().forEach((a) => a.cancel());
      holder.style.opacity = '0';
    },
  };
})();

// The seven days of the week as seven round tags (the chant lights them one by one), and the three Wednesdays.
const DAYS = [['一', 'yī'], ['二', 'èr'], ['三', 'sān'], ['四', 'sì'], ['五', 'wǔ'], ['六', 'liù'], ['日', 'rì']];
const weekRow = (() => {
  const holder = svg('g', {}, props);
  holder.style.opacity = '0';
  const tags = DAYS.map(([zh, py], k) => {
    const g = svg('g', {}, svg('g', { transform: `translate(${360 + k * 104} 290)` }, holder)); // positioned outside, animated inside
    const disc = svg('circle', { r: 46, fill: '#2f6a5a', stroke: '#f1ecdf', 'stroke-width': 5 }, g);
    svg('text', { 'text-anchor': 'middle', y: 22, style: 'font: 400 62px "Ma Shan Zheng","Kaiti SC",serif; fill:#f1ecdf' }, g).textContent = zh;
    svg('text', { 'text-anchor': 'middle', y: 78, style: 'font: 700 22px "Atkinson Hyperlegible Next",sans-serif; fill:#2f6a5a' }, g).textContent = py;
    g.style.transformBox = 'fill-box';
    g.style.transformOrigin = '50% 50%';
    g.style.opacity = '0';
    return { g, disc };
  });
  return {
    async show() {
      holder.style.opacity = '1';
      await Promise.all(tags.map(({ g }, k) => g.animate([{ opacity: 0, transform: 'scale(0.2)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 300, delay: k * 50, fill: 'forwards' }).finished.catch(() => {})));
    },
    light(k) {
      sound.pluck([293.66, 329.63, 369.99, 440, 493.88, 587.33, 659.25][k], undefined, 0.55);
      tags[k].disc.setAttribute('fill', '#e0a526');
      tags[k].g.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.28)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 480, easing: 'ease-out' });
    },
    async hide() {
      await holder.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' }).finished.catch(() => {});
    },
    reset() {
      holder.getAnimations().forEach((a) => a.cancel());
      tags.forEach(({ g, disc }) => {
        g.getAnimations().forEach((a) => a.cancel());
        g.style.opacity = '0';
        disc.setAttribute('fill', '#2f6a5a');
      });
      holder.style.opacity = '0';
    },
  };
})();
const wednesdays = (() => {
  const holder = svg('g', {}, props);
  const cards = [['11月18号', 430], ['11月25号', 700], ['12月2号', 970]].map(([text, x]) => {
    const g = svg('g', {}, svg('g', { transform: `translate(${x - 90} 215)` }, holder));
    svg('rect', { width: 180, height: 150, rx: 10, fill: '#fbf8f1', stroke: '#8c6b45', 'stroke-width': 4 }, g);
    svg('path', { d: 'M0 10Q0 0 10 0H170Q180 0 180 10V48H0Z', fill: '#b3392b' }, g);
    svg('text', { x: 90, y: 38, 'text-anchor': 'middle', style: 'font: 700 28px "Atkinson Hyperlegible Next",sans-serif; fill:#f6e3dc' }, g).textContent = text;
    svg('text', { x: 90, y: 112, 'text-anchor': 'middle', style: 'font: 400 52px "Ma Shan Zheng","Kaiti SC",serif; fill:#3a2a18' }, g).textContent = '星期三';
    g.style.transformBox = 'fill-box';
    g.style.transformOrigin = '50% 50%';
    g.style.opacity = '0';
    return g;
  });
  return {
    pop(i) {
      sound.chime();
      cards[i].animate([{ opacity: 0, transform: 'translate(0, -40px) scale(0.4)' }, { opacity: 1, transform: 'translate(0, 0) scale(1.12)', offset: 0.6 }, { opacity: 1, transform: 'translate(0, 0) scale(1)' }], { duration: 520, easing: 'ease-out', fill: 'forwards' });
      sparkleAt(fx, [430, 700, 970][i], 290);
    },
    async hide() {
      await Promise.all(cards.map((g) => g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' }).finished.catch(() => {})));
    },
    reset() {
      cards.forEach((g) => {
        g.getAnimations().forEach((a) => a.cancel());
        g.style.opacity = '0';
      });
    },
  };
})();

// The Turtle goes to school to «read»: a book on his face.
const book = (() => {
  const holder = frontGroup(0, 0);
  holder.style.opacity = '0';
  svg('rect', { x: -50, y: -34, width: 100, height: 68, rx: 4, fill: '#2f6a5a', stroke: '#1c1b18', 'stroke-width': 3 }, holder);
  svg('rect', { x: -42, y: -26, width: 84, height: 52, rx: 2, fill: '#fbf8f1' }, holder);
  svg('path', { d: 'M-30 -12H30M-30 0H30M-30 12H14', stroke: '#b9ad96', 'stroke-width': 3 }, holder);
  return {
    async on(who) {
      const x = who.x + (who.facing === -1 ? 52 : -52);
      const y = who.top()[1] + 56;
      holder.style.opacity = '1';
      const a = holder.animate([{ transform: `translate(${x}px, ${y - 140}px) rotate(-40deg)` }, { transform: `translate(${x}px, ${y}px) rotate(-12deg)` }], { duration: 520, easing: 'ease-in', fill: 'forwards' });
      await a.finished.catch(() => {});
      sound.bump();
    },
    reset() {
      holder.getAnimations().forEach((a) => a.cancel());
      holder.style.opacity = '0';
    },
  };
})();

function reset(part) {
  STACK.forEach((a) => actors.append(a.el));
  calendar.set(part === 1 ? 9 : 11, part === 1 ? 1 : 11, 3);
  while (parcels.length) parcels.pop().remove();
  pile.show(false);
  ticket.reset();
  letter.reset();
  weekRow.reset();
  wednesdays.reset();
  book.reset();
  put(cat, [0, 66]);
  $('#phone').style.opacity = '0';
  tadpole.lids.forEach((l) => (l.style.transform = 'scaleY(0)'));
  put(fly, [1800, 120], { visible: false });
  put(frog, [1750, 712], { visible: false, facing: 1 });
  put(crab, [335, 716], { facing: -1 });
  put(carp, [570, 700], { facing: part === 1 ? -1 : 1 });
  put(tadpole, [1010, 651], { facing: -1, scale: 1.1 });
  put(duck, [1272, 705], { facing: 1 });
  put(turtle, part === 1 ? [-320, 712] : [790, 712], { visible: part === 2, facing: -1, scale: 0.95 });
}

// ---- Part 1: 11.11 ---------------------------------------------------------------------------------

async function partOne() {
  sound.startAmbience();
  const titleEl = $('#title-card');
  await showTitleCard(titleEl, ep.EP.title);
  await say('a_title', null, { subtitles: false, keep: 500 });
  await hideTitleCard(titleEl);

  // The Dragonfly arrives with parcels for everyone.
  put(fly, [1800, 110], { facing: 1 });
  pile.show(true);
  sound.whoosh();
  await walkTo(fly, [840, 420, 1], 1600, { facing: 1, style: 'fly' });
  const hover = flutter(fly);
  const delivery = (async () => {
    await wait(900);
    await dropParcel(crab);
    await wait(250);
    await dropParcel(carp);
    await wait(250);
    await dropParcel(tadpole);
    pile.shrink();
  })();
  await say('a_fly_hi', fly);
  await delivery;
  look(carp, fly.x);
  await hop(carp, 16);
  await say('a_carp_thanks', carp);

  // 请问，今天几号？ The Duck reads her calendar: stuck on September.
  hover();
  await walkTo(fly, [990, 575, 1], 1200, { facing: -1, style: 'fly' });
  const hover2 = flutter(fly);
  await say('a_fly_q1', fly);
  look(duck, fly.x);
  await puff(duck, 1.1);
  await say('a_duck_wrong', duck);
  mark(fly.x, fly.top()[1] - 20, '？');
  await shake(fly);
  await say('a_fly_hm', fly);
  await say('a_duck_wed', duck);
  fly.face(-1);
  sparkleAt(fx, fly.x - 60, fly.top()[1] + 40);
  await say('a_fly_no', fly);
  hover2();
  const tear = calendar.tearTo(11, 11, 3);
  await say('a_duck_sorry', duck);
  await tear;

  // The book's second dialogue, with the new calendar.
  look(carp, calendar.centre[0]);
  await say('a_carp_q', carp);
  look(crab, calendar.centre[0]);
  await Promise.all([calendar.flipTo(11, 10, 2), say('a_crab_a1', crab)]);
  await say('a_carp_q2', carp);
  await Promise.all([calendar.flipTo(11, 12, 4), say('a_crab_a2', crab)]);

  // The ticket's date, on the calendar too.
  calendar.flipTo(11, 11, 3);
  look(tadpole, 1272);
  ticket.over(tadpole);
  await hop(tadpole, 28);
  await say('a_tad_ticket', tadpole);
  const date = calendar.flipTo(12, 2, 3);
  ticket.shine();
  await say('a_duck_ticket', duck);
  await date;

  // The Turtle is late, as always.
  put(turtle, [-320, 712], { facing: -1, scale: 0.95 });
  walkTo(turtle, [790, 712, 0.95], 3600, { facing: -1 });
  calendar.flipTo(11, 11, 3);
  await wait(2800);
  await say('a_turtle_q', turtle);
  await ep.sayAll('a_all_wed', ALL, { keep: 600 });
  await puff(turtle, 1.2);
  mark(turtle.x, turtle.y - 230, '！');
  await wait(400);
  await say('a_ask', null, { keep: 300 });
  ep.showQuestion(); // stays up for the class to discuss: A, B or C?
  sound.stopAmbience(2);
  return [];
}

// ---- Part 2: the letter, the weeks, the birthdays ---------------------------------------------------

async function partTwo() {
  sound.startAmbience();
  await ep.loadName();
  ep.prepareNameClips();
  await wait(900);

  // The letter from Beijing.
  put(fly, [1800, 110], { facing: 1 });
  sound.whoosh();
  await walkTo(fly, [880, 400, 1], 1500, { facing: 1, style: 'fly' });
  const hover = flutter(fly);
  const post = letter.fly([fly.x, fly.y - 40], [tadpole.x, tadpole.top()[1] - 60]);
  await say('b_fly_post', fly);
  await post;
  await hop(tadpole, 26);
  letter.away();
  hover();
  await fly.moveTo(1500, 90, 800, 'ease-in');
  fly.show(false);
  await showCall(true, tadpole);
  await say('b_cat_hi', cat);
  await say('b_cat_a', cat);
  await say('b_cat_b', cat);
  const flip = calendar.flipTo(12, 2, 3);
  ticket.over(tadpole);
  await flip;
  await say('b_cat_c', cat);
  await showCall(false);
  ticket.show(false);
  calendar.flipTo(11, 11, 3);

  // How many weeks? The Frog Teacher hops in: a week has seven days.
  await hop(tadpole, 20);
  await say('b_tad_how', tadpole);
  put(frog, [1750, 712], { facing: 1 });
  sound.whoosh();
  await frog.moveTo(1450, 560, 450, 'ease-out');
  await frog.moveTo(1300, 712, 450, 'ease-in');
  ripple(1300, 722);
  sound.plop();
  await frog.moveTo(1130, 560, 400, 'ease-out');
  await frog.moveTo(1090, 712, 400, 'ease-in');
  ripple(1090, 722);
  sound.plop();
  look(frog, tadpole.x);
  await say('b_frog_come', frog);
  await weekRow.show();
  const chant = syncWords(DAYS.map((_, k) => [k * 3, () => (weekRow.light(k), hop(tadpole, 22))]));
  if (ep.mode === 'live') chant.live();
  await ep.sayAll('b_all_week', ALL, { keep: 600, onPlay: chant.onPlay });

  // Three Wednesdays.
  await weekRow.hide();
  const count = syncWords([[0, () => wednesdays.pop(0)], [1, () => wednesdays.pop(1)], [2, () => wednesdays.pop(2)]]);
  if (ep.mode === 'live') count.live();
  await say('b_frog_three', frog, { onPlay: count.onPlay });
  await droop(tadpole);
  await say('b_tad_three', tadpole);
  await wednesdays.hide();

  // Birthdays: the calendar flips back through the year.
  look(tadpole, frog.x);
  await say('b_tad_bq', tadpole);
  await calendar.flipTo(8, 31, 1);
  await say('b_frog_bday', frog);
  const crowd = swarm();
  await say('b_carp_bday', carp);
  await crowd;
  look(duck, turtle.x);
  look(turtle, duck.x);
  await say('b_duck_bq', duck);
  await calendar.flipTo(11, 12, 4);
  await say('b_turtle_bday', turtle);
  await Promise.all([hop(crab, 20), say('b_crab_yday', crab)]);
  await calendar.flipTo(10, 28, 3);
  burst(fx, tadpole.x, tadpole.y - 60, 12);
  for (let i = 0; i < 20; i++) sparkleAt(fx, 300 + Math.random() * 1000, 200 + Math.random() * 300);
  await hop(tadpole, 30);
  await say('b_tad_bday', tadpole);

  // The third dialogue, at the tea stall: 去 + school + read.
  await calendar.flipTo(11, 12, 4);
  look(crab, turtle.x);
  await say('b_crab_q3', crab);
  await say('b_turtle_a3', turtle);
  await say('b_crab_q4', crab);
  const stopSnore = snoring(turtle);
  await book.on(turtle);
  await say('b_turtle_a4', turtle);
  await ep.sayAll('b_all_read', ALL, { keep: 600 });
  stopSnore();

  // Back to Beijing: the Cat says goodbye, and everyone sets the date.
  await calendar.flipTo(12, 2, 3);
  await showCall(true, tadpole);
  await say('b_cat_bye', cat);
  await showCall(false);
  ticket.over(tadpole);
  await Promise.all([hop(crab, 22), hop(carp, 22), hop(turtle, 22), hop(duck, 22), hop(frog, 22), ep.sayAll('b_all_go', ALL, { keep: 600 })]);
  burst(fx, 800, 500, 16);
  sound.sparkle();
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
