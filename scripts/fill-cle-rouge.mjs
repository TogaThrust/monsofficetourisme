/**
 * La clé rouge : renomme le POI (ex-A la Clee Rouge), texte long réécrit,
 * court mis à jour, quiz XVIIIe, traductions 10 langues, MP3 court+long.
 * Usage: node scripts/fill-cle-rouge.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { config } from 'dotenv';
import { pronounceForTts } from './tts-pronounce.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const FACTORY = 'C:/Users/togat/Desktop/TOGA THRUST APPS/CLQ-App-Factory';
config({ path: path.join(FACTORY, '.env') });

const OLD = 'A la Clee Rouge';
const NAME = 'La clé rouge';
const LANGS = ['fr', 'en', 'nl', 'de', 'it', 'es', 'pl', 'ar', 'cn', 'jp'];
const LANG_ALIASES = { cn: 'zh', jp: 'ja' };
const POLLY_LANG = { jp: 'ja', cn: 'cn' };
const ADDRESS = 'Rue de Nimy 96, 7000 Mons.';
const ADDRESS_LABEL = {
  fr: 'Adresse :',
  en: 'Address:',
  nl: 'Adres:',
  de: 'Adresse:',
  it: 'Indirizzo:',
  es: 'Dirección:',
  pl: 'Adres:',
  ar: 'العنوان :',
  cn: '地址：',
  jp: '住所：',
};

const FR_SHORT = 'La clé rouge : grande clé sculptée au 96 rue de Nimy.';
const FR_LONG_BODY = `Le panneau tient l’allège de la fenêtre du milieu, au premier étage. Un cartouche aux coins arrondis, fond ocre. Au centre, une clé debout, anneau en haut, panneton en bas — encore rouge-brun. Autour, gravé : A LA CLEE ROVGE. CLEE avec deux E. ROVGE : le V vaut U. Il reste de l’or dans les lettres. La façade est classique montoise : brique et calcaire.

On peignait. Le rouge se voyait de loin, par la brume, à la lanterne. Première moitié du XVIIIe siècle. Plus tard, Joseph Cowet y vend des pains d’épices — douceurs de garnison et de pèlerinage, qui tiennent.

Pourquoi une clé pour un pâtissier ? L’enseigne n’était pas toujours le métier. Secret de recette, Porte de Nimy toute proche, ou simplement la pierre déjà là, trop chère à changer. Les numéros viendront avec les Français. La clé, elle, est restée dans le mur.`;

function writeJson(file, data) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
  try { fs.unlinkSync(file); } catch {}
  fs.renameSync(tmp, file);
}

function renameKey(obj) {
  if (!obj || !Object.prototype.hasOwnProperty.call(obj, OLD)) return false;
  obj[NAME] = obj[OLD];
  delete obj[OLD];
  return true;
}

function setDesc(store, lang, text) {
  if (!store[lang]) store[lang] = {};
  renameKey(store[lang]);
  store[lang][NAME] = text;
  const alias = LANG_ALIASES[lang];
  if (alias) {
    if (!store[alias]) store[alias] = {};
    renameKey(store[alias]);
    store[alias][NAME] = text;
  }
}

function ttsText(raw, lang = 'fr') {
  return pronounceForTts(
    String(raw || '')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim(),
    lang,
  );
}

function is18th(opt) {
  const s = String(opt);
  if (/19|XIX|20|XXe|20th|20e |20\.|20世纪|20世紀/.test(s) && !/18|XVIII/.test(s)) return false;
  if (s.includes('XVIIIe') || /\bXVIII\b/.test(s)) return true;
  if (/18th|18e |18\.|18世纪|18世紀|الثامن عشر/.test(s)) return true;
  return false;
}

function patchQuizList(list) {
  if (!Array.isArray(list)) return 0;
  let n = 0;
  for (const q of list) {
    if (typeof q.question === 'string') {
      const next = q.question
        .replace(/À la Clée Rouge/g, 'La clé rouge')
        .replace(/À la Clee Rouge/g, 'La clé rouge')
        .replace(/A la Clee Rouge/g, 'La clé rouge');
      if (next !== q.question) {
        q.question = next;
        n++;
      }
    }
    if (Array.isArray(q.options) && /époque|era|eeuw|Jahrhundert|secolo|siglo|wiek|قرن|世纪|世紀|burinage/i.test(q.question || '')) {
      const idx = q.options.findIndex(is18th);
      if (idx >= 0 && q.answer !== idx) {
        q.answer = idx;
        n++;
      }
    }
  }
  return n;
}

function renameAndPatchQuizBag(bag) {
  let n = 0;
  if (bag?.[OLD]) {
    bag[NAME] = bag[OLD];
    delete bag[OLD];
    n++;
  }
  n += patchQuizList(bag?.[NAME]);
  return n;
}

async function chatJson(system, user, maxTokens = 4000) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY;
  if (!apiKey) throw new Error('Pas de clé OpenAI');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const json = await res.json();
  return JSON.parse(json.choices?.[0]?.message?.content || '{}');
}

function patchTextFile(rel, replacers) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return;
  let t = fs.readFileSync(p, 'utf8');
  const before = t;
  for (const [a, b] of replacers) t = t.split(a).join(b);
  if (t !== before) {
    const tmp = p + '.tmp';
    fs.writeFileSync(tmp, t);
    try { fs.unlinkSync(p); } catch {}
    fs.renameSync(tmp, p);
  }
}

const shorts = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions_short.json'), 'utf8'));
const longs = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations/descriptions.json'), 'utf8'));

for (const lang of Object.keys(shorts)) renameKey(shorts[lang]);
for (const lang of Object.keys(longs)) renameKey(longs[lang]);

setDesc(shorts, 'fr', FR_SHORT);
setDesc(longs, 'fr', `${FR_LONG_BODY}\n\nAdresse : ${ADDRESS}`);

const parsed = await chatJson(
  'You translate CityLoop Quest Mons visitor texts. Return JSON only. Keep the stone inscription exactly: A LA CLEE ROVGE, CLEE, ROVGE. Keep proper names exactly: La clé rouge, Joseph Cowet, Porte de Nimy, Mons. Keep XVIIIe as 18th century (first half). cn = Simplified Chinese. jp = Japanese.',
  `Translate into: en, nl, de, it, es, pl, ar, cn, jp (cn = Simplified Chinese, jp = Japanese).
Return JSON:
{ "en": { "short": "...", "long": "..." }, "nl": { "short": "...", "long": "..." }, ... }

SHORT (keep the French name "La clé rouge" at the start, then translate the rest):
${FR_SHORT}

LONG (same facts, paragraph breaks. Do not add the address. Do not write "96 rue de Nimy". Do not open with "large sculpted key"):
${FR_LONG_BODY}`,
  5500,
);

for (const lang of LANGS.filter((l) => l !== 'fr')) {
  const bag = parsed[lang] || {};
  const trShort = String(bag.short || '').trim();
  const trLong = String(bag.long || '').trim();
  if (trShort) setDesc(shorts, lang, trShort);
  else console.warn('empty short', lang);
  if (trLong) setDesc(longs, lang, `${trLong}\n\n${ADDRESS_LABEL[lang]} ${ADDRESS}`);
  else console.warn('empty long', lang);
  console.log('ok', lang, 'short', trShort.length, 'long', trLong.length);
}

writeJson(path.join(ROOT, 'translations/descriptions_short.json'), shorts);
writeJson(path.join(ROOT, 'translations/descriptions.json'), longs);
writeJson(path.join(ROOT, 'dist/translations/descriptions_short.json'), shorts);
writeJson(path.join(ROOT, 'dist/translations/descriptions.json'), longs);

const txt = longs.fr[NAME].replace(/\n/g, '\r\n');
fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'data', 'la_cle_rouge.txt'), txt);
fs.mkdirSync(path.join(ROOT, 'dist', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'data', 'la_cle_rouge.txt'), txt);

patchTextFile('circuit-data.js', [
  ['{ name: "A la Clee Rouge", lat: 50.458131, lng: 3.955611, audio: "audio/ALaCleeRouge.mp3" }', '{ name: "La clé rouge", lat: 50.458131, lng: 3.955611, audio: "audio/LaCleRouge.mp3" }'],
]);
patchTextFile('dist/circuit-data.js', [
  ['{ name: "A la Clee Rouge", lat: 50.458131, lng: 3.955611, audio: "audio/ALaCleeRouge.mp3" }', '{ name: "La clé rouge", lat: 50.458131, lng: 3.955611, audio: "audio/LaCleRouge.mp3" }'],
]);
patchTextFile('js/poi-image-map.js', [['"A la Clee Rouge"', '"La clé rouge"']]);
patchTextFile('dist/js/poi-image-map.js', [['"A la Clee Rouge"', '"La clé rouge"']]);
patchTextFile('scripts/build-thematic-circuits.mjs', [
  ["name: 'A la Clee Rouge'", "name: 'La clé rouge'"],
  ['"À la Clée Rouge : grande clé sculptée au 96 rue de Nimy."', `"${FR_SHORT}"`],
  ["'A la Clee Rouge', 'Aux Trois Verts Chapeaux'", "'La clé rouge', 'Aux Trois Verts Chapeaux'"],
]);
patchTextFile('scripts/thematic-circuits-output.json', [['"A la Clee Rouge"', '"La clé rouge"']]);

let quizFixed = 0;
for (const lang of LANGS) {
  const p = path.join(ROOT, 'scripts', `quiz-${lang}.json`);
  if (!fs.existsSync(p)) continue;
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  quizFixed += renameAndPatchQuizBag(data);
  writeJson(p, data);
}
for (const rel of [
  'quizData.js',
  'dist/quizData.js',
  'scripts/quiz-basreliefs-nord-fr.json',
  'scripts/.basreliefs-quiz-fr.json',
]) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  const raw = fs.readFileSync(p, 'utf8');
  if (rel.endsWith('.js')) {
    const data = JSON.parse(raw.replace(/^[^{]+/, '').replace(/;?\s*$/, ''));
    quizFixed += renameAndPatchQuizBag(data);
    const prefix = raw.match(/^[^{]*/)?.[0] || '';
    const tmp = p + '.tmp';
    fs.writeFileSync(tmp, `${prefix}${JSON.stringify(data, null, 2)}\n`);
    try { fs.unlinkSync(p); } catch {}
    fs.renameSync(tmp, p);
  } else {
    const data = JSON.parse(raw);
    quizFixed += renameAndPatchQuizBag(data);
    writeJson(p, data);
  }
}
const quizTrPath = path.join(ROOT, 'translations/quiz_translations.json');
const quizTr = JSON.parse(fs.readFileSync(quizTrPath, 'utf8'));
for (const lang of Object.keys(quizTr)) {
  quizFixed += renameAndPatchQuizBag(quizTr[lang]);
}
writeJson(quizTrPath, quizTr);
writeJson(path.join(ROOT, 'dist/translations/quiz_translations.json'), quizTr);
console.log('quiz patched', quizFixed);

const { synthesizeSpeechMp3 } = await import(
  pathToFileURL(path.join(FACTORY, 'lib', 'tts-providers.js')).href
);
fs.mkdirSync(path.join(ROOT, 'dist', 'audio'), { recursive: true });
for (const lang of LANGS) {
  const jobs = [
    { kind: 'short', text: ttsText(shorts[lang]?.[NAME] || shorts.fr[NAME], lang), out: path.join(ROOT, 'audio', `LaCleRouge_short_${lang}.mp3`) },
    { kind: 'long', text: ttsText(longs[lang][NAME], lang), out: path.join(ROOT, 'audio', `LaCleRouge_${lang}.mp3`) },
  ];
  for (const job of jobs) {
    if (!job.text) throw new Error('TTS vide ' + lang + ' ' + job.kind);
    try { fs.unlinkSync(job.out); } catch {}
    await synthesizeSpeechMp3(job.text, job.out, { lang: POLLY_LANG[lang] || lang });
    fs.copyFileSync(job.out, path.join(ROOT, 'dist', 'audio', path.basename(job.out)));
    const flag = /Clée|Rouge/.test(job.text) && /A LA CLEE|CLEE|ROVGE/.test(longs[lang]?.[NAME] || '') ? '' : '';
    console.log('audio', job.kind, lang, fs.statSync(job.out).size, /À la Clée Rouge|Clée/.test(job.text) ? ' Clée' : flag);
  }
}

function copyViaTmp(src, dest) {
  const tmp = dest + '.tmp';
  fs.writeFileSync(tmp, fs.readFileSync(src));
  try { fs.unlinkSync(dest); } catch {}
  fs.renameSync(tmp, dest);
}
copyViaTmp(
  path.join(ROOT, 'scripts/tts-pronounce.mjs'),
  path.join(ROOT, 'dist/scripts/tts-pronounce.mjs'),
);
console.log('done');
