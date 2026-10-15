// Episode 2 · 你叫什么名字？ (Come ti chiami?). Unit 3.
//
// Part 1, the queue at the Duck's registry: everyone needs a stamp on their pond card.
//   The Turtle Teacher is first, asleep in the queue: "Are you a student?" "I'm a TEACHER!"
//   The Dragonfly jumps the queue and is gone before the stamp. The Crab hands over a business
//   card (谢谢 / 不客气, from last week). Auntie Carp registers, then her phone rings: the Café
//   Cat in Beijing turns out to be Italian, and the Duck stamps the phone. Last, the tadpole:
//   "My name is... Tadpole?" "Tadpole is not a name!" Over to the class: the naming ceremony.
// Part 2, after the ceremony: the tadpole says its new name, the Duck writes it on the card and
//   stamps 名, everyone greets it by name, the Turtle enrols it as a student, and the Dragonfly
//   takes a group photo (茄子！). In the corner of the photo: a shadow nobody knows. 她是谁？
import { createEpisode } from './episode-kit.js';
import { Actor, burst, flutter, hideTitleCard, makeHatchling, showTitleCard, sparkleAt, stampSeal, svg, wait, waddle } from './stage.js';

const $ = (sel) => document.querySelector(sel);
const actors = $('#actors');

// Everyone who speaks stays within x 210-1390 (visible on a 4:3 projector). The page shows the
// scene from y 110 down, so the pond sits above the subtitle panel at the bottom of the screen.
const DUCK = [1190, 705];
const FRONT = [830, 705]; // where the one being registered stands, facing the desk
const WAIT = [
  [652, 702, 0.82],
  [486, 694, 0.72],
  [338, 686, 0.64],
];
const CALL = [420, 340]; // the video call to Beijing
const OFF = { left: [-320, 705], right: [1900, 705] };

const duck = new Actor(actors, 'ch-duck', { x: DUCK[0], y: DUCK[1], w: 200, h: 218 });
const turtle = new Actor(actors, 'ch-turtle', { x: OFF.left[0], y: 705, w: 260, h: 200 });
const crab = new Actor(actors, 'ch-crab', { x: OFF.left[0], y: 705, w: 230, h: 186 });
const carp = new Actor(actors, 'ch-carp', { x: OFF.left[0], y: 620, w: 300, h: 204, anchor: 'center' });
const tadpole = makeHatchling(actors, { x: OFF.left[0], y: 620, w: 240 });
const fly = new Actor(actors, 'ch-dragonfly', { x: 1800, y: 120, w: 190, h: 139 });
const ticket = new Actor(actors, 'ticket', { x: 0, y: 0, w: 76, h: 51, anchor: 'center' });
const card = new Actor(actors, 'card', { x: 0, y: 0, w: 110, h: 77, anchor: 'center' });
const cup = new Actor(actors, 'cup', { x: 0, y: 0, w: 44, h: 35, anchor: 'center' });
const camera = new Actor(actors, 'camera', { x: 0, y: 0, w: 70, h: 49, anchor: 'center' });
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

// A spot in the queue for this actor: [x, y, scale], whatever its anchor.
function spot(a, [x, bottom, scale = 1]) {
  return [x, a.anchor === 'center' ? bottom - (a.h * scale) / 2 : bottom, scale];
}

function placeAt(a, where, facing = -1) {
  const [x, y, scale] = spot(a, where);
  put(a, [x, y], { facing, scale });
}

async function walkTo(a, where, ms = 1200, { facing = -1, style = 'walk' } = {}) {
  const [x, y, scale] = spot(a, where);
  a.face(facing);
  const stop = style === 'fly' ? flutter(a) : style === 'swim' ? a.loop([{ transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }], { duration: 320, direction: 'alternate' }) : waddle(a, 4, 300);
  await a.moveTo(x, y, ms, 'ease-in-out', scale);
  stop();
}

const hop = (a, height = 18) =>
  a.gesture([{ transform: 'translateY(0)' }, { transform: `translateY(-${height}px)` }, { transform: 'translateY(0)' }], { duration: 420, easing: 'ease-out' });

const ep = await createEpisode({
  id: 'ep02',
  unitPage: '#',
  parts: { 1: partOne, 2: partTwo },
  reset,
  // The Cat talks from the video call: its tag goes beside the call window.
  tagSpot: (who) => (who === 'cat' ? [CALL[0] + 190, CALL[1] - 100] : null),
  viewTop: 110,
});
ep.stage = { duck, turtle, crab, carp, tadpole, dragonfly: fly, cat };
const { sound, fx } = ep;

function reset(part) {
  put(duck, DUCK);
  for (const a of [turtle, crab]) put(a, OFF.left, { visible: false });
  put(carp, [OFF.left[0], 640], { visible: false });
  put(fly, [1800, 120], { visible: false });
  for (const a of [ticket, card, cup, camera]) put(a, [0, 0], { visible: false });
  put(cat, [0, 66]);
  $('#phone').style.opacity = '0';
  $('#phone-marks').replaceChildren();
  tadpole.lids.forEach((l) => (l.style.transform = 'scaleY(0)'));
  if (part === 1) {
    placeAt(turtle, [...FRONT, 1]);
    placeAt(crab, WAIT[0]);
    placeAt(carp, WAIT[1]);
    placeAt(tadpole, WAIT[2]);
  } else {
    put(tadpole, OFF.left, { visible: false });
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

// Zzz rising from a sleeper, until stopped.
function snoring(x, y) {
  const holder = svg('g', { transform: `translate(${x} ${y})` }, fx);
  const z = svg('text', { class: 'zzz' }, holder);
  z.textContent = 'Zzz';
  z.animate([{ transform: 'translate(0, 10px)', opacity: 0 }, { transform: 'translate(10px, -6px)', opacity: 1, offset: 0.5 }, { transform: 'translate(22px, -28px)', opacity: 0 }], {
    duration: 1600,
    iterations: Infinity,
  });
  return () => holder.remove();
}

// The customer's pond card goes onto the desk, gets a red stamp and comes back.
async function stampTicket(from, { miss = false } = {}) {
  const [x, y] = from;
  put(ticket, [x, y]);
  await ticket.moveTo(1010, 612, 500, 'ease-out');
  await duck.gesture([{ transform: 'rotate(0)' }, { transform: 'rotate(-10deg) translateY(8px)', offset: 0.5 }, { transform: 'rotate(0)' }], { duration: 380 });
  sound.stamp();
  if (miss) return;
  const seal = svg('use', { href: '#seal-hao', x: 6, y: -24, width: 26, height: 26 }, ticket.talkG);
  seal.animate([{ opacity: 0, transform: 'scale(1.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 200 });
  await wait(450);
  await ticket.moveTo(x, y, 450, 'ease-in');
  ticket.show(false);
  seal.remove();
}

// The video call: a window onto the Café Cat in Beijing, linked to Auntie Carp's phone.
function showCall(on) {
  const [cx, cy] = CALL;
  // Her phone is near her head: on the right when she faces right.
  const px = carp.x + (carp.facing === -1 ? 0.16 : -0.16) * carp.w * carp.scale;
  const py = carp.y - 0.14 * carp.h * carp.scale;
  $('#phone-signal').setAttribute('d', `M0 124C60 210 ${px - cx - 70} ${(py - cy) * 0.62} ${px - cx} ${py - cy - 20}`);
  return $('#phone').animate([{ opacity: on ? 0 : 1 }, { opacity: on ? 1 : 0 }], { duration: 450, fill: 'forwards' }).finished;
}

// The tadpole's pond card, close up: its name line, its picture, and a seal for each word it has
// learned: 好 (Episode 0), 谢 (Episode 1), and 名 once it has a name.
function cardCloseup({ name = null, ming = false } = {}) {
  const holder = svg('g', { transform: 'translate(800 360)' }, fx);
  const g = svg('g', {}, holder);
  svg('rect', { x: -240, y: -140, width: 480, height: 280, rx: 20, fill: '#fbf8f1', stroke: '#b9ad96', 'stroke-width': 4 }, g);
  svg('text', { x: -196, y: -96, class: 'card-py' }, g).textContent = 'míngzi';
  svg('text', { x: -200, y: -52, class: 'card-name' }, g).textContent = '名字';
  svg('path', { d: 'M-108 -56H30', stroke: '#cfc4ad', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
  svg('text', { x: -106, y: -24, class: 'card-it' }, g).textContent = 'nome';
  svg('use', { href: '#tp-hatch', x: -205, y: 8, width: 180, height: 115 }, g);
  const slots = [[90, -70], [166, -70], [90, 8], [166, 8]];
  const seals = ['seal-hao', 'seal-xie', ming ? 'seal-ming' : null, null];
  const empty = slots.map(([x, y], i) => {
    if (seals[i]) {
      const seal = svg('g', { transform: `translate(${x - 32} ${y - 32})` }, g);
      svg('use', { href: `#${seals[i]}`, width: 64, height: 64, transform: 'rotate(-8 32 32)' }, seal);
      return null;
    }
    return svg('rect', { x: x - 30, y: y - 30, width: 60, height: 60, rx: 6, fill: 'none', stroke: '#d6cebb', 'stroke-width': 3, 'stroke-dasharray': '6 6' }, g);
  });
  const written = svg('g', { transform: 'translate(-40 -60)' }, g);
  const showName = (n) => {
    written.replaceChildren();
    const py = svg('text', { class: 'card-written-py', 'text-anchor': 'middle', y: -40 }, written);
    py.textContent = n.display;
    const zh = svg('text', { class: 'card-written', 'text-anchor': 'middle' }, written);
    zh.textContent = n.zh;
    return [py, zh];
  };
  if (name) showName(name);
  g.style.transformBox = 'fill-box';
  g.style.transformOrigin = '50% 50%';
  return {
    open: () => g.animate([{ transform: 'scale(0.3)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 450, easing: 'ease-out' }).finished,
    askName() {
      const q = svg('text', { x: -40, y: -64, class: 'card-q', 'text-anchor': 'middle' }, g);
      q.textContent = '？';
      q.animate([{ opacity: 1 }, { opacity: 0.25 }], { duration: 450, iterations: Infinity, direction: 'alternate' });
    },
    // The Duck writes the name, one character at a time, then stamps 名.
    async writeName(n) {
      const [py, zh] = showName(n);
      zh.textContent = '';
      py.style.opacity = '0';
      for (const ch of n.zh) {
        zh.textContent += ch;
        sound.tap();
        await wait(380);
      }
      py.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: 'forwards' });
      await wait(500);
      sound.stamp();
      empty[2]?.remove();
      stampSeal(g, 'seal-ming', slots[2][0], slots[2][1], 64);
      await wait(250);
      sound.chime();
      sparkleAt(holder, slots[2][0] + 40, slots[2][1] - 40);
    },
    async close() {
      await g.animate([{ opacity: 1 }, { transform: 'scale(0.3)', opacity: 0 }], { duration: 400, easing: 'ease-in', fill: 'forwards' }).finished;
      holder.remove();
    },
  };
}

// ---- Part 1: the queue at the registry -----------------------------------------------------

async function partOne() {
  sound.startAmbience();
  const titleEl = $('#title-card');
  await showTitleCard(titleEl, ep.EP.title);
  await ep.say('a_title', null, { subtitles: false, keep: 500 });
  await hideTitleCard(titleEl);

  // The Turtle Teacher came yesterday, to be on time for once. He fell asleep in the queue.
  const stopZ = snoring(turtle.x + 60, turtle.y - 190);
  sound.snore();
  await wait(900);
  sound.stamp();
  await ep.say('a_next', duck);
  sound.snore();
  await wait(700);
  stopZ();
  await hop(turtle, 26); // awake!
  await ep.say('a_duck_name', duck);
  await ep.say('a_turtle_name', turtle);
  await duck.gesture([{ transform: 'rotate(0)' }, { transform: 'rotate(-8deg) translateX(-6px)', offset: 0.5 }, { transform: 'rotate(0)' }], { duration: 900 }); // peers at him
  await ep.say('a_duck_student', duck);
  await turtle.gesture([{ transform: 'scale(1)' }, { transform: 'scale(1.12)', offset: 0.4 }, { transform: 'scale(1.12)', offset: 0.8 }, { transform: 'scale(1)' }], { duration: 900 });
  await ep.say('a_turtle_teacher', turtle);
  await stampTicket([turtle.x + 40, turtle.y - 120]);
  // He leaves... slowly. He'll still be walking a while.
  const turtleLeaves = walkTo(turtle, [1280, 900, 1], 16000, { facing: -1 });

  // The Dragonfly jumps the queue.
  put(fly, [1800, 100], { facing: 1 });
  sound.whoosh();
  await walkTo(fly, [FRONT[0] + 30, 560, 1], 1100, { facing: -1, style: 'fly' });
  const hover = flutter(fly);
  await ep.say('a_fly_name', fly, { keep: 150 });
  sound.whoosh();
  const stampMiss = stampTicket([fly.x, fly.y - 60], { miss: true });
  await fly.moveTo(-260, 60, 900, 'ease-in');
  hover();
  fly.show(false);
  await stampMiss;
  ticket.show(false);
  await ep.say('a_duck_hey', duck);

  // The Crab: everyone shuffles forward.
  await Promise.all([walkTo(crab, FRONT, 1400), walkTo(carp, WAIT[0], 1400, { style: 'swim' }), walkTo(tadpole, WAIT[1], 1400, { style: 'swim' })]);
  await ep.say('a_duck_name', duck);
  await ep.say('a_crab_name', crab);
  put(ticket, [crab.x + 40, crab.y - 120]);
  await ticket.moveTo(1010, 612, 500, 'ease-out'); // her business card
  ticket.show(false);
  await ep.say('a_duck_thanks', duck);
  await crab.gesture([{ transform: 'rotate(0)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(0)' }], { duration: 500 });
  await ep.say('a_crab_welcome', crab);
  await stampTicket([crab.x + 40, crab.y - 120]);
  const crabLeaves = walkTo(crab, [OFF.left[0], 760, 1], 2600, { facing: 1 });

  // Auntie Carp.
  // (a little further from the desk: she's long, and her head mustn't hide behind it)
  await Promise.all([walkTo(carp, [FRONT[0] - 40, FRONT[1], 1], 1300, { style: 'swim' }), walkTo(tadpole, [470, 702, 0.82], 1300, { style: 'swim' })]);
  await ep.say('a_duck_name', duck);
  await ep.say('a_carp_name', carp);
  await ep.say('a_duck_chinese', duck);
  await ep.say('a_carp_chinese', carp);
  await stampTicket([carp.x + 50, carp.y - 40]);
  // Her phone rings: the Café Cat, calling from Beijing.
  sound.ring();
  await carp.gesture([{ transform: 'rotate(0)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(0)' }], { duration: 600 });
  await ep.say('a_carp_phone', carp, { keep: 200 });
  await showCall(true);
  await ep.say('a_cat_hello', cat);
  await ep.say('a_duck_chinese', duck); // the Duck registers everyone. Even phone calls.
  await ep.say('a_cat_italian', cat);
  // So she stamps the phone call.
  await duck.gesture([{ transform: 'rotate(0)' }, { transform: 'rotate(-10deg) translateY(8px)', offset: 0.5 }, { transform: 'rotate(0)' }], { duration: 380 });
  sound.stamp();
  stampSeal($('#phone-marks'), 'seal-hao', 46, 40, 54);
  await wait(900);
  await showCall(false);
  $('#phone-marks').replaceChildren();
  mark(carp.x, carp.y - 130);
  await wait(600);
  await walkTo(carp, [OFF.left[0], 800, 1], 2200, { facing: 1, style: 'swim' });
  await Promise.all([crabLeaves, wait(10)]);

  // Last in the queue: the tadpole.
  await walkTo(tadpole, [FRONT[0] - 10, 705, 1], 1300, { style: 'swim' });
  sound.stamp();
  await ep.say('a_next', duck);
  await ep.say('a_duck_name', duck);
  await tadpole.gesture([{ transform: 'rotate(0)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }], { duration: 900 });
  await ep.say('a_tad_name', tadpole);
  await duck.gesture(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.14) rotate(-3deg)', offset: 0.3 }, { transform: 'scale(1.14) rotate(3deg)', offset: 0.6 }, { transform: 'scale(1)' }],
    { duration: 700 },
  );
  await ep.say('a_duck_noname', duck, { keep: 300 });
  // The card has an empty name line.
  const closeup = cardCloseup();
  await closeup.open();
  closeup.askName();
  await tadpole.blink();
  await wait(300);
  await tadpole.blink();
  await wait(1200);
  await closeup.close();
  tadpole.face(1);
  mark(tadpole.x, tadpole.y - 110);
  await turtleLeaves.catch(() => {});
  await ep.say('a_ask', null, { keep: 300 });
  await showTitleCard($('#title-card'), {
    zh: '小蝌蚪叫什么名字？',
    py: 'xiǎo kēdǒu jiào shénme míngzi?',
    it: 'Come si chiama il girino? Lo scegliete voi!',
  });
  sound.stopAmbience(2);
  // At the end: straight to the naming ceremony.
  return [];
}

// ---- Part 2: the name ------------------------------------------------------------------------

async function partTwo() {
  sound.startAmbience();
  await ep.loadName();
  ep.prepareNameClips(); // usually ready already; if not, name lines are said live

  // Back at the desk, proud.
  placeAt(tadpole, [-240, 705, 1]);
  tadpole.show();
  await walkTo(tadpole, [FRONT[0] - 10, 705, 1], 1700, { style: 'swim' });
  await hop(tadpole);
  sound.stamp();
  await ep.say('a_next', duck);
  await ep.say('a_duck_name', duck);
  await hop(tadpole, 24);
  await ep.say('b_tad_name', tadpole);
  const closeup = cardCloseup();
  await closeup.open();
  await closeup.writeName(ep.name);
  await wait(600);
  await ep.say('b_duck_goodname', duck);
  await closeup.close();
  burst(fx, tadpole.x, tadpole.y - 40, 10);
  sound.sparkle();

  // Everyone comes to say hello, by name. The tadpole turns to them.
  tadpole.face(1);
  put(crab, [OFF.left[0], 712], { facing: -1 });
  await walkTo(crab, [560, 712, 1], 1900);
  await ep.say('b_crab_hello', crab);
  await ep.say('b_crab_give', crab);
  put(cup, [crab.x + 70, crab.y - 112]);
  await cup.moveTo(tadpole.x - 92, tadpole.y + 4, 600, 'ease-out');
  await ep.say('b_tad_thanks', tadpole);
  await ep.say('a_crab_welcome', crab);
  cup.show(false);
  await walkTo(crab, [296, 716, 0.75], 1100, { facing: -1 }); // makes room

  // Auntie Carp tells everyone at once. Beijing included.
  put(carp, [OFF.left[0], 760], { facing: -1 });
  sound.ring();
  await walkTo(carp, [575, 790, 1], 1900, { style: 'swim' }); // in the water, in front
  await ep.say('b_carp_news', carp, { keep: 200 });
  await showCall(true);
  await ep.say('b_cat_goodname', cat);
  const snooze = cat.loop([{ transform: 'scale(1, 1)' }, { transform: 'scale(1.02, 1.05)' }], { duration: 900, direction: 'alternate', easing: 'ease-in-out' });
  sound.snore();
  await wait(1200);
  snooze();

  // The Turtle Teacher arrives (still slow): a new student!
  put(turtle, [OFF.left[0], 712], { facing: -1 });
  await walkTo(turtle, [445, 700, 0.92], 2600);
  await ep.say('b_turtle_student', turtle);
  await hop(tadpole, 22);
  await ep.say('b_tad_student', tadpole);
  await ep.say('b_turtle_good', turtle);

  // The Dragonfly, with a camera: a photo for the pond card.
  put(fly, [1800, 90], { facing: 1 });
  put(camera, [1800, 140]);
  sound.whoosh();
  await Promise.all([walkTo(fly, [1240, 400, 1], 1300, { facing: 1, style: 'fly' }), camera.moveTo(1200, 360, 1300, 'ease-out')]);
  const hover = flutter(fly);
  await ep.say('b_fly_hello', fly);
  // Everyone squeezes into the picture.
  await Promise.all([
    walkTo(duck, [1030, 712, 0.95], 1200, { facing: 1 }),
    walkTo(crab, [360, 716, 0.9], 900, { facing: -1 }),
    walkTo(turtle, [530, 716, 0.95], 900, { facing: -1 }),
    walkTo(tadpole, [800, 700, 1], 900, { facing: -1, style: 'swim' }),
    walkTo(carp, [680, 790, 0.9], 900, { facing: -1, style: 'swim' }),
  ]);
  await ep.say('b_fly_count', fly);
  await ep.sayAll('b_all_cheese', [tadpole, duck, crab, carp, turtle, fly, cat], { keep: 200 });
  hover();
  await flash();
  await showPhoto();
  await ep.say('b_next', null, { subtitles: false, keep: 300 });
  sound.stopAmbience(2.5);
  return [];
}

// ---- The photo -------------------------------------------------------------------------------

async function flash() {
  sound.sparkle();
  const white = svg('rect', { x: -100, y: -100, width: 1800, height: 1100, fill: '#fff' }, fx);
  await white.animate([{ opacity: 0.95 }, { opacity: 0 }], { duration: 700, easing: 'ease-out' }).finished;
  white.remove();
}

// A polaroid of everyone with the new name underneath, and in the corner, half out of the picture,
// a shadow nobody knows.
async function showPhoto() {
  const holder = svg('g', { transform: 'translate(800 420) rotate(-3)' }, fx);
  const g = svg('g', {}, holder);
  svg('rect', { x: -330, y: -250, width: 660, height: 520, rx: 6, fill: '#fdfbf6', stroke: '#d6cebb', 'stroke-width': 2 }, g);
  const clip = svg('clipPath', { id: 'photo-clip' }, g);
  svg('rect', { x: -300, y: -222, width: 600, height: 380 }, clip);
  const pic = svg('g', { 'clip-path': 'url(#photo-clip)' }, g);
  svg('rect', { x: -300, y: -222, width: 600, height: 380, fill: '#e8e2d2' }, pic);
  svg('ellipse', { cx: 0, cy: 120, rx: 290, ry: 70, fill: '#3e4b45' }, pic);
  const at = (id, x, y, w, h, flip = false) =>
    svg('use', { href: `#${id}`, x: -w / 2, y: -h, width: w, height: h, transform: `translate(${x} ${y})${flip ? ' scale(-1 1)' : ''}` }, pic);
  // The stranger, peeking in from the right edge.
  const stranger = svg('use', { href: '#tp-frog', x: 0, y: 0, width: 170, height: 162, filter: 'url(#silhouette)', transform: 'translate(206 -60)' }, pic);
  at('ch-turtle', -205, 120, 150, 115);
  at('ch-crab', -110, 132, 130, 105);
  at('ch-duck', 175, 128, 120, 131, true);
  at('ch-carp', 60, 168, 170, 116);
  at('tp-hatch', 30, 92, 150, 95);
  at('ch-dragonfly', -210, -110, 120, 88);
  // The Cat on Auntie Carp's phone.
  svg('circle', { cx: 120, cy: -150, r: 46, fill: '#fbf8f1', stroke: '#b9ad96', 'stroke-width': 2 }, pic);
  at('ch-cat', 120, -118, 76, 60);
  // The name, written underneath.
  const name = ep.name || { zh: '？', display: '' };
  const caption = svg('text', { class: 'photo-caption', 'text-anchor': 'middle', y: 236 }, g);
  caption.textContent = name.zh;
  const py = svg('text', { class: 'photo-py', 'text-anchor': 'middle', y: 190 }, g);
  py.textContent = name.display;
  g.style.transformBox = 'fill-box';
  g.style.transformOrigin = '50% 50%';
  await g.animate([{ transform: 'scale(0.4) rotate(8deg)', opacity: 0 }, { transform: 'scale(1) rotate(0)', opacity: 1 }], { duration: 600, easing: 'ease-out' }).finished;
  await wait(1600);
  // Who's that?
  sound.pluck(293.66, undefined, 0.5);
  stranger.animate([{ transform: 'translate(206px, -60px)' }, { transform: 'translate(178px, -66px)' }], { duration: 700, easing: 'ease-out', fill: 'forwards' });
  const q = svg('text', { class: 'bubble-q', 'text-anchor': 'middle', x: 262, y: -78 }, g);
  q.textContent = '？';
  q.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 500, fill: 'forwards' });
  await wait(1800);
  await showTitleCard($('#title-card'), ep.EP.next);
}

// ---- The start screen: has the class chosen the name yet? -----------------------------------

async function nameStatus() {
  const el = $('#name-status');
  const n = await ep.loadName();
  if (!n?.chosen) {
    el.innerHTML = 'Il nome non è ancora stato scelto: <a href="/name.html">apri la cerimonia del nome</a>.';
    return;
  }
  const show = (ready, total) => {
    el.innerHTML = '';
    const strong = document.createElement('strong');
    strong.textContent = `${n.zh} ${n.display}`;
    el.append('Il nome: ', strong, ready === total ? ' · voci pronte ✓' : ` · preparo le voci ${ready}/${total}… (se non sono pronte, quelle battute si dicono dal vivo)`);
  };
  show(0, Object.values(ep.EP.lines).filter((l) => l.name).length);
  ep.prepareNameClips(show);
}
