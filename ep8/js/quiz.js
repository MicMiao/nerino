// Esercizi: ten listening questions made from the episode's own lines.
//   1. Ascolta e scegli il significato (three Italian sentences)
//   2. Ascolta e scegli la frase (three Chinese sentences, with pinyin)
import { entries, play, stopAudio, fillRuby, SPEAKER } from './lines.js';
const $ = (s) => document.querySelector(s);
const body = $('#quiz-body');
const ROUNDS = 10;
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
// One entry per sentence: the same sentence said by two characters would make two right answers.
const pool = [...new Map(entries.filter((e) => !e.chorus && e.zh.replace(/[^\p{Script=Han}]/gu, '').length >= 2).map((e) => [e.zh, e])).values()];
const el = (tag, cls, text) => Object.assign(document.createElement(tag), { className: cls || '', textContent: text ?? '' });

let questions = [];
let index = 0;
let score = 0;

function makeQuestions() {
  return shuffle(pool)
    .slice(0, ROUNDS)
    .map((answer, i) => {
      const kind = i % 2 === 0 ? 'meaning' : 'sentence';
      const others = shuffle(pool.filter((e) => e.zh !== answer.zh && (kind === 'sentence' || e.it !== answer.it))).slice(0, 2);
      return { kind, answer, options: shuffle([answer, ...others]) };
    });
}

function start() {
  questions = makeQuestions();
  index = 0;
  score = 0;
  show();
}

function show() {
  if (index >= questions.length) return finish();
  const q = questions[index];
  body.replaceChildren();
  body.append(el('p', 'qz-count', `Domanda ${index + 1} di ${questions.length}`));
  body.append(el('h3', 'qz-prompt', q.kind === 'meaning' ? 'Ascolta e scegli il significato' : 'Ascolta e scegli la frase'));
  const hear = el('button', 'qz-hear');
  hear.type = 'button';
  hear.innerHTML = SPEAKER + '<span>Ascolta</span>';
  hear.addEventListener('click', () => play(q.answer.urls));
  body.append(hear);
  const list = el('div', 'qz-options');
  q.options.forEach((o) => {
    const b = el('button', 'qz-option');
    b.type = 'button';
    if (q.kind === 'meaning') b.textContent = o.it;
    else {
      b.append(el('span', 'qz-zh', o.zh), el('span', 'qz-py', o.py));
    }
    b.addEventListener('click', () => answer(q, o, b, list));
    list.append(b);
  });
  body.append(list);
  body.append(el('div', 'qz-feedback'));
  play(q.answer.urls);
}

function answer(q, chosen, button, list) {
  const right = chosen.zh === q.answer.zh;
  if (right) score++;
  [...list.children].forEach((b, i) => {
    b.disabled = true;
    if (q.options[i].zh === q.answer.zh) b.classList.add('right');
  });
  if (!right) button.classList.add('wrong');
  const fb = body.querySelector('.qz-feedback');
  fb.append(el('p', 'qz-verdict ' + (right ? 'ok' : 'no'), right ? 'Giusto!' : 'Non proprio. Era:'));
  const zh = el('div', 'qz-answer-zh');
  fillRuby(zh, q.answer.zh, q.answer.py);
  fb.append(zh, el('p', 'qz-answer-it', q.answer.it));
  const next = el('button', 'qz-next', index + 1 < questions.length ? 'Avanti' : 'Vedi il risultato');
  next.type = 'button';
  next.addEventListener('click', () => {
    index++;
    show();
  });
  fb.append(next);
  next.focus();
}

function finish() {
  stopAudio();
  body.replaceChildren();
  const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 5 ? 1 : 0;
  body.append(el('p', 'qz-count', 'Risultato'));
  body.append(el('h3', 'qz-score', `${score} su ${questions.length}`));
  body.append(el('p', 'qz-stars', '★'.repeat(stars) + '☆'.repeat(3 - stars)));
  body.append(el('p', 'qz-msg', score >= 9 ? 'Ottimo! Sei pronto per la prossima lezione.' : score >= 6 ? 'Bene! Riascolta le frasi che hai sbagliato in «Frasi» e riprova.' : 'Riascolta le frasi in «Frasi», poi riprova: ogni volta le domande cambiano.'));
  const again = el('button', 'qz-next', 'Riprova');
  again.type = 'button';
  again.addEventListener('click', start);
  body.append(again);
}

const open = (on) => {
  $('#quiz').hidden = !on;
  if (on) {
    $('#review').hidden = true;
    start();
  } else stopAudio();
};
document.querySelectorAll('[data-quiz]').forEach((b) => b.addEventListener('click', () => open(true)));
$('#quiz-close').addEventListener('click', () => open(false));
document.addEventListener('keydown', (e) => e.key === 'Escape' && open(false));
