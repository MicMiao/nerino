// The episode's lines for the review and the quiz: text, pinyin, Italian and the clips to play.
import { fillRuby } from './stage.js';
export { fillRuby };
const EP_ID = "ep03";
const UNIT = "u04";
const [EP, CAST, U] = await Promise.all([`episodes/${EP_ID}.json`, 'units/cast.json', `units/${UNIT}.json`].map((u) => fetch(u).then((r) => r.json())));
const ROLE = Object.fromEntries(CAST.roles.map((r) => [r.role, r]));
const name = EP.fallbackName;
const display = name.py.replace(/\s+/g, '');
const fillName = (s, kind) => s.replaceAll(kind === 'py' ? '{py}' : '{name}', kind === 'zh' ? name.zh : kind === 'py' ? name.py : display[0].toUpperCase() + display.slice(1));
export const phrases = U.phrases;
export const nameLabel = `${name.zh} (${name.py})`;
export const entries = [];
for (const [id, l] of Object.entries(EP.lines)) {
  if (l.who === 'narrator') continue;
  const named = Boolean(l.name);
  entries.push({
    id,
    part: id.startsWith('a_') ? 1 : 2,
    who: l.who === 'all' ? 'Tutti' : ROLE[l.who].it,
    chorus: l.who === 'all',
    zh: named ? fillName(l.zh, 'zh') : l.zh,
    py: named ? fillName(l.py, 'py') : l.py,
    it: named ? fillName(l.it, 'it') : l.it,
    urls: l.who === 'all' ? l.voices.map((v) => `audio/${EP_ID}/${id}.${v}.mp3`) : [named ? `audio/${EP_ID}/name/${id}.mp3` : `audio/${EP_ID}/${id}.mp3`],
  });
}
export const phraseUrl = (p) => `audio/${UNIT}/${p.id}.mp3`;
let playing = [];
export function stopAudio() {
  playing.forEach((a) => a.pause());
  playing = [];
}
// Plays one or more clips together; resolves when the first one ends.
export function play(urls) {
  stopAudio();
  playing = urls.map((u) => new Audio(u));
  const done = new Promise((resolve) => playing[0].addEventListener('ended', resolve, { once: true }));
  playing.forEach((a) => a.play().catch(() => {}));
  return done;
}
export const SPEAKER =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
