// The machinery every weekly episode shares (from Episode 2 on): lines in three modes, subtitles,
// the live cue with a name tag, the class's chorus, the end bar, the start screen and the keys.
//   ai        every line in the AI voices, slowly, with the subtitle up a moment before the voice
//   live      characters silent: each student says their own line when the cue appears
//             (the narrator keeps its AI voice in every mode)
//   recorded  the students' takes from the booth (AI voice where a line has no take)
// An episode only writes its scenes: createEpisode() gives back say(), sayAll() and friends.
import { Sound } from './sound.js';
import { Subtitles, clock, fillRuby, loadArt, setupControls, svg, wait } from './stage.js';

const $ = (sel) => document.querySelector(sel);

const MODE_NAMES = { ai: 'Con le voci', live: 'Dal vivo: tocca a voi', recorded: 'Con le vostre registrazioni' };
const KEYS = { 1: [1, 'ai'], 3: [2, 'ai'] };
const LEAD_IN = 600; // ms the subtitle is up before the voice starts, so eyes find it first
// An episode can set "pace" (default 1) to stretch the pauses around every line, and "speed" for the voices.

// The pinyin of a name, written for Italian subtitles: "dòu dou" -> "Dòudou".
export const nameForSubtitles = (py) => {
  const joined = String(py || '').replace(/\s+/g, '');
  return joined.charAt(0).toUpperCase() + joined.slice(1);
};

// viewTop: where the page's view of the scene starts (its viewBox y), to keep name tags on screen.
// extraRoles: characters who aren't one of the seven students, e.g. { frog: { it: 'La Maestra Rana', zh: '青蛙老师' } }.
// Their voices are marked "guest": true in the episode JSON and always speak with the AI voice.
export async function createEpisode({ id, unitPage, parts, reset, stage = {}, tagSpot, viewTop = 0, extraRoles = {} }) {
  const [EP, CAST] = await Promise.all([
    fetch(`episodes/${id}.json`).then((r) => r.json()),
    fetch('units/cast.json').then((r) => r.json()),
  ]);
  await loadArt();
  const ROLES = { ...Object.fromEntries(CAST.roles.map((r) => [r.role, r])), ...extraRoles };
  const sound = new Sound();
  const subs = new Subtitles($('#subs'));
  const fx = $('#fx');

  const ep = {
    EP,
    ROLES,
    sound,
    subs,
    fx,
    stage, // role -> Actor, filled in by the episode
    mode: 'ai',
    running: false,
    takes: {},
    name: null, // the tadpole's name: { zh, py, it, display, chosen }
    nameClips: {}, // line id -> { url, ready }
    currentVoices: [],
  };

  // ---- The tadpole's name (lines marked "name": true) -------------------------------------

  ep.loadName = async () => {
    let chosen = null;
    try {
      chosen = null;
    } catch {
      /* no server data: use the fallback */
    }
    const n = chosen?.zh ? chosen : EP.fallbackName;
    ep.name = n ? { ...n, display: nameForSubtitles(n.py), chosen: Boolean(chosen?.zh) } : null;
    return ep.name;
  };

  // A line with the name filled in.
  ep.line = (lineId) => {
    const line = EP.lines[lineId];
    if (!line.name || !ep.name) return line;
    return {
      ...line,
      zh: line.zh.replaceAll('{name}', ep.name.zh),
      py: line.py.replaceAll('{py}', ep.name.py),
      it: line.it.replaceAll('{name}', ep.name.display),
    };
  };

  // Ask the server to voice every name line (it takes a minute or two the first time).
  ep.prepareNameClips = async () => {
    for (const k of Object.keys(EP.lines).filter((x) => EP.lines[x].name)) ep.nameClips[k] = { ready: true, url: `audio/${id}/name/${k}.mp3` };
    return { ready: 1, total: 1 };
  };
  const unusedPrepare = async (onProgress) => {
    const ids = Object.keys(EP.lines).filter((k) => EP.lines[k].name);
    if (!ep.name) return { ready: 0, total: ids.length };
    const request = async (lineId) => {
      const line = ep.line(lineId);
      try {
        const res = await fetch('/api/tts', { method: 'POST', body: JSON.stringify({ ep: id, role: line.who, text: line.zh }) });
        ep.nameClips[lineId] = res.ok ? await res.json() : { ready: false, error: `HTTP ${res.status}` };
      } catch (err) {
        ep.nameClips[lineId] = { ready: false, error: String(err) };
      }
    };
    await Promise.all(ids.map(request));
    const count = () => ids.filter((k) => ep.nameClips[k]?.ready).length;
    onProgress?.(count(), ids.length);
    // Poll until all are ready, one fails, or five minutes pass.
    const started = Date.now();
    while (count() < ids.length && Date.now() - started < 300000) {
      await new Promise((r) => setTimeout(r, 2500));
      await Promise.all(
        ids
          .filter((k) => !ep.nameClips[k]?.ready && ep.nameClips[k]?.key)
          .map(async (k) => {
            ep.nameClips[k] = await (await fetch(`/api/tts?key=${ep.nameClips[k].key}`)).json();
          }),
      );
      onProgress?.(count(), ids.length);
      if (ids.some((k) => ep.nameClips[k]?.error)) break;
    }
    return { ready: count(), total: ids.length };
  };

  // ---- Voices -------------------------------------------------------------------------------

  async function loadTakes() {
    try {
      ep.takes = {};
    } catch {
      ep.takes = {};
    }
  }

  async function timingsAt(url) {
    try {
      const data = await (await fetch(url)).json();
      return Array.isArray(data) ? data[0] : data;
    } catch {
      return null;
    }
  }

  // The clip for a line: a student's take (recorded mode), the name clip, or the AI voice.
  // Returns null when a name line has no voice yet: then a student says it live.
  async function voiceFor(lineId) {
    const line = EP.lines[lineId];
    if (ep.mode === 'recorded' && ep.takes[lineId] && !line.name) {
      try {
        return { buffer: await sound.load(ep.takes[lineId].file), timings: null, take: ep.takes[lineId] };
      } catch {
        /* use the AI voice */
      }
    }
    if (line.name) {
      const clip = ep.nameClips[lineId];
      if (!clip?.ready) return null;
      try {
        const [buffer, timings] = await Promise.all([sound.load(clip.url), timingsAt(clip.url.replace(/\.mp3$/, '.json'))]);
        return { buffer, timings, take: null };
      } catch {
        return null;
      }
    }
    const [buffer, timings] = await Promise.all([sound.load(`audio/${id}/${lineId}.mp3`), timingsAt(`audio/${id}/${lineId}.json`)]);
    return { buffer, timings, take: null };
  }

  // Who is talking, above the subtitles. With a student's recording, their name too.
  function speakerOf(line, take) {
    const role = ROLES[line.who];
    if (!role) return line.who === 'all' ? 'Tutti' : '';
    return take ? `${role.it} · ${take.actor || role.actor}` : role.it;
  }

  function stopVoices() {
    ep.currentVoices.forEach((v) => v.stop());
    ep.currentVoices = [];
  }
  ep.stopVoices = stopVoices;

  // ---- Saying lines -------------------------------------------------------------------------

  // pace: stretches (or squeezes) the pauses around this one line; the default is the episode's own "pace".
  // onPlay (optional): called when the voice starts, with the audio clock and the word timings, to sync an animation to it.
  ep.say = async (lineId, actor, { keep = 700, subtitles = true, pace = EP.pace ?? 1, onPlay } = {}) => {
    const line = ep.line(lineId);
    // Live mode silences the characters only; the narrator always speaks with the AI voice.
    if (ep.mode === 'live' && line.who !== 'narrator' && !EP.voices[line.who]?.guest) return sayLive(lineId, line, actor, { subtitles });
    const voice = await voiceFor(lineId);
    if (!voice) {
      // A name line not voiced yet. A guest (the Frog Teacher) has no student behind it: show the subtitle and move on.
      if (EP.voices[line.who]?.guest) {
        subs.render(line, { speaker: speakerOf(line) });
        await wait(3200);
        subs.clear();
        return;
      }
      return sayLive(lineId, line, actor, { subtitles });
    }
    if (subtitles) {
      subs.render(line, { speaker: speakerOf(line, voice.take) });
      await wait(LEAD_IN * pace);
    }
    const playing = sound.playVoice(voice.buffer, { onLevel: actor ? (l) => actor.talkLevel(l) : null });
    ep.currentVoices = [playing];
    if (subtitles) subs.follow(voice.timings, playing.startedAt, sound.ctx);
    onPlay?.({ startedAt: playing.startedAt, timings: voice.timings, ctx: sound.ctx });
    await playing.done;
    ep.currentVoices = [];
    await wait(keep * pace);
    if (subtitles) subs.clear();
  };

  // Everyone at once (a line with "who": "all"): every voice together, every character moving.
  ep.sayAll = async (lineId, actors = [], { keep = 900 } = {}) => {
    const line = ep.line(lineId);
    if (ep.mode === 'live') return sayLive(lineId, line, null, { actors });
    subs.render(line, { speaker: 'Tutti' });
    await wait(LEAD_IN * (EP.pace ?? 1));
    const roles = line.voices || [];
    const buffers = await Promise.all(roles.map((r) => sound.load(`audio/${id}/${lineId}.${r}.mp3`).catch(() => null)));
    const timings = await timingsAt(`audio/${id}/${lineId}.${roles[0]}.json`);
    const playing = buffers.map((b, i) => (b ? sound.playVoice(b, { onLevel: (l) => ep.stage[roles[i]]?.talkLevel(l) }) : null)).filter(Boolean);
    ep.currentVoices = playing;
    if (playing[0]) subs.follow(timings, playing[0].startedAt, sound.ctx);
    await Promise.all(playing.map((p) => p.done));
    ep.currentVoices = [];
    await wait(keep * (EP.pace ?? 1));
    subs.clear();
  };

  // Long enough to say the line at a beginner's pace: the slow model voice plus a margin,
  // never under 2.4 s. (Name lines and chorus lines have no model clip: about 3 s.)
  async function liveTime(lineId) {
    const line = EP.lines[lineId];
    try {
      if (line.name || line.who === 'all') return 3200;
      const b = await sound.load(`audio/${id}/${lineId}.mp3`);
      return Math.max(2400, b.duration * 1500 + 900);
    } catch {
      return 3000;
    }
  }

  // A countdown that stops while paused (Space) and ends early on →.
  function countdown(ms) {
    const fill = $('#cue-fill');
    return new Promise((resolve) => {
      let left = ms;
      let last = performance.now();
      const tick = (now) => {
        const dt = now - last;
        last = now;
        if (clock.skipping) {
          fill.style.width = '0%';
          return resolve();
        }
        if (!clock.paused) left -= dt;
        fill.style.width = `${Math.max(0, left / ms) * 100}%`;
        if (left <= 0) return resolve();
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  // A name tag bobbing above whoever has to speak.
  function nameTag(who, name) {
    let spot = tagSpot?.(who);
    if (!spot) {
      const a = ep.stage[who];
      if (!a || a.el.style.opacity === '0') return null;
      const [x, y] = a.top();
      spot = [x, y - 30];
    }
    const x = Math.max(240, Math.min(1360, spot[0]));
    const y = Math.max(viewTop + 44, spot[1]);
    const holder = svg('g', { transform: `translate(${x} ${y})` }, fx);
    const tag = svg('g', {}, holder);
    const bg = svg('rect', { y: -24, height: 48, rx: 24, fill: '#2f6a5a' }, tag);
    svg('path', { d: 'M-11 22L0 35L11 22Z', fill: '#2f6a5a' }, tag);
    const text = svg('text', { class: 'tag-text', 'text-anchor': 'middle', y: 9 }, tag);
    text.textContent = name;
    const width = Math.max(96, text.getComputedTextLength() + 44);
    bg.setAttribute('x', String(-width / 2));
    bg.setAttribute('width', String(width));
    tag.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }], {
      duration: 520,
      iterations: Infinity,
      direction: 'alternate',
      easing: 'ease-in-out',
    });
    return holder;
  }

  async function sayLive(lineId, line, actor, { subtitles = true, actors = [] } = {}) {
    const role = ROLES[line.who];
    const name = document.createElement('span');
    name.textContent = role ? role.actor : 'Tutti insieme!';
    const what = document.createElement('small');
    what.textContent = role ? `${role.it} · ${role.zh}` : 'tutta la classe';
    $('#cue-who').replaceChildren(name, what);
    $('#cue').hidden = false;
    if (subtitles) {
      subs.render(line, { speaker: role ? role.it : 'Tutti' });
      subs.follow(null, 0, sound.ctx);
    }
    const tag = role ? nameTag(line.who, role.actor) : null;
    const movers = actor ? [actor] : actors;
    const talking = movers.map((a) =>
      a.talkG.animate([{ transform: 'scale(1, 1)' }, { transform: 'scale(1.03, 1.07)' }], { duration: 220, iterations: Infinity, direction: 'alternate' }),
    );
    sound.pluck(587.33, undefined, 0.4);
    sound.duck(true);
    await countdown(await liveTime(lineId));
    sound.duck(false);
    talking.forEach((t) => t.cancel());
    tag?.remove();
    $('#cue').hidden = true;
    if (subtitles) subs.clear();
    await wait(300);
  }

  // ---- The question card (pinyin over every character; click an option, or press A B C, to hear it) ----
  // EP.question: { zh, py, it, line, options: [{ zh, py, sound }] }. showQuestion() leaves it up for the class to
  // discuss; showQuestion({ vote: true }) also lets the teacher confirm a choice (button or Enter) and resolves
  // with its index.
  const EAR =
    '<svg class="ear" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z"/>' +
    '<path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  let ask = null;
  let optionVoice = null;

  function stopOption() {
    optionVoice?.stop();
    optionVoice = null;
    document.querySelectorAll('.opt.playing').forEach((b) => b.classList.remove('playing'));
  }

  async function playClip(url, button) {
    stopOption();
    button?.classList.add('playing');
    try {
      await sound.unlock();
      const v = sound.playVoice(await sound.load(url));
      optionVoice = v;
      await v.done;
    } finally {
      button?.classList.remove('playing');
    }
  }

  function hear(i) {
    if (!ask) return;
    if (ask.vote) pick(i);
    playClip(EP.question.options[i].sound, $('#q-opts').children[i]);
  }

  function pick(i) {
    ask.picked = i;
    [...$('#q-opts').children].forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    $('#q-go').textContent = `✓ ${EP.question.options[i].zh.replace(/？/g, '')}`;
    $('#q-go').hidden = false;
  }

  ep.showQuestion = ({ vote = false } = {}) => {
    const q = EP.question;
    const title = $('#q-title');
    title.replaceChildren();
    fillRuby(title, q.zh, q.py);
    $('#q-it').textContent = q.it;
    const buttons = q.options.map((opt, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', `${'ABC'[i]}: ${opt.zh} ${opt.py} (ascolta)`);
      const key = document.createElement('span');
      key.className = 'key';
      key.textContent = 'ABC'[i];
      const zh = document.createElement('span');
      zh.className = 'zh';
      fillRuby(zh, opt.zh, opt.py);
      b.append(key, zh);
      b.insertAdjacentHTML('beforeend', EAR);
      b.addEventListener('click', () => {
        b.blur(); // so Space keeps pausing instead of pressing this button again
        hear(i);
      });
      return b;
    });
    $('#q-opts').replaceChildren(...buttons);
    $('#q-hint').textContent = vote ? 'Cliccate per ascoltare, poi votate.' : 'Cliccate per ascoltare.';
    $('#q-go').hidden = true;
    $('#question').hidden = false;
    return new Promise((resolve) => {
      ask = { vote, picked: null, resolve };
    });
  };

  ep.hideQuestion = () => {
    stopOption();
    ask = null;
    $('#question').hidden = true;
  };

  function confirmPick() {
    if (!ask?.vote || ask.picked === null) return;
    const { picked, resolve } = ask;
    ep.hideQuestion();
    resolve(picked);
  }
  $('#q-go').addEventListener('click', confirmPick);
  $('#q-title').addEventListener('click', () => {
    $('#q-title').blur();
    playClip(`audio/${id}/${EP.question.line}.mp3`);
  });

  // ---- Playing a part ------------------------------------------------------------------------

  const controls = setupControls({ sound, subs, hud: $('#hud'), onKey: handleKey });
  ep.controls = controls;

  function clearOverlays() {
    for (const el of ['#title-card', '#end', '#cue']) $(el).hidden = true;
    ep.hideQuestion();
    subs.clear();
    controls.setHud('');
    stopVoices();
    clock.paused = false;
    clock.skipping = false;
  }

  ep.endOptions = (part) => (part === 1 ? [['Parte 2', 2, 'ai', false], ['Rivedi la parte 1', 1, 'ai', true]] : [['Rivedi la parte 2', 2, 'ai', false], ['Rivedi la parte 1', 1, 'ai', true]]);

  function showEnd(part, extra = []) {
    $('#end-title').textContent = `${part === 1 ? 'Fine della parte 1' : 'Fine dell’episodio'}${ep.mode === 'live' ? ' · ottimo lavoro!' : ''}`;
    const buttons = ep.endOptions(part).map(([label, p, m, secondary]) => {
      const b = document.createElement('button');
      b.type = 'button';
      if (secondary) b.className = 'secondary';
      b.textContent = label;
      b.addEventListener('click', () => ep.play(p, m));
      return b;
    });
    const back = document.createElement('a');
    back.className = 'button secondary';
    back.href = '#';
    back.addEventListener('click', (e) => {
      e.preventDefault();
      location.reload();
    });
    back.textContent = '↩ Torna all’inizio';
    $('#end-actions').replaceChildren(...extra, ...buttons, back);
    $('#end').hidden = false;
    (extra[0] || buttons[0]).focus();
  }

  ep.play = async (part, chosenMode) => {
    if (ep.running) return;
    ep.running = true;
    ep.mode = chosenMode;
    $('#splash').hidden = true;
    document.getAnimations().forEach((a) => a.cancel());
    fx.replaceChildren();
    clearOverlays();
    sound.stopAmbience(0.3);
    reset(part);
    await sound.unlock();
    await loadTakes();
    controls.setHud(`Parte ${part} · ${MODE_NAMES[ep.mode]}`);
    setTimeout(() => {
      if (!clock.paused) controls.setHud('');
    }, 4000);
    let extra = [];
    try {
      extra = (await parts[part]()) || [];
    } finally {
      ep.running = false;
    }
    showEnd(part, extra);
  };

  async function handleKey(e) {
    const key = e.key.toLowerCase();
    // The question: A B C play the options; Enter confirms a vote.
    if (ask) {
      const i = ['a', 'b', 'c'].indexOf(key);
      if (i >= 0 && i < EP.question.options.length) {
        e.preventDefault();
        hear(i);
        return true;
      }
      if (e.key === 'Enter' && ask.vote) {
        e.preventDefault();
        confirmPick();
        return true;
      }
    }
    if (!ep.running) {
      if (KEYS[key]) {
        ep.play(...KEYS[key]);
        return true;
      }
      if (e.code === 'Space' && !$('#splash').hidden) {
        e.preventDefault();
        ep.play(location.hash === '#parte2' ? 2 : 1, 'ai');
        return true;
      }
      return e.code === 'Space'; // no pausing between playings
    }
    if (key === 'r') {
      location.reload();
      return true;
    }
    if (e.key === 'ArrowRight') stopVoices();
    return false;
  }

  document.querySelectorAll('#splash [data-part]').forEach((b) => b.addEventListener('click', () => ep.play(Number(b.dataset.part), b.dataset.mode)));

  // Show how many lines the class has recorded so far.
  await loadTakes();
  const booth = Object.keys(EP.lines).filter((k) => EP.lines[k].booth);
  $('#btn-recorded')?.append(` (${booth.filter((k) => ep.takes[k]).length}/${booth.length})`);

  return ep;
}
