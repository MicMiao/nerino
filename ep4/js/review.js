// Frasi: every line of the episode, with pinyin and Italian. Tap the speaker to hear it again.
import { entries, phrases, phraseUrl, play, stopAudio, fillRuby, SPEAKER } from './lines.js';
const $ = (s) => document.querySelector(s);
const SECTIONS = ["Parte 1 · Per chi è la torta?","Parte 2 · La festa"];
function row({ zh, py, it, who, urls, plain }) {
  const li = document.createElement('li');
  const btn = Object.assign(document.createElement('button'), { type: 'button', className: 'say', innerHTML: SPEAKER });
  btn.setAttribute('aria-label', 'Ascolta: ' + zh);
  btn.addEventListener('click', () => {
    document.querySelectorAll('.say.on').forEach((b) => b.classList.remove('on'));
    btn.classList.add('on');
    play(urls).then(() => btn.classList.remove('on'));
  });
  const text = document.createElement('div');
  text.className = 'line';
  const head = Object.assign(document.createElement('div'), { className: 'who', textContent: who });
  const z = Object.assign(document.createElement('div'), { className: 'zh' });
  const i = Object.assign(document.createElement('div'), { className: 'it', textContent: it });
  if (plain) {
    z.textContent = zh;
    text.append(head, z, Object.assign(document.createElement('div'), { className: 'py', textContent: py }), i);
  } else {
    fillRuby(z, zh, py);
    text.append(head, z, i);
  }
  li.append(btn, text);
  return li;
}
function section(title, rows) {
  const ul = document.createElement('ul');
  ul.append(...rows);
  return [Object.assign(document.createElement('h3'), { textContent: title }), ul];
}
$('#review-body').replaceChildren(
  ...section('Da ricordare', phrases.map((p) => row({ ...p, who: '', urls: [phraseUrl(p)], plain: true }))),
  ...section(SECTIONS[0], entries.filter((e) => e.part === 1).map(row)),
  ...section(SECTIONS[1], entries.filter((e) => e.part === 2).map(row)),
);
const open = (on) => {
  $('#review').hidden = !on;
  if (on) $('#quiz').hidden = true;
  else stopAudio();
};
document.querySelectorAll('[data-review]').forEach((b) => b.addEventListener('click', () => open(true)));
$('#review-close').addEventListener('click', () => open(false));
document.addEventListener('keydown', (e) => e.key === 'Escape' && open(false));
