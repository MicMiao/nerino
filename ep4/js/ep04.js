// Episode 4 · 你多大了？ (Quanti anni hai?). Unit 5.
//
// Part 1, "Chi ha un anno?": the Dragonfly delivers a giant cake, lifted by balloons, with a card that
//   says 一岁 (one year old). The Duck wants to know who it is for, so she asks everybody's age
//   (你今年多大了？) and stamps a big red 不 on every answer: the Dragonfly (3), the Crab (20), Auntie
//   Carp's daughter (20), the Cat (10), the Duck herself (23)... The Turtle Teacher turns up late, and
//   she asks him 你几岁了？ ("how old are you", the way you ask a small child). He is offended. The
//   Frog Teacher shows the polite way (您今年多大年纪了？) and he proudly says 99. Auntie Carp gossips
//   about the teacher's age (the book's dialogue: 五十, daughter 二十) and the teacher corrects her: 四十九!
//   The only one left is the tadpole, who says it is four (a sentence from the book). Question: 小蝌蚪今年几岁了？
// Part 2, the party: the Café Cat calls from Beijing: "you are one this year". Surprise party! The Frog
//   Teacher asks 你家有几口人？ and the whole class counts itself, one number each (一 to 七), and the tadpole
//   adds itself: 八口人. Auntie Carp boasts 两千口人 (and two thousand baby carp swim through), the Turtle lives
//   alone (一口人). Candle, 一二三, and the tadpole grows its back legs: 你大了！ The Cat adds: your family
//   is in Beijing, and there are two thousand of them...
import { createEpisode } from './episode-kit.js';
import { Actor, burst, flutter, hideTitleCard, makeHatchling, showTitleCard, sparkleAt, stampSeal, svg, wait, waddle } from './stage.js';

const $ = (sel) => document.querySelector(sel);
const actors = $('#actors');

// Everyone who speaks stays within x 210-1390 (visible on a 4:3 projector). The page shows the scene from
// y 110 down, so the pond sits above the subtitle panel at the bottom of the screen.
const TABLE = [1260, 606]; // the cake stands here
const CALL = [420, 340]; // the video call to Beijing
const OFF = { left: [-320, 705], right: [1900, 705] };

const duck = new Actor(actors, 'ch-duck', { x: 1000, y: 705, w: 200, h: 218 });
const turtle = new Actor(actors, 'ch-turtle', { x: OFF.left[0], y: 705, w: 260, h: 200 });
const crab = new Actor(actors, 'ch-crab', { x: 320, y: 716, w: 230, h: 186 });
const carp = new Actor(actors, 'ch-carp', { x: 590, y: 700, w: 300, h: 204, anchor: 'center' });
const tadpole = makeHatchling(actors, { x: 860, y: 650, w: 240 });
const fly = new Actor(actors, 'ch-dragonfly', { x: 1800, y: 120, w: 190, h: 139 });
const frog = new Actor(actors, 'ch-frog', { x: 1110, y: 712, w: 200, h: 190 });
const cat = new Actor($('#phone-cat'), 'ch-cat', { x: 0, y: 66, w: 190, h: 150 });
$('#phone').setAttribute('transform', `translate(${CALL[0]} ${CALL[1]})`);
const ALL = [tadpole, duck, crab, carp, turtle, fly, cat];

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

const ep = await createEpisode({
  id: 'ep04',
  unitPage: '#',
  parts: { 1: partOne, 2: partTwo },
  reset,
  // The Cat talks from the video call: its tag goes beside the call window.
  tagSpot: (who) => (who === 'cat' ? [CALL[0] + 190, CALL[1] - 100] : null),
  viewTop: 110,
  extraRoles: { frog: { role: 'frog', it: 'La Maestra Rana', zh: '李月老师' } },
});
ep.stage = { duck, turtle, crab, carp, tadpole, dragonfly: fly, cat, frog };

// Everyone stands close together, so whoever speaks steps to the front: nobody talks from behind a neighbour.
const STACK = [duck, turtle, crab, carp, tadpole, fly, frog];
const say = (id, who, opts) => {
  if (who && who !== cat) actors.append(who.el);
  return ep.say(id, who, opts);
};
const { sound, fx } = ep;

// ---- The cake ---------------------------------------------------------------------------------
// A big pink cake with one candle, a card that says 一岁, and a bunch of balloons tied to it.

const cake = (() => {
  const holder = svg('g', { class: 'actor' }, $('#cake-layer'));
  holder.style.transformBox = 'view-box';
  holder.style.transformOrigin = '0 0';
  const pos = { x: TABLE[0], y: TABLE[1], sx: 1, sy: 1 };
  const apply = (p = {}) => {
    Object.assign(pos, p);
    holder.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${pos.sx}, ${pos.sy})`;
  };

  const balloons = svg('g', {}, holder);
  const bunch = [
    [-72, -330, '#b3392b'],
    [-8, -372, '#e9c46a'],
    [58, -336, '#2f6a5a'],
    [-124, -288, '#f2c2cd'],
    [112, -296, '#7aa6c2'],
  ].map(([dx, dy, color]) => {
    const g = svg('g', {}, balloons);
    svg('path', { d: `M0 -134C${dx * 0.3} -190 ${dx * 0.6} ${dy + 130} ${dx} ${dy + 52}`, fill: 'none', stroke: '#8a8478', 'stroke-width': 2 }, g);
    const b = svg('g', { transform: `translate(${dx} ${dy})` }, g);
    svg('ellipse', { rx: 34, ry: 42, fill: color, stroke: '#1c1b18', 'stroke-opacity': 0.25, 'stroke-width': 2 }, b);
    svg('ellipse', { cx: -11, cy: -16, rx: 7, ry: 11, fill: '#fff', opacity: 0.45 }, b);
    svg('path', { d: 'M-6 42L0 53L6 42Z', fill: color }, b);
    return g;
  });

  const body = svg('g', {}, holder);
  svg('ellipse', { cx: 0, cy: -3, rx: 122, ry: 17, fill: '#fbf8f1', stroke: '#b9ad96', 'stroke-width': 3 }, body);
  svg('rect', { x: -96, y: -66, width: 192, height: 62, rx: 14, fill: '#f2c2cd', stroke: '#d9788f', 'stroke-width': 3 }, body);
  svg('path', { d: 'M-96 -66q12 22 24 0q12 22 24 0q12 22 24 0q12 22 24 0q12 22 24 0q12 22 24 0q12 22 24 0q12 22 24 0', fill: '#fff', stroke: '#e6d9dc', 'stroke-width': 2 }, body);
  svg('rect', { x: -64, y: -114, width: 128, height: 50, rx: 12, fill: '#fdfbf6', stroke: '#d6cebb', 'stroke-width': 3 }, body);
  svg('rect', { x: -64, y: -90, width: 128, height: 10, fill: '#e9a1b3' }, body);
  [-46, -14, 18, 48].forEach((x) => {
    svg('circle', { cx: x, cy: -118, r: 9, fill: '#c8372d', stroke: '#8f2a22', 'stroke-width': 1.5 }, body);
    svg('path', { d: `M${x - 5} -126l5 -5l5 5`, fill: '#4f8a58' }, body);
  });
  // The card in front: 一岁.
  const card = svg('g', {}, body);
  svg('rect', { x: -50, y: -56, width: 100, height: 42, rx: 8, fill: '#fbf8f1', stroke: '#b9ad96', 'stroke-width': 2.5 }, card);
  svg('text', { x: 0, y: -24, 'text-anchor': 'middle', style: 'font: 400 38px "Ma Shan Zheng","Kaiti SC",serif; fill:#b3392b' }, card).textContent = '一岁';
  // One candle with a flame.
  svg('rect', { x: -5, y: -152, width: 10, height: 38, rx: 3, fill: '#e9c46a', stroke: '#c9a24a', 'stroke-width': 1.5 }, body);
  svg('path', { d: 'M-5 -142l10 -6M-5 -132l10 -6M-5 -122l10 -6', stroke: '#fbf8f1', 'stroke-width': 2.5 }, body);
  const flame = svg('g', { transform: 'translate(0 -156)' }, body);
  const flameShape = svg('g', {}, flame);
  svg('path', { d: 'M0 -26C12 -10 10 4 0 4C-10 4 -12 -10 0 -26Z', fill: '#f4a259' }, flameShape);
  svg('path', { d: 'M0 -14C6 -6 5 2 0 2C-5 2 -6 -6 0 -14Z', fill: '#ffe9a8' }, flameShape);
  flameShape.style.transformBox = 'fill-box';
  flameShape.style.transformOrigin = '50% 100%';
  flame.style.opacity = '0';

  apply();
  return {
    holder,
    apply,
    show(on) {
      holder.style.opacity = on ? '1' : '0';
    },
    balloons(on) {
      balloons.style.opacity = on ? '1' : '0';
    },
    // Balloons bob in the air.
    bob() {
      bunch.forEach((g, i) =>
        g.animate([{ transform: 'translateY(-7px)' }, { transform: 'translateY(7px)' }], { duration: 1500 + i * 220, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: i * 140 }),
      );
    },
    reset() {
      flame.style.opacity = '0';
      flameShape.getAnimations().forEach((a) => a.cancel());
      body.getAnimations().forEach((a) => a.cancel());
      bunch.forEach((g) => g.getAnimations().forEach((a) => a.cancel()));
      apply({ x: TABLE[0], y: TABLE[1], sx: 1, sy: 1 });
    },
    // The cake comes in from the top right, carried by its balloons, and lands on the table.
    async arrive(ms = 2600) {
      const from = { x: 1800, y: -10, sx: 1, sy: 1 };
      apply(from);
      const anim = holder.animate(
        [{ transform: `translate(${from.x}px, ${from.y}px)` }, { transform: `translate(${TABLE[0]}px, ${TABLE[1]}px)` }],
        { duration: ms, easing: 'ease-in-out', fill: 'forwards' },
      );
      await anim.finished.catch(() => {});
      apply({ x: TABLE[0], y: TABLE[1] });
      anim.cancel();
      // landing: a small squash
      const land = holder.animate(
        [{ transform: `translate(${TABLE[0]}px, ${TABLE[1]}px) scale(1, 1)` }, { transform: `translate(${TABLE[0]}px, ${TABLE[1]}px) scale(1.06, 0.9)`, offset: 0.35 }, { transform: `translate(${TABLE[0]}px, ${TABLE[1]}px) scale(1, 1)` }],
        { duration: 420, easing: 'ease-out' },
      );
      await land.finished.catch(() => {});
    },
    light() {
      flame.style.opacity = '1';
      flameShape.animate([{ transform: 'scale(1, 1) rotate(-3deg)' }, { transform: 'scale(1.08, 1.18) rotate(3deg)' }], { duration: 160, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    },
    // The flame goes out in a puff of smoke.
    blow() {
      flameShape.getAnimations().forEach((a) => a.cancel());
      flame.style.opacity = '0';
      for (let i = 0; i < 4; i++) {
        const smoke = svg('circle', { cx: pos.x + (i - 1.5) * 6, cy: pos.y - 160, r: 8 + i * 2, fill: '#b9b2a2', opacity: 0.6 }, fx);
        smoke.style.transformBox = 'fill-box'; // grow in place, not around the corner of the scene
        smoke.style.transformOrigin = '50% 50%';
        smoke.animate([{ transform: 'translate(0, 0) scale(0.6)', opacity: 0.7 }, { transform: `translate(${(i - 1.5) * 16}px, -${60 + i * 20}px) scale(2)`, opacity: 0 }], { duration: 1500 + i * 150, easing: 'ease-out', delay: i * 80 }).finished.then(
          () => smoke.remove(),
          () => smoke.remove(),
        );
      }
    },
  };
})();

// ---- Party decorations: bunting and confetti -----------------------------------------------------

const party = (() => {
  const layer = $('#party-layer');
  return {
    reset() {
      layer.replaceChildren();
    },
    // A string of flags across the top, dropping in with a bounce.
    bunting() {
      const g = svg('g', {}, layer);
      const colors = ['#b3392b', '#e9c46a', '#2f6a5a', '#f2c2cd', '#7aa6c2'];
      const [x0, x1, y, sag] = [240, 1360, 128, 40]; // high and flat: clear of the call window's caption
      svg('path', { d: `M${x0} ${y}Q${(x0 + x1) / 2} ${y + 2 * sag} ${x1} ${y}`, fill: 'none', stroke: '#8a7a64', 'stroke-width': 3 }, g);
      for (let i = 0; i <= 14; i++) {
        const t = i / 14;
        const px = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * ((x0 + x1) / 2) + t ** 2 * x1;
        const py = (1 - t) ** 2 * y + 2 * (1 - t) * t * (y + 2 * sag) + t ** 2 * y;
        svg('path', { d: `M${px - 21} ${py - 2}L${px + 21} ${py - 2}L${px} ${py + 42}Z`, fill: colors[i % colors.length], stroke: '#1c1b18', 'stroke-opacity': 0.2, 'stroke-width': 2 }, g);
      }
      g.animate([{ transform: 'translateY(-260px)' }, { transform: 'translateY(0)' }], { duration: 1000, easing: 'cubic-bezier(.3,1.5,.5,1)' });
    },
    confetti(count = 70) {
      const colors = ['#b3392b', '#2f6a5a', '#e9c46a', '#f2c2cd', '#7aa6c2'];
      for (let i = 0; i < count; i++) {
        const size = 8 + Math.random() * 9;
        const piece = Math.random() < 0.5 ? svg('rect', { x: -size / 2, y: -size / 4, width: size, height: size / 2, fill: colors[i % 5] }, fx) : svg('circle', { r: size / 3, fill: colors[i % 5] }, fx);
        piece.style.transformBox = 'fill-box';
        piece.style.transformOrigin = '50% 50%';
        const x = 230 + Math.random() * 1140;
        const drift = (Math.random() - 0.5) * 220;
        piece
          .animate(
            [
              { transform: `translate(${x}px, 120px) rotate(0deg)`, opacity: 1 },
              { transform: `translate(${x + drift}px, 860px) rotate(${Math.random() * 900 - 450}deg)`, opacity: 1 },
            ],
            { duration: 2400 + Math.random() * 2200, delay: Math.random() * 800, easing: 'ease-in' },
          )
          .finished.then(
            () => piece.remove(),
            () => piece.remove(),
          );
      }
    },
  };
})();

// ---- Small stage business ----------------------------------------------------------------------

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

// The video call: a window onto the Café Cat in Beijing, linked to Auntie Carp's phone.
function showCall(on) {
  const [cx, cy] = CALL;
  const px = carp.x + (carp.facing === -1 ? 0.16 : -0.16) * carp.w * carp.scale;
  const py = carp.y - 0.14 * carp.h * carp.scale;
  $('#phone-signal').setAttribute('d', `M0 124C60 210 ${px - cx - 70} ${(py - cy) * 0.62} ${px - cx} ${py - cy - 20}`);
  return $('#phone').animate([{ opacity: on ? 0 : 1 }, { opacity: on ? 1 : 0 }], { duration: 450, fill: 'forwards' }).finished;
}

// Where something floats above this actor (the Cat floats above its call window).
function above(actor, lift = 50) {
  if (actor === cat) return [CALL[0] + 150, CALL[1] - 70];
  const [x, y] = actor.top();
  return [Math.max(260, Math.min(1340, x)), Math.max(190, y - lift)];
}

// A round tag with a number in digits, so the age is easy to see: "20", "99"... It sits left of the speaker's
// centre and the stamp right of it, so a pair is as wide as one character.
const TAG_SHIFT = 36;
function ageTag(actor, n, lift = 64) {
  const [x, y] = above(actor, lift);
  const holder = svg('g', { transform: `translate(${x - TAG_SHIFT} ${y})` }, fx);
  const g = svg('g', {}, holder);
  svg('circle', { r: 34, fill: '#fbf8f1', stroke: '#2f6a5a', 'stroke-width': 5 }, g);
  const t = svg('text', { class: 'age-num', 'text-anchor': 'middle', y: 14 }, g);
  t.textContent = String(n);
  g.style.transformBox = 'fill-box';
  g.style.transformOrigin = '50% 50%';
  g.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.2)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
  return { holder, set: (v) => (t.textContent = String(v)), shake: () => g.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(0)' }], { duration: 500 }) };
}

// The Duck's big red 不 beside an answer (beside, so the number stays readable).
function stampOn(actor, lift = 64) {
  const [x, y] = above(actor, lift);
  sound.stamp();
  return stampSeal(fx, 'seal-bu', x + TAG_SHIFT, y - 4, 66);
}

// A number in the counting round: the character, with its pinyin, in a green badge above the speaker.
const NOTES = [293.66, 329.63, 369.99, 440, 493.88, 587.33, 659.25, 739.99];
function badge(actor, char, py, index) {
  const [x, y] = above(actor, 90);
  const holder = svg('g', { transform: `translate(${x} ${y})` }, fx);
  const g = svg('g', {}, holder);
  svg('circle', { r: 46, fill: '#2f6a5a', stroke: '#f1ecdf', 'stroke-width': 5 }, g);
  svg('text', { 'text-anchor': 'middle', y: 24, style: 'font: 400 66px "Ma Shan Zheng","Kaiti SC",serif; fill:#f1ecdf' }, g).textContent = char;
  svg('text', { class: 'badge-py', 'text-anchor': 'middle', y: 78 }, g).textContent = py;
  g.style.transformBox = 'fill-box';
  g.style.transformOrigin = '50% 50%';
  g.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.25)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 400, easing: 'ease-out' });
  sound.pluck(NOTES[index % NOTES.length], undefined, 0.55);
  return holder;
}

// Water rings where the Frog lands.
function ripple(x, y) {
  for (let i = 0; i < 2; i++) {
    const r = svg('ellipse', { cx: x, cy: y, rx: 20, ry: 6, fill: 'none', stroke: '#8fa89b', 'stroke-width': 4 }, fx);
    r.animate([{ transform: 'scale(0.4)', opacity: 0.8 }, { transform: 'scale(5)', opacity: 0 }], { duration: 1300, delay: i * 260, easing: 'ease-out' }).finished.then(
      () => r.remove(),
      () => r.remove(),
    );
    r.style.transformBox = 'fill-box';
    r.style.transformOrigin = '50% 50%';
  }
}

// Two thousand baby carp swim across the whole screen (well, quite a few of them).
function swarm(count = 44) {
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

// The tadpole's new back legs: two little legs under the body.
function growLegs() {
  tadpole.setSymbol('tp-legs2');
  tadpole.use.setAttribute('height', String((tadpole.w * 150) / 220));
}
function loseLegs() {
  tadpole.setSymbol('tp-hatch');
  tadpole.use.setAttribute('height', String(tadpole.h));
}

// A party hat on the tadpole's head (it rides along when the tadpole moves).
const hat = (() => {
  const g = svg('g', { transform: 'translate(-48 -26) rotate(-14)' }, tadpole.talkG);
  svg('path', { d: 'M-28 0L0 -66L28 0Z', fill: '#e9c46a', stroke: '#c9a24a', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
  svg('path', { d: 'M-18 -22l36 0M-9 -44l18 0', stroke: '#b3392b', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
  svg('circle', { cx: 0, cy: -68, r: 9, fill: '#b3392b' }, g);
  g.style.opacity = '0';
  return { show: (on) => (g.style.opacity = on ? '1' : '0') };
})();

function reset(part) {
  STACK.forEach((a) => actors.append(a.el));
  loseLegs();
  hat.show(false);
  party.reset();
  cake.reset();
  cake.show(part === 2);
  cake.balloons(part === 2);
  if (part === 2) cake.bob();
  put(cat, [0, 66]);
  $('#phone').style.opacity = '0';
  tadpole.lids.forEach((l) => (l.style.transform = 'scaleY(0)'));
  put(fly, [1800, 120], { visible: false });
  put(frog, [1110, 712], { visible: false });
  if (part === 1) {
    put(duck, [1000, 705], { facing: -1 });
    put(crab, [320, 716], { facing: -1 });
    put(carp, [590, 700], { facing: -1 });
    put(tadpole, [860, 650], { facing: -1 });
    put(turtle, OFF.left, { visible: false, facing: -1 });
  } else {
    placeAt(crab, [310, 716, 0.9], -1);
    placeAt(turtle, [470, 712, 0.92], -1);
    placeAt(carp, [610, 790, 0.92], -1);
    placeAt(frog, [790, 712, 1], 1);
    placeAt(duck, [950, 705, 0.95], -1);
    placeAt(tadpole, [1090, 720, 0.9], -1); // the birthday star stands by the cake: nobody hides its new legs
  }
}

// ---- Part 1: who is one year old? ----------------------------------------------------------------

async function partOne() {
  sound.startAmbience();
  const titleEl = $('#title-card');
  await showTitleCard(titleEl, ep.EP.title);
  await say('a_title', null, { subtitles: false, keep: 500 });
  await hideTitleCard(titleEl);

  // The Dragonfly brings a giant cake, lifted by balloons.
  put(fly, [1800, 100], { facing: 1 });
  sound.whoosh();
  cake.show(true);
  cake.balloons(true);
  cake.bob();
  await Promise.all([walkTo(fly, [1130, 300, 1], 2500, { facing: -1, style: 'fly' }), cake.arrive(2600)]);
  const hover = flutter(fly);
  sound.chime();
  sparkleAt(fx, TABLE[0], TABLE[1] - 140);
  await say('a_fly_hi', fly, { keep: 200 });

  // The Duck reads the card: 一岁. Who is one year old?
  look(duck, TABLE[0]);
  await lean(duck, -6);
  await say('a_duck_card', duck);

  // Everybody's age, one by one. First the Dragonfly, before she dashes off.
  await say('a_duck_howold', duck);
  await say('a_fly_age', fly);
  const tagFly = ageTag(fly, 3);
  await wait(500);
  const flyStamp = stampOn(fly);
  await say('a_duck_no', duck, { keep: 200 });
  sound.whoosh();
  await Promise.all([say('a_fly_bye', fly, { keep: 0 }), fly.moveTo(1900, 80, 1300, 'ease-in')]);
  hover();
  fly.show(false);
  tagFly.holder.remove();
  flyStamp.remove();

  // The Crab: twenty, and very proud of it.
  await walkTo(duck, [470, 705, 1], 1700, { facing: 1 });
  await say('a_duck_howold', duck);
  await puff(crab, 1.1);
  await say('a_crab_age', crab);
  ageTag(crab, 20);
  await wait(400);
  stampOn(crab);
  await say('a_duck_no', duck, { keep: 200 });

  // Auntie Carp: she answers for her daughter. Then she calls the Cat.
  await walkTo(duck, [700, 705, 1], 1300, { facing: 1 });
  await say('a_duck_carp', duck);
  await say('a_carp_daughter', carp);
  ageTag(carp, 20);
  await wait(400);
  stampOn(carp);
  await say('a_duck_no', duck, { keep: 200 });
  sound.ring();
  await carp.gesture([{ transform: 'rotate(0)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(0)' }], { duration: 600 });
  await say('a_carp_cat', carp, { keep: 150 });
  await showCall(true);
  await say('a_cat_age', cat);
  ageTag(cat, 10);
  await wait(400);
  stampOn(cat);
  await say('a_duck_no', duck, { keep: 200 });
  await showCall(false);

  // The Turtle Teacher, late as always. The Duck asks him the way you ask a small child.
  turtle.show();
  walkTo(turtle, [470, 712, 0.92], 4200, { facing: -1 });
  await wait(2600);
  look(duck, 470);
  await say('a_turtle_sorry', turtle);
  await say('a_duck_turtle', duck);
  await puff(turtle, 1.22);
  burst(fx, turtle.x, turtle.y - 150, 6); // steam
  await say('a_turtle_kid', turtle);
  // The Crab tries the friendly way.
  await say('a_crab_howold', crab);
  await shake(turtle);
  await say('a_turtle_classmate', turtle);

  // The Frog Teacher hops in and shows the polite way.
  put(frog, [1750, 712], { facing: 1 });
  sound.whoosh();
  await frog.moveTo(1500, 560, 450, 'ease-out');
  await frog.moveTo(1300, 712, 450, 'ease-in');
  ripple(1300, 722);
  sound.plop();
  await frog.moveTo(1190, 560, 400, 'ease-out');
  await frog.moveTo(1110, 712, 400, 'ease-in');
  ripple(1110, 722);
  sound.plop();
  await say('a_frog_polite', frog);
  await say('a_duck_polite', duck);
  await say('a_turtle_99', turtle);
  const tag99 = ageTag(turtle, 99, 124); // his own row: the punchline
  await ep.sayAll('a_all_99', ALL, { keep: 500 });
  await wait(300);
  stampOn(turtle, 124);
  await say('a_duck_no', duck, { keep: 200 });

  // Gossip: how old is the teacher? Auntie Carp knows. (She says it loud enough for the teacher to hear.)
  await say('a_crab_frog', crab);
  await say('a_carp_frog', carp, { keep: 150 });
  const tagFrog = ageTag(frog, 50);
  await shake(frog);
  await say('a_frog_hey', frog, { keep: 100 });
  tagFrog.set(49);
  tagFrog.shake();
  await wait(700);

  // Only the Duck and the tadpole are left. The Crab turns it around: and you?
  await say('a_crab_ne', crab);
  await lean(duck, -8);
  await say('a_duck_age', duck);
  ageTag(duck, 23);
  await wait(400);
  stampOn(duck);
  await say('a_duck_no', duck, { keep: 200 });
  await walkTo(duck, [740, 705, 1], 1200, { facing: -1 });
  look(duck, tadpole.x);
  await say('a_duck_ne', duck);
  await hop(tadpole, 22);
  await say('a_tad_four', tadpole);
  ageTag(tadpole, 4);
  await wait(400);
  stampOn(tadpole);
  await say('a_duck_no', duck, { keep: 200 });

  tag99.holder.remove();
  mark(tadpole.x, tadpole.y - 120);
  await wait(500);
  await say('a_ask', null, { keep: 300 });
  ep.showQuestion(); // stays up for the class to discuss: A, B or C?
  sound.stopAmbience(2);
  return [];
}

// ---- Part 2: the party ------------------------------------------------------------------------

async function partTwo() {
  sound.startAmbience();
  await ep.loadName();
  ep.prepareNameClips();
  await wait(1000);

  // The phone rings: Beijing.
  sound.ring();
  await carp.gesture([{ transform: 'rotate(0)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(0)' }], { duration: 600 });
  await say('b_carp_ring', carp, { keep: 150 });
  await showCall(true);
  await say('b_cat_one', cat);
  await showCall(false);
  look(tadpole, tadpole.x - 100);
  await hop(tadpole, 24);
  await say('b_tad_surprise', tadpole);

  // Surprise party!
  party.bunting();
  party.confetti(80);
  sound.chime();
  sound.sparkle();
  await wait(700);
  await ep.sayAll('b_all_birthday', ALL, { keep: 500 });

  // The Dragonfly comes back with a party hat.
  put(fly, [1800, 110], { facing: 1 });
  sound.whoosh();
  await walkTo(fly, [tadpole.x + 40, tadpole.y - 90, 1], 1400, { facing: 1, style: 'fly' });
  hat.show(true);
  sparkleAt(fx, tadpole.x - 40, tadpole.y - 70);
  const hover = flutter(fly);
  await say('b_fly_gei', fly);
  await say('b_fly_compare', fly);
  hover();
  await fly.moveTo(1030, 470, 900, 'ease-in-out');

  // "Quante persone ci sono nella tua famiglia?" The tadpole counts: everyone says a number.
  look(frog, tadpole.x);
  await say('b_frog_family', frog);
  await say('b_tad_family', tadpole);
  const round = [
    [crab, 'b_n1', '一', 'yī'],
    [turtle, 'b_n2', '二', 'èr'],
    [cat, 'b_n3', '三', 'sān'],
    [carp, 'b_n4', '四', 'sì'],
    [duck, 'b_n5', '五', 'wǔ'],
    [fly, 'b_n6', '六', 'liù'],
    [frog, 'b_n7', '七', 'qī'],
  ];
  const badges = [];
  for (const [i, [who, id, char, py]] of round.entries()) {
    if (who === cat) await showCall(true);
    if (who !== cat) look(tadpole, who.x);
    badges.push(badge(who, char, py, i));
    await say(id, who, { keep: 120, pace: 0.35 });
  }
  await showCall(false);
  look(tadpole, tadpole.x - 100);
  badges.push(badge(tadpole, '八', 'bā', 7));
  await hop(tadpole, 26);
  await say('b_tad_eight', tadpole);
  sound.chime();
  burst(fx, tadpole.x, tadpole.y - 40, 10);
  await wait(900);
  badges.forEach((b) => b.remove());

  // Auntie Carp can't help boasting: two thousand! (and so can her family)
  const swim = swarm();
  await say('b_carp_2000', carp, { keep: 150 });
  await ep.sayAll('b_all_2000', ALL, { keep: 300 });
  await swim;
  await say('b_turtle_one', turtle);

  // The candle. Everyone counts to three, and the tadpole blows.
  cake.light();
  sound.pluck(587.33, undefined, 0.6);
  look(tadpole, TABLE[0]);
  await walkTo(tadpole, [1130, 690, 0.9], 900, { facing: -1, style: 'swim' });
  await ep.sayAll('b_all_123', ALL, { keep: 300 });
  await tadpole.scaleTo(1.12, 350);
  sound.whoosh();
  cake.blow();
  await tadpole.scaleTo(0.9, 300);
  await wait(400);

  // Pop! Back legs.
  sound.crack();
  growLegs();
  sound.sparkle();
  burst(fx, tadpole.x, tadpole.y, 14);
  sparkleAt(fx, tadpole.x - 30, tadpole.y - 60);
  sparkleAt(fx, tadpole.x - 8, tadpole.y + 40); // the legs are thin and dark: point them out
  sparkleAt(fx, tadpole.x + 16, tadpole.y + 48);
  // ...and it has grown: bigger from here on, so the legs show.
  await Promise.all([
    tadpole.gesture([{ transform: 'scale(1)' }, { transform: 'scale(1.18) rotate(-6deg)', offset: 0.3 }, { transform: 'scale(1.18) rotate(6deg)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 900 }),
    tadpole.scaleTo(1.22, 900),
  ]);
  await say('b_frog_big', frog);
  // Wobbly first hops.
  await tadpole.gesture(
    [{ transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(-30px) rotate(-10deg)', offset: 0.3 }, { transform: 'translateY(0) rotate(6deg)', offset: 0.55 }, { transform: 'translateY(-14px) rotate(-4deg)', offset: 0.75 }, { transform: 'translateY(0) rotate(0)' }],
    { duration: 1200, easing: 'ease-in-out' },
  );
  await say('b_tad_big', tadpole);
  party.confetti(50);

  // One more call from Beijing.
  sound.ring();
  await showCall(true);
  await say('b_cat_beijing', cat, { keep: 200 });
  const snooze = cat.loop([{ transform: 'scale(1, 1)' }, { transform: 'scale(1.02, 1.05)' }], { duration: 900, direction: 'alternate', easing: 'ease-in-out' });
  look(tadpole, CALL[0]);
  mark(tadpole.x, tadpole.y - 150, '！');
  await say('b_tad_beijing', tadpole);
  snooze();
  await showCall(false);
  await walkTo(carp, [tadpole.x - 190, 790, 0.92], 1500, { facing: -1, style: 'swim' });
  await say('b_carp_same', carp);
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
