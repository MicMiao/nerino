// Frasi: every line of the episode, with pinyin and Italian, tap to hear it again.
import { fillRuby } from './stage.js';
const $ = (s) => document.querySelector(s);
const [EP, CAST, U03] = await Promise.all(['episodes/ep02.json', 'units/cast.json', 'units/u03.json'].map((u) => fetch(u).then((r) => r.json())));
const ROLE = Object.fromEntries(CAST.roles.map((r) => [r.role, r]));
const name = EP.fallbackName;
const display = name.py.replace(/\s+/g, '');
const fill = (s, kind) => s.replaceAll(kind === 'zh' ? '{name}' : kind === 'py' ? '{py}' : '{name}', kind === 'zh' ? name.zh : kind === 'py' ? name.py : display[0].toUpperCase() + display.slice(1));
let playing = [];
function play(urls, button) {
  playing.forEach((a) => a.pause());
  document.querySelectorAll('.say.on').forEach((b) => b.classList.remove('on'));
  playing = urls.map((u) => new Audio(u));
  button.classList.add('on');
  playing[0].addEventListener('ended', () => button.classList.remove('on'));
  playing.forEach((a) => a.play().catch(() => button.classList.remove('on')));
}
function row(zh, py, it, who, urls, plain = false) {
  const li = document.createElement('li');
  const btn = Object.assign(document.createElement('button'), { type: 'button', className: 'say' });
  btn.setAttribute('aria-label', 'Ascolta: ' + zh);
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  btn.addEventListener('click', () => play(urls, btn));
  const text = document.createElement('div');
  text.className = 'line';
  const head = document.createElement('div');
  head.className = 'who';
  head.textContent = who;
  const z = document.createElement('div');
  z.className = 'zh';
  const i = document.createElement('div');
  i.className = 'it';
  i.textContent = it;
  if (plain) {
    z.textContent = zh;
    const p = document.createElement('div');
    p.className = 'py';
    p.textContent = py;
    text.append(head, z, p, i);
  } else {
    fillRuby(z, zh, py);
    text.append(head, z, i);
  }
  li.append(btn, text);
  return li;
}
function section(title, rows) {
  const h = document.createElement('h3');
  h.textContent = title;
  const ul = document.createElement('ul');
  ul.append(...rows);
  return [h, ul];
}
const parts = { 1: [], 2: [] };
for (const [id, l] of Object.entries(EP.lines)) {
  if (l.who === 'narrator') continue;
  const part = id.startsWith('a_') ? 1 : 2;
  const named = l.name;
  const zh = named ? fill(l.zh, 'zh') : l.zh;
  const py = named ? fill(l.py, 'py') : l.py;
  const it = named ? fill(l.it, 'it') : l.it;
  const urls = l.who === 'all' ? l.voices.map((v) => `audio/ep02/${id}.${v}.mp3`) : [named ? `audio/ep02/name/${id}.mp3` : `audio/ep02/${id}.mp3`];
  parts[part].push(row(zh, py, it, l.who === 'all' ? 'Tutti' : ROLE[l.who].it, urls));
}
$('#review-body').replaceChildren(
  ...section('Da ricordare', U03.phrases.map((p) => row(p.zh, p.py, p.it, '', [`audio/u03/${p.id}.mp3`], true))),
  ...section('Parte 1 · La fila all’anagrafe', parts[1]),
  ...section('Parte 2 · Il nome', parts[2]),
);
const open = (on) => {
  $('#review').hidden = !on;
  if (!on) playing.forEach((a) => a.pause());
};
document.querySelectorAll('[data-review]').forEach((b) => b.addEventListener('click', () => open(true)));
$('#review-close').addEventListener('click', () => open(false));
document.addEventListener('keydown', (e) => e.key === 'Escape' && open(false));
