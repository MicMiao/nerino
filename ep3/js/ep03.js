// Episode 3 · 她是我的汉语老师 (Lei è la mia insegnante di cinese). Unit 4.
//
// Part 1, "Chi è la sagoma?": the Dragonfly pins last week's class photo on the noticeboard. In the
//   corner there is still a shadow. Everyone guesses (他/她, 同学, 朋友) and gets it wrong, the Turtle
//   Teacher turns up late and asks if she's his student. Then the question: 她是谁？ A, B, C.
// Part 2, the answer: the shadow hops out of the photo. It's a frog, 李月, the class's new Chinese
//   teacher (like the teacher in the book). The tadpole asks if she's its mother. A round of 你是哪国人？
//   (the Cat is still Italian), the photo exercise from the book (他是我同学。她不是我同学，她是我朋友。),
//   tea from the Crab, and "老师，再见！" from everyone.
import { createEpisode } from './episode-kit.js';
import { Actor, burst, flutter, hideTitleCard, makeHatchling, showTitleCard, sparkleAt, svg, wait, waddle } from './stage.js';

const $ = (sel) => document.querySelector(sel);
const actors = $('#actors');

// Everyone who speaks stays within x 210-1390 (visible on a 4:3 projector). The page shows the scene from
// y 110 down, so the pond sits above the subtitle panel at the bottom of the screen.
const BOARD = [1240, 445]; // the photo on the noticeboard
const CALL = [420, 340]; // the video call to Beijing
const OFF = { left: [-320, 705], right: [1900, 705] };
const PHOTO_BIG = { x: 800, y: 372, s: 0.6 };
const PHOTO_SMALL = { x: BOARD[0], y: BOARD[1], s: 0.36 };

const duck = new Actor(actors, 'ch-duck', { x: 1010, y: 705, w: 200, h: 218 });
const turtle = new Actor(actors, 'ch-turtle', { x: OFF.left[0], y: 705, w: 260, h: 200 });
const crab = new Actor(actors, 'ch-crab', { x: 330, y: 716, w: 230, h: 186 });
const carp = new Actor(actors, 'ch-carp', { x: 600, y: 700, w: 300, h: 204, anchor: 'center' });
const tadpole = makeHatchling(actors, { x: 760, y: 640, w: 240 });
const fly = new Actor(actors, 'ch-dragonfly', { x: 1800, y: 120, w: 190, h: 139 });
const frog = new Actor(actors, 'ch-frog', { x: 1110, y: 712, w: 200, h: 190 });
const cup = new Actor(actors, 'cup', { x: 0, y: 0, w: 44, h: 35, anchor: 'center' });
const cat = new Actor($('#phone-cat'), 'ch-cat', { x: 0, y: 66, w: 190, h: 150 });
$('#phone').setAttribute('transform', `translate(${CALL[0]} ${CALL[1]})`);

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
async function walkTo(a, where, ms = 1200, { facing = 1, style = 'walk' } = {}) {
  const [x, y, scale] = spot(a, where);
  a.face(facing);
  const stop = style === 'fly' ? flutter(a) : style === 'swim' ? a.loop([{ transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }], { duration: 320, direction: 'alternate' }) : waddle(a, 4, 300);
  await a.moveTo(x, y, ms, 'ease-in-out', scale);
  stop();
}
const hop = (a, height = 18) =>
  a.gesture([{ transform: 'translateY(0)' }, { transform: `translateY(-${height}px)` }, { transform: 'translateY(0)' }], { duration: 420, easing: 'ease-out' });
const lean = (a, deg = -8) => a.gesture([{ transform: 'rotate(0)' }, { transform: `rotate(${deg}deg) translateY(4px)`, offset: 0.5 }, { transform: 'rotate(0)' }], { duration: 700, easing: 'ease-in-out' });
const puff = (a) =>
  a.gesture([{ transform: 'scale(1)' }, { transform: 'scale(1.14) rotate(-3deg)', offset: 0.3 }, { transform: 'scale(1.14) rotate(3deg)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 700 });
const shake = (a) => a.gesture([{ transform: 'rotate(0)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(7deg)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(0)' }], { duration: 800 });

const ep = await createEpisode({
  id: 'ep03',
  unitPage: '#',
  parts: { 1: partOne, 2: partTwo },
  reset,
  tagSpot: (who) => (who === 'cat' ? [CALL[0] + 190, CALL[1] - 100] : null),
  viewTop: 110,
  extraRoles: { frog: { role: 'frog', it: 'La Maestra Rana', zh: '李月老师' } },
});
ep.stage = { duck, turtle, crab, carp, tadpole, dragonfly: fly, cat, frog };
const { sound, fx } = ep;

// ---- The class photo from Episode 2 (with the shadow in its corner) -------------------------------

const photo = (() => {
  const holder = svg('g', { class: 'actor' }, $('#board-photo'));
  holder.style.transformBox = 'view-box';
  holder.style.transformOrigin = '0 0';
  const g = svg('g', {}, holder);
  svg('rect', { x: -330, y: -250, width: 660, height: 520, rx: 6, fill: '#fdfbf6', stroke: '#d6cebb', 'stroke-width': 2 }, g);
  const clip = svg('clipPath', { id: 'photo3-clip' }, g);
  svg('rect', { x: -300, y: -222, width: 600, height: 380 }, clip);
  const pic = svg('g', { 'clip-path': 'url(#photo3-clip)' }, g);
  svg('rect', { x: -300, y: -222, width: 600, height: 380, fill: '#e8e2d2' }, pic);
  svg('ellipse', { cx: 0, cy: 120, rx: 290, ry: 70, fill: '#3e4b45' }, pic);
  const at = (id, x, y, w, h, flip = false) => svg('use', { href: `#${id}`, x: -w / 2, y: -h, width: w, height: h, transform: `translate(${x} ${y})${flip ? ' scale(-1 1)' : ''}` }, pic);
  const stranger = svg('use', { href: '#ch-frog', x: 0, y: 0, width: 170, height: 162, filter: 'url(#silhouette)', transform: 'translate(135 -75)' }, pic);
  at('ch-turtle', -205, 120, 150, 115);
  at('ch-crab', -110, 132, 130, 105);
  at('ch-duck', 175, 128, 120, 131, true);
  at('ch-carp', 60, 168, 170, 116);
  at('tp-hatch', 30, 92, 150, 95);
  at('ch-dragonfly', -210, -110, 120, 88);
  svg('circle', { cx: 120, cy: -150, r: 46, fill: '#fbf8f1', stroke: '#b9ad96', 'stroke-width': 2 }, pic);
  at('ch-cat', 120, -118, 76, 60);
  const caption = svg('text', { x: 0, y: 236, 'text-anchor': 'middle', style: 'font: 400 52px "Ma Shan Zheng","Kaiti SC",serif; fill:#1c1b18' }, g);
  const state = { ...PHOTO_SMALL };
  const apply = (s) => {
    holder.style.transform = `translate(${s.x}px, ${s.y}px) scale(${s.s})`;
    Object.assign(state, s);
  };
  apply(PHOTO_SMALL);
  const mark = svg('text', { x: 232, y: -86, 'text-anchor': 'middle', class: 'bubble-q' }, pic);
  mark.textContent = '？';
  return {
    holder,
    stranger,
    setCaption: (text) => (caption.textContent = text),
    show(on) {
      holder.style.opacity = on ? '1' : '0';
    },
    reset() {
      stranger.setAttribute('filter', 'url(#silhouette)');
      stranger.style.opacity = '1';
      mark.style.opacity = '1';
      highlight(null);
      apply(PHOTO_SMALL);
      holder.getAnimations().forEach((a) => a.cancel());
    },
    async glide(to, ms = 800) {
      const from = { ...state };
      const anim = holder.animate(
        [{ transform: `translate(${from.x}px, ${from.y}px) scale(${from.s})` }, { transform: `translate(${to.x}px, ${to.y}px) scale(${to.s})` }],
        { duration: ms, easing: 'ease-in-out', fill: 'forwards' },
      );
      await anim.finished.catch(() => {});
      apply(to);
      anim.cancel();
    },
    // The stranger turns from a shadow into the frog.
    reveal() {
      stranger.removeAttribute('filter');
      mark.style.opacity = '0';
    },
    ring: (who) => highlight(who),
  };
  function highlight(who) {
    pic.querySelectorAll('.ring').forEach((r) => r.remove());
    const spots = { crab: [-110, 80, 70, 62], carp: [60, 112, 92, 62], fly: [-210, -150, 70, 50] };
    if (!who) return;
    const [cx, cy, rx, ry] = spots[who];
    svg('ellipse', { class: 'ring', cx, cy, rx, ry, fill: 'none', stroke: '#b3392b', 'stroke-width': 9 }, pic);
  }
})();

function reset(part) {
  put(duck, [1010, 705], { facing: -1 });
  put(crab, [330, 716], { facing: -1 });
  put(carp, [600, 700], { facing: -1 });
  put(tadpole, [760, 640], { facing: -1 });
  tadpole.lids.forEach((l) => (l.style.transform = 'scaleY(0)'));
  put(turtle, OFF.left, { visible: false, facing: -1 });
  put(fly, [1800, 120], { visible: false });
  put(frog, [1110, 712], { visible: false });
  put(cup, [0, 0], { visible: false });
  put(cat, [0, 66]);
  $('#phone').style.opacity = '0';
  photo.reset();
  photo.setCaption(ep.name?.zh || ep.EP.fallbackName.zh);
  if (part === 1) {
    photo.show(false);
  } else {
    photo.show(true);
    placeAt(turtle, [470, 712, 0.92], -1);
    placeAt(crab, [310, 716, 0.9], -1);
    placeAt(carp, [610, 790, 0.92], -1);
    placeAt(tadpole, [790, 720, 0.9], -1);
    placeAt(duck, [930, 705, 0.95], -1);
    placeAt(fly, [1010, 500, 0.95], -1);
    fly.show();
  }
}

// ---- Small stage business ----------------------------------------------------------------

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

// ---- Part 1: who is the shadow? -------------------------------------------------------------

async function partOne() {
  sound.startAmbience();
  const titleEl = $('#title-card');
  await showTitleCard(titleEl, ep.EP.title);
  await ep.say('a_title', null, { subtitles: false, keep: 500 });
  await hideTitleCard(titleEl);

  // The Dragonfly brings last week's photo and pins it on the board.
  put(fly, [1800, 100], { facing: 1 });
  sound.whoosh();
  await walkTo(fly, [1180, 330, 1], 1200, { facing: -1, style: 'fly' });
  const hover = flutter(fly);
  photo.show(true);
  sound.stamp();
  sparkleAt(fx, BOARD[0], BOARD[1] - 100);
  await ep.say('a_fly_hi', fly, { keep: 150 });
  sound.whoosh();
  await Promise.all([ep.say('a_fly_bye', fly, { keep: 0 }), fly.moveTo(1900, 60, 1300, 'ease-in')]);
  hover();
  fly.show(false);

  // Everybody crowds around it.
  await photo.glide(PHOTO_BIG, 900);
  await ep.say('a_duck_who', duck);
  await ep.say('a_tad_ask', tadpole);

  // Wrong guess 1: the Crab. It's a "she"!
  await lean(crab, -8);
  await ep.say('a_crab_he', crab);
  await puff(duck);
  await ep.say('a_duck_not', duck);

  // Wrong guess 2: Auntie Carp knows everybody. (Does she?)
  await ep.say('a_carp_friend', carp);
  await ep.say('a_duck_really', duck);
  sound.ring();
  await carp.gesture([{ transform: 'rotate(0)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(0)' }], { duration: 600 });
  await ep.say('a_carp_phone', carp, { keep: 150 });
  await showCall(true);
  await ep.say('a_cat_classmate', cat);
  await ep.say('a_carp_no', carp);
  await showCall(false);

  // Wrong guess 3: the Turtle Teacher, late as always.
  turtle.show();
  walkTo(turtle, [470, 712, 0.92], 4200, { facing: -1 });
  await wait(2600);
  await ep.say('a_turtle_sorry', turtle);
  await lean(turtle, -6);
  await ep.say('a_turtle_student', turtle);
  await ep.say('a_duck_no', duck);

  mark(PHOTO_BIG.x + 130, 200);
  await wait(500);
  await ep.say('a_ask', null, { keep: 300 });
  ep.showQuestion(); // stays up for the class to discuss: A, B or C?
  sound.stopAmbience(2);
  return [];
}

// ---- Part 2: the answer ----------------------------------------------------------------------

async function partTwo() {
  sound.startAmbience();
  await ep.loadName();
  ep.prepareNameClips();
  photo.setCaption(ep.name.zh);

  mark(BOARD[0], 330);
  sound.pluck(293.66, undefined, 0.5);
  await wait(1200);

  // The shadow hops out of the photo!
  photo.reveal();
  put(frog, [BOARD[0], 520], { facing: 1, scale: 0.18 });
  sound.plop();
  burst(fx, BOARD[0], 470, 12);
  await frog.moveTo(1180, 380, 450, 'ease-out', 0.5);
  sound.plop();
  await frog.moveTo(1110, 712, 520, 'ease-in', 1);
  sound.bump();
  frog.face(1);
  await ep.say('b_frog_hello', frog);
  await ep.say('b_frog_call', frog);
  await ep.sayAll('b_all_hello', [tadpole, duck, crab, carp, turtle, fly, cat], { keep: 600 });

  // The tadpole has a theory.
  await hop(tadpole, 22);
  await ep.say('b_tad_mama', tadpole);
  await shake(frog);
  await ep.say('b_frog_notmom', frog);

  // Auntie Carp calls Beijing: who is she?
  sound.ring();
  await showCall(true);
  await ep.say('b_cat_who', cat);
  await ep.say('b_tad_book', tadpole);
  await showCall(false);

  // The Turtle Teacher is not sure about a second teacher.
  await lean(turtle, -6);
  await ep.say('b_turtle_teacher', turtle);
  await ep.say('b_frog_yes', frog);

  // Round of introductions: 你们是哪国人？
  await ep.say('b_frog_guo', frog);
  await ep.say('b_duck_china', duck);
  await ep.say('b_turtle_china', turtle);
  await ep.say('b_fly_china', fly);
  await ep.say('b_crab_us', crab);
  sound.ring();
  await showCall(true);
  await ep.say('b_cat_italy', cat);
  await showCall(false);
  await ep.say('b_frog_china', frog);

  // The photo exercise from the book.
  await photo.glide(PHOTO_BIG, 800);
  photo.ring('crab');
  await ep.say('b_frog_he', frog);
  await ep.say('b_tad_he', tadpole);
  photo.ring('carp');
  await ep.say('b_frog_she', frog);
  await ep.say('b_tad_friend', tadpole);
  await ep.say('b_carp_friend', carp);
  photo.ring('fly');
  await ep.say('b_frog_who3', frog);
  await ep.say('b_fly_me', fly);
  photo.ring(null);
  await photo.glide(PHOTO_SMALL, 700);

  // Tea for the teacher.
  await walkTo(crab, [940, 716, 0.95], 1500, { facing: -1 });
  put(cup, [crab.x + 70, crab.y - 112]);
  await ep.say('b_crab_tea', crab);
  await cup.moveTo(frog.x - 100, frog.y - 60, 600, 'ease-out');
  await ep.say('b_frog_thanks', frog);
  await ep.say('b_crab_welcome', crab);
  cup.show(false);

  // News travels fast: Auntie Carp tells Beijing.
  sound.ring();
  await showCall(true);
  await ep.say('b_carp_news', carp, { keep: 200 });
  await ep.say('b_cat_goodname', cat);
  const snooze = cat.loop([{ transform: 'scale(1, 1)' }, { transform: 'scale(1.02, 1.05)' }], { duration: 900, direction: 'alternate', easing: 'ease-in-out' });
  sound.snore();
  await wait(1000);
  snooze();
  await showCall(false);

  // Goodbye, teacher!
  await ep.sayAll('b_all_bye', [tadpole, duck, crab, carp, turtle, fly, cat], { keep: 500 });
  await ep.say('b_frog_bye', frog);
  await hop(frog, 24);
  burst(fx, frog.x, frog.y - 100, 8);
  sound.sparkle();
  await wait(700);

  const cardEl = $('#title-card');
  await showTitleCard(cardEl, ep.EP.next);
  await ep.say('b_next', null, { subtitles: false, keep: 1500 });
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
    el.append('Il nome: ', strong, ready === total ? ' · voci pronte ✓' : ` · preparo le voci ${ready}/${total}… (se non sono pronte, quelle battute si dicono dal vivo)`);
  };
  show(0, Object.values(ep.EP.lines).filter((l) => l.name).length);
  ep.prepareNameClips(show);
}
